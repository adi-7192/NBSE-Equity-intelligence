# Architecture Research — Indian Bloomberg Terminal

**Domain:** Personal financial terminal, Indian equity markets
**Researched:** 2026-03-30
**Overall confidence:** HIGH (Kite API docs confirmed, Vercel constraints verified, auth landscape verified)

---

## Component Map

Seven major components with clear boundaries. Each can be reasoned about independently.

### 1. Auth Layer
**Responsibility:** Session management, user identity, route protection for 2-5 users.
**Technology:** Better Auth (email/password, database sessions, middleware cookie check).
**Why Better Auth over Auth.js / Lucia:** Auth.js v5 discourages credentials-only use; Lucia deprecated March 2025. Better Auth is the current TypeScript-native recommendation for Next.js + PostgreSQL + email/password with active maintenance as of 2026.
**Communicates with:** PostgreSQL (session store), Next.js middleware (cookie check), all API routes (session validation).

### 2. Real-Time Relay
**Responsibility:** Maintain a single persistent connection to Kite WebSocket (`wss://ws.kite.trade`), receive binary tick data, fan out to browser clients.
**Technology:** KiteTicker (official `kiteconnect` npm package, TypeScript), SSE route handler for browser delivery.
**Constraints:** Kite supports up to 3,000 instrument tokens per connection and 3 connections per API key. Binary packets: LTP (8 bytes), Quote (44 bytes), Full mode with depth (184 bytes). Prices arrive in paise — divide by 100.
**Communicates with:** Kite WebSocket (upstream), browser clients via SSE (downstream), in-process tick buffer.

### 3. Fundamentals ETL
**Responsibility:** Scheduled ingestion of P&L, balance sheet, cash flow statements, and key ratios into PostgreSQL. Runs after market close.
**Technology:** Vercel Cron Jobs (HTTP GET to Next.js API route) for orchestration; actual fetch/parse logic in the route handler.
**Data sources:** BSE bulk data CSVs, Screener.in (scraping or export), or a paid fundamentals API (Tickertape) if scraping proves fragile.
**Communicates with:** External data sources (HTTP), PostgreSQL (writes), OHLCV ingestion (Kite REST historical API).

### 4. Market Data Store (PostgreSQL)
**Responsibility:** Single source of truth for all persistent data: stock universe, OHLCV history, fundamentals (P&L, BS, CF), user portfolios, watchlists, alert definitions, and intelligence archives.
**Technology:** PostgreSQL 16 (Supabase or self-hosted). Plain PostgreSQL is sufficient at this scale — TimescaleDB hypertable optimization is optional and adds operational complexity; defer unless query latency becomes a problem.
**Communicates with:** ETL (writes), API routes (reads), screener query engine.

### 5. Unified Data API
**Responsibility:** Serve the browser with merged views: live prices + fundamentals + portfolio positions + news. Each route composes data from multiple sources behind a single clean interface.
**Technology:** Next.js App Router Route Handlers (existing pattern). No separate API gateway — overkill for personal use.
**Pattern:** Aggregation at the route layer. Example: `GET /api/stocks/[ticker]` fetches DB fundamentals, reads latest tick from Redis/in-memory cache, and joins. The client never calls Kite directly.
**Communicates with:** PostgreSQL (fundamentals, portfolio, alerts), Redis/Upstash KV (tick cache), Kite REST API (historical OHLCV on demand), News API (RSS/HTTP).

### 6. Screener Engine
**Responsibility:** Filter 5,000+ Indian stocks by fundamental criteria (PE, PB, ROE, ROCE, debt/equity, revenue growth, margin trends). Return sorted, paginated results.
**Technology:** PostgreSQL queries with indexes on screener filter columns. Results cached in Upstash Redis/KV with TTL.
**Communicates with:** PostgreSQL (primary query), Upstash KV (cached result sets), Unified Data API (caller).

