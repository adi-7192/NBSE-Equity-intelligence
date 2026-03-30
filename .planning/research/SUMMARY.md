# Project Research Summary

**Project:** Equity Intelligence
**Domain:** Personal Indian-market terminal / screener / portfolio monitor
**Researched:** 2026-03-30
**Confidence:** HIGH

## Executive Summary

This product fits a well-defined pattern: a private market-intelligence workspace that combines persistent portfolio data, a live market feed, fundamentals screening, and a narrative layer on top. The strongest direction is to keep the existing Next.js dashboard shell, preserve the weekly AI digest as a differentiated surface, and replace the current simulated/in-memory data paths with a PostgreSQL-backed system of record plus a dedicated Kite relay for live prices.

Research points to a phased build where persistence and access control come first, because every later capability depends on durable user-scoped data. From there, live pricing, fundamentals ingestion, screening, and stock analysis can be layered in cleanly, with macro/news intelligence and AI synthesis built on top of real stored inputs rather than mocks.

The biggest risks are architectural, not visual: treating Vercel like the place to host a persistent Kite connection, accepting partially stale fundamentals as "good enough," and letting cached or simulated values blur the line between real and fake data. The right mitigation is a strict source-of-truth model, explicit provenance/freshness, and early investment in auth, persistence, and ingestion correctness.

## Key Findings

### Recommended Stack

The current stack is already a strong base. Next.js 16, React 19, TypeScript, Recharts, and the Vercel AI SDK are all worth keeping. The major additions are PostgreSQL 16 for durable data, Better Auth for simple invite-only authentication, Drizzle ORM for typed schema and migrations, `kiteconnect` for broker-backed market data, and Upstash Redis for live/cache-heavy workloads where Vercel alone is not enough.

The key technical pattern is separation of concerns: Next.js remains the product shell and API surface, PostgreSQL becomes the system of record, and the Kite live-price connection runs in a long-lived process rather than a serverless route. This keeps the product aligned with its intended scale while avoiding premature infrastructure complexity.

**Core technologies:**
- Next.js 16.1.6: App shell, routes, server rendering — already aligned with the existing repo and dashboard UX.
- PostgreSQL 16: persistent storage for stocks, fundamentals, portfolios, alerts, and archives — needed to replace fragile in-memory state.
- Better Auth + Drizzle ORM: auth and schema management — a clean fit for a small private user base.
- `kiteconnect`: live prices, historical OHLCV, and holdings sync — the natural upstream data source for this workflow.
- Upstash Redis: tick and screener caching — useful when the app needs fast shared state without a heavy ops burden.

### Expected Features

Users will treat private access, saved portfolios/watchlists, live prices, a real screener, and stock detail pages as table stakes for a serious Indian-market terminal. The best differentiators are the ones already hinted at by the current repo: a weekly AI digest grounded in real stored data, a strong archive/history layer, India-specific macro context, and red-flag monitoring that is actually relevant to held positions.

**Must have (table stakes):**
- Basic auth and durable storage — users expect personal data to persist and stay private.
- Live watchlist and portfolio monitoring — this is the terminal heartbeat.
- Fundamentals screener — the product’s core value depends on this.
- Stock detail pages with financials, charts, and peers — required for conviction work.

**Should have (competitive):**
- Weekly AI intelligence using real stored data — this keeps the product distinctive.
- Archive history of briefings and snapshots — valuable for review and learning.
- India-specific macro and sector-rotation views — strong contextual differentiators.
- Red-flag alerts tied to actual holdings and watchlists — more useful than generic price alerts.

**Defer (v2+):**
- Trade execution — attractive, but too much operational and workflow complexity for v1.
- Options/F&O analytics — expands scope away from the core equity workflow.
- Mobile native apps and public SaaS multi-tenancy — both are outside the current product shape.

### Architecture Approach

The recommended architecture is a layered model: auth and persistence at the base, a dedicated real-time relay for Kite ticks, scheduled ETL for fundamentals and news/macro inputs, a unified Next.js data API for the browser, and the existing AI layer re-used as a narrative/synthesis surface over real stored data. This aligns well with the current codebase and avoids a rewrite.

**Major components:**
1. Auth + PostgreSQL foundation — durable, user-scoped storage and protected routes.
2. Real-time relay — long-lived Kite process with SSE/browser delivery.
3. Fundamentals and news/macro ingestion — scheduled ETL into PostgreSQL.
4. Unified dashboard API — compositional routes for screeners, stock pages, and portfolios.
5. AI intelligence layer — weekly summaries and archives based on real data.

### Critical Pitfalls

1. **Using Vercel as the Kite host** — avoid by running KiteTicker in a dedicated always-on process and using SSE/shared storage for delivery.
2. **Accepting brittle or partial fundamentals ingestion** — avoid with strict parsers, ingestion metadata, and fail-closed ETL behavior.
3. **Cross-user data leakage through caches or routes** — avoid by scoping every read, write, and cache key by authenticated user.
4. **Leaving fake data paths alive after real feeds arrive** — avoid by enforcing a single source of truth and labeling provenance/freshness in the UI.
5. **Turning alerts and AI summaries into noise** — avoid with severity thresholds, dedupe, and relevance tied to actual holdings/watchlists.

