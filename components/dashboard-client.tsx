"use client"

import { useState } from "react"
import { BarChart2, Bell, BookOpen, Target, RefreshCw, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import MarketHeader from "@/components/market-header"
import AlertCards from "@/components/alert-cards"
import MacroPulse from "@/components/macro-pulse"
import SectorRankings from "@/components/sector-rankings"
import StockPicks from "@/components/stock-picks"
import PicksUnderReview from "@/components/picks-under-review"
import WatchNextWeek from "@/components/watch-next-week"
import type {
  AlertCard,
  MacroBullet,
  SectorRanking,
  StockPick,
  ReviewPick,
  WatchItem,
} from "@/lib/data"

interface Props {
  marketBaseline: {
    date: string
    nifty50: { value: number; change: number }
    niftyMidcap100: { value: number; change: number }
    brentCrude: { value: number; change: number }
    inrUsd: { value: number; change: number }
    gsec10y: { value: number; change: number }
  }
  alertCards: AlertCard[]
  macroPulse: MacroBullet[]
  sectorRankings: SectorRanking[]
  stockPicks: StockPick[]
  picksUnderReview: ReviewPick[]
  watchNextWeek: WatchItem[]
}

type Tab = "alerts" | "digest" | "picks" | "review" | "watch"

export default function DashboardClient({
  marketBaseline,
  alertCards,
  macroPulse,
  sectorRankings,
  stockPicks,
  picksUnderReview,
  watchNextWeek,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("alerts")

  const tabs: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: "alerts", label: "Event Radar", icon: Bell, count: alertCards.length },
    { id: "digest", label: "Macro & Sectors", icon: BarChart2 },
    { id: "picks", label: "Stock Picks", icon: Target, count: stockPicks.length },
    { id: "review", label: "Under Review", icon: RefreshCw, count: picksUnderReview.length },
    { id: "watch", label: "Watch List", icon: Eye, count: watchNextWeek.length },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketHeader marketBaseline={marketBaseline} />

      {/* Page title */}
      <div className="border-b border-border bg-card/50 px-4 py-3">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-primary" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Weekly Digest
            </span>
            <span className="font-mono text-xs text-muted-foreground">·</span>
            <span className="font-mono text-xs text-muted-foreground">
              NSE/BSE · Large &amp; Mid Cap · 6–12M Horizon
            </span>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-border bg-card/30 sticky top-[91px] z-40 overflow-x-auto">
        <div className="max-w-5xl mx-auto px-4">
          <nav className="flex gap-0 min-w-max" role="tablist" aria-label="Digest sections">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  <Icon className="size-3.5" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span
                      className={cn(
                        "font-mono text-[10px] rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center",
                        isActive
                          ? "bg-primary/20 text-primary"
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        {activeTab === "alerts" && <AlertCards alerts={alertCards} />}

        {activeTab === "digest" && (
          <div className="space-y-8">
            <MacroPulse bullets={macroPulse} />
            <SectorRankings sectors={sectorRankings} />
          </div>
        )}

        {activeTab === "picks" && <StockPicks picks={stockPicks} />}

        {activeTab === "review" && <PicksUnderReview picks={picksUnderReview} />}

        {activeTab === "watch" && <WatchNextWeek items={watchNextWeek} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Disclaimer:</strong> This digest is for informational
            and research purposes only. It does not constitute investment advice. All picks carry
            risk — past performance is no guarantee of future returns. Always do your own due
            diligence. Stop losses and targets are indicative only. Universe: NSE/BSE Large &amp;
            Mid cap. Horizon: 6–12 months. Risk: Moderate.
          </p>
        </div>
      </footer>
    </div>
  )
}
