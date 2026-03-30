import { EventEmitter } from "node:events"
import type { Tick } from "kiteconnect"
import {
  STALE_AFTER_MS,
  createEmptyInstrumentQuote,
  createIndianMarketState,
  deriveFreshnessState,
  toIsoString,
  type BenchmarkInstrument,
  type ConnectionInfo,
  type ConnectionState,
  type LiveMarketSnapshot,
  type MarketHeartbeatEventData,
  type MarketInstrumentQuote,
  type MarketQuotesEventData,
  type MarketStatusEventData,
  type MarketStreamEvent,
  type SharedWatchlistInstrument,
  type TrackedInstrument,
} from "../../lib/live-market/contracts"

type QuoteState = {
  lastPrice: number | null
  absoluteChange: number | null
  changePercent: number | null
  volume: number | null
  previousClose: number | null
  exchangeTimestamp: string | null
  receivedAt: string | null
}

type RelayEventListener = (event: MarketStreamEvent) => void

function createQuoteState(tick: Tick, receivedAt: string): QuoteState {
  const previousClose = tick.ohlc?.close ?? null
  const lastPrice = typeof tick.last_price === "number" ? tick.last_price : null

  return {
    lastPrice,
    absoluteChange:
      previousClose !== null && lastPrice !== null ? Number((lastPrice - previousClose).toFixed(2)) : null,
    changePercent: typeof tick.change === "number" ? tick.change : null,
    volume: typeof tick.volume_traded === "number" ? tick.volume_traded : null,
    previousClose,
    exchangeTimestamp: toIsoString(tick.exchange_timestamp ?? null),
    receivedAt,
  }
}

export class LiveMarketStore {
  private readonly emitter = new EventEmitter()
  private readonly quotesByToken = new Map<number, QuoteState>()
  private benchmarkDefinitions: Record<string, BenchmarkInstrument> = {}
  private sharedWatchlistItems: SharedWatchlistInstrument[] = []
  private sequence = 0
  private lastHeartbeatAt: string | null = null
  private connection: ConnectionInfo = {
    state: "disconnected",
    lastHeartbeatAt: null,
    message: "Relay not connected",
  }

  setBenchmarks(benchmarks: Record<string, BenchmarkInstrument>) {
    this.benchmarkDefinitions = benchmarks
  }

  replaceSharedWatchlist(items: SharedWatchlistInstrument[]) {
    this.sharedWatchlistItems = [...items].sort(
      (left, right) => left.sortOrder - right.sortOrder || left.displayName.localeCompare(right.displayName)
    )
    this.publishSnapshot()
  }

  getSubscribedTokens() {
    const benchmarkTokens = Object.values(this.benchmarkDefinitions)
      .map((benchmark) => benchmark.instrumentToken)
      .filter((token): token is number => token !== null)

    const watchlistTokens = this.sharedWatchlistItems.map((item) => item.instrumentToken)
    return [...new Set([...benchmarkTokens, ...watchlistTokens])]
  }

  onEvent(listener: RelayEventListener) {
    this.emitter.on("event", listener)
    return () => {
      this.emitter.off("event", listener)
    }
  }

  getSnapshot(): LiveMarketSnapshot {
    const market = createIndianMarketState()
    const asOf = this.getAsOf()
    const ageMs = asOf ? Math.max(0, Date.now() - new Date(asOf).getTime()) : null
    const freshness = {
      state: deriveFreshnessState(ageMs),
      ageMs,
      staleAfterMs: STALE_AFTER_MS,
    } as const

    return {
      sequence: this.sequence,
      source: "kite-relay",
      asOf,
      market,
      freshness,
      connection: this.connection,
      benchmarks: {
        nifty50: this.getQuoteForInstrument(this.benchmarkDefinitions.nifty50),
        sensex: this.getQuoteForInstrument(this.benchmarkDefinitions.sensex),
        niftyBank: this.getQuoteForInstrument(this.benchmarkDefinitions.niftyBank),
        midcap150: this.getQuoteForInstrument(this.benchmarkDefinitions.midcap150),
      },
      watchlist: this.sharedWatchlistItems.map((item) => this.getQuoteForInstrument(item)),
    }
  }

  getHealth() {
    return {
      connection: this.connection,
      subscriptions: {
        benchmarks: Object.values(this.benchmarkDefinitions).filter((item) => item.instrumentToken !== null).length,
        watchlist: this.sharedWatchlistItems.length,
        total: this.getSubscribedTokens().length,
      },
      snapshot: this.getSnapshot(),
    }
  }

