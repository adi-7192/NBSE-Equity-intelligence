# Architecture

**Analysis Date:** 2026-03-30

## Pattern Overview

**Overall:** Full-Stack Next.js Application with AI-Powered Data Generation

**Key Characteristics:**
- Server-side rendering with React Server Components for initial data loading
- Client-side component tree for interactivity and tab-based navigation
- API route handlers for data mutations and archival operations
- Session-based in-memory data storage for live updates and archives
- AI-powered market data generation via Claude API integration
- Static default data with live fallback mechanism

## Layers

**Presentation Layer:**
- Purpose: Render interactive user interface for equity research intelligence dashboard
- Location: `app/` (page routes), `components/` (React components)
- Contains: Page components (`*.tsx`), feature components (alerts, picks, macro, sectors), UI primitives
- Depends on: Data layer (lib/data), utilities, Next.js framework
- Used by: Browser clients

**Application/Route Layer:**
- Purpose: Handle HTTP requests, orchestrate data updates, serve API endpoints
- Location: `app/api/` (API routes)
- Contains: POST handler for AI-powered data generation, GET handlers for archive retrieval
- Depends on: Data layer, AI SDK (Vercel AI SDK), Zod for validation
- Used by: Client components via fetch() calls

**Data & Logic Layer:**
- Purpose: Manage market data schema, static defaults, archive history, persistence
- Location: `lib/data.ts` (market data types and defaults), `lib/archive.ts` (storage operations)
- Contains: TypeScript interfaces, default market baseline/alerts/sectors/picks, in-memory archive system
- Depends on: Zod for runtime validation
- Used by: API routes, page components

**Infrastructure Layer:**
- Purpose: Utility functions, styling helpers, configuration
- Location: `lib/utils.ts`, `styles/globals.css`, `components/ui/` (shadcn components)
- Contains: cn() helper for Tailwind merging, global styles, reusable UI components
- Depends on: External libraries (clsx, tailwind-merge, tailwindcss, Radix UI)
- Used by: All components

## Data Flow

**Initial Page Load (Server-Side):**

1. User navigates to `/` → `app/page.tsx` renders on server
2. `getLiveData()` called to fetch any previously updated data from session
3. If live data exists, use it; otherwise fall back to defaults from `lib/data.ts`
4. Pass data as props to `DashboardClient` component
5. Client receives hydrated state and mounts interactively

**Manual Data Update (User-Initiated):**

1. User clicks "Update Data" button in `MarketHeader`
2. `UpdateButton` component opens dialog and calls `POST /api/update-data`
3. API route handler in `app/api/update-data/route.ts`:
   - Retrieves current live data (or defaults)
   - Archives current data with timestamp via `archiveCurrentData()`
   - Generates fresh market data using Claude API with structured schema
   - Saves new data via `saveLiveData()`
   - Returns success response with summary
4. Client shows success dialog and reloads page with fresh data

**Archive Retrieval:**

1. User or system calls `GET /api/archives?filename=[name]`
2. `app/api/archives/route.ts` handler queries in-memory archive history
3. Returns archived data snapshot or list of all archives

**State Management:**

- No external state management library (Redux, Zustand)
- Session-based data stored in module-level variable in `lib/archive.ts`
- Live data persists only during current session (not persistent across server restarts)
- Component-level state via React hooks (`useState`) for UI interactions (tabs, expanded alerts)
- No client-side cache invalidation strategy (page reload on successful update)

## Key Abstractions

**Market Intelligence Domain:**
- Purpose: Represent weekly equity research briefing structure
- Examples: `AlertCard`, `SectorRanking`, `StockPick`, `MarketBaseline` types in `lib/data.ts`
- Pattern: Discriminated unions with status flags (`AlertSeverity`, `PickStatus`, `RatingLevel`)
- Schema-driven: Zod schemas in `app/api/update-data/route.ts` define exact AI output shape

**Dashboard Composition:**
- Purpose: Organize research data into logical tabs/sections
- Examples: `DashboardClient` → `AlertCards`, `MacroPulse`, `SectorRankings`, `StockPicks`, etc.
- Pattern: Container component manages tab state; child components are presentation-only
- Data flows down via props; no bidirectional communication

**Update Orchestration:**
- Purpose: Encapsulate AI-driven refresh logic and data archival
- Examples: `UpdateButton` (UI), `POST /api/update-data` (logic), `archiveCurrentData()` / `saveLiveData()` (persistence)
- Pattern: Optimistic UI (show loading state), fetch remote data, update on success, reload page

## Entry Points

**Web Application:**
- Location: `app/page.tsx`
- Triggers: User navigates to `/`
- Responsibilities: Server-side data fetch (live vs. default), render dashboard with initial data, pass data to client component

**Update API:**
- Location: `app/api/update-data/route.ts`
- Triggers: `POST /api/update-data` called from `UpdateButton`
- Responsibilities: Archive current data, call Claude API with market data schema, validate response, persist, return summary

**Archives API:**
- Location: `app/api/archives/route.ts`
- Triggers: `GET /api/archives` with optional `filename` query parameter
- Responsibilities: List all archived data snapshots or retrieve specific archive by filename

**Client Application Root:**
- Location: `app/layout.tsx`
- Triggers: Every page route
- Responsibilities: Setup metadata, fonts (Inter, JetBrains Mono), analytics, global HTML structure

## Error Handling

**Strategy:** Try-catch at API route level; error messages displayed in client dialogs

**Patterns:**
- API route wraps async logic in try-catch block (see `app/api/update-data/route.ts`)
- On error: Log to console, return `Response.json({ success: false, error: message }, { status: 500 })`
- Client component in `UpdateButton` catches fetch errors and displays in error state UI
- Invalid AI response (missing structured output) throws error with descriptive message
- Archive not found returns 404 status in `app/api/archives/route.ts`

## Cross-Cutting Concerns

**Logging:**
- Approach: Browser console (client-side), Node.js console (server-side)
- Used for: API errors, update status, data serialization issues
- Example: `console.error("[update-data] Error:", error)` in route handler

**Validation:**
- Approach: Zod schemas for AI response validation in `app/api/update-data/route.ts`
- Critical schemas: `MarketDataSchema` ensures AI output matches expected structure
- Type safety: Full TypeScript, strict mode enabled, no implicit any

**Authentication:**
- Approach: None implemented (public-facing research dashboard)
- Assumption: Deployed in private/corporate environment or accepts public access
- API routes have no auth guards

**Data Consistency:**
- Approach: Single source of truth in session memory (`currentLiveData` variable)
- Archive mechanism preserves historical snapshots before mutations
- No distributed cache or multi-process synchronization needed

---

*Architecture analysis: 2026-03-30*
