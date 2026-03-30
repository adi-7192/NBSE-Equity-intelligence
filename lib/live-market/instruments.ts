import {
  STALE_AFTER_MS,
  createEmptyInstrumentQuote,
  createIndianMarketState,
  type BenchmarkInstrument,
  type BenchmarkKey,
  type LiveMarketSnapshot,
  type SharedWatchlistInstrument,
} from "./contracts"

type BenchmarkCatalogEntry = {
  key: BenchmarkKey
  exchange: "NSE" | "BSE"
  symbol: string
  displayName: string
  tokenEnvVar: string
}

const benchmarkCatalog: Record<BenchmarkKey, BenchmarkCatalogEntry> = {
  nifty50: {
    key: "nifty50",
    exchange: "NSE",
    symbol: "NIFTY 50",
    displayName: "Nifty 50",
    tokenEnvVar: "KITE_BENCHMARK_NIFTY50_TOKEN",
  },
  sensex: {
    key: "sensex",
    exchange: "BSE",
    symbol: "SENSEX",
    displayName: "Sensex",
    tokenEnvVar: "KITE_BENCHMARK_SENSEX_TOKEN",
  },
  niftyBank: {
    key: "niftyBank",
    exchange: "NSE",
    symbol: "NIFTY BANK",
    displayName: "Nifty Bank",
    tokenEnvVar: "KITE_BENCHMARK_NIFTY_BANK_TOKEN",
  },
  midcap150: {
    key: "midcap150",
    exchange: "NSE",
    symbol: "NIFTY MIDCAP 150",
    displayName: "Midcap 150",
    tokenEnvVar: "KITE_BENCHMARK_MIDCAP150_TOKEN",
  },
}

export const SHARED_WATCHLIST_SEED: Array<{
  exchange: "NSE" | "BSE"
  symbol: string
  displayName: string
  instrumentToken: number
  notes?: string | null
}> = []

function parseInstrumentToken(envVarName: string) {
  const value = process.env[envVarName]
  if (!value) {
    return null
  }

  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export function getBenchmarkCatalogEntry(key: BenchmarkKey): BenchmarkCatalogEntry {
  return benchmarkCatalog[key]
}

export function getConfiguredBenchmarkDefinitions(): Record<BenchmarkKey, BenchmarkInstrument> {
  return {
    nifty50: {
      ...benchmarkCatalog.nifty50,
      instrumentToken: parseInstrumentToken(benchmarkCatalog.nifty50.tokenEnvVar),
    },
    sensex: {
      ...benchmarkCatalog.sensex,
      instrumentToken: parseInstrumentToken(benchmarkCatalog.sensex.tokenEnvVar),
    },
    niftyBank: {
      ...benchmarkCatalog.niftyBank,
      instrumentToken: parseInstrumentToken(benchmarkCatalog.niftyBank.tokenEnvVar),
    },
    midcap150: {
      ...benchmarkCatalog.midcap150,
      instrumentToken: parseInstrumentToken(benchmarkCatalog.midcap150.tokenEnvVar),
    },
  }
}

export function getConfiguredBenchmarkTokens() {
  const benchmarks = getConfiguredBenchmarkDefinitions()
  return Object.values(benchmarks)
    .map((benchmark) => benchmark.instrumentToken)
    .filter((token): token is number => token !== null)
}

export function buildDisconnectedMarketSnapshot(options: {
  watchlist?: SharedWatchlistInstrument[]
  reason?: string
}): LiveMarketSnapshot {
  const benchmarks = getConfiguredBenchmarkDefinitions()
  const watchlist = options.watchlist ?? []

  return {
    sequence: 0,
    source: "app-fallback",
    asOf: null,
    market: createIndianMarketState(),
    freshness: {
      state: "stale",
      ageMs: null,
      staleAfterMs: STALE_AFTER_MS,
    },
    connection: {
      state: "disconnected",
      lastHeartbeatAt: null,
      message: options.reason ?? "Live relay unavailable",
    },
    benchmarks: {
      nifty50: createEmptyInstrumentQuote(benchmarks.nifty50),
      sensex: createEmptyInstrumentQuote(benchmarks.sensex),
      niftyBank: createEmptyInstrumentQuote(benchmarks.niftyBank),
      midcap150: createEmptyInstrumentQuote(benchmarks.midcap150),
    },
    watchlist: watchlist.map((item) => createEmptyInstrumentQuote(item)),
  }
}
