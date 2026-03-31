# Roadmap: Equity Intelligence

## Overview

This milestone turns the current AI-driven weekly digest into a usable personal Bloomberg-style terminal for Indian markets. The path starts by replacing throwaway storage with persistent infrastructure and access control, then layers in live market data, screening, stock analysis, portfolio monitoring, and finally macro/news intelligence powered by real data.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation & Access** - Add PostgreSQL persistence and lightweight authentication so the product has a durable, protected base.
- [ ] **Phase 2: Live Market Data** - Introduce Zerodha-backed live prices, watchlists, and market overview surfaces.
- [ ] **Phase 02.1: Workspace Shell & Personal Integrations (INSERTED)** - Redesign the app shell, navigation, dark-theme UX, and per-user integrations/settings before deeper feature work.
- [ ] **Phase 3: Fundamentals Screener** - Build the stock-universe ingestion pipeline and the core screener experience.
- [ ] **Phase 4: Stock Research Workspace** - Add individual stock pages, peer comparison, and scoring workflows.
- [ ] **Phase 5: Portfolio Monitor** - Track holdings, live P&L, risk alerts, and portfolio analytics.
- [ ] **Phase 6: Macro & Intelligence Layer** - Add macro/news ingestion and upgrade the AI briefing to run on real stored data.

## Phase Details

### Phase 1: Foundation & Access
**Goal**: Replace in-memory state with PostgreSQL-backed persistence and protect the product for a small invited user group.
**Depends on**: Nothing (first phase)
**Requirements**: [DATA-01, DATA-02, AUTH-01, AUTH-02]
**Canonical refs**:
- `.planning/PROJECT.md` — milestone goals, constraints, and validated existing capabilities
- `.planning/codebase/CONCERNS.md` — persistence, auth, and update-route risks already identified
- `.planning/research/ARCHITECTURE.md` — recommended auth layer and database direction
**Success Criteria** (what must be TRUE):
  1. Approved users can authenticate and unauthenticated requests cannot access protected dashboard routes or write APIs.
  2. Live dashboard data and archived intelligence snapshots survive restarts and deployments.
  3. Core entities needed by later phases have a PostgreSQL-backed storage model and migration path.
**Plans**: 2 plans

Plans:
- [x] 01-01: Establish the persistent data layer, schema, and archive migration path
- [x] 01-02: Add auth, session handling, and route protection

### Phase 2: Live Market Data
**Goal**: Introduce real-time market data delivery for the watchlist and market overview experience.
**Depends on**: Phase 1
**Requirements**: [LIVE-01, LIVE-02, LIVE-03]
**Canonical refs**:
- `.planning/PROJECT.md` — live market data scope and deployment constraints
- `.planning/codebase/ARCHITECTURE.md` — current dashboard composition and entry points
- `.planning/research/ARCHITECTURE.md` — Kite WebSocket, SSE relay, and deployment recommendations
**Success Criteria** (what must be TRUE):
  1. The system ingests Zerodha Kite prices for tracked instruments during market hours.
  2. Users can monitor a live watchlist with price, change, and volume updates.
  3. The dashboard shows a real market overview for the tracked benchmark indices.
**Plans**: 2 plans

Plans:
- [x] 02-01: Build the server-side price relay and market data cache
- [x] 02-02: Ship the live watchlist and market overview UI

### Phase 02.1: Workspace Shell & Personal Integrations (INSERTED)
**Goal**: Redesign the product shell so the terminal feels like a coherent private workspace, with durable navigation, stronger dark-theme UI/UX, and per-user settings for Zerodha and AI providers.
**Depends on**: Phase 2
**Requirements**: [SHELL-01, SHELL-02, INTG-01, INTG-02]
**Canonical refs**:
- `.planning/PROJECT.md` — product vision, terminal-style direction, and private-workspace scope
- `.planning/codebase/ARCHITECTURE.md` — current dashboard composition and route entry points
- `.planning/codebase/STACK.md` — Next.js/Tailwind/Shadcn stack and reusable UI primitives
- `.planning/phases/02-live-market-data/02-02-SUMMARY.md` — current shell limitations and live-market/dashboard baseline
**Success Criteria** (what must be TRUE):
  1. The app has a clear reusable shell with primary navigation, consistent dark-theme hierarchy, and better information density.
  2. Users can access a dedicated settings area for profile, integrations, and system/account status.
  3. Zerodha and AI provider credentials are stored per user, protected server-side, and never exposed raw in the frontend.
**Plans**: 0 plans

Plans:
- [x] 02.1-01: Build the shared workspace shell, navigation, and visual system
- [x] 02.1-02: Add secure personal integrations and the dedicated settings experience

