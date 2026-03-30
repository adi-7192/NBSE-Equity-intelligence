"use client"

import Link from "next/link"
import { TrendingUp, TrendingDown, Activity, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UpdateButton } from "./update-button"

interface MarketBaseline {
  date: string
  nifty50: { value: number; change: number }
  niftyMidcap100: { value: number; change: number }
  brentCrude: { value: number; change: number }
  inrUsd: { value: number; change: number }
  gsec10y: { value: number; change: number }
}

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

export default function MarketHeader({ marketBaseline }: { marketBaseline: MarketBaseline }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      {/* Top bar — brand + date */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <Activity className="size-4 text-primary" />
          <span className="font-mono text-xs font-bold tracking-[0.2em] text-primary uppercase">
            Equity Intelligence
          </span>
          <span className="hidden sm:inline text-muted-foreground font-mono text-xs">
            NSE / BSE · Large &amp; Mid Cap
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-bullish animate-pulse" />
            <span className="font-mono text-xs text-muted-foreground">
              Week of {marketBaseline.date}
            </span>
          </div>
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
          <UpdateButton />
        </div>
      </div>

      {/* Market baseline tickers */}
      <div className="overflow-x-auto">
        <div className="flex items-center gap-6 px-4 py-3 min-w-max">
          <Ticker
            label="NIFTY 50"
            value={marketBaseline.nifty50.value}
            change={marketBaseline.nifty50.change}
            decimals={0}
          />
          <div className="w-px h-8 bg-border" />
          <Ticker
            label="MIDCAP 100"
            value={marketBaseline.niftyMidcap100.value}
            change={marketBaseline.niftyMidcap100.change}
            decimals={0}
          />
          <div className="w-px h-8 bg-border" />
          <Ticker
            label="BRENT $/bbl"
            value={marketBaseline.brentCrude.value}
            change={marketBaseline.brentCrude.change}
            prefix="$"
            decimals={1}
          />
          <div className="w-px h-8 bg-border" />
          <Ticker
            label="INR/USD"
            value={marketBaseline.inrUsd.value}
            change={marketBaseline.inrUsd.change}
            decimals={2}
          />
          <div className="w-px h-8 bg-border" />
          <Ticker
            label="10Y G-SEC"
            value={marketBaseline.gsec10y.value}
            change={marketBaseline.gsec10y.change}
            suffix="%"
            decimals={2}
          />
        </div>
      </div>
    </header>
  )
}
