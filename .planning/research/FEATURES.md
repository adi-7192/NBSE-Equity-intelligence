# Feature Research

**Domain:** Personal Bloomberg-style terminal for Indian equity markets
**Researched:** 2026-03-30
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

These are the non-negotiables for a serious Indian-market terminal. If any are missing, the product feels unfinished rather than opinionated.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Basic auth + private workspace | This is a personal/family terminal, not a public app | MEDIUM | Email/password or invite-only is enough for 2-5 users |
| Persistent watchlist and portfolio storage | Users expect saved positions, notes, and watchlists to survive restarts | MEDIUM | PostgreSQL replaces in-memory state |
| Live NSE/BSE prices | A terminal should show current prices without manual refresh | HIGH | Zerodha Kite WebSocket relay with SSE/browser updates |
| Stock screener with core fundamentals | The main job is filtering 5,000+ stocks into a short list | HIGH | PE, PB, ROE, ROCE, debt/equity, margin trends, growth |
| Individual stock research page | Users need one place for price, charts, fundamentals, peers, and history | HIGH | This is where the dashboard becomes a research terminal |
| Portfolio P&L and holdings view | Without live P&L and holdings, the terminal cannot monitor risk | MEDIUM | Manual entry plus broker-backed positions where possible |
| News and filings for tracked names | Indian investors expect exchange filings and relevant news nearby | MEDIUM | NSE/BSE filing feeds first, then curated news sources |
| Historical context and charts | A live number is not enough without trend and comparison context | MEDIUM | Recharts and stored OHLCV/fundamentals fit the existing UI well |

### Differentiators (Competitive Advantage)

These are the parts that can make the product feel meaningfully better than Screener.in, broker consoles, or generic market apps.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Weekly AI intelligence grounded in real stored data | Turns raw market data into a usable weekly memo instead of a chatty summary | MEDIUM | Keep the current Claude-powered workflow, but feed it real DB-backed data |
| Archive of past intelligence snapshots | Lets users review what changed, what was predicted, and what aged well | LOW | Existing dashboard strength worth preserving and expanding |
| Filter-to-shortlist workflow | Reduces the path from 5,000 stocks to a conviction list | HIGH | Screener results should naturally feed watchlists and stock pages |
| India-specific macro dashboard | Adds RBI rates, CPI/WPI, IIP, and FII/DII flows in one place | MEDIUM | More useful than generic US-centric macro widgets |
| Sector rotation and peer comparison | Helps users see leadership, weakness, and valuation context quickly | HIGH | Strong fit for a long-term Indian equity workflow |
| Red-flag alerts on holdings | Surfaces earnings misses, pledge changes, margin deterioration, and governance issues | HIGH | More actionable than generic price alerts |
| Cohesive tabbed dashboard experience | The existing multi-tab layout is already a strong mental model | LOW | Preserve the current dashboard strengths instead of rebuilding around a new navigation pattern |

### Anti-Features (Commonly Requested, Often Problematic)

These ideas sound attractive, but they pull the product away from the core investing workflow or create too much operational complexity too early.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Trade execution in v1 | It feels complete if users can buy/sell inside the app | Adds compliance, edge cases, and workflow risk before the research layer is solid | Keep Kite for data only in v1 and revisit execution later |
| Real-time tick-by-tick everything | Users like the idea of always-on live data | Most of the product is fundamental/investment research, not HFT; it increases infra cost and noise | Stream meaningful live prices and update derived views at sane intervals |
| Options chain and F&O analytics | Many Indian users ask for derivatives tools | It balloons scope and shifts the product away from the core equity terminal | Defer until the equity workflow is stable and clearly demanded |
| Public SaaS signups | Broader growth sounds good | Breaks the 2-5 user assumption and forces multi-tenant hardening too early | Keep it invite-only and private |
| Mobile native app | Feels convenient for monitoring | Duplicates effort and usually degrades research UX | Use a responsive web app first |
| Social feeds, comments, and stock forums | Can increase engagement | Adds moderation and noise without helping conviction | Keep notes/private watchlists instead |
| AI-generated recommendations without grounding | Feels like a smarter advisor | Easy to hallucinate or drift away from the data | Use AI only on top of stored fundamentals, prices, and news |

## Feature Dependencies

