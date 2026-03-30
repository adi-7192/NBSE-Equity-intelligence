import { generateText, Output } from "ai"
import { z } from "zod"
import { archiveCurrentData, saveLiveData, getLiveData } from "@/lib/archive"
import { getSessionFromHeaders } from "@/lib/auth"
import {
  marketBaseline,
  alertCards,
  macroPulse,
  sectorRankings,
  stockPicks,
  picksUnderReview,
  watchNextWeek,
} from "@/lib/data"

// ── Schema for structured market data extraction ──────────────────────────────

const MarketDataSchema = z.object({
  marketBaseline: z.object({
    date: z.string().describe("Date in DD MMM YYYY format"),
    nifty50: z.object({
      value: z.number().describe("Nifty 50 index value"),
      change: z.number().describe("Weekly percentage change"),
    }),
    niftyMidcap100: z.object({
      value: z.number().describe("Nifty Midcap 100 index value"),
      change: z.number().describe("Weekly percentage change"),
    }),
    brentCrude: z.object({
      value: z.number().describe("Brent crude price in USD/bbl"),
      change: z.number().describe("Weekly percentage change"),
    }),
    inrUsd: z.object({
      value: z.number().describe("INR/USD exchange rate"),
      change: z.number().describe("Weekly change"),
    }),
    gsec10y: z.object({
      value: z.number().describe("10-year G-Sec yield percentage"),
      change: z.number().describe("Weekly change in bps"),
    }),
  }),
  alerts: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().describe("Event headline"),
        source: z.string().describe("Source name"),
        sourceUrl: z.string().describe("Source URL"),
        date: z.string().describe("Event date in DD MMM YYYY"),
        what: z.string().describe("What happened — detailed description"),
        implication: z.string().describe("Investment implications for Indian markets"),
        stocks: z.array(z.string()).describe("Affected NSE ticker symbols (3–5 tickers)"),
        timeframe: z.string().describe("Investment timeframe"),
        risk: z.string().describe("Risk/invalidation scenario"),
        severity: z.enum(["high", "medium", "low"]),
      })
    )
    .describe("3 major market-moving events"),
  macroPulse: z
    .array(
      z.object({
        icon: z.enum(["rate", "fii", "crude", "gst", "capex"]).describe("Icon type"),
        text: z.string().describe("Macro data point with specific numbers and sources"),
        source: z.string().describe("Source attribution"),
      })
    )
    .describe("5 key macro indicators"),
  sectorRankings: z
    .array(
      z.object({
        rank: z.number().min(1).max(8),
        sector: z.string(),
        rating: z.enum(["Overweight", "Neutral", "Underweight"]),
        rationale: z.string().describe("One-line rationale with data points"),
      })
    )
    .describe(
      "Rankings for all 8 sectors: Defence, Pharma, Banking, Infrastructure, Energy, Auto, FMCG, IT"
    ),
  watchNextWeek: z
    .array(
      z.object({
        date: z.string().describe("Date in DD MMM YYYY"),
        event: z.string().describe("Event name"),
        relevance: z.string().describe("Why it matters for Indian markets"),
        tickers: z.array(z.string()).describe("Affected NSE tickers"),
      })
    )
    .describe("3 upcoming events for next week"),
})

export async function POST(request: Request) {
  try {
    const session = await getSessionFromHeaders(request.headers)
    if (!session) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      )
    }

    const modelId = "anthropic/claude-opus-4.6"

    // Step 1: Gather and archive the current dataset
    const currentLive = await getLiveData(session.user.id)
    const currentData = currentLive ?? {
      marketBaseline,
      alertCards,
      macroPulse,
      sectorRankings,
      stockPicks,
      picksUnderReview,
      watchNextWeek,
    }

    const archiveResult = await archiveCurrentData(
      {
        ...(currentData as object),
        archivedAt: new Date().toISOString(),
      },
      session.user.id
    )

    // Step 2: Use AI to generate fresh market data
    const today = new Date()
    const dateStr = today.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })

    const result = await generateText({
      model: modelId,
      output: Output.object({ schema: MarketDataSchema }),
      system: `You are a senior equity research analyst specialising in Indian capital markets (NSE/BSE).
Your task is to generate a comprehensive weekly market intelligence briefing.

Today's date: ${dateStr}

Guidelines:
- Provide realistic and internally consistent market data for Indian equities
- Use actual NSE ticker symbols (e.g., HDFCBANK, RELIANCE, TCS, HAL, BPCL, SUNPHARMA)
- Reference real institutions as sources: RBI, NSE, BSE, MoSPI, PIB, IEA, Federal Reserve, SEBI
- Include specific numbers, percentages, and plausible dates
- Focus on current themes: global macro → India FII flows, RBI policy, corporate earnings, govt capex
- Maintain professional equity research tone
- Generate fresh alerts about realistic market-moving events (different from the previous week)
- Rank sectors based on current macro conditions`,
      prompt: `Generate a fresh weekly market intelligence report for Indian equities as of the week of ${dateStr}.

Include:
1. Nifty 50 and Midcap 100 levels with realistic weekly changes
2. Brent crude price (USD/bbl) and INR/USD rate
3. 10-year G-Sec yield
4. 3 distinct market-moving events with detailed analysis (global macro, domestic policy, corporate/sector developments)
5. 5 macro indicators: RBI policy update, FII equity flows (weekly), CPI/WPI print, GST collections, govt capex progress
6. Updated sector rankings for all 8 sectors: Defence, Pharma, Banking, Infrastructure, Energy, Auto, FMCG, IT
7. 3 upcoming events for next week with affected tickers

Make the data realistic and plausible for the current market environment. Vary the events and rankings from a typical prior week.`,
    })

    if (!result.output) {
      throw new Error("AI did not return structured market data")
    }

    const newData = result.output

    // Step 3: Persist the new data and carry over stock picks / picks-under-review
    // (those require manual research — only auto-update the high-frequency fields)
    const livePayload = {
      marketBaseline: newData.marketBaseline,
      alertCards: newData.alerts,
      macroPulse: newData.macroPulse,
      sectorRankings: newData.sectorRankings,
      stockPicks: (currentData as { stockPicks?: unknown }).stockPicks ?? stockPicks,
      picksUnderReview: (currentData as { picksUnderReview?: unknown }).picksUnderReview ?? picksUnderReview,
      watchNextWeek: newData.watchNextWeek,
      sourceModel: modelId,
      updatedAt: new Date().toISOString(),
    }

    await saveLiveData(livePayload, session.user.id)

    return Response.json({
      success: true,
      message: "Market data updated successfully",
      archived: archiveResult.filename,
      updatedAt: livePayload.updatedAt,
      summary: {
        nifty50: newData.marketBaseline.nifty50.value,
        alertsCount: newData.alerts.length,
        date: newData.marketBaseline.date,
      },
    })
  } catch (error) {
    console.error("[update-data] Error:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Update failed",
      },
      { status: 500 }
    )
  }
}