### 7. AI Intelligence Layer (existing, extended)
**Responsibility:** Weekly market summary, curated picks, alerts — Claude generates narrative on top of real data instead of simulated data. Architecture unchanged from current implementation.
**Technology:** Vercel AI SDK (existing). Only the input changes: real fundamentals + real prices replace mock data.
**Communicates with:** PostgreSQL (reads real data for context), existing archive system, existing `POST /api/update-data` route.

---

## Data Flow

### Live Price Path (market hours)

```
Kite WebSocket (wss://ws.kite.trade)
  |
  | binary tick packets (paise, LTP/Quote/Full mode)
  v
KiteTicker process (Node.js, server-side)
  |
  | parsed tick objects (JS numbers, rupees)
  v
In-process tick store (Map<token, TickData>)
  |
  +---> Upstash KV (write latest price, TTL = 60s)  [optional persistence]
  |
  v
GET /api/stream (SSE route handler, Next.js)
  |
  | text/event-stream, data: JSON
  v
Browser (EventSource API, React state update)
  |
  v
Watchlist UI / Portfolio P&L / Market Overview components
```

**Key constraint:** The KiteTicker must run in a long-lived Node.js process — not a serverless function. On Vercel, SSE route handlers are serverless and cannot hold the upstream Kite connection. Two valid deployment strategies exist (see Deployment Considerations).

### Fundamentals Data Path (after-hours ETL)

```
Vercel Cron (daily, ~18:30 IST = 13:00 UTC)
  |
  | HTTP GET /api/cron/fundamentals (CRON_SECRET header)
  v
Next.js API Route Handler
  |
  | fetch/scrape external sources
  v
Data transform + Zod validation
  |
  v
PostgreSQL (UPSERT into financials tables)
  |
  v
Screener cache invalidation (Upstash KV flush)
```

### Screener Request Path

```
Browser (filter form submit)
  |
  | GET /api/screener?pe_max=20&roe_min=15&...
  v
Next.js API Route Handler
  |
  | cache key = hash(filter params)
  +---> Upstash KV hit? --> return cached JSON (sub-10ms)
  |
  | cache miss
  v
PostgreSQL (parameterized query, indexed columns)
  |
  v
Upstash KV.set(key, result, { ex: 300 })  // 5min TTL
  |
  v
Browser (results table, Recharts charts)
```

### Individual Stock Page Path

```
Browser navigates to /stocks/RELIANCE
  |
  v
Next.js Server Component (page.tsx)
  |
  | parallel fetches:
  +---> PostgreSQL: fundamentals (P&L 5yr, BS, CF, ratios)
  +---> PostgreSQL: OHLCV 1yr daily
  +---> Upstash KV: latest tick price (live overlay)
  +---> PostgreSQL: peer universe (same sector)
  |
  v
Rendered page (Recharts: price chart, financial trend bars)
  |
  v
Client component mounts EventSource to /api/stream?tokens=[NSE:RELIANCE]
  |
  v
Live price overlay updates without page reload
```

### News & Filings Path

```
External RSS feeds (NSE/BSE exchange filings, ET, Mint)
  |
  | scheduled fetch (Vercel Cron, every few hours)
  v
News ingestion route handler
  |
  v
PostgreSQL (news_items table, associated stock tickers via full-text match)
  |
  v
GET /api/news?tickers=RELIANCE,TCS
  |
  v
Browser (News Intelligence tab)
```

---

## Real-Time Architecture Decision

### Recommendation: SSE from Next.js + KiteTicker in a persistent process

**Decision:** Use Server-Sent Events (SSE) for browser delivery. Run KiteTicker in a single long-lived process that is NOT a Vercel serverless function.

**Rationale:**

The browser-facing direction is unidirectional: server pushes prices, client never sends market commands back. SSE is the correct primitive for this. It uses standard HTTP, works through corporate firewalls and proxies, has native browser reconnection via `EventSource`, and requires no special WebSocket infrastructure on the client side.

