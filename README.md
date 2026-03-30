# NBSE Equity Intelligence

Private Indian equities research workspace built on Next.js, Drizzle, PostgreSQL, Better Auth, and a separate Kite-ready live market relay.

## Current Scope

Phases 1 and 2 are implemented:

- Durable PostgreSQL-backed dashboard state and archive storage
- Private email/password authentication with Better Auth
- One bootstrap admin account
- Admin-managed account creation inside the app
- User-scoped dashboard and archive data
- Shared live watchlist persistence and admin controls
- Authenticated live market snapshot and SSE routes
- Standalone relay service for Zerodha Kite market data
- Live dashboard header with explicit disconnected and market-state messaging

Real Zerodha validation is still pending. The relay and dashboard are wired up, but you still need fresh Kite credentials and a market-hours test to confirm end-to-end live prices.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Fill in `.env` with real values.

3. Run the generated migrations against your Supabase database.

4. Start the app:

```bash
npm run dev
```

5. If you want live market data locally, run the relay in a second terminal:

```bash
npm run relay:dev
```

## Environment Variables

- `DATABASE_URL`: Supabase Postgres connection string
- `BETTER_AUTH_SECRET`: long random secret for Better Auth
- `BETTER_AUTH_URL`: app base URL, for example `http://localhost:3000`
- `BOOTSTRAP_ADMIN_EMAIL`: one-time first admin email
- `BOOTSTRAP_ADMIN_PASSWORD`: one-time first admin password
- `LIVE_RELAY_URL`: base URL for the standalone live market relay, for example `http://localhost:4001`
- `LIVE_RELAY_SECRET`: shared bearer token used between the app and the relay
- `LIVE_RELAY_PORT`: local relay port, for example `4001`
- `KITE_API_KEY`: Zerodha Kite API key for the relay
- `KITE_ACCESS_TOKEN`: fresh Zerodha Kite access token
- `KITE_BENCHMARK_NIFTY50_TOKEN`: instrument token for Nifty 50
- `KITE_BENCHMARK_SENSEX_TOKEN`: instrument token for Sensex
- `KITE_BENCHMARK_NIFTY_BANK_TOKEN`: instrument token for Nifty Bank
- `KITE_BENCHMARK_MIDCAP150_TOKEN`: instrument token for Nifty Midcap 150

## Supabase Setup

Detailed Supabase setup lives in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).

## Relay Setup

Relay-specific runtime notes live in [relay/README.md](./relay/README.md).

## Verification

These commands passed locally during the completed implementation work:

```bash
npm run lint
npx tsc --noEmit
npx drizzle-kit generate
```
