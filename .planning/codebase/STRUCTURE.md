# Codebase Structure

**Analysis Date:** 2026-03-30

## Directory Layout

```
Equity Intelligence/
├── app/                            # Next.js 13+ App Router
│   ├── api/                        # API route handlers
│   │   ├── update-data/
│   │   │   └── route.ts            # AI-powered market data generation
│   │   └── archives/
│   │       └── route.ts            # Archive listing and retrieval
│   ├── archives/
│   │   └── page.tsx                # Archives page (placeholder/future)
│   ├── layout.tsx                  # Root layout, metadata, fonts, analytics
│   ├── page.tsx                    # Home page — dashboard entry point
│   └── globals.css                 # Global Tailwind directives
│
├── components/                     # React components
│   ├── ui/                         # shadcn/ui primitives (40+ components)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── tabs.tsx
│   │   ├── badge.tsx
│   │   ├── chart.tsx
│   │   └── [35 more UI components]
│   │
│   ├── theme-provider.tsx          # Theme setup (light/dark mode)
│   ├── dashboard-client.tsx        # Main dashboard shell, tab routing
│   ├── market-header.tsx           # Market baseline ticker display
│   ├── alert-cards.tsx             # Event alerts section
│   ├── macro-pulse.tsx             # Macro indicators section
│   ├── sector-rankings.tsx         # Sector ratings table
│   ├── stock-picks.tsx             # Active stock picks with price bars
│   ├── picks-under-review.tsx      # Picks awaiting confirmation
│   ├── watch-next-week.tsx         # Upcoming events watch list
│   └── update-button.tsx           # Data refresh trigger with dialog UI
│
├── hooks/                          # Custom React hooks
│   ├── use-mobile.ts               # Media query hook (mobile breakpoint)
│   └── use-toast.ts                # Toast notification hook
│
├── lib/                            # Core logic and utilities
│   ├── data.ts                     # Types, interfaces, static market data defaults
│   ├── archive.ts                  # In-memory data persistence, archive operations
│   └── utils.ts                    # Helper: cn() for Tailwind class merging
│
├── styles/                         # Global CSS
│   └── globals.css                 # Tailwind imports, CSS variables, theme tokens
│
├── public/                         # Static assets
│   └── [various image/icon assets]
│
├── .planning/                      # GSD documentation directory
│   └── codebase/                   # Codebase analysis documents
│
├── next.config.mjs                 # Next.js configuration
├── tsconfig.json                   # TypeScript configuration with path aliases
├── components.json                 # shadcn/ui configuration
├── package.json                    # Dependencies and scripts
├── pnpm-lock.yaml                  # Lockfile for pnpm
├── postcss.config.mjs              # PostCSS + Tailwind setup
└── .gitignore                      # Version control exclusions
```

## Directory Purposes

**app/:**
- Purpose: Next.js App Router — all page routes and API endpoints
- Contains: Server and client components, layouts, API handlers
- Key files: `page.tsx` (home), `layout.tsx` (root), `api/**/route.ts` (endpoints)

**components/:**
- Purpose: Reusable React components split into UI primitives and feature components
- Contains: 45+ files — mostly shadcn/ui library components plus custom research dashboard sections
- Key files: `dashboard-client.tsx` (layout), 7 section components, 1 update button

**hooks/:**
- Purpose: Custom React hooks for shared logic
- Contains: Mobile responsive detection, toast notifications
- Key files: Minimal — only 2 files

**lib/:**
- Purpose: Business logic, data models, and utilities
- Contains: Market data types/defaults, in-memory storage operations, helper functions
- Key files: `data.ts` (all types + defaults), `archive.ts` (session storage), `utils.ts` (cn helper)

**styles/:**
- Purpose: Global CSS and design tokens
- Contains: Single file with Tailwind directives and CSS variable definitions
- Key files: `globals.css` (4.3 KB — colors, gradients, responsive)

**public/:**
- Purpose: Static assets served directly by Next.js
- Contains: Images, icons, favicons (not fully examined)
- Key files: Standard Next.js public assets

## Key File Locations

**Entry Points:**
- `app/page.tsx`: Home page — renders dashboard with live/default data
- `app/layout.tsx`: Root layout with metadata, fonts, analytics
- `app/api/update-data/route.ts`: POST endpoint for AI-powered data refresh
- `app/api/archives/route.ts`: GET endpoint for archive listing/retrieval

