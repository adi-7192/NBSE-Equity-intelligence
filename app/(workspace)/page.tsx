import DashboardClient from "@/components/dashboard-client"
import ConnectEmptyState from "@/components/integrations/connect-empty-state"
import {
  alertCards as defaultAlerts,
  macroPulse as defaultMacro,
  sectorRankings as defaultSectors,
  stockPicks as defaultPicks,
  picksUnderReview as defaultReview,
  type AlertCard,
  type MacroBullet,
  type ReviewPick,
  type SectorRanking,
  type StockPick,
} from "@/lib/data"
import { getLiveData } from "@/lib/archive"
import { getRequiredSession } from "@/lib/auth"
import { listSharedWatchlistItems } from "@/lib/db/queries/shared-watchlist"
import { listUserIntegrations } from "@/lib/db/queries/user-integrations"
import { buildDisconnectedMarketSnapshot } from "@/lib/live-market/instruments"
import {
  fetchRelaySnapshot,
  isRelayConfigured,
  syncRelaySubscriptions,
} from "@/lib/live-market/relay-client"
import type { LiveMarketSnapshot } from "@/lib/live-market/contracts"

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
  const live = (await getLiveData(session.user.id)) as LiveData | null
  const integrations = await listUserIntegrations(session.user.id)

  const data = {
    alertCards: live?.alertCards ?? defaultAlerts,
    macroPulse: live?.macroPulse ?? defaultMacro,
    sectorRankings: live?.sectorRankings ?? defaultSectors,
    stockPicks: live?.stockPicks ?? defaultPicks,
    picksUnderReview: live?.picksUnderReview ?? defaultReview,
  }

  const marketSnapshot = await getInitialMarketSnapshot()
  const hasZerodha = integrations.some((item) => item.provider === "zerodha")
  const hasAiProvider = integrations.some((item) =>
    item.provider === "openai" || item.provider === "gemini" || item.provider === "anthropic"
  )

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[28px] border border-border/70 bg-card/75 p-6 shadow-[0_30px_100px_-60px_rgba(0,0,0,0.9)]">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
            Dashboard
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-foreground md:text-4xl">
            Market context, conviction work, and personal setup in one workspace.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground md:text-[15px]">
            The shell is now organized around the way you actually work: live market awareness at
            the top, durable research below, and dedicated settings for the provider connections
            that power the next stages of the terminal.
          </p>
        </div>

        <div className="grid gap-4">
          {!hasZerodha ? (
            <ConnectEmptyState
              eyebrow="Zerodha"
              title="Connect Zerodha to personalize your live market workflows."
              body="Your dashboard still loads, but your personal brokerage connection is not configured yet."
              ctaLabel="Open Settings"
              href="/settings#integrations"
            />
          ) : (
            <ConnectEmptyState
              eyebrow="Zerodha"
              title="Zerodha connection stored"
              body="Your personal Zerodha credentials are saved server-side and ready for the next personalized market workflows."
              ctaLabel="Review Settings"
              href="/settings#integrations"
              tone="configured"
            />
          )}

          {!hasAiProvider ? (
            <ConnectEmptyState
              eyebrow="AI Providers"
              title="Connect an AI provider for your personal intelligence workflows."
              body="Add OpenAI, Gemini, or Anthropic from Settings so future AI-driven workflows can use your own provider access."
              ctaLabel="Configure Providers"
              href="/settings#integrations"
            />
          ) : (
            <ConnectEmptyState
              eyebrow="AI Providers"
              title="Personal AI provider ready"
              body="At least one AI provider is configured for your account and stored safely server-side."
              ctaLabel="Manage Providers"
              href="/settings#integrations"
              tone="configured"
            />
          )}
        </div>
      </section>

      <DashboardClient initialMarketSnapshot={marketSnapshot} {...data} />
    </div>
  )
}
