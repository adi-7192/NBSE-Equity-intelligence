import { BarChart3, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ScreenerPlaceholderPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-border/70 bg-card/75 p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
          Screener
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">The stock universe view lands next.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground md:text-[15px]">
          This destination is now part of the workspace shell so the product feels complete even
          before the fundamentals engine ships in Phase 3.
        </p>
      </section>

      <section className="rounded-[28px] border border-dashed border-border/80 bg-background/70 p-8">
        <BarChart3 className="size-10 text-primary" />
        <h2 className="mt-4 text-2xl font-semibold text-foreground">Fundamentals pipeline pending</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          The next phase will ingest the Indian stock universe, refresh core metrics on a durable
          schedule, and expose sortable filters for valuation, quality, growth, and leverage.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/">
            <Button className="rounded-xl">
              Return to Dashboard
              <ChevronRight className="size-4" />
            </Button>
          </Link>
          <Link href="/settings#integrations">
            <Button variant="outline" className="rounded-xl">
              Review Integrations
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
