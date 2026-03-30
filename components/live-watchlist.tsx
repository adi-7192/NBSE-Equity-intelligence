import { Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ConnectionInfo, MarketInstrumentQuote } from "@/lib/live-market/contracts"

function formatPrice(value: number | null) {
  if (value === null) {
    return "—"
  }

  return value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "—"
  }

  const prefix = value > 0 ? "+" : ""
  return `${prefix}${value.toFixed(2)}%`
}

function formatVolume(value: number | null) {
  if (value === null) {
    return "—"
  }

  return value.toLocaleString("en-IN")
}

export default function LiveWatchlist({
  items,
  connection,
}: {
  items: MarketInstrumentQuote[]
  connection: ConnectionInfo
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Eye className="size-4 text-primary" />
          <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Shared Live Watchlist
          </h2>
        </div>
        <p className="font-mono text-[11px] text-muted-foreground">
          Admin-managed starter list
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-4 py-5 text-sm text-muted-foreground">
          No tracked symbols yet. The admin can add the first shared watchlist names from the admin panel.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="grid grid-cols-[1.1fr_0.8fr_0.8fr_0.9fr] gap-3 border-b border-border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <span>Symbol</span>
            <span>Last Price</span>
            <span>Change</span>
            <span>Volume</span>
          </div>
          <div className="divide-y divide-border">
            {items.map((item) => {
              const isPositive = (item.changePercent ?? 0) >= 0
              const isDisconnected = connection.state === "disconnected" || item.lastPrice === null

              return (
                <div
                  key={`${item.exchange}:${item.symbol}:${item.instrumentToken ?? "pending"}`}
                  className="grid grid-cols-[1.1fr_0.8fr_0.8fr_0.9fr] gap-3 px-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold text-foreground">{item.symbol}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.displayName}</p>
                  </div>
                  <div className="font-mono text-sm text-foreground">{formatPrice(item.lastPrice)}</div>
                  <div
                    className={cn(
                      "font-mono text-sm",
                      isDisconnected ? "text-muted-foreground" : isPositive ? "text-bullish" : "text-bearish"
                    )}
                  >
                    {formatPercent(item.changePercent)}
                  </div>
                  <div className="font-mono text-sm text-muted-foreground">{formatVolume(item.volume)}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
