import { RefreshCw, TrendingUp, Minus, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReviewPick, PickStatus } from "@/lib/data"

function statusConfig(status: PickStatus) {
  switch (status) {
    case "On Track":
      return {
        icon: TrendingUp,
        badge: "text-bullish border-bullish/30 bg-bullish/10",
        dot: "bg-bullish",
      }
    case "Revise Target":
      return {
        icon: Minus,
        badge: "text-amber border-amber/30 bg-amber/10",
        dot: "bg-amber",
      }
    case "Exit":
      return {
        icon: XCircle,
        badge: "text-bearish border-bearish/30 bg-bearish/10",
        dot: "bg-bearish",
      }
    default:
      return {
        icon: Minus,
        badge: "text-muted-foreground border-border bg-secondary",
        dot: "bg-muted-foreground",
      }
  }
}

function pnl(entry: number, cmp: number) {
  const pct = (((cmp - entry) / entry) * 100).toFixed(1)
  const isUp = cmp >= entry
  return { pct, isUp }
}

export default function PicksUnderReview({ picks }: { picks: ReviewPick[] }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <RefreshCw className="size-4 text-primary" />
        <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
          D. Picks Under Review
        </h2>
      </div>
      <div className="border border-border rounded-md overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[1fr_5rem_5rem_5rem_6rem] gap-4 bg-secondary/60 border-b border-border px-4 py-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Stock</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-right">Entry</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-right">CMP</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-right">P&L</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-right">Status</span>
        </div>

        {picks.map((p, i) => {
          const cfg = statusConfig(p.status)
          const StatusIcon = cfg.icon
          const { pct, isUp } = pnl(p.entryPrice, p.cmp)

          return (
            <div
              key={i}
              className="border-b border-border/50 last:border-b-0 px-4 py-3 hover:bg-secondary/30 transition-colors space-y-2"
            >
              {/* Main row */}
              <div className="flex items-start justify-between gap-3 md:grid md:grid-cols-[1fr_5rem_5rem_5rem_6rem] md:gap-4">
                {/* Company */}
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full shrink-0",
                        cfg.dot
                      )}
                    />
                    <span className="font-mono text-xs font-bold text-primary">{p.ticker}</span>
                    <span className="text-sm font-semibold text-foreground">{p.company}</span>
                  </div>
                  <p className="font-mono text-[11px] text-muted-foreground pl-3.5">
                    Added {p.weekAdded} · Tgt ₹{p.targetPrice.toLocaleString("en-IN")}
                  </p>
                </div>

                {/* Entry */}
                <div className="text-right hidden md:block">
                  <span className="font-mono text-xs text-muted-foreground">
                    ₹{p.entryPrice.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* CMP */}
                <div className="text-right hidden md:block">
                  <span className="font-mono text-xs text-foreground font-semibold">
                    ₹{p.cmp.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* P&L */}
                <div className="text-right hidden md:block">
                  <span
                    className={cn(
                      "font-mono text-xs font-bold",
                      isUp ? "text-bullish" : "text-bearish"
                    )}
                  >
                    {isUp ? "+" : ""}{pct}%
                  </span>
                </div>

                {/* Status badge */}
                <div className="flex justify-end items-start">
                  <span
                    className={cn(
                      "font-mono text-[10px] font-semibold tracking-wide border rounded-sm px-2 py-0.5 flex items-center gap-1 whitespace-nowrap",
                      cfg.badge
                    )}
                  >
                    <StatusIcon className="size-2.5" />
                    {p.status}
                  </span>
                </div>
              </div>

              {/* Mobile P&L row */}
              <div className="flex gap-4 md:hidden font-mono text-xs pl-3.5">
                <span className="text-muted-foreground">Entry ₹{p.entryPrice.toLocaleString("en-IN")}</span>
                <span className="text-foreground">CMP ₹{p.cmp.toLocaleString("en-IN")}</span>
                <span className={cn(isUp ? "text-bullish" : "text-bearish", "font-bold")}>
                  {isUp ? "+" : ""}{pct}%
                </span>
              </div>

              {/* Status note */}
              <div className="pl-3.5">
                <p className="text-xs text-muted-foreground leading-relaxed">{p.statusNote}</p>
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground/60 italic">
                  Source: {p.statusSource}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