The hard constraint is Vercel serverless. Vercel serverless functions cannot hold a persistent upstream WebSocket connection to `wss://ws.kite.trade` — they are request-scoped and time-boxed to 800 seconds maximum even on Pro. Kite's `KiteTicker` is designed for a persistent Node.js process, not a per-request Lambda.

**Chosen topology:**

```
KiteTicker process (always-on Node.js)
  -- writes ticks --> Upstash KV (or in-process Map for self-host)
  -- or directly fans out --> SSE clients if same process

Browser clients
  -- EventSource --> GET /api/stream (Next.js SSE route)
  -- route reads from Upstash KV / in-process store --> streams events
```

For self-hosted deployment (Railway, Fly.io, or VPS), Next.js can run as a custom server with KiteTicker in the same process. The SSE route handler reads from the in-process tick map and streams to clients. This is the simplest architecture.

For Vercel deployment, a small separate service (Node.js Express or Fastify, ~50 lines) runs on a cheap persistent host (Railway Hobby $5/mo, Fly.io free tier, or a $4 VPS). This service runs KiteTicker and writes ticks to Upstash KV. The Next.js SSE route on Vercel reads from Upstash KV and polls every 1-2 seconds, then emits SSE events. Latency is 1-3 seconds — acceptable for fundamental investing workflow (not HFT).

**Why not a browser WebSocket to the Kite relay process directly?**
Additional infrastructure (WebSocket server port exposure, CORS, TLS termination). SSE + HTTP is simpler and sufficient. No use case in this app requires browser-to-server streaming.

**Why not Socket.io or Ably/Pusher?**
Socket.io is a library, not a hosted service — same deployment constraint as raw WebSocket. Ably/Pusher are paid managed services; unnecessary for 2-5 users. Upstash KV as the tick store is simpler and already in the stack for screener caching.

**SSE reconnection:** Browser `EventSource` reconnects automatically. Implement a 30-second heartbeat (`event: ping`) from the server to keep connections alive through idle timeouts.

---

## Database Schema Patterns

### Naming conventions
Use `snake_case`. All timestamps as `timestamptz`. Monetary values as `numeric(18,4)`. Ratios and percentages as `numeric(10,4)`.

### Core tables

**stocks** — Master stock universe

```sql
CREATE TABLE stocks (
  id              SERIAL PRIMARY KEY,
  isin            CHAR(12)    UNIQUE NOT NULL,
  ticker_nse      VARCHAR(20),          -- e.g. RELIANCE
  ticker_bse      VARCHAR(10),          -- e.g. 500325
  kite_token      INTEGER UNIQUE,       -- Kite instrument token for WebSocket
  company_name    TEXT        NOT NULL,
  sector          VARCHAR(100),
  industry        VARCHAR(100),
  market_cap_cat  VARCHAR(10),          -- LARGE, MID, SMALL
  is_active       BOOLEAN     DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stocks_ticker_nse ON stocks(ticker_nse);
CREATE INDEX idx_stocks_kite_token ON stocks(kite_token);
CREATE INDEX idx_stocks_sector ON stocks(sector);
```

**ohlcv_daily** — Daily price history (primary OHLCV store)

```sql
CREATE TABLE ohlcv_daily (
  stock_id    INTEGER     REFERENCES stocks(id),
  date        DATE        NOT NULL,
  open        NUMERIC(10,2),
  high        NUMERIC(10,2),
  low         NUMERIC(10,2),
  close       NUMERIC(10,2),
  volume      BIGINT,
  PRIMARY KEY (stock_id, date)
);

CREATE INDEX idx_ohlcv_stock_date ON ohlcv_daily(stock_id, date DESC);
```

Note: For screener lookups (52-week high/low, momentum), precompute and store on stocks or a `stock_metrics` denormalized table. Avoid scanning all OHLCV rows for filter queries.

**financials** — Annual and TTM fundamental data