  setConnectionState(state: ConnectionState, message: string | null) {
    this.connection = {
      state,
      lastHeartbeatAt: this.lastHeartbeatAt,
      message,
    }

    this.publish({
      type: "status",
      data: this.createStatusEventData(),
    })
  }

  recordHeartbeat(at: Date = new Date()) {
    this.lastHeartbeatAt = at.toISOString()
    this.connection = {
      ...this.connection,
      lastHeartbeatAt: this.lastHeartbeatAt,
    }
  }

  ingestTicks(ticks: Tick[]) {
    if (ticks.length === 0) {
      return
    }

    const receivedAt = new Date().toISOString()
    this.recordHeartbeat(new Date(receivedAt))

    const changedQuotes: MarketInstrumentQuote[] = []
    for (const tick of ticks) {
      const instrumentToken = tick.instrument_token
      if (!this.getSubscribedTokens().includes(instrumentToken)) {
        continue
      }

      this.quotesByToken.set(instrumentToken, createQuoteState(tick, receivedAt))
      const trackedInstrument = this.findTrackedInstrument(instrumentToken)
      if (trackedInstrument) {
        changedQuotes.push(this.getQuoteForInstrument(trackedInstrument))
      }
    }

    if (changedQuotes.length === 0) {
      return
    }

    this.publish({
      type: "quotes",
      data: this.createQuotesEventData(changedQuotes),
    })
  }

  createHeartbeatEvent(): MarketStreamEvent {
    this.recordHeartbeat()
    return {
      type: "heartbeat",
      data: this.createHeartbeatEventData(),
    }
  }

  publishSnapshot() {
    this.publish({
      type: "snapshot",
      data: this.snapshotWithSequence(this.nextSequence()),
    })
  }

  private publish(event: MarketStreamEvent) {
    this.emitter.emit("event", event)
  }

  private nextSequence() {
    this.sequence += 1
    return this.sequence
  }

  private snapshotWithSequence(sequence: number): LiveMarketSnapshot {
    return {
      ...this.getSnapshot(),
      sequence,
    }
  }

  private createStatusEventData(): MarketStatusEventData {
    const snapshot = this.snapshotWithSequence(this.nextSequence())
    return {
      sequence: snapshot.sequence,
      asOf: snapshot.asOf,
      market: snapshot.market,
      freshness: snapshot.freshness,
      connection: snapshot.connection,
    }
  }

  private createQuotesEventData(quotes: MarketInstrumentQuote[]): MarketQuotesEventData {
    const snapshot = this.snapshotWithSequence(this.nextSequence())
    return {
      sequence: snapshot.sequence,
      asOf: snapshot.asOf,
      market: snapshot.market,
      freshness: snapshot.freshness,
      connection: snapshot.connection,
      quotes,
    }
  }

  private createHeartbeatEventData(): MarketHeartbeatEventData {
    return {
      sequence: this.nextSequence(),
      at: this.lastHeartbeatAt ?? new Date().toISOString(),
      connection: this.connection,
    }
  }

  private getAsOf() {
    const timestamps = [...this.quotesByToken.values()]
      .flatMap((quote) => [quote.exchangeTimestamp, quote.receivedAt])
      .filter((value): value is string => Boolean(value))
      .map((value) => new Date(value).getTime())

    if (timestamps.length === 0) {
      return null
    }

    return new Date(Math.max(...timestamps)).toISOString()
  }

  private getQuoteForInstrument(instrument?: TrackedInstrument): MarketInstrumentQuote {
    if (!instrument) {
      return createEmptyInstrumentQuote({
        exchange: "NSE",
        symbol: "UNKNOWN",
        displayName: "Unknown",
        instrumentToken: null,
      })
    }

    if (instrument.instrumentToken === null) {
      return createEmptyInstrumentQuote(instrument)
    }

    const quote = this.quotesByToken.get(instrument.instrumentToken)
    if (!quote) {
      return createEmptyInstrumentQuote(instrument)
    }

    return {
      exchange: instrument.exchange,
      symbol: instrument.symbol,
      displayName: instrument.displayName,
      instrumentToken: instrument.instrumentToken,
      lastPrice: quote.lastPrice,
      absoluteChange: quote.absoluteChange,
      changePercent: quote.changePercent,
      volume: quote.volume,
      previousClose: quote.previousClose,
      exchangeTimestamp: quote.exchangeTimestamp,
      receivedAt: quote.receivedAt,
    }
  }

  private findTrackedInstrument(instrumentToken: number) {
    const benchmark = Object.values(this.benchmarkDefinitions).find(
      (item) => item.instrumentToken === instrumentToken
    )
    if (benchmark) {
      return benchmark
    }

    return this.sharedWatchlistItems.find((item) => item.instrumentToken === instrumentToken)
  }
}
