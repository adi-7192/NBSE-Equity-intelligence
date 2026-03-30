import { z } from "zod"

export const MARKET_TIMEZONE = "Asia/Kolkata"
export const FRESH_AFTER_MS = 10_000
export const STALE_AFTER_MS = 30_000
export const HEARTBEAT_INTERVAL_MS = 30_000

export const benchmarkKeys = ["nifty50", "sensex", "niftyBank", "midcap150"] as const
export const exchangeCodes = ["NSE", "BSE"] as const
export const marketPhases = ["preopen", "open", "postclose", "closed", "holiday"] as const
export const freshnessStates = ["fresh", "lagging", "stale"] as const
export const connectionStates = ["connected", "degraded", "disconnected"] as const

export type BenchmarkKey = (typeof benchmarkKeys)[number]
export type ExchangeCode = (typeof exchangeCodes)[number]
export type MarketPhase = (typeof marketPhases)[number]
export type FreshnessState = (typeof freshnessStates)[number]
export type ConnectionState = (typeof connectionStates)[number]

export interface TrackedInstrument {
  exchange: ExchangeCode
  symbol: string
  displayName: string
  instrumentToken: number | null
}

export interface BenchmarkInstrument extends TrackedInstrument {
  key: BenchmarkKey
}

export interface SharedWatchlistInstrument extends Omit<TrackedInstrument, "instrumentToken"> {
  id: string
  instrumentToken: number
  notes?: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface MarketInstrumentQuote extends TrackedInstrument {
  lastPrice: number | null
  absoluteChange: number | null
  changePercent: number | null
  volume: number | null
  previousClose: number | null
  exchangeTimestamp: string | null
  receivedAt: string | null
}

export interface MarketState {
  phase: MarketPhase
  isOpen: boolean
  sessionDate: string
  timezone: typeof MARKET_TIMEZONE
  nextTransitionAt: string | null
  reason: string | null
}

export interface FreshnessInfo {
  state: FreshnessState
  ageMs: number | null
  staleAfterMs: number
}

export interface ConnectionInfo {
  state: ConnectionState
  lastHeartbeatAt: string | null
  message: string | null
}

export interface LiveMarketSnapshot {
  sequence: number
  source: "kite-relay" | "app-fallback"
  asOf: string | null
  market: MarketState
  freshness: FreshnessInfo
  connection: ConnectionInfo
  benchmarks: Record<BenchmarkKey, MarketInstrumentQuote>
  watchlist: MarketInstrumentQuote[]
}

export interface MarketQuotesEventData {
  sequence: number
  asOf: string | null
  market: MarketState
  freshness: FreshnessInfo
  connection: ConnectionInfo
  quotes: MarketInstrumentQuote[]
}

export interface MarketStatusEventData {
  sequence: number
  asOf: string | null
  market: MarketState
  freshness: FreshnessInfo
  connection: ConnectionInfo
}

export interface MarketHeartbeatEventData {
  sequence: number
  at: string
  connection: ConnectionInfo
}

export type MarketStreamEvent =
  | { type: "snapshot"; data: LiveMarketSnapshot }
  | { type: "quotes"; data: MarketQuotesEventData }
  | { type: "status"; data: MarketStatusEventData }
  | { type: "heartbeat"; data: MarketHeartbeatEventData }

const instrumentSchema = z.object({
  exchange: z.enum(exchangeCodes),
  symbol: z.string().min(1),
  displayName: z.string().min(1),
  instrumentToken: z.number().int().positive().nullable(),
})

export const benchmarkInstrumentSchema = instrumentSchema.extend({
  key: z.enum(benchmarkKeys),
})

export const sharedWatchlistInstrumentSchema = instrumentSchema.extend({
  id: z.string().uuid(),
  instrumentToken: z.number().int().positive(),
  notes: z.string().nullable().optional(),
  sortOrder: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const marketInstrumentQuoteSchema = instrumentSchema.extend({
  lastPrice: z.number().nullable(),
  absoluteChange: z.number().nullable(),
  changePercent: z.number().nullable(),
  volume: z.number().nullable(),
  previousClose: z.number().nullable(),
  exchangeTimestamp: z.string().datetime().nullable(),
  receivedAt: z.string().datetime().nullable(),
})

export const marketStateSchema = z.object({
  phase: z.enum(marketPhases),
  isOpen: z.boolean(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timezone: z.literal(MARKET_TIMEZONE),
  nextTransitionAt: z.string().datetime().nullable(),
  reason: z.string().nullable(),
})

export const freshnessInfoSchema = z.object({
  state: z.enum(freshnessStates),
  ageMs: z.number().int().nonnegative().nullable(),
  staleAfterMs: z.number().int().positive(),
})

export const connectionInfoSchema = z.object({
  state: z.enum(connectionStates),
  lastHeartbeatAt: z.string().datetime().nullable(),
  message: z.string().nullable(),
})

export const liveMarketSnapshotSchema = z.object({
  sequence: z.number().int().nonnegative(),
  source: z.enum(["kite-relay", "app-fallback"]),
  asOf: z.string().datetime().nullable(),
  market: marketStateSchema,
  freshness: freshnessInfoSchema,
  connection: connectionInfoSchema,
  benchmarks: z.object({
    nifty50: marketInstrumentQuoteSchema,
    sensex: marketInstrumentQuoteSchema,
    niftyBank: marketInstrumentQuoteSchema,
    midcap150: marketInstrumentQuoteSchema,
  }),
  watchlist: z.array(marketInstrumentQuoteSchema),
})

export const marketQuotesEventSchema = z.object({
  sequence: z.number().int().nonnegative(),
  asOf: z.string().datetime().nullable(),
  market: marketStateSchema,
  freshness: freshnessInfoSchema,
  connection: connectionInfoSchema,
  quotes: z.array(marketInstrumentQuoteSchema),
})

export const marketStatusEventSchema = z.object({
  sequence: z.number().int().nonnegative(),
  asOf: z.string().datetime().nullable(),
  market: marketStateSchema,
  freshness: freshnessInfoSchema,
  connection: connectionInfoSchema,
})

export const marketHeartbeatEventSchema = z.object({
  sequence: z.number().int().nonnegative(),
  at: z.string().datetime(),
  connection: connectionInfoSchema,
})

export const relaySubscriptionSyncRequestSchema = z.object({
  watchlist: z.array(sharedWatchlistInstrumentSchema),
})

function getIndiaDateParts(now: Date) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: MARKET_TIMEZONE,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  const parts = Object.fromEntries(
    formatter
      .formatToParts(now)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  ) as Record<string, string>

  return {
    weekday: parts.weekday,
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  }
}

function createTransitionDateIso(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
) {
  // Convert an Asia/Kolkata clock time to UTC ISO by subtracting the fixed offset.
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour - 5, minute - 30, 0))
  return utcDate.toISOString()
}

export function createIndianMarketState(now: Date = new Date()): MarketState {
  const parts = getIndiaDateParts(now)
  const sessionDate = `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`
  const weekday = parts.weekday.toLowerCase()
  const totalMinutes = parts.hour * 60 + parts.minute

  if (weekday === "sat" || weekday === "sun") {
    return {
      phase: "holiday",
      isOpen: false,
      sessionDate,
      timezone: MARKET_TIMEZONE,
      nextTransitionAt: null,
      reason: "Weekend",
    }
  }

  if (totalMinutes < 540) {
    return {
      phase: "closed",
      isOpen: false,
      sessionDate,
      timezone: MARKET_TIMEZONE,
      nextTransitionAt: createTransitionDateIso(parts.year, parts.month, parts.day, 9, 0),
      reason: "Market not open yet",
    }
  }

  if (totalMinutes < 555) {
    return {
      phase: "preopen",
      isOpen: false,
      sessionDate,
      timezone: MARKET_TIMEZONE,
      nextTransitionAt: createTransitionDateIso(parts.year, parts.month, parts.day, 9, 15),
      reason: "Pre-open session",
    }
  }

  if (totalMinutes < 930) {
    return {
      phase: "open",
      isOpen: true,
      sessionDate,
      timezone: MARKET_TIMEZONE,
      nextTransitionAt: createTransitionDateIso(parts.year, parts.month, parts.day, 15, 30),
      reason: null,
    }
  }

  if (totalMinutes < 960) {
    return {
      phase: "postclose",
      isOpen: false,
      sessionDate,
      timezone: MARKET_TIMEZONE,
      nextTransitionAt: createTransitionDateIso(parts.year, parts.month, parts.day, 16, 0),
      reason: "Post-close session",
    }
  }

  return {
    phase: "closed",
    isOpen: false,
    sessionDate,
    timezone: MARKET_TIMEZONE,
    nextTransitionAt: null,
    reason: "Market closed for the day",
  }
}

export function deriveFreshnessState(ageMs: number | null): FreshnessState {
  if (ageMs === null) {
    return "stale"
  }

  if (ageMs <= FRESH_AFTER_MS) {
    return "fresh"
  }

  if (ageMs <= STALE_AFTER_MS) {
    return "lagging"
  }

  return "stale"
}

export function toIsoString(value?: Date | string | null): string | null {
  if (!value) {
    return null
  }

  if (typeof value === "string") {
    return value
  }

  return value.toISOString()
}

export function createEmptyInstrumentQuote(instrument: TrackedInstrument): MarketInstrumentQuote {
  return {
    exchange: instrument.exchange,
    symbol: instrument.symbol,
    displayName: instrument.displayName,
    instrumentToken: instrument.instrumentToken,
    lastPrice: null,
    absoluteChange: null,
    changePercent: null,
    volume: null,
    previousClose: null,
    exchangeTimestamp: null,
    receivedAt: null,
  }
}
