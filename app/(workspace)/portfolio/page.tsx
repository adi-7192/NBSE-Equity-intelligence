import { ChevronRight, WalletCards } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PortfolioPlaceholderPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-border/70 bg-card/75 p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
          Portfolio
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">Portfolio monitoring has a home now.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground md:text-[15px]">
          This route is intentionally part of the shell already so the workspace can grow into live
          P&amp;L, red-flag monitoring, and portfolio analytics without another navigation rewrite.
        </p>
      </section>

      <section className="rounded-[28px] border border-dashed border-border/80 bg-background/70 p-8">
        <WalletCards className="size-10 text-primary" />
        <h2 className="mt-4 text-2xl font-semibold text-foreground">Holdings workflows come in Phase 5</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          The next portfolio milestone will add holdings ingestion, live P&amp;L, risk alerts, and
          concentration analytics inside this destination.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/">
            <Button className="rounded-xl">
              Return to Dashboard
              <ChevronRight className="size-4" />
            </Button>
          </Link>
          <Link href="/settings#workspace-status">
            <Button variant="outline" className="rounded-xl">
              View Workspace Status
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
