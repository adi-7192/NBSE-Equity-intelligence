"use client"

import Link from "next/link"
import { TrendingUp, TrendingDown, Activity, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
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
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      {/* Top bar — brand + live market status */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <Activity className="size-4 text-primary" />
          <span className="font-mono text-xs font-bold tracking-[0.2em] text-primary uppercase">
            Equity Intelligence
          </span>
          <span className="hidden sm:inline text-muted-foreground font-mono text-xs">
            Live Market · NSE / BSE
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/archives">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <Archive className="h-4 w-4" />
              <span className="hidden sm:inline">Archives</span>
            </Button>
          </Link>
          <UpdateButton label="Refresh Weekly Brief" />
        </div>
      </div>

      <div className="border-b border-border/50 px-4 py-2.5">
        <div className="mx-auto max-w-5xl">
          <LiveMarketStatus
            market={marketSnapshot.market}
            freshness={marketSnapshot.freshness}
            connection={marketSnapshot.connection}
            asOf={marketSnapshot.asOf}
            source={marketSnapshot.source}
          />
        </div>
      </div>

      {/* Market baseline tickers */}
      <div className="overflow-x-auto">
        <div className="flex items-center gap-6 px-4 py-3 min-w-max">
          <Ticker
            label="NIFTY 50"
            value={marketSnapshot.benchmarks.nifty50.lastPrice ?? 0}
            change={marketSnapshot.benchmarks.nifty50.changePercent ?? 0}
            decimals={0}
          />
          <div className="w-px h-8 bg-border" />
          <Ticker
            label="SENSEX"
            value={marketSnapshot.benchmarks.sensex.lastPrice ?? 0}
            change={marketSnapshot.benchmarks.sensex.changePercent ?? 0}
            decimals={0}
          />
          <div className="w-px h-8 bg-border" />
          <Ticker
            label="NIFTY BANK"
            value={marketSnapshot.benchmarks.niftyBank.lastPrice ?? 0}
            change={marketSnapshot.benchmarks.niftyBank.changePercent ?? 0}
            decimals={0}
          />
          <div className="w-px h-8 bg-border" />
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
