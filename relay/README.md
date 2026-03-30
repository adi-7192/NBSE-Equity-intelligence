# Equity Intelligence Relay

This service owns the long-lived Zerodha Kite market-data connection for Phase 2.

## Purpose

- Maintain a persistent Kite WebSocket connection outside Vercel serverless.
- Keep an in-memory latest-price snapshot for the four benchmark indices and the shared watchlist.
- Expose narrow machine endpoints for the main app:
  - `GET /health`
  - `GET /snapshot`
  - `GET /events`
  - `POST /subscriptions/sync`

## Required Environment

Set these in the same shell you use to run the relay:

```bash
LIVE_RELAY_PORT=4001
LIVE_RELAY_SECRET=replace-with-a-shared-relay-secret
KITE_API_KEY=your-kite-api-key
KITE_ACCESS_TOKEN=your-fresh-kite-access-token
KITE_BENCHMARK_NIFTY50_TOKEN=...
KITE_BENCHMARK_SENSEX_TOKEN=...
KITE_BENCHMARK_NIFTY_BANK_TOKEN=...
KITE_BENCHMARK_MIDCAP150_TOKEN=...
```

## Run Locally

From the repo root:

```bash
npm run relay:dev
```

Or directly:

```bash
npm run dev --prefix relay
```

## Operational Notes

- `KITE_ACCESS_TOKEN` is not a forever secret. Refresh it operationally each day before market open.
- If the relay restarts, the Next.js app will resync the shared watchlist subscriptions on the next authenticated market request.
- The relay keeps only in-memory market state in Phase 2. Postgres remains the source of truth for the shared watchlist configuration, not for live ticks.

## Recovery Checklist

If live prices stop updating:

1. Confirm `GET /health` still reports the relay as reachable.
2. Refresh `KITE_ACCESS_TOKEN` if it has expired.
3. Restart the relay process.
4. Open the app again so the authenticated market route can resync the shared watchlist subscriptions.