**Configuration:**
- `tsconfig.json`: TypeScript strict mode, path alias `@/*` points to root
- `next.config.mjs`: TypeScript error ignoring, image optimization disabled
- `components.json`: shadcn/ui config (New York style, RSC enabled, Tailwind CSS vars)
- `postcss.config.mjs`: PostCSS + Tailwind (separate file, minimal)

**Core Logic:**
- `lib/data.ts`: All data types, interfaces, and static defaults (250+ lines)
- `lib/archive.ts`: Session-based data persistence and archive management (45 lines)
- `lib/utils.ts`: Utility function `cn()` for Tailwind class merging (6 lines)

**Testing:**
- No dedicated test directory — no test files detected in codebase

**Styles:**
- `styles/globals.css`: Global Tailwind imports, CSS custom properties for theme colors
- Color scheme: Neutral base with custom color tokens (bullish: green, bearish: red, amber)

## Naming Conventions

**Files:**
- **Pages:** kebab-case (`page.tsx`, `archives/page.tsx`)
- **Components:** PascalCase (`DashboardClient.tsx`, `AlertCards.tsx`, `MarketHeader.tsx`)
- **Utilities:** camelCase (`utils.ts`, `use-mobile.ts`, `use-toast.ts`)
- **API routes:** `route.ts` in feature-named directories (`api/update-data/route.ts`)

**Directories:**
- **Features:** kebab-case (`update-data/`, `archives/`)
- **Functional groups:** lowercase (ui, hooks, lib, styles, public)

**TypeScript Types/Interfaces:**
- **Data models:** PascalCase + "Type"/"Interface" suffix where helpful (`AlertCard`, `MarketBaseline`, `StockPick`)
- **Enums/Unions:** PascalCase (`AlertSeverity`, `PickStatus`, `Tab`)
- **Component props:** PascalCase with "Props" suffix optional (often inlined in component signature)

**Functions/Variables:**
- **Server/API functions:** camelCase (`saveLiveData`, `archiveCurrentData`, `getLiveData`)
- **React hooks:** camelCase starting with "use" (`useToast`, `useMobile`)
- **Component state:** camelCase (`activeTab`, `expanded`, `status`)
- **Helper functions:** camelCase (`severityStyles`, `ratingStyles`, `cn`)

## Where to Add New Code

**New Feature (e.g., Portfolio Analysis):**
- Primary code: Create directory `components/portfolio-*` for related components
- Types: Add to `lib/data.ts` (if shared) or co-located in component file
- API endpoint: Create `app/api/portfolio/route.ts` if backend logic needed
- Tests: Create `components/__tests__/portfolio-*.test.tsx` (currently not used, add when testing added)

**New Component/Module:**
- Implementation: `components/[feature-name].tsx` if feature component, `components/ui/[element].tsx` if UI primitive
- Props interface: Define inline above component or use discriminated union if complex
- Re-export: Add to appropriate parent if bundling (optional — currently all components imported directly)

**Utilities/Helpers:**
- Shared helpers: Add to `lib/utils.ts` or create new `lib/[domain].ts` file
- Styling helpers: Keep in `lib/utils.ts` (e.g., `cn()`) or inline in components if single-use
- Hooks: Create `hooks/use-[feature].ts` for cross-component logic

**API Endpoints:**
- New endpoint: Create `app/api/[resource]/route.ts` following RESTful naming
- Schema validation: Define Zod schema in route file or extracted to `lib/schemas.ts`
- Error handling: Wrap in try-catch, return JSON with success flag and error message

**Styling:**
- Global styles: Add to `styles/globals.css`
- Component styles: Use Tailwind classes inline (no separate CSS files currently)
- Theme colors: Define CSS variables in `styles/globals.css`, reference in Tailwind `tailwind.config.js` (not present — using CSS vars)

## Special Directories

**app/api/:**
- Purpose: Next.js API routes
- Generated: No (hand-written)
- Committed: Yes

**components/ui/:**
- Purpose: shadcn/ui component library
- Generated: Yes (generated via shadcn CLI install)
- Committed: Yes (components checked into repo, not node_modules)

**.planning/codebase/:**
- Purpose: GSD documentation and architecture analysis
- Generated: Yes (auto-generated by codebase mapping)
- Committed: Yes

**.claude/:**
- Purpose: Claude IDE and GSD-specific configuration
- Generated: Yes
- Committed: Yes (exists in repo)

**public/:**
- Purpose: Static assets
- Generated: No (manually added)
- Committed: Yes

---

*Structure analysis: 2026-03-30*
