# Technology Stack

**Analysis Date:** 2026-03-30

## Languages

**Primary:**
- TypeScript 5.7.3 - All source code (`app/`, `components/`, `lib/`)
- JSX/TSX - React components and Next.js pages

**Secondary:**
- CSS (Tailwind CSS) - Styling via `app/globals.css`

## Runtime

**Environment:**
- Node.js (version not specified in package.json)

**Package Manager:**
- pnpm (indicated by `pnpm-lock.yaml` presence)
- Lockfile: `pnpm-lock.yaml` present

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework with API routes
- React 19.2.4 - UI component library
- React DOM 19.2.4 - DOM rendering

**UI Component System:**
- Radix UI (comprehensive component primitives) - 30+ components including:
  - Dialog, dropdown, select, tabs, toggle, tooltip, popover
  - Alert dialog, context menu, navigation menu
  - Form primitives (checkbox, radio, label)
  - Layout (scroll area, separator, aspect ratio)
  - Location: `components/ui/` (shadcn/ui components built on Radix)

**Styling & Theme:**
- Tailwind CSS 4.2.0 - Utility-first CSS framework
- Tailwind CSS PostCSS 4.2.0 - PostCSS integration
- class-variance-authority 0.7.1 - Component variant management
- tailwind-merge 3.3.1 - Merge Tailwind classes safely
- next-themes 0.4.6 - Theme switching (dark/light mode)
- tw-animate-css 1.3.3 - Animation utilities
- PostCSS 8.5.0 - CSS processing pipeline

**Form & Validation:**
- React Hook Form 7.54.1 - Form state management
- @hookform/resolvers 3.9.1 - Validation resolver integration
- Zod 3.24.1 - Schema validation and TypeScript type inference

**Charts & Visualization:**
- Recharts 2.15.0 - React charting library for market data visualization

**AI/LLM Integration:**
- ai 6.0.116 - Vercel AI SDK for LLM integration (`app/api/update-data/route.ts`)

**Utilities & Components:**
- lucide-react 0.564.0 - Icon library (used throughout UI)
- sonner 1.7.1 - Toast notification library
- cmdk 1.1.1 - Command menu component
- clsx 2.1.1 - Conditional className utility
- date-fns 4.1.0 - Date manipulation utilities
- vaul 1.1.2 - Drawer component
- embla-carousel-react 8.6.0 - Carousel component
- react-day-picker 9.13.2 - Date picker component
- input-otp 1.4.2 - One-time password input
- react-resizable-panels 2.1.7 - Resizable panel layout

**Analytics:**
- @vercel/analytics 1.6.1 - Vercel analytics integration (`app/layout.tsx`)

**Development:**
- TypeScript 5.7.3 - Type checking
- @types/node 22 - Node.js type definitions
- @types/react 19.2.14 - React type definitions
- @types/react-dom 19.2.3 - React DOM type definitions
- autoprefixer 10.4.20 - CSS vendor prefixing

## Configuration

**Environment:**
- No required environment variables for basic operation
- Analytics via Vercel (automatic if deployed to Vercel)

**TypeScript:**
- Config: `tsconfig.json`
- Target: ES6
- Strict mode: enabled
- Module resolution: bundler
- Path aliases: `@/*` maps to project root

**Next.js:**
- Config: `next.config.mjs`
- Image optimization: disabled (`unoptimized: true`)
- Build errors: TypeScript errors ignored during build
- Font loading: Google Fonts (Inter, JetBrains Mono)

**Tailwind CSS:**
- Config: uses components.json with shadcn/ui configuration
- Style: New York (shadcn preset)
- CSS output: `app/globals.css`
- Base color: neutral
- CSS Variables: enabled
- Icon library: lucide

**PostCSS:**
- Config: `postcss.config.mjs`
- Plugins: @tailwindcss/postcss

**Code Quality:**
- Linting: ESLint configured (`package.json` includes `lint` script)
- ESLint config: Not detected (may use default Next.js)

## Build & Development

**Scripts:**
```bash
npm run dev       # Start development server (next dev)
npm run build     # Production build (next build)
npm run start     # Start production server (next start)
npm run lint      # Run ESLint (eslint .)
```

**Development:**
- Development server runs on default Next.js port (3000)
- Fast refresh enabled (React 19)

**Production:**
- Standalone Node.js server
- Vercel deployment ready

## Key Dependencies

**Critical:**
- `ai` (Vercel AI SDK) - Core dependency for Claude model integration in `app/api/update-data/route.ts`
- `zod` - Data schema validation for market data structure

**Infrastructure:**
- `next` - Framework and API routes
- `react` - UI rendering engine
- Radix UI suite - Accessible component primitives
- `tailwindcss` - Styling system

## Platform Requirements

**Development:**
- Node.js LTS recommended
- pnpm package manager
- Modern browser with ES6 support

**Production:**
- Node.js runtime (Vercel, self-hosted, or containerized)
- No database required (in-memory session storage)
- No external service dependencies for core functionality

---

*Stack analysis: 2026-03-30*