### Phase 3: Fundamentals Screener
**Goal**: Turn the product into a conviction-finding tool by ingesting fundamentals and exposing a usable screener.
**Depends on**: Phase 2
**Requirements**: [SCRN-01, SCRN-02, SCRN-03]
**Canonical refs**:
- `.planning/PROJECT.md` — core value and fundamentals scope
- `.planning/codebase/CONCERNS.md` — testing, persistence, and configuration gaps to avoid repeating
- `.planning/research/ARCHITECTURE.md` — ETL, data-store, and screener-engine recommendations
**Success Criteria** (what must be TRUE):
  1. Fundamentals data refreshes on a reliable schedule and is persisted for query use.
  2. Users can filter the Indian stock universe by the required valuation and quality metrics.
  3. Screener results are sortable and paginated so the shortlist is usable at market scale.
**Plans**: 2 plans

Plans:
- [ ] 03-01: Implement fundamentals ingestion, schema, and refresh jobs
- [ ] 03-02: Build the screener API, filters, and shortlist results UI

### Phase 4: Stock Research Workspace
**Goal**: Let users go deeper on a single company with financial history, peers, and scoring context.
**Depends on**: Phase 3
**Requirements**: [STCK-01, STCK-02, STCK-03]
**Canonical refs**:
- `.planning/PROJECT.md` — stock page and peer comparison requirements
- `.planning/codebase/STACK.md` — existing charts, Next.js, and UI primitives available for reuse
- `.planning/research/ARCHITECTURE.md` — stock detail data flow and live overlay pattern
**Success Criteria** (what must be TRUE):
  1. Users can open a stock detail page with financial statements and TTM data.
  2. Users can compare the company against relevant peers on key metrics.
  3. Users can interpret a clear scoring or valuation view without leaving the app.
**Plans**: 2 plans

Plans:
- [ ] 04-01: Build stock detail data retrieval and financial visualizations
- [ ] 04-02: Add peer comparison and composite scoring surfaces

### Phase 5: Portfolio Monitor
**Goal**: Make the dashboard useful day-to-day by tracking holdings, performance, and risk signals.
**Depends on**: Phase 4
**Requirements**: [PORT-01, PORT-02, PORT-03]
**Canonical refs**:
- `.planning/PROJECT.md` — portfolio-monitor scope and red-flag expectations
- `.planning/codebase/CONCERNS.md` — alerting and manual-maintenance issues in the current app
- `.planning/research/ARCHITECTURE.md` — unified API and live-overlay architecture
**Success Criteria** (what must be TRUE):
  1. Users can load holdings and see live portfolio P&L.
  2. Relevant portfolio red flags surface automatically from the stored data.
  3. Portfolio analytics explain concentration and performance at the portfolio level.
**Plans**: 2 plans

Plans:
- [ ] 05-01: Build holdings ingestion and live portfolio state
- [ ] 05-02: Add alerts and portfolio analytics views

### Phase 6: Macro & Intelligence Layer
**Goal**: Complete the operating system loop by layering macro data, curated news, filings, and AI synthesis onto the real-data foundation.
**Depends on**: Phase 5
**Requirements**: [MACR-01, MACR-02, NEWS-01, NEWS-02, AI-01]
**Canonical refs**:
- `.planning/PROJECT.md` — macro, news, and AI-briefing goals
- `.planning/codebase/INTEGRATIONS.md` — current AI route and external integration assumptions
- `.planning/research/ARCHITECTURE.md` — macro/news ingestion direction and AI-layer role
**Success Criteria** (what must be TRUE):
  1. Users can inspect the tracked macro series and sector rotation view in the product.
  2. Users receive curated news and filings relevant to their holdings and watchlists.
  3. The weekly AI market briefing is generated from stored real data and remains archivable.
**Plans**: 3 plans

Plans:
- [ ] 06-01: Ingest macro series and build the sector-rotation view
- [ ] 06-02: Add curated news and filings relevance pipelines
- [ ] 06-03: Rework the AI briefing pipeline to use real stored data and archives

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 2.1 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Access | 2/2 | Complete | 2026-03-30 |
| 2. Live Market Data | 2/2 | Implemented (validation pending) | 2026-03-30 |
| 2.1. Workspace Shell & Personal Integrations | 2/2 | Implemented | 2026-03-31 |
| 3. Fundamentals Screener | 0/2 | Not started | - |
| 4. Stock Research Workspace | 0/2 | Not started | - |
| 5. Portfolio Monitor | 0/2 | Not started | - |
| 6. Macro & Intelligence Layer | 0/3 | Not started | - |
