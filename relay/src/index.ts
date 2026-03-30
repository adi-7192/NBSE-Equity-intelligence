import { createServer, type IncomingMessage, type ServerResponse } from "node:http"
import { getConfiguredBenchmarkDefinitions } from "../../lib/live-market/instruments"
import { HEARTBEAT_INTERVAL_MS, relaySubscriptionSyncRequestSchema, type MarketStreamEvent } from "../../lib/live-market/contracts"
import { LiveMarketStore } from "./store"
import { KiteRelayController } from "./kite"

const PORT = Number(process.env.LIVE_RELAY_PORT ?? 4001)
const RELAY_SECRET = process.env.LIVE_RELAY_SECRET

const store = new LiveMarketStore()
store.setBenchmarks(getConfiguredBenchmarkDefinitions())

const kiteRelay = new KiteRelayController(store)
kiteRelay.syncSubscriptions(store.getSubscribedTokens())
kiteRelay.start()

const clients = new Set<ServerResponse>()

function isAuthorized(request: IncomingMessage) {
  if (!RELAY_SECRET) {
    return false
  }

  return request.headers.authorization === `Bearer ${RELAY_SECRET}`
}

function sendJson(response: ServerResponse, status: number, payload: unknown) {
  response.statusCode = status
  response.setHeader("Content-Type", "application/json")
  response.setHeader("Cache-Control", "no-store")
  response.end(JSON.stringify(payload))
}

function writeEvent(response: ServerResponse, event: MarketStreamEvent) {
  response.write(`event: ${event.type}\n`)
  response.write(`data: ${JSON.stringify(event.data)}\n\n`)
}

async function readJsonBody(request: IncomingMessage) {
  const chunks: Buffer[] = []
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  const rawBody = Buffer.concat(chunks).toString("utf8")
  return rawBody.length > 0 ? JSON.parse(rawBody) : {}
}

store.onEvent((event) => {
  for (const client of clients) {
    writeEvent(client, event)
  }
})

setInterval(() => {
  if (clients.size === 0) {
    return
  }

  const heartbeat = store.createHeartbeatEvent()
  for (const client of clients) {
    writeEvent(client, heartbeat)
  }
}, HEARTBEAT_INTERVAL_MS)

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`)

  if (request.method === "GET" && requestUrl.pathname === "/health") {
    return sendJson(response, 200, {
      ok: true,
      ...store.getHealth(),
    })
  }

  if (!isAuthorized(request)) {
    return sendJson(response, 401, {
      error: "Unauthorized relay request",
    })
  }

  if (request.method === "GET" && requestUrl.pathname === "/snapshot") {
    return sendJson(response, 200, store.getSnapshot())
  }

  if (request.method === "GET" && requestUrl.pathname === "/events") {
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    })
    response.write("retry: 3000\n\n")
    writeEvent(response, {
      type: "snapshot",
      data: store.getSnapshot(),
    })

    clients.add(response)
    request.on("close", () => {
      clients.delete(response)
      response.end()
    })
    return
  }

  if (request.method === "POST" && requestUrl.pathname === "/subscriptions/sync") {
    try {
      const payload = relaySubscriptionSyncRequestSchema.parse(await readJsonBody(request))
      store.replaceSharedWatchlist(payload.watchlist)
      kiteRelay.syncSubscriptions(store.getSubscribedTokens())

      return sendJson(response, 200, {
        ok: true,
        watchlistCount: payload.watchlist.length,
        tokenCount: store.getSubscribedTokens().length,
      })
    } catch (error) {
      return sendJson(response, 400, {
        error: error instanceof Error ? error.message : "Invalid subscription payload",
      })
    }
  }

  return sendJson(response, 404, {
    error: "Relay route not found",
  })
})

server.listen(PORT, () => {
  console.log(`[relay] listening on http://localhost:${PORT}`)
})
