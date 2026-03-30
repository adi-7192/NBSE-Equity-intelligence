import { liveMarketSnapshotSchema, relaySubscriptionSyncRequestSchema, type SharedWatchlistInstrument } from "./contracts"

const LIVE_RELAY_URL = process.env.LIVE_RELAY_URL
const LIVE_RELAY_SECRET = process.env.LIVE_RELAY_SECRET

export class RelayClientError extends Error {
  constructor(
    message: string,
    readonly status: number = 500
  ) {
    super(message)
    this.name = "RelayClientError"
  }
}

function requireRelayConfig() {
  if (!LIVE_RELAY_URL) {
    throw new RelayClientError("LIVE_RELAY_URL is not configured.", 503)
  }

  if (!LIVE_RELAY_SECRET) {
    throw new RelayClientError("LIVE_RELAY_SECRET is not configured.", 503)
  }

  return {
    url: LIVE_RELAY_URL.replace(/\/$/, ""),
    secret: LIVE_RELAY_SECRET,
  }
}

function createRelayHeaders(extra?: HeadersInit) {
  const relay = requireRelayConfig()

  return {
    Authorization: `Bearer ${relay.secret}`,
    ...extra,
  }
}

export function isRelayConfigured() {
  return Boolean(LIVE_RELAY_URL && LIVE_RELAY_SECRET)
}

export async function fetchRelaySnapshot() {
  const relay = requireRelayConfig()
  const response = await fetch(`${relay.url}/snapshot`, {
    headers: createRelayHeaders(),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  })

  if (!response.ok) {
    throw new RelayClientError(`Relay snapshot request failed with status ${response.status}.`, response.status)
  }

  const payload = await response.json()
  return liveMarketSnapshotSchema.parse(payload)
}

export async function streamRelayEvents() {
  const relay = requireRelayConfig()
  return fetch(`${relay.url}/events`, {
    headers: createRelayHeaders({
      Accept: "text/event-stream",
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  })
}

export async function syncRelaySubscriptions(watchlist: SharedWatchlistInstrument[]) {
  const relay = requireRelayConfig()
  const payload = relaySubscriptionSyncRequestSchema.parse({
    watchlist,
  })

  const response = await fetch(`${relay.url}/subscriptions/sync`, {
    method: "POST",
    headers: createRelayHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  })

  if (!response.ok) {
    throw new RelayClientError(`Relay subscription sync failed with status ${response.status}.`, response.status)
  }

  return response.json()
}
