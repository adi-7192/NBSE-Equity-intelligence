import { KiteTicker, type Tick, type Ticker } from "kiteconnect"
import { LiveMarketStore } from "./store"

function getKiteCredentials() {
  const apiKey = process.env.KITE_API_KEY
  const accessToken = process.env.KITE_ACCESS_TOKEN

  if (!apiKey || !accessToken) {
    return null
  }

  return {
    apiKey,
    accessToken,
  }
}

export class KiteRelayController {
  private ticker: Ticker | null = null
  private desiredTokens = new Set<number>()

  constructor(private readonly store: LiveMarketStore) {}

  start() {
    const credentials = getKiteCredentials()
    if (!credentials) {
      this.store.setConnectionState("disconnected", "Kite credentials are missing or expired.")
      return
    }

    this.ticker = new KiteTicker({
      api_key: credentials.apiKey,
      access_token: credentials.accessToken,
      reconnect: true,
      max_retry: 50,
      max_delay: 60,
    })

    this.registerListeners(this.ticker)
    this.ticker.connect()
  }

  syncSubscriptions(tokens: number[]) {
    const nextTokens = [...new Set(tokens.filter((token) => Number.isInteger(token) && token > 0))]
    const nextTokenSet = new Set(nextTokens)

    if (this.ticker?.connected()) {
      const toUnsubscribe = [...this.desiredTokens].filter((token) => !nextTokenSet.has(token))
      const toSubscribe = nextTokens.filter((token) => !this.desiredTokens.has(token))

      if (toUnsubscribe.length > 0) {
        this.ticker.unsubscribe(toUnsubscribe)
      }

      if (toSubscribe.length > 0) {
        this.ticker.subscribe(toSubscribe)
      }

      if (nextTokens.length > 0) {
        this.ticker.setMode(this.ticker.modeQuote, nextTokens)
      }
    }

    this.desiredTokens = nextTokenSet
    this.store.publishSnapshot()
  }

  private registerListeners(ticker: Ticker) {
    ticker.on("connect", () => {
      this.store.recordHeartbeat()
      this.store.setConnectionState("connected", "Connected to Kite live feed.")
      this.applyDesiredSubscriptions()
    })

    ticker.on("ticks", (ticks: Tick[]) => {
      this.store.ingestTicks(ticks)
    })

    ticker.on("reconnect", (attempt, interval) => {
      this.store.setConnectionState(
        "degraded",
        `Reconnecting to Kite (attempt ${attempt}, next retry ${interval}s).`
      )
    })

    ticker.on("error", (error) => {
      this.store.setConnectionState("disconnected", error.message)
    })

    ticker.on("disconnect", (error) => {
      this.store.setConnectionState("disconnected", error.message)
    })

    ticker.on("close", (reason) => {
      this.store.setConnectionState("disconnected", reason)
    })

    ticker.on("noreconnect", () => {
      this.store.setConnectionState("disconnected", "Kite relay exhausted all reconnect attempts.")
    })
  }

  private applyDesiredSubscriptions() {
    if (!this.ticker || this.desiredTokens.size === 0) {
      return
    }

    const tokens = [...this.desiredTokens]
    this.ticker.subscribe(tokens)
    this.ticker.setMode(this.ticker.modeQuote, tokens)
  }
}