```text
[Basic auth]
    └──requires──> [Persistent database]
                       └──requires──> [User sessions / profile tables]

[Live NSE/BSE prices]
    └──requires──> [Kite WebSocket relay]
                       └──requires──> [Stock universe with instrument tokens]

[Stock screener]
    └──requires──> [Fundamentals ETL]
                       └──requires──> [Stock master table + financial history]

[Individual stock page]
    └──requires──> [OHLCV history]
    └──requires──> [Fundamentals ETL]
    └──requires──> [Live price relay]

[Portfolio P&L]
    └──requires──> [Holdings / positions store]
    └──requires──> [Live price relay]

[News and filings]
    └──requires──> [Ticker mapping + stock universe]
    └──requires──> [Scheduled ingestion jobs]

[Weekly AI intelligence]
    └──requires──> [All persisted market data]
                       └──requires──> [Archive/history tables]

[Red-flag alerts]
    └──enhances──> [Portfolio monitor]
    └──requires──> [News, filings, and fundamentals history]
```

### Dependency Notes

- **Basic auth requires a persistent database:** sessions, users, portfolios, and saved filters need to survive deploys and restarts.
- **The screener requires fundamentals ETL:** without fresh P&L, balance sheet, and ratio data, the core user promise collapses.
- **Live price views require the relay layer:** watchlists and portfolio P&L should not call Kite directly from the browser.
- **Weekly AI intelligence depends on real stored data:** the current AI dashboard is a strength, but it only stays credible if it summarizes actual holdings, market data, and news.
- **Red-flag alerts depend on multiple sources:** the useful alerts are usually cross-signal alerts, not a single price threshold.

## MVP Definition

### Launch With (v1)

Minimum viable product for this terminal is the smallest set of features that makes the product useful for daily research and portfolio monitoring.

- [ ] Basic auth + PostgreSQL persistence - private access and durable user state are required before anything else feels real.
- [ ] Live watchlist + portfolio holdings with current prices - this is the daily-monitoring heartbeat of the terminal.
- [ ] Fundamentals screener - this is the core value proposition for narrowing the universe to conviction candidates.
- [ ] Stock detail page with charts, fundamentals, and peers - users need one strong research surface per company.
- [ ] Weekly AI market intelligence powered by real data - preserves the existing dashboard win while grounding it in the new data model.

### Add After Validation (v1.x)

These should land once the core workflow proves useful and the data pipeline is stable.

- [ ] Exchange filing and news ingestion - adds timeliness without blocking the core screening workflow.
- [ ] Macro dashboard for RBI rates, inflation, and FII/DII flows - important context, but not the first thing users open every day.
- [ ] Red-flag alerts for holdings - best added after the portfolio model and news/fundamentals history are reliable.
- [ ] Better peer comparison and ranking views - useful once the base screener and stock pages are working.

### Future Consideration (v2+)

These are valuable, but they should wait until the equity research workflow has traction.

- [ ] Trade execution - only after the data and monitoring layers are trusted.
- [ ] Options/F&O analytics - a separate complexity bucket that can distract from the equity focus.
- [ ] Mobile native app - the web product should earn the right to duplicate itself.
- [ ] Public multi-tenant SaaS - not aligned with the current 2-5 user target.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Basic auth + persistent database | HIGH | MEDIUM | P1 |
| Live watchlist and portfolio P&L | HIGH | HIGH | P1 |
| Fundamentals screener | HIGH | HIGH | P1 |
| Stock detail page with charts and peers | HIGH | HIGH | P1 |
| Weekly AI intelligence on real data | HIGH | MEDIUM | P1 |
| Exchange filings and curated news | MEDIUM | MEDIUM | P2 |
| Macro dashboard | MEDIUM | MEDIUM | P2 |
| Red-flag alerts | HIGH | HIGH | P2 |
| Trade execution | MEDIUM | HIGH | P3 |
| Options/F&O analytics | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Screener.in | Zerodha Console / Kite | Our Approach |
|---------|-------------|------------------------|--------------|
| Fundamental screening | Strong screening and ratio filters, but mostly static | Limited for deep fundamental discovery | Build the screening flow into the same workspace as live prices and portfolio monitoring |
| Live market monitoring | Not the main strength | Excellent for prices and holdings | Combine live data with fundamentals and research context in one terminal |
| Research narrative | Minimal AI or narrative layer | Very limited | Keep the existing AI weekly brief, but ground it in stored market data and archive it |
| Macro and filings context | Partial, fragmented across the site | Mostly trading-focused | Surface RBI, flows, and filings alongside the stock and portfolio views |

## Sources

- `.planning/PROJECT.md`
- `.planning/research/ARCHITECTURE.md`
- Existing dashboard strengths documented in the current project brief

---
*Feature research for: Indian-market personal Bloomberg terminal*
*Researched: 2026-03-30*
