"use client"

import { TrendingUp, TrendingDown, Activity, Sparkles } from "lucide-react"
import type { LiveMarketSnapshot } from "@/lib/live-market/contracts"
import { UpdateButton } from "./update-button"
import LiveMarketStatus from "./live-market-status"

function Ticker({
  label,
  value,
  change,
  prefix = "",
  suffix = "",
  decimals = 2,
}: {
  label: string
  value: number
  change: number
  prefix?: string
  suffix?: string
  decimals?: number
}) {
  const isUp = change >= 0
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
        {label}
      </span>
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-sm font-semibold text-foreground">
          {prefix}
          {value.toLocaleString("en-IN", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })}
          {suffix}
        </span>
        <span
          className={`flex items-center gap-0.5 text-xs font-mono font-medium ${
            isUp ? "text-bullish" : "text-bearish"
          }`}
        >
          {isUp ? (
            <TrendingUp className="size-3" />
          ) : (
            <TrendingDown className="size-3" />
          )}
          {isUp ? "+" : ""}
          {change.toFixed(2)}
        </span>
      </div>
    </div>
  )
}

export default function MarketHeader({ marketSnapshot }: { marketSnapshot: LiveMarketSnapshot }) {
  return (
    <header className="overflow-hidden rounded-[32px] border border-border/70 bg-card/80 shadow-[0_32px_120px_-70px_rgba(214,165,74,0.45)]">
      <div className="border-b border-border/60 px-5 py-5 md:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <Activity className="size-4 text-primary" />
              <span className="font-mono text-xs font-bold tracking-[0.2em] text-primary uppercase">
                Live Market
              </span>
              <span className="hidden sm:inline text-muted-foreground font-mono text-xs">
                NSE / BSE terminal layer
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-foreground md:text-[2rem]">
              Benchmarks, trust state, and market context at a glance.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              This top layer is now explicitly about live market awareness. The weekly intelligence
              sections stay below as a separate analysis surface.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-border/70 bg-background/75 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground lg:flex">
              <Sparkles className="mr-2 size-3.5 text-primary" />
              Weekly refresh remains manual
            </div>
            <UpdateButton label="Refresh Weekly Brief" />
          </div>
        </div>
      </div>

      <div className="border-b border-border/60 px-5 py-4 md:px-6">
        <LiveMarketStatus
          market={marketSnapshot.market}
          freshness={marketSnapshot.freshness}
          connection={marketSnapshot.connection}
          asOf={marketSnapshot.asOf}
          source={marketSnapshot.source}
        />
      </div>

      <div className="overflow-x-auto px-5 py-5 md:px-6">
        <div className="grid min-w-[48rem] grid-cols-4 gap-3">
          <Ticker
            label="NIFTY 50"
            value={marketSnapshot.benchmarks.nifty50.lastPrice ?? 0}
            change={marketSnapshot.benchmarks.nifty50.changePercent ?? 0}
            decimals={0}
          />
          <Ticker
            label="SENSEX"
            value={marketSnapshot.benchmarks.sensex.lastPrice ?? 0}
            change={marketSnapshot.benchmarks.sensex.changePercent ?? 0}
            decimals={0}
          />
          <Ticker
            label="NIFTY BANK"
            value={marketSnapshot.benchmarks.niftyBank.lastPrice ?? 0}
            change={marketSnapshot.benchmarks.niftyBank.changePercent ?? 0}
            decimals={0}
          />
          <Ticker
            label="MIDCAP 150"
            value={marketSnapshot.benchmarks.midcap150.lastPrice ?? 0}
            change={marketSnapshot.benchmarks.midcap150.changePercent ?? 0}
            decimals={0}
          />
        </div>
      </div>
    </header>
  )
}
