# Stack Research

**Domain:** Personal Indian-market terminal / screener / portfolio monitor
**Researched:** 2026-03-30
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.1.6 | App shell, route handlers, server components, cron entrypoints | Already in the repo and a strong fit for a dashboard that mixes SSR, API routes, and incremental data refresh. |
| React | 19.2.4 | UI rendering and client interactivity | Matches the existing app and keeps the dashboard on the current React platform. |
| TypeScript | 5.7.3 | Type safety across UI, API, ETL, and data models | Important for financial data correctness, schema drift detection, and safer refactors. |
| PostgreSQL | 16 | Primary store for stocks, fundamentals, portfolios, alerts, and history | The right default for multi-user persistence, queryable fundamentals, and time-series-ish market history at this scale. |
| Better Auth | 1.x | Email/password auth, invite-only access, database sessions | Best match for a small fixed user group that wants simple auth without enterprise complexity. |
| Drizzle ORM | 0.44.x | Type-safe database access and schema-first migrations | Good fit for analytics-heavy tables and explicit SQL tuning without the abstraction tax of heavier ORMs. |
| kiteconnect | 3.x | Zerodha Kite REST + WebSocket client | Official path for live prices, historical OHLCV, and portfolio/positions sync. |
| Upstash Redis | 1.x | Tick cache, screener cache, lightweight coordination | Keeps live price overlays and expensive screener queries fast without forcing a large infra footprint. |
| Vercel AI SDK | 6.x | Weekly intelligence generation and narrative summaries | Already present and a clean way to keep Claude focused on interpretation rather than data acquisition. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@upstash/redis` | 1.x | Cache latest ticks, screener results, and derived market state | Use if the app is Vercel-first or you want a portable cache abstraction. |
| `@upstash/qstash` | 2.x | Reliable background delivery for ingestion jobs and retries | Use if cron-driven ingestion starts needing retries or fan-out beyond one route handler. |
| `pino` | 9.x | Structured server logging | Use for API routes, ETL jobs, and relay service logs that need to stay searchable. |
| `cheerio` | 1.x | HTML scraping for Screener.in-like pages | Use only if exchange CSVs or official feeds do not cover a fundamentals field you need. |
| `fast-xml-parser` | 4.x | RSS/XML parsing for filings and news feeds | Best for NSE/BSE feeds, RSS sources, and other XML-shaped market data. |
| `csv-parse` | 5.x | Bulk CSV ingestion and normalization | Use for exchange bulk files, end-of-day dumps, and fundamentals exports. |
| `@tanstack/react-query` | 5.x | Client cache for watchlists, portfolios, and live-refresh panels | Useful once the dashboard has multiple client-driven data sources that need polling or invalidation. |
| `zustand` | 4.x | Small client state store | Use for UI-only state like selected watchlists, active filters, and panel coordination. |
| `react-hook-form` + `@hookform/resolvers` | 7.54.x + 3.9.x | Form handling and Zod-backed validation | Already a good fit for screener filters, alerts, and user settings forms. |
| `zod` | 3.24.1 | Runtime validation for APIs and ETL payloads | Keep using it for scraped data, market payloads, and AI output schemas. |
| `recharts` | 2.15.0 | Charts for price, fundamentals, and portfolio views | Already in place and sufficient for the analytic charts this product needs. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vitest | Unit and integration tests | Strong default for parsing logic, validators, and database helpers; keep tests close to the data layer. |
| Playwright | End-to-end dashboard checks | Use for login flow, screener filters, portfolio pages, and SSE/live price smoke tests. |
| ESLint | Static code quality | Keep the existing lint workflow; add rules around import hygiene and type-aware mistakes where practical. |
| Prettier | Formatting | Optional if the repo wants strict formatting consistency alongside ESLint. |
| Docker Compose | Local Postgres/Redis stack | Makes it easy to run the persistence and cache layers locally without bespoke setup. |
| `tsx` | Run TypeScript scripts directly | Useful for one-off ETL utilities, backfills, and schema maintenance scripts. |

## Installation

```bash
# Core
npm install drizzle-orm better-auth kiteconnect @upstash/redis

