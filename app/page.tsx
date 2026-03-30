import SessionToolbar from "@/components/session-toolbar"
import { getLiveData } from "@/lib/archive"
import { getRequiredSession, hasAdminRole } from "@/lib/auth"
import {
  marketBaseline as defaultBaseline,
  alertCards as defaultAlerts,
  macroPulse as defaultMacro,
  sectorRankings as defaultSectors,
  stockPicks as defaultPicks,
  picksUnderReview as defaultReview,
  watchNextWeek as defaultWatch,
  type AlertCard,
  type MacroBullet,
  type SectorRanking,
  type StockPick,
  type ReviewPick,
  type WatchItem,
} from "@/lib/data"
import DashboardClient from "@/components/dashboard-client"

interface LiveData {
  marketBaseline?: typeof defaultBaseline
  alertCards?: AlertCard[]
  macroPulse?: MacroBullet[]
  sectorRankings?: SectorRanking[]
  stockPicks?: StockPick[]
  picksUnderReview?: ReviewPick[]
  watchNextWeek?: WatchItem[]
}

export default async function Home() {
  const session = await getRequiredSession()
  const isAdmin = hasAdminRole(session.user.role)

  // Try to load durable live data; fall back to static defaults when the database is empty.
  const live = (await getLiveData(session.user.id)) as LiveData | null

  const data = {
    marketBaseline: live?.marketBaseline ?? defaultBaseline,
    alertCards: live?.alertCards ?? defaultAlerts,
    macroPulse: live?.macroPulse ?? defaultMacro,
    sectorRankings: live?.sectorRankings ?? defaultSectors,
    stockPicks: live?.stockPicks ?? defaultPicks,
    picksUnderReview: live?.picksUnderReview ?? defaultReview,
    watchNextWeek: live?.watchNextWeek ?? defaultWatch,
  }

  return (
    <>
      <SessionToolbar email={session.user.email} isAdmin={isAdmin} />
      <DashboardClient {...data} />
    </>
  )
}
