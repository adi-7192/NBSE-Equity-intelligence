"use client"

import { startTransition, useEffect, useEffectEvent, useState } from "react"
import { BarChart2, Bell, BookOpen, Target, RefreshCw, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import MarketHeader from "@/components/market-header"
import AlertCards from "@/components/alert-cards"
import MacroPulse from "@/components/macro-pulse"
import SectorRankings from "@/components/sector-rankings"
import StockPicks from "@/components/stock-picks"
import PicksUnderReview from "@/components/picks-under-review"
import LiveWatchlist from "@/components/live-watchlist"
import type {
  AlertCard,
  MacroBullet,
  SectorRanking,
  StockPick,
  ReviewPick,
} from "@/lib/data"
import type {
  LiveMarketSnapshot,
  MarketHeartbeatEventData,
  MarketInstrumentQuote,
  MarketQuotesEventData,
  MarketStatusEventData,
} from "@/lib/live-market/contracts"

interface Props {
  initialMarketSnapshot: LiveMarketSnapshot
  alertCards: AlertCard[]
  macroPulse: MacroBullet[]
  sectorRankings: SectorRanking[]
  stockPicks: StockPick[]
  picksUnderReview: ReviewPick[]
}

type Tab = "alerts" | "digest" | "picks" | "review" | "watch"

function mergeQuoteList(items: MarketInstrumentQuote[], quotes: MarketInstrumentQuote[]) {
  const quotesByToken = new Map(
    quotes
      .filter((quote) => quote.instrumentToken !== null)
      .map((quote) => [quote.instrumentToken, quote])
  )

  return items.map((item) => {
    if (item.instrumentToken === null) {
      return item
    }

    const next = quotesByToken.get(item.instrumentToken)
    return next ? { ...item, ...next } : item
  })
}

export default function DashboardClient({
  initialMarketSnapshot,
  alertCards,
  macroPulse,
  sectorRankings,
  stockPicks,
  picksUnderReview,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("alerts")
  const [marketSnapshot, setMarketSnapshot] = useState(initialMarketSnapshot)

  const refreshSnapshot = useEffectEvent(async () => {
    const response = await fetch("/api/market/snapshot", {
      cache: "no-store",
    })

    const snapshot = (await response.json()) as LiveMarketSnapshot
    startTransition(() => {
      setMarketSnapshot(snapshot)
    })
  })

  const applyQuotes = useEffectEvent((payload: MarketQuotesEventData) => {
    startTransition(() => {
      setMarketSnapshot((current) => ({
        ...current,
        sequence: payload.sequence,
        asOf: payload.asOf,
        market: payload.market,
        freshness: payload.freshness,
        connection: payload.connection,
        benchmarks: {
          ...current.benchmarks,
          nifty50:
            payload.quotes.find((quote) => quote.instrumentToken === current.benchmarks.nifty50.instrumentToken) ??
            current.benchmarks.nifty50,
          sensex:
            payload.quotes.find((quote) => quote.instrumentToken === current.benchmarks.sensex.instrumentToken) ??
            current.benchmarks.sensex,
          niftyBank:
            payload.quotes.find((quote) => quote.instrumentToken === current.benchmarks.niftyBank.instrumentToken) ??
            current.benchmarks.niftyBank,
          midcap150:
            payload.quotes.find((quote) => quote.instrumentToken === current.benchmarks.midcap150.instrumentToken) ??
            current.benchmarks.midcap150,
        },
        watchlist: mergeQuoteList(current.watchlist, payload.quotes),
      }))
    })
  })

  const applyStatus = useEffectEvent((payload: MarketStatusEventData) => {
    startTransition(() => {
      setMarketSnapshot((current) => ({
        ...current,
        sequence: payload.sequence,
        asOf: payload.asOf,
        market: payload.market,
        freshness: payload.freshness,
        connection: payload.connection,
      }))
    })
  })

  const applyHeartbeat = useEffectEvent((payload: MarketHeartbeatEventData) => {
    startTransition(() => {
      setMarketSnapshot((current) => ({
        ...current,
        sequence: payload.sequence,
        connection: {
          ...current.connection,
          ...payload.connection,
          lastHeartbeatAt: payload.at,
        },
      }))
    })
  })

  useEffect(() => {
    if (marketSnapshot.market.phase !== "open") {
      const interval = window.setInterval(() => {
        void refreshSnapshot()
      }, 60_000)

      const handleFocus = () => {
        void refreshSnapshot()
      }

      window.addEventListener("focus", handleFocus)
      return () => {
        window.clearInterval(interval)
        window.removeEventListener("focus", handleFocus)
      }
    }

    const stream = new EventSource("/api/market/stream")

    stream.addEventListener("snapshot", (event) => {
      const snapshot = JSON.parse((event as MessageEvent<string>).data) as LiveMarketSnapshot
      startTransition(() => {
        setMarketSnapshot(snapshot)
      })
    })

    stream.addEventListener("quotes", (event) => {
      applyQuotes(JSON.parse((event as MessageEvent<string>).data) as MarketQuotesEventData)
    })

    stream.addEventListener("status", (event) => {
      applyStatus(JSON.parse((event as MessageEvent<string>).data) as MarketStatusEventData)
    })

    stream.addEventListener("heartbeat", (event) => {
      applyHeartbeat(JSON.parse((event as MessageEvent<string>).data) as MarketHeartbeatEventData)
    })

    stream.onerror = () => {
      void refreshSnapshot()
    }

    return () => {
      stream.close()
    }
  }, [marketSnapshot.market.phase])

  const tabs: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: "alerts", label: "Event Radar", icon: Bell, count: alertCards.length },
    { id: "digest", label: "Macro & Sectors", icon: BarChart2 },
    { id: "picks", label: "Stock Picks", icon: Target, count: stockPicks.length },
    { id: "review", label: "Under Review", icon: RefreshCw, count: picksUnderReview.length },
    { id: "watch", label: "Live Watchlist", icon: Eye, count: marketSnapshot.watchlist.length },
  ]

  return (
    <div className="space-y-6 text-foreground">
      <MarketHeader marketSnapshot={marketSnapshot} />

      <div className="rounded-[28px] border border-border/70 bg-card/75 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-primary" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Weekly Intelligence
            </span>
            <span className="font-mono text-xs text-muted-foreground">·</span>
            <span className="font-mono text-xs text-muted-foreground">
              Analysis Layer · Archives, alerts, sectors, and conviction work
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[28px] border border-border/70 bg-card/65">
        <div className="px-3">
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

      <main className="space-y-8 rounded-[32px] border border-border/70 bg-card/55 p-4 md:p-6">
        {activeTab === "alerts" && <AlertCards alerts={alertCards} />}

        {activeTab === "digest" && (
          <div className="space-y-8">
            <MacroPulse bullets={macroPulse} />
            <SectorRankings sectors={sectorRankings} />
          </div>
        )}

        {activeTab === "picks" && <StockPicks picks={stockPicks} />}

        {activeTab === "review" && <PicksUnderReview picks={picksUnderReview} />}

        {activeTab === "watch" && (
          <LiveWatchlist
            items={marketSnapshot.watchlist}
            connection={marketSnapshot.connection}
          />
        )}
      </main>

      <footer className="rounded-[24px] border border-border/70 bg-card/55 px-5 py-5">
        <div>
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