```sql
CREATE TABLE financials (
  id           SERIAL PRIMARY KEY,
  stock_id     INTEGER     REFERENCES stocks(id),
  period_type  VARCHAR(10) NOT NULL,  -- 'annual' | 'ttm' | 'quarterly'
  period_end   DATE        NOT NULL,  -- e.g. 2024-03-31
  -- Income Statement
  revenue      NUMERIC(18,4),
  gross_profit NUMERIC(18,4),
  ebitda       NUMERIC(18,4),
  ebit         NUMERIC(18,4),
  net_profit   NUMERIC(18,4),
  eps          NUMERIC(10,4),
  -- Balance Sheet
  total_assets NUMERIC(18,4),
  total_equity NUMERIC(18,4),
  total_debt   NUMERIC(18,4),
  cash         NUMERIC(18,4),
  -- Cash Flow
  cfo          NUMERIC(18,4),  -- operating cash flow
  capex        NUMERIC(18,4),
  fcf          NUMERIC(18,4),  -- free cash flow
  -- Derived ratios (precomputed at ingestion)
  pe_ratio     NUMERIC(10,4),
  pb_ratio     NUMERIC(10,4),
  roe          NUMERIC(10,4),  -- %
  roce         NUMERIC(10,4),  -- %
  debt_equity  NUMERIC(10,4),
  dividend_yield NUMERIC(10,4),  -- %
  UNIQUE (stock_id, period_type, period_end)
);

CREATE INDEX idx_financials_stock_period ON financials(stock_id, period_end DESC);
CREATE INDEX idx_financials_screener ON financials(pe_ratio, roe, roce, debt_equity)
  WHERE period_type = 'ttm';  -- Screener only needs TTM row
```

**stock_metrics** — Precomputed screener-ready snapshot (1 row per stock, updated by ETL)

```sql
CREATE TABLE stock_metrics (
  stock_id         INTEGER  PRIMARY KEY REFERENCES stocks(id),
  -- Price & momentum
  price_last       NUMERIC(10,2),
  price_52w_high   NUMERIC(10,2),
  price_52w_low    NUMERIC(10,2),
  market_cap       NUMERIC(18,4),
  -- TTM fundamentals (snapshot, matches latest financials TTM row)
  pe_ratio         NUMERIC(10,4),
  pb_ratio         NUMERIC(10,4),
  roe              NUMERIC(10,4),
  roce             NUMERIC(10,4),
  debt_equity      NUMERIC(10,4),
  revenue_growth_1y NUMERIC(10,4),  -- %
  profit_growth_1y  NUMERIC(10,4),  -- %
  net_margin        NUMERIC(10,4),  -- %
  dividend_yield    NUMERIC(10,4),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
-- The screener queries this table exclusively. It fits in a few MB of RAM.
CREATE INDEX idx_metrics_pe ON stock_metrics(pe_ratio);
CREATE INDEX idx_metrics_roe ON stock_metrics(roe);
CREATE INDEX idx_metrics_roce ON stock_metrics(roce);
```

**portfolios** — User portfolios

```sql
CREATE TABLE portfolios (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT        NOT NULL,  -- Better Auth user ID
  name        VARCHAR(100) DEFAULT 'Default',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE portfolio_holdings (
  id           SERIAL PRIMARY KEY,
  portfolio_id INTEGER     REFERENCES portfolios(id),
  stock_id     INTEGER     REFERENCES stocks(id),
  quantity     NUMERIC(10,4),
  avg_cost     NUMERIC(10,4),
  added_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (portfolio_id, stock_id)
);
```

**watchlists** — Named watchlists per user

```sql
CREATE TABLE watchlists (
  id         SERIAL PRIMARY KEY,
  user_id    TEXT    NOT NULL,
  name       VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE watchlist_items (
  watchlist_id INTEGER  REFERENCES watchlists(id) ON DELETE CASCADE,
  stock_id     INTEGER  REFERENCES stocks(id),
  position     INTEGER  DEFAULT 0,
  added_at     TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (watchlist_id, stock_id)
);
```

