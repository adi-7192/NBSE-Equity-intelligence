# Coding Conventions

**Analysis Date:** 2026-03-30

## Naming Patterns

**Files:**
- Component files: kebab-case (e.g., `alert-cards.tsx`, `stock-picks.tsx`, `market-header.tsx`, `update-button.tsx`)
- Utility files: kebab-case (e.g., `use-mobile.ts`, `use-toast.ts`)
- Data/logic files: camelCase (e.g., `archive.ts`, `data.ts`, `utils.ts`)
- UI component files: kebab-case (e.g., `button.tsx`, `card.tsx`, `dialog.tsx`)
- Pages: kebab-case or index pattern (e.g., `page.tsx` for route handlers, `route.ts` for API routes)

**Functions:**
- React components: PascalCase (e.g., `DashboardClient`, `AlertCards`, `StockPickCard`, `MarketHeader`)
- Utility functions: camelCase (e.g., `cn`, `severityStyles`, `genId`, `addToRemoveQueue`, `getLiveData`)
- Custom hooks: camelCase with `use` prefix (e.g., `useToast`, `useIsMobile`)
- Event handlers: camelCase with handler verb prefix (e.g., `handleUpdate`, `handleClose`, `handleChange`)

**Variables:**
- State variables: camelCase (e.g., `activeTab`, `expanded`, `status`, `result`, `open`)
- Constants: UPPER_SNAKE_CASE or camelCase depending on scope (e.g., `MOBILE_BREAKPOINT`, `TOAST_LIMIT`, `TOAST_REMOVE_DELAY`)
- DOM references: descriptive camelCase (e.g., `response`, `data`, `error`, `archive`)

**Types:**
- Interfaces: PascalCase (e.g., `AlertCard`, `MarketBaseline`, `StockPick`, `Props`, `UpdateResult`)
- Type aliases: PascalCase (e.g., `AlertSeverity`, `Tab`, `UpdateStatus`, `PickStatus`, `ToasterToast`)
- Discriminated union types: PascalCase (e.g., `Action`, `ActionType`)

## Code Style

**Formatting:**
- No explicit formatter configured (no .prettierrc or biome.json found)
- Indentation: 2 spaces (inferred from source files)
- Semicolons: Consistently used at statement ends
- Quotes: Single quotes for imports, double quotes for JSX attributes and strings

**Linting:**
- ESLint configured (package.json includes `"lint": "eslint ."`)
- No .eslintrc config found; uses Next.js defaults
- TypeScript strict mode enabled in `tsconfig.json`

**Patterns Observed:**
- Arrow functions for component definitions and callbacks
- Consistent use of type annotations on props
- Destructuring in function parameters
- Ternary operators for simple conditionals
- Early returns in error handling

## Import Organization

**Order:**
1. React imports and hooks (`import { useState, useEffect } from "react"`)
2. Third-party library imports (`import Link from "next/link"`, `import { Button } from "@radix-ui/..."`)
3. Icon imports (`import { ChevronDown, AlertTriangle } from "lucide-react"`)
4. Local utility imports (`import { cn } from "@/lib/utils"`)
5. Local component imports (`import AlertCards from "@/components/alert-cards"`)
6. Type imports (`import type { AlertCard } from "@/lib/data"`)

**Path Aliases:**
- `@/*` resolves to repository root
- Used consistently for imports: `@/lib/...`, `@/components/...`, `@/hooks/...`
- No relative path imports observed in main code

## Error Handling

**Patterns:**
- Try-catch blocks in async functions (e.g., `app/api/update-data/route.ts`)
- Type-safe error checking with `instanceof Error` (e.g., `err instanceof Error ? err.message : "Network error"`)
- Null checking with optional chaining and nullish coalescing (e.g., `data?.success ?? false`, `live?.marketBaseline ?? defaultBaseline`)
- Graceful fallback to default values (e.g., `live?.alertCards ?? defaultAlerts`)
- API error responses with appropriate status codes (e.g., `{ status: 404 }`, `{ status: 500 }`)
- Console error logging for server-side errors (e.g., `console.error("[update-data] Error:", error)`)

## Logging

**Framework:** `console` (no external logging library)

**Patterns:**
- Server-side: `console.error` with contextual prefixes (e.g., `"[update-data] Error:"`)
- Client-side: Not observed; state-based UI feedback used instead
- No structured logging or log levels observed

## Comments

**When to Comment:**
- Sparse use of comments; code is generally self-documenting
- Section dividers for major logical blocks (e.g., `// ── Market Baseline ──────────────────────────────`)
- Explanatory comments for non-obvious business logic
- Side-effect warnings in non-obvious code (e.g., `// ! Side effects !` in `use-toast.ts`)

**JSDoc/TSDoc:**
- Minimal use observed
- No formal JSDoc blocks; inline type annotations preferred
- Zod `.describe()` method used for schema documentation in `app/api/update-data/route.ts`

## Function Design

**Size:** Functions are typically 10–50 lines; larger components broken into smaller subcomponents

**Parameters:**
- Props passed as single object parameter in components
- Destructuring in parameter list: `function Ticker({ label, value, change, ... }: { label: string; value: number; ... })`
- Optional parameters have defaults or use destructuring (e.g., `prefix = ""`, `decimals = 2`)

**Return Values:**
- JSX components return `React.ReactElement` or implicit return in arrow functions
- Async functions return `Promise<T>` (e.g., `Promise<void>`, `Promise<unknown | null>`)
- API routes return `Response.json()` with typed data
- Custom hooks return objects or tuples with utilities and state

## Module Design

**Exports:**
- Named exports for utilities and types (e.g., `export function cn(...)`, `export interface AlertCard`)
- Default exports for React components (e.g., `export default function DashboardClient(...)`)
- Mix of named and default exports in the same file accepted (e.g., `export { Button, buttonVariants }`)

**Barrel Files:**
- Not used; components imported directly from file paths
- Example: `import AlertCards from "@/components/alert-cards"` not from index file

**Component Composition:**
- Subcomponents defined within files when tightly coupled (e.g., `function PriceBar(...)` and `function StockPickCard(...)` in `stock-picks.tsx`)
- Extracted to separate files when reusable across components
- Props passed explicitly; composition over context for most cases

---

*Convention analysis: 2026-03-30*
