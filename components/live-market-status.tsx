import type { ConnectionInfo, FreshnessInfo, MarketState } from "@/lib/live-market/contracts"

function getStatusTone(connection: ConnectionInfo, freshness: FreshnessInfo, market: MarketState) {
  if (connection.state === "disconnected") {
    return "text-bearish border-bearish/30 bg-bearish/10"
  }

  if (market.phase === "closed" || market.phase === "holiday") {
    return "text-muted-foreground border-border bg-secondary/40"
  }

  if (freshness.state === "stale" || connection.state === "degraded") {
    return "text-amber-400 border-amber-400/30 bg-amber-400/10"
  }

  return "text-bullish border-bullish/30 bg-bullish/10"
}

function getStatusLabel(connection: ConnectionInfo, freshness: FreshnessInfo, market: MarketState) {
  if (connection.state === "disconnected") {
    return "Disconnected"
  }

  if (market.phase === "holiday") {
    return "Market Holiday"
  }

  if (market.phase === "closed") {
    return "Market Closed"
  }

  if (market.phase === "preopen") {
    return "Pre-open"
  }

  if (market.phase === "postclose") {
    return "Post-close"
  }

  if (freshness.state === "stale") {
    return "Stale"
  }

  if (freshness.state === "lagging" || connection.state === "degraded") {
    return "Delayed"
  }

  return "Live"
}

function formatAsOf(value: string | null) {
  if (!value) {
    return "Awaiting live data"
  }

  return new Date(value).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export default function LiveMarketStatus({
  market,
  freshness,
  connection,
  asOf,
  source,
}: {
  market: MarketState
  freshness: FreshnessInfo
  connection: ConnectionInfo
  asOf: string | null
  source: string
}) {
  const label = getStatusLabel(connection, freshness, market)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] ${getStatusTone(connection, freshness, market)}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {label}
      </span>
      <span className="font-mono text-[11px] text-muted-foreground">
        As of {formatAsOf(asOf)} IST
      </span>
      <span className="hidden sm:inline font-mono text-[11px] text-muted-foreground">
        Source: {source}
      </span>
      {connection.message && (
        <span className="w-full font-mono text-[11px] text-muted-foreground sm:w-auto">
          {connection.message}
        </span>
      )}
    </div>
  )
}
