# Codebase Concerns

**Analysis Date:** 2026-03-30

## Data Persistence & Loss Risk

**In-Memory Archive Storage:**
- Issue: All archives are stored in memory (`let currentLiveData` and `archiveHistory` array) in `/lib/archive.ts`
- Files: `lib/archive.ts` (lines 4-5), `app/api/update-data/route.ts` (lines 104-107)
- Impact: Data loss on server restart. Archives cannot survive deployment cycles or service restarts. For a financial market intelligence platform, losing historical data is a critical issue.
- Fix approach: Migrate archive storage to persistent backend (database, file system, or object storage). Consider implementing a database layer (SQLite, PostgreSQL, or Vercel Postgres) with versioned snapshots.

**Missing Data Validation on Restore:**
- Issue: When loading live data, no validation that restored data matches expected schema
- Files: `app/page.tsx` (lines 31, 33-41), `lib/archive.ts` (lines 11-12)
- Impact: Malformed or partial data from a failed save could render with incorrect defaults silently. Type-casting to `unknown` provides no runtime safety.
- Fix approach: Add Zod schema validation to `getLiveData()` and `getArchive()` functions. Return null and log errors if data fails validation.

## AI Model Dependency & Cost Risk

**Hardcoded Model Selection:**
- Issue: API route uses `anthropic/claude-opus-4.6` directly without fallback or configuration
- Files: `app/api/update-data/route.ts` (line 118)
- Impact: Model deprecation or API changes force code changes. No ability to test with different models or adjust for cost/latency trade-offs. Potential for unexpected billing if model pricing changes.
- Fix approach: Move model name to environment variable with sensible default. Add fallback logic or graceful degradation if model is unavailable.

**No Rate Limiting or Request Throttling:**
- Issue: `/api/update-data` endpoint has no rate limiting; users can trigger unlimited AI requests
- Files: `app/api/update-data/route.ts` (line 90)
- Impact: Potential cost explosion if endpoint is called repeatedly by accident or maliciously. No protection against DoS.
- Fix approach: Implement request rate limiting (e.g., one update per 5 minutes, per IP/session). Add success/error tracking to prevent runaway loops.

**Single Point of Failure in AI Generation:**
- Issue: AI call failure (line 149-151) causes entire update to fail with generic error
- Files: `app/api/update-data/route.ts` (lines 149-151, 181-189)
- Impact: No graceful degradation. If AI fails, entire dashboard becomes stale. No ability to update partial data (e.g., preserve old picks but refresh macro data).
- Fix approach: Implement partial success handling. Allow independent updates to different sections. Return 206 Partial Content on partial failures.

## Type Safety & Runtime Issues

**Unsafe Type Casting in API Response:**
- Issue: `MarketDataSchema` validation is performed, but response is directly used without re-validation
- Files: `app/api/update-data/route.ts` (line 119), `lib/data.ts` (lines 16-88)
- Impact: If AI returns data that passes Zod but is semantically invalid (e.g., negative stock prices, illogical date strings), it will silently propagate to frontend.
- Fix approach: Add secondary validation after Zod parsing for business logic (e.g., target > cmp > stopLoss for stock picks). Log validation errors.

**Untyped Archive History:**
- Issue: `archiveHistory` array stores `unknown` type without runtime type checking on retrieval
- Files: `lib/archive.ts` (line 5, 36-40)
- Impact: Retrieving old archives requires unsafe type casting on the frontend. Frontend has no guarantee data matches expected shape.
- Fix approach: Use Zod schemas for all stored data structures. Validate on retrieval, return null on mismatch.

**Missing Error Type Discriminator:**
- Issue: Error handling treats all exceptions identically; no distinction between network, timeout, validation, and API errors
- Files: `app/api/update-data/route.ts` (lines 181-189), `components/update-button.tsx` (lines 54-59)
- Impact: User feedback is too generic. Hard to debug or implement retry strategies specific to error type.
- Fix approach: Create typed error class hierarchy (NetworkError, ValidationError, AIError). Return structured error codes.

## Page Reload Side Effect

**Forced Full Page Reload on Success:**
- Issue: `window.location.reload()` in success handler resets all component state
- Files: `components/update-button.tsx` (line 67)
- Impact: User loses position in UI (tab selection, scroll position, expanded/collapsed states). Jarring UX, especially on mobile. Defeats purpose of client-side component state.
- Fix approach: Refactor to use data refetching or state mutation without reload. Use React Query/SWR or implement a custom cache invalidation pattern.

## Missing API Security Measures

**No Request Authentication/Authorization:**
- Issue: `/api/update-data` endpoint is publicly accessible with no authentication check
- Files: `app/api/update-data/route.ts` (line 90)
- Impact: Anyone with knowledge of the URL can trigger expensive AI requests. No access control for sensitive market data operations.
- Fix approach: Add middleware to verify request origin/authentication. Implement API key or session-based access control.

**No API Input Validation:**
- Issue: POST endpoint accepts no parameters; all logic is hardcoded
- Files: `app/api/update-data/route.ts` (line 90)
- Impact: Future extensibility is blocked. Cannot parameterize which sectors, tickers, or data sources to update.
- Fix approach: Add optional query/body parameters with validation. Document API contract.

## Data Consistency & Synchronization

