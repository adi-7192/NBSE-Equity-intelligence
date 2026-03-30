import { HEARTBEAT_INTERVAL_MS, type LiveMarketSnapshot } from "@/lib/live-market/contracts"
import { getSessionFromHeaders } from "@/lib/auth"
import { listSharedWatchlistItems } from "@/lib/db/queries/shared-watchlist"
import { buildDisconnectedMarketSnapshot } from "@/lib/live-market/instruments"
import { isRelayConfigured, streamRelayEvents, syncRelaySubscriptions } from "@/lib/live-market/relay-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 300

const encoder = new TextEncoder()

function sseMessage(event: string, data: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}

function createDisconnectedStream(snapshot: LiveMarketSnapshot) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode("retry: 3000\n\n"))
      controller.enqueue(sseMessage("snapshot", snapshot))
      controller.enqueue(sseMessage("status", {
        sequence: snapshot.sequence,
        asOf: snapshot.asOf,
        market: snapshot.market,
        freshness: snapshot.freshness,
        connection: snapshot.connection,
      }))
      controller.enqueue(sseMessage("heartbeat", {
        sequence: snapshot.sequence,
        at: new Date().toISOString(),
        connection: snapshot.connection,
      }))

      const interval = setInterval(() => {
        controller.enqueue(sseMessage("heartbeat", {
          sequence: snapshot.sequence,
          at: new Date().toISOString(),
          connection: snapshot.connection,
        }))
      }, HEARTBEAT_INTERVAL_MS)

      return () => {
        clearInterval(interval)
      }
    },
    cancel() {
      // no-op
    },
  })
}

function createSseHeaders() {
  return {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return "Live relay unavailable"
}

export async function GET(request: Request) {
  const session = await getSessionFromHeaders(request.headers)
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const watchlist = await listSharedWatchlistItems()

  if (!isRelayConfigured()) {
    return new Response(createDisconnectedStream(buildDisconnectedMarketSnapshot({
      watchlist,
      reason: "Live relay is not configured.",
    })), {
      headers: createSseHeaders(),
    })
  }

  try {
    await syncRelaySubscriptions(watchlist)
    const upstream = await streamRelayEvents()

    if (!upstream.ok || !upstream.body) {
      throw new Error(`Relay event stream failed with status ${upstream.status}.`)
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: createSseHeaders(),
    })
  } catch (error) {
    return new Response(createDisconnectedStream(buildDisconnectedMarketSnapshot({
      watchlist,
      reason: getErrorMessage(error),
    })), {
      headers: createSseHeaders(),
    })
  }
}