# Supporting
npm install @tanstack/react-query zustand pino cheerio fast-xml-parser csv-parse @upstash/qstash

# Dev dependencies
npm install -D drizzle-kit vitest @playwright/test tsx prettier
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Drizzle ORM | Prisma | Use Prisma if the team wants a more opinionated abstraction and is willing to accept heavier generated-client workflows. |
| Better Auth | Auth.js | Use Auth.js only if you need its ecosystem breadth and are not doing credentials-only auth as the primary path. |
| Upstash Redis | Self-hosted Redis/Valkey | Use self-hosted Redis if you are fully VPS-based and want lower per-request cost than a managed cache. |
| SSE for live prices | Socket.io / raw browser WebSocket | Use WebSockets only if you truly need bidirectional client control; SSE is simpler for one-way market updates. |
| Vercel Cron | Dedicated worker or queue | Use a worker/queue once ingestion becomes multi-step, high-volume, or retry-sensitive. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| SQLite as the primary store | It will become awkward for multi-user history, query-heavy screening, and concurrent writes | PostgreSQL 16 |
| Direct browser access to Kite APIs | Exposes credentials and makes rate limiting/session control harder | Server-side Kite relay plus SSE or cached reads |
| Socket.io for basic price streaming | Adds protocol overhead and deployment complexity without solving a real need here | SSE from Next.js |
| TimescaleDB on day one | Useful later, but extra operational surface is not justified yet | Plain PostgreSQL with targeted indexes and denormalized summary tables |
| Large ORM overkill for everything | Can hide SQL that matters for screener performance and reporting | Drizzle with explicit SQL where needed |
| Paid market data by default | The workflow does not need expensive subscriptions yet | Zerodha Kite plus exchange feeds and bulk files |

## Stack Patterns by Variant

**If staying Vercel-first:**
- Keep Next.js on Vercel.
- Use Vercel Cron for scheduled ingestion.
- Use `@upstash/redis` for tick and screener caching.
- Run the Kite WebSocket relay in a small always-on Node service.
- Because Vercel serverless cannot hold a persistent upstream market-data connection.

**If self-hosting on a VPS:**
- Run Next.js, the Kite relay, and PostgreSQL on the same small server or adjacent containers.
- Use local Redis or Valkey if you want to avoid managed cache latency.
- Because the live relay can stay in-process and SSE can read from the same memory space.

**If market-data volume grows materially:**
- Split ingestion into a dedicated worker.
- Add queueing with QStash or a worker queue.
- Because fundamentals ETL, live ticks, and news ingestion should not contend for the same runtime forever.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 16.1.6 | React 19.2.4 | Matches the current repo and keeps App Router, server actions, and route handlers aligned. |
| Next.js 16.1.6 | TypeScript 5.7.3 | Current repo versions are already aligned for app-router development. |
| Better Auth 1.x | PostgreSQL 16 | Prefer database-backed sessions and simple invite-only auth for the 2-5 user group. |
| Drizzle ORM 0.44.x | `pg` 8.x | Drizzle works well with native PostgreSQL access and explicit migration control. |
| kiteconnect 3.x | Node 20+ | Keep the relay in a long-lived Node process rather than serverless-only execution. |
| `@upstash/redis` 1.x | Vercel or self-hosted Next.js | Works cleanly as a cache abstraction for live prices and screener results. |

## Sources

- `.planning/PROJECT.md` - product requirements and milestone scope.
- `.planning/research/ARCHITECTURE.md` - system boundaries, data flow, and deployment direction.
- Next.js App Router docs - server components, route handlers, and cron-friendly patterns.
- PostgreSQL docs - schema, indexing, and query planning guidance.
- Better Auth docs - email/password and database session flow.
- Drizzle ORM docs - schema-first migrations and typed queries.
- Zerodha Kite API docs - WebSocket relay and historical market data constraints.

---
*Stack research for: personal Indian-market terminal / screener / portfolio monitor*
*Researched: 2026-03-30*