**Stock Picks Manually Maintained in Mix of Generated Data:**
- Issue: Stock picks and picks-under-review are preserved on update (lines 162-163) while everything else regenerates
- Files: `app/api/update-data/route.ts` (lines 155-166), `lib/data.ts` (lines 204-415)
- Impact: Picks can become inconsistent with updated macro/sector context. Old pick thesis may no longer be relevant to updated market data. No audit trail of when picks were made vs. when data was updated.
- Fix approach: Store picks in separate persistent data structure with explicit version tracking. Document which data updates affect pick validity.

**Archives Missing Metadata:**
- Issue: Archives store only filename, date, and raw data; no metadata about what triggered the archive or what changed
- Files: `lib/archive.ts` (lines 15-27), `app/archives/page.tsx` (lines 82-106)
- Impact: Cannot easily identify which archives are comparable or what market conditions changed between them. Difficult to analyze drift.
- Fix approach: Add metadata: trigger reason, diff summary, AI model used, timestamp precision, summary stats.

## UI & Component Issues

**Archives Page UI Incomplete:**
- Issue: Archives listed but no way to view, download, or compare them; placeholders in template
- Files: `app/archives/page.tsx` (lines 82-103)
- Impact: Archives feature is non-functional. Users cannot actually examine historical data, defeating stated purpose.
- Fix approach: Implement archive download/view endpoint. Add side-by-side comparison view. Include export options.

**Missing Loading Fallback for Live Data:**
- Issue: If `getLiveData()` is slow or fails, page renders with no loading indicator
- Files: `app/page.tsx` (line 31)
- Impact: Page appears broken while loading. No skeleton or placeholder content.
- Fix approach: Wrap page in Suspense boundary with loading skeleton. Implement streaming response if data is large.

**No Null Safety in Stock Picks Rendering:**
- Issue: `stockPicks.map()` called without length check; empty picks array renders empty section
- Files: `components/stock-picks.tsx` (lines 226-228)
- Impact: Confusing UX if picks are ever empty (should show message, not blank section). Not defensive.
- Fix approach: Add explicit check for empty arrays with contextual empty state message.

## Testing & Validation Gaps

**No Test Coverage:**
- Impact: API route, archive logic, and data validation have no unit or integration tests
- Files: All source files
- Risk: Refactoring breaks functionality silently. Schema changes not caught before deployment.
- Fix approach: Add Jest or Vitest configuration. Write tests for: archive persistence, API response validation, data schema conformance, error cases.

**Manual Data Maintenance Risk:**
- Issue: Stock picks in `lib/data.ts` are hardcoded with no way to update via UI
- Files: `lib/data.ts` (lines 204-415)
- Impact: Stale picks accumulate. Changes require code commit. User has no control over which picks to display.
- Fix approach: Implement UI form for manual pick entry. Store picks separately from generated data.

## Configuration & Environment Concerns

**Missing Environment Variable Documentation:**
- Issue: No `.env.example` or documented required environment variables
- Impact: Deployment setup unclear. AI API key handling unknown.
- Fix approach: Create `.env.example` with all required variables documented. Document deployment instructions.

**Next.js Configuration Minimal:**
- Issue: `next.config.mjs` is empty (only 144 bytes)
- Files: `next.config.mjs`
- Impact: No image optimization, security headers, or compression configured. Not optimized for production.
- Fix approach: Add config for: Image optimization, ISR revalidation timing, security headers, compression, CSP policy.

## Performance & Scaling Concerns

**Sidebar Component Size:**
- Issue: `components/ui/sidebar.tsx` is 726 lines, `chart.tsx` is 353 lines
- Files: `components/ui/sidebar.tsx`, `components/ui/chart.tsx`
- Impact: Bundle size bloat. Potential performance issue on slow networks. Code maintenance difficulty.
- Fix approach: Code-split large UI libraries. Lazy-load charting if not on current tab. Tree-shake unused Recharts features.

**No Pagination in Archives:**
- Issue: If hundreds of archives accumulate in memory, `/api/archives` returns all at once
- Files: `lib/archive.ts` (lines 29-33), `app/api/archives/route.ts` (lines 15-16)
- Impact: Memory leak. O(n) response size. Page becomes slow.
- Fix approach: Implement cursor-based or limit/offset pagination. Add retention policy (delete archives older than 90 days).

**AI Response Generation Time Unknown:**
- Issue: No timeout specified for `generateText()` call
- Files: `app/api/update-data/route.ts` (lines 117-147)
- Impact: Update can hang indefinitely if AI service is slow. Frontend timeout on dialog (not specified in code).
- Fix approach: Add explicit timeout (e.g., 30 seconds). Return partial/cached data on timeout instead of full failure.

## Documentation & Maintainability

**Missing JSDoc/TypeDoc:**
- Issue: Complex functions lack docstrings explaining behavior, parameters, return values, and error cases
- Files: All API routes and utility functions
- Impact: Future contributors uncertain about intent and contracts
- Fix approach: Add JSDoc to all exported functions. Document schema assumptions.

**Hardcoded Indices & Magic Strings:**
- Issue: Sector list order assumed as "all 8 sectors: Defence, Pharma, Banking..." without constants
- Files: `app/api/update-data/route.ts` (line 143), `lib/data.ts` (line 76)
- Impact: Easy to break if sector list changes. No single source of truth.
- Fix approach: Define sector enum or constant list. Use in validation and AI prompt.

---

*Concerns audit: 2026-03-30*
