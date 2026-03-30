# Requirements: Equity Intelligence

**Defined:** 2026-03-30
**Core Value:** A stock screener + portfolio monitor that lets you go from 5,000+ Indian stocks to a conviction-ready shortlist — with real fundamentals, live Kite prices, and AI-powered weekly intelligence — in one tab.

## v1 Requirements

### Data Foundation

- [ ] **DATA-01**: Live dashboard data and archived intelligence snapshots persist across restarts and deployments.
- [ ] **DATA-02**: PostgreSQL stores the stock universe, fundamentals, watchlists, portfolios, and intelligence records as the system of record.

### Authentication

- [ ] **AUTH-01**: An approved user can sign in with email and password.
- [ ] **AUTH-02**: Authenticated sessions protect the dashboard and data-mutating API routes for the 2-5 invited users.

### Live Market Data

- [ ] **LIVE-01**: The application ingests Zerodha Kite live prices for tracked NSE/BSE instruments during market hours.
- [ ] **LIVE-02**: A user can view a live watchlist with last price, percentage change, and volume.
- [ ] **LIVE-03**: A user can view a market overview for Nifty 50, Sensex, Nifty Bank, and Midcap 150.

### Screener

- [ ] **SCRN-01**: A user can filter Indian stocks by PE, PB, ROE, ROCE, revenue growth, profit margins, debt/equity, and dividend yield.
- [ ] **SCRN-02**: The screener returns sortable, paginated shortlist results across the Indian stock universe.
- [ ] **SCRN-03**: Screener fundamentals refresh on a daily or weekly cadence via scheduled ingestion jobs.

### Stock Analytics

- [ ] **STCK-01**: A user can open an individual stock page with historical P&L, balance sheet, cash flow, and TTM data.
- [ ] **STCK-02**: A user can compare a stock against relevant sector peers on key fundamentals and valuation metrics.
- [ ] **STCK-03**: A user can see a valuation or composite scoring view that combines quality, valuation, and momentum signals.

### Portfolio Monitor

- [ ] **PORT-01**: A user can sync or enter portfolio holdings and see live P&L.
- [ ] **PORT-02**: A user receives portfolio red-flag alerts such as earnings misses, margin deterioration, pledge changes, or governance issues.
- [ ] **PORT-03**: A user can see portfolio analytics including sector concentration, XIRR, and beta.

### Macro Data

- [ ] **MACR-01**: A user can view tracked macro series for RBI rates, CPI/WPI, IIP, and FII/DII flows.
- [ ] **MACR-02**: A user can view a sector rotation view derived from macro and market data.

### News Intelligence

- [ ] **NEWS-01**: A user can view a curated news feed filtered to portfolio and watchlist stocks.
- [ ] **NEWS-02**: A user receives relevant BSE/NSE filing alerts for holdings and watchlist names.

### AI Intelligence

- [ ] **AI-01**: The weekly AI-generated market intelligence uses real stored market and fundamentals data instead of simulated values.

## v2 Requirements

### Trade Execution

- **EXEC-01**: A user can place cash-equity orders through Zerodha Kite from inside the terminal.
- **EXEC-02**: A user can review recent orders and execution status from the same interface.

### Derivatives Expansion

- **DERIV-01**: A user can inspect options or F&O context alongside equity research workflows.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Public SaaS or open signups | Product is for a fixed small group, not a multi-tenant platform |
| Mobile native app | Web dashboard is the intended surface area for v1 |
| Sub-second tick data or HFT workflows | Not needed for the intended fundamental investing use case |
| Social features, commenting, or collaboration feeds | Not part of the personal terminal focus |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 1 | Complete |
| DATA-02 | Phase 1 | Complete |
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| LIVE-01 | Phase 2 | Pending |
| LIVE-02 | Phase 2 | Pending |
| LIVE-03 | Phase 2 | Pending |
| SCRN-01 | Phase 3 | Pending |
| SCRN-02 | Phase 3 | Pending |
| SCRN-03 | Phase 3 | Pending |
| STCK-01 | Phase 4 | Pending |
| STCK-02 | Phase 4 | Pending |
| STCK-03 | Phase 4 | Pending |
| PORT-01 | Phase 5 | Pending |
| PORT-02 | Phase 5 | Pending |
| PORT-03 | Phase 5 | Pending |
| MACR-01 | Phase 6 | Pending |
| MACR-02 | Phase 6 | Pending |
| NEWS-01 | Phase 6 | Pending |
| NEWS-02 | Phase 6 | Pending |
| AI-01 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0

---
*Requirements defined: 2026-03-30*
*Last updated: 2026-03-30 after GSD state reconstruction*