## Implications for Roadmap

Based on research, the roadmap should keep foundation work first, then move from upstream data plumbing into downstream user workflows.

### Phase 1: Foundation & Access
**Rationale:** Persistence and auth unblock everything else and prevent user-trust issues from day one.
**Delivers:** PostgreSQL-backed storage, archive durability, and protected routes.
**Addresses:** Basic auth, private workspace, durable watchlists/portfolios/history.
**Avoids:** Cross-user leakage and archive-integrity failures.

### Phase 2: Live Market Data
**Rationale:** Live watchlists and market overview are the first daily-use behaviors once the app has a durable backend.
**Delivers:** Kite relay, tick cache, and live market overview surfaces.
**Uses:** `kiteconnect`, SSE, Upstash Redis.
**Implements:** Real-time relay and market data delivery architecture.

### Phase 3: Fundamentals Screener
**Rationale:** The core product promise is reducing the stock universe into a shortlist, which requires fresh fundamentals before richer research views.
**Delivers:** ETL, stock universe tables, screening API, and filterable shortlist UI.
**Addresses:** Core screening and data freshness expectations.
**Avoids:** Mixed stale/fresh valuation data.

### Phase 4: Stock Research Workspace
**Rationale:** Once a shortlist exists, users need a deep research page for each company.
**Delivers:** Stock detail pages, charts, peer comparison, and scoring views.
**Uses:** Stored fundamentals, OHLCV, live overlays, and charting.
**Implements:** Unified stock detail and peer-comparison flow.

### Phase 5: Portfolio Monitor
**Rationale:** Portfolio monitoring becomes powerful only after live prices, stock data, and persistence are all in place.
**Delivers:** Holdings, live P&L, portfolio analytics, and alert scaffolding.
**Addresses:** Daily monitoring and personal-risk workflows.
**Avoids:** Alert systems that fire without portfolio context.

### Phase 6: Macro & Intelligence Layer
**Rationale:** Macro/news/AI should summarize and prioritize the real data foundation rather than substitute for it.
**Delivers:** Macro series, news and filings relevance, and real-data AI briefings with archives.
**Uses:** Existing Vercel AI SDK and new persisted datasets.
**Implements:** The narrative layer on top of the full terminal stack.

### Phase Ordering Rationale

- Persistence and auth come first because every later feature depends on durable user-scoped data.
- Live data comes before screeners and stock pages because real-time state is a core expectation and a shared dependency for portfolios.
- Fundamentals ETL precedes deep research views because the screener and stock pages both rely on the same stored data foundation.
- Macro/news/AI comes last because it is most valuable when grounded in the full dataset rather than bootstrapping the product by itself.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Auth and DB implementation details, especially Better Auth + Drizzle integration choices.
- **Phase 2:** Kite relay deployment model, connection management, and SSE delivery details.
- **Phase 3:** Fundamentals-source reliability, ingestion strategy, and parser hardening.
- **Phase 6:** News and filing-source quality, ticker relevance matching, and alert-ranking strategy.

Phases with more standard patterns:
- **Phase 4:** Stock detail and peer comparison UI follow common dashboard/product patterns once data is present.
- **Phase 5:** Portfolio tables, analytics, and red-flag surfaces are conceptually straightforward after the data model is in place.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Strong alignment between the existing repo, project constraints, and recommended additions. |
| Features | HIGH | The product brief is already unusually clear about what is v1 versus deferred. |
| Architecture | HIGH | The architecture direction is coherent and the critical live-data constraint is well understood. |
| Pitfalls | HIGH | The major risks are concrete, project-specific, and already visible from the current codebase and target deployment model. |

**Overall confidence:** HIGH

### Gaps to Address

- **Exact fundamentals source strategy:** Validate which free or low-cost sources are reliable enough before Phase 3 execution.
- **Preferred deployment split for the Kite relay:** Decide whether the live relay will be a small sidecar service or part of a self-hosted stack.
- **Auth library integration details:** Confirm the preferred Better Auth + Drizzle + Next.js setup before implementing Phase 1.

## Sources

### Primary (HIGH confidence)
- `.planning/PROJECT.md` — milestone scope, product boundaries, and existing constraints.
- `.planning/research/STACK.md` — recommended technologies and deployment variants.
- `.planning/research/FEATURES.md` — feature expectations, dependency ordering, and MVP boundaries.
- `.planning/research/ARCHITECTURE.md` — component map, data flow, and real-time constraints.
- `.planning/research/PITFALLS.md` — project-specific failure modes and phase prevention mapping.

### Secondary (MEDIUM confidence)
- `.planning/codebase/CONCERNS.md` — current app risks that reinforce the migration priorities.
- `.planning/codebase/STACK.md` — current repo technology baseline.

---
*Research completed: 2026-03-30*
*Ready for roadmap: yes*