**alerts** — User-defined alert rules

```sql
CREATE TABLE alerts (
  id           SERIAL PRIMARY KEY,
  user_id      TEXT    NOT NULL,
  stock_id     INTEGER REFERENCES stocks(id),
  alert_type   VARCHAR(50),        -- 'price_above', 'price_below', 'pe_above', 'earnings_miss'
  threshold    NUMERIC(18,4),
  is_active    BOOLEAN DEFAULT true,
  triggered_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

**news_items** — Ingested news and exchange filings

```sql
CREATE TABLE news_items (
  id           SERIAL PRIMARY KEY,
  source       VARCHAR(50),        -- 'BSE', 'NSE', 'ET', 'MINT'
  headline     TEXT,
  url          TEXT UNIQUE,
  body_snippet TEXT,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE news_stock_tags (
  news_id   INTEGER  REFERENCES news_items(id) ON DELETE CASCADE,
  stock_id  INTEGER  REFERENCES stocks(id),
  PRIMARY KEY (news_id, stock_id)
);

CREATE INDEX idx_news_published ON news_items(published_at DESC);
```

**macro_data** — Macroeconomic indicators (RBI rates, CPI, FII flows)

```sql
CREATE TABLE macro_data (
  id         SERIAL PRIMARY KEY,
  indicator  VARCHAR(100),  -- 'REPO_RATE', 'CPI_YOY', 'FII_NET_EQUITY'
  value      NUMERIC(18,4),
  period_date DATE,
  source     VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (indicator, period_date)
);
```

### Schema notes

- All financial ratio filtering in the screener happens against `stock_metrics`. This table is small (one row per stock, ~5,000 rows), fully indexed, and can be loaded into PostgreSQL's buffer cache.
- `financials` stores the full history for individual stock pages and peer comparisons. It is never scanned for screener queries.
- `ohlcv_daily` only needs indexes on `(stock_id, date DESC)`. Do not add TimescaleDB partitioning unless query times exceed 200ms — plain PostgreSQL handles 5 years of daily OHLCV for 5,000 stocks (roughly 9M rows) comfortably with this index.
- Better Auth creates its own `user`, `session`, `account`, `verification` tables via CLI migration — do not hand-create these.

---

## Build Order

Dependencies flow from foundation upward. Each layer unlocks the next.

### Phase 1: Foundation (no external deps, unblocks everything)
Items here have no dependencies on external APIs and can be built and tested independently.

1. **PostgreSQL schema** — Create all tables, indexes, seed stock universe (BSE 500 list). No API keys needed.
2. **Better Auth** — Email/password auth, session middleware, protected routes. Uses only PostgreSQL.
3. **Drizzle ORM setup** — Schema definitions in TypeScript, migrations. Works against local Postgres.
4. **Environment config** — `.env` structure: DB URL, Kite credentials, Better Auth secret, Upstash URL.

*These four are independent of each other within Phase 1 and can be parallelized.*

### Phase 2: Data ingestion (unblocks screener and stock pages)
Requires Phase 1 complete (schema + config). Can be built before UI.

5. **OHLCV ETL** — Kite REST API historical endpoint → `ohlcv_daily` table. Needs Kite API key.
6. **Fundamentals ETL** — External source → `financials` + `stock_metrics` tables. Kite credentials not required; separate data source.
7. **Vercel Cron orchestration** — `vercel.json` cron config, `CRON_SECRET` env var guard, scheduled triggers for items 5-6.
8. **Macro data ingestion** — RBI/MOSPI fetch → `macro_data` table. Independent of Kite.
9. **News ingestion** — RSS feed fetch → `news_items` + `news_stock_tags`. Independent of all above.

*Items 6-9 are independent of each other. Item 5 (OHLCV) requires Kite credentials.*

### Phase 3: Real-time relay (unblocks live watchlist and portfolio P&L)
Requires Phase 1 for auth. Can be built in parallel with Phase 2.

10. **KiteTicker integration** — Connect to Kite WebSocket, subscribe to watchlist tokens, parse binary packets.
11. **Tick store** — In-process Map (self-host) or Upstash KV writes (Vercel deployment).
12. **SSE route handler** — `GET /api/stream`, reads tick store, streams `data:` events. Client EventSource setup.
13. **Access token flow** — Kite requires daily login; implement token refresh and secure storage in DB.

*Items 10-12 are sequential. Item 13 is a prerequisite for item 10.*

### Phase 4: API and UI (requires Phases 1-3)
14. **Screener API** — `GET /api/screener` with filter params, queries `stock_metrics`, Upstash KV caching.
15. **Stock detail API** — `GET /api/stocks/[ticker]` aggregates DB fundamentals + OHLCV + live tick.
16. **Portfolio API** — CRUD for holdings, live P&L calculation (tick price × quantity − cost).
17. **Watchlist API** — CRUD for watchlist items, drives SSE token subscriptions.
18. **Screener UI** — Filter form, results table, export. Consumes screener API.
19. **Stock page UI** — Recharts price chart, financial tables, peer comparison. Consumes stock detail API.
20. **Portfolio UI** — Holdings table with live P&L via SSE. Consumes portfolio + stream APIs.
21. **Market overview UI** — Nifty 50, Sensex, Nifty Bank index cards. Consumes SSE stream.

### Phase 5: Intelligence layer upgrade (requires Phase 2 data)
22. **AI context builder** — Fetches real DB data (top performers, fundamental shifts, FII flows) to replace mock data in the Claude prompt.
23. **Weekly intelligence generation** — Existing `POST /api/update-data` route updated to read real context. Archive system unchanged.

### What blocks what (critical path)

```
Schema + Auth (Phase 1)
  --> ETL (Phase 2) --> Screener UI + Stock pages (Phase 4)
  --> Real-time relay (Phase 3) --> Live watchlist + Portfolio P&L (Phase 4)
  --> Data in DB (Phase 2) --> AI intelligence with real data (Phase 5)
```

The screener can be built and demonstrated with only Phase 1 + Phase 2 complete — no real-time required. Real-time overlay is additive.

---

## Deployment Considerations

### Option A: Self-hosted (Railway, Fly.io, or VPS) — Recommended

Next.js runs as a custom Node.js server. KiteTicker runs in the same process. SSE route reads from in-process tick Map. No external tick relay service needed.

**Advantages:**
- Simplest architecture — no Upstash KV dependency for tick data
- Persistent connections work naturally
- Single deployment unit
- Cost: Railway Hobby ~$5/mo for a 512MB container handles this workload easily

**Deployment config:**
```
server.ts  (custom Next.js server)
  ├── imports KiteTicker
  ├── connects to Kite WebSocket on startup
  └── starts Next.js HTTP server on same port
```

SSE route reads from the in-process `tickMap` exported from the KiteTicker singleton. No Redis needed for tick data (Redis/Upstash is still useful for screener query cache).

**Vercel Cron compatibility:** Vercel Cron Jobs make HTTP GET requests to your production URL. If you self-host, replicate this with GitHub Actions (free), a cheap cron service (cron-job.org), or a simple OS crontab on the VPS.

### Option B: Vercel (frontend) + separate tick relay service

Keep the Next.js app on Vercel. Run a minimal Node.js service (Express, ~80 lines) on Railway or Fly.io that runs KiteTicker and writes ticks to Upstash KV.

**Architecture:**
```
Kite WebSocket --> Tick Relay Service (Railway/Fly, always-on)
                       |
                       v
                  Upstash KV (tick cache, TTL 60s)
                       |
                       v
GET /api/stream (Vercel SSE route, polls KV every 1s, streams events)
                       |
                       v
Browser (EventSource)
```

**Advantages:**
- Zero-config Vercel CI/CD for the main app
- Vercel Cron Jobs work natively (built-in, configured in `vercel.json`)
- Vercel Analytics, preview deployments

**Disadvantages:**
- Two deployment targets to manage
- Tick latency: 1-3 seconds (KV poll interval) vs near-real-time on self-host
- Upstash KV adds ~$0/mo at low request volume (generous free tier)
- Not a problem for fundamental investing workflow

**Vercel Cron limits that matter:**
- Hobby plan: 2 cron jobs max, once per day minimum frequency
- Pro plan: 40 cron jobs, up to every minute
- Max function duration: 300s (Hobby) / 800s (Pro) — sufficient for ETL if chunked properly
- Long ETL jobs (>800s) must be chunked: fetch 100 stocks per cron invocation, track progress in DB

### Decision guide

| Scenario | Recommendation |
|----------|---------------|
| Comfortable with self-hosting | Option A (Railway/Fly) — simpler, lower latency |
| Want Vercel CI/CD and previews | Option B — add Railway tick relay, Upstash KV |
| On Vercel Hobby plan | Option B mandatory for cron (once/day limit is fine for daily ETL) |
| Want maximum simplicity | Option A with a $4 VPS and PM2 |

### Database hosting

Both deployment options support:
- **Supabase** — managed PostgreSQL, generous free tier, includes connection pooling (Supavisor), Postgres REST API optional but not needed. Better Auth + Drizzle work against Supabase without any Supabase-specific code.
- **Neon** — serverless PostgreSQL, autoscaling, good for Vercel deployment. Branching useful for migrations.
- **Railway PostgreSQL** — add-on to Option A self-hosted deployment; lowest latency if app is also on Railway.

### Caching in production

```
Upstash KV (serverless Redis, HTTP-based, works on Vercel Edge)
  ├── Screener result cache (key: hash(filters), TTL: 5 min)
  ├── Stock metrics snapshot (key: "metrics:{stock_id}", TTL: 10 min)
  └── Tick price cache (Option B only, key: "tick:{token}", TTL: 60s)
```

For Option A (self-host), screener results can be cached in Node.js in-process LRU cache (`lru-cache` package) to avoid the Upstash HTTP round-trip. Use Upstash only if multiple Node.js processes need shared cache state.

### Kite access token refresh

Kite access tokens expire daily. The user must log in to Kite and generate a new token. Two approaches:
1. **Manual:** Admin `/api/admin/set-token` route that accepts a new token and stores it in the database or environment. Simplest for personal use.
2. **Automated:** Implement the Kite login flow (redirect URL, exchange request token for access token). More work but hands-free once set up.

For a personal tool used by 2-5 people, manual token refresh (once per day by the admin user) is sufficient for v1.

---

## Sources

- Kite Connect WebSocket API docs: https://kite.trade/docs/connect/v3/websocket/
- KiteTicker TypeScript source: https://github.com/zerodha/kiteconnectjs/blob/master/lib/ticker.ts
- Vercel Function duration limits: https://vercel.com/docs/functions/configuring-functions/duration
- Vercel Cron Jobs documentation: https://vercel.com/docs/cron-jobs
- Better Auth Next.js integration: https://better-auth.com/docs/integrations/next
- SSE in Next.js App Router: https://hackernoon.com/streaming-in-nextjs-15-websockets-vs-server-sent-events
- Upstash Redis + Vercel: https://upstash.com/docs/redis/howto/vercelintegration
- Lucia auth deprecation: https://trybuildpilot.com/625-better-auth-vs-lucia-vs-nextauth-2026
- PostgreSQL financial schema: https://analyzingalpha.com/financial-statement-database
- TimescaleDB vs PostgreSQL for stock data: https://www.bluetickconsultants.com/how-timescaledb-streamlines-time-series-data-for-stock-market-analysis/
- WebSockets on Fly.io: https://fly.io/javascript-journal/websockets-with-nextjs/
