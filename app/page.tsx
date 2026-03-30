import SessionToolbar from "@/components/session-toolbar"
import { getLiveData } from "@/lib/archive"
import { getRequiredSession, hasAdminRole } from "@/lib/auth"
import { listSharedWatchlistItems } from "@/lib/db/queries/shared-watchlist"
import { buildDisconnectedMarketSnapshot } from "@/lib/live-market/instruments"
import { fetchRelaySnapshot, isRelayConfigured, syncRelaySubscriptions } from "@/lib/live-market/relay-client"
import type { LiveMarketSnapshot } from "@/lib/live-market/contracts"
import {
  alertCards as defaultAlerts,
  macroPulse as defaultMacro,
  sectorRankings as defaultSectors,
  stockPicks as defaultPicks,
  picksUnderReview as defaultReview,
  type AlertCard,
  type MacroBullet,
  type SectorRanking,
  type StockPick,
  type ReviewPick,
} from "@/lib/data"
import DashboardClient from "@/components/dashboard-client"

interface LiveData {
  alertCards?: AlertCard[]
  macroPulse?: MacroBullet[]
  sectorRankings?: SectorRanking[]
  stockPicks?: StockPick[]
  picksUnderReview?: ReviewPick[]
}

async function getInitialMarketSnapshot(): Promise<LiveMarketSnapshot> {
  const watchlist = await listSharedWatchlistItems()

  if (!isRelayConfigured()) {
    return buildDisconnectedMarketSnapshot({
      watchlist,
      reason: "Live relay is not configured yet.",
    })
  }

  try {
    await syncRelaySubscriptions(watchlist)
    return await fetchRelaySnapshot()
  } catch (error) {
    return buildDisconnectedMarketSnapshot({
      watchlist,
      reason: error instanceof Error ? error.message : "Live relay unavailable",
    })
  }
}

export default async function Home() {
  const session = await getRequiredSession()
  const isAdmin = hasAdminRole(session.user.role)

  // Try to load durable live data; fall back to static defaults when the database is empty.
  const live = (await getLiveData(session.user.id)) as LiveData | null

  const data = {
    alertCards: live?.alertCards ?? defaultAlerts,
    macroPulse: live?.macroPulse ?? defaultMacro,
    sectorRankings: live?.sectorRankings ?? defaultSectors,
    stockPicks: live?.stockPicks ?? defaultPicks,
    picksUnderReview: live?.picksUnderReview ?? defaultReview,
  }

  const marketSnapshot = await getInitialMarketSnapshot()

  return (
    <>
      <SessionToolbar email={session.user.email} isAdmin={isAdmin} />
      <DashboardClient initialMarketSnapshot={marketSnapshot} {...data} />
    </>
  )
}
