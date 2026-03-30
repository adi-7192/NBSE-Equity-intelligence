import { Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SectorRanking } from "@/lib/data"

function ratingStyles(rating: SectorRanking["rating"]) {
  if (rating === "Overweight")
    return {
      badge: "text-bullish border-bullish/30 bg-bullish/10",
      bar: "bg-bullish",
      barWidth: "w-full",
    }
  if (rating === "Neutral")
    return {
      badge: "text-amber border-amber/30 bg-amber/10",
      bar: "bg-amber",
      barWidth: "w-2/3",
    }
  return {
    badge: "text-bearish border-bearish/30 bg-bearish/10",
    bar: "bg-bearish",
    barWidth: "w-1/3",
  }
}

export default function SectorRankings({ sectors }: { sectors: SectorRanking[] }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Layers className="size-4 text-primary" />
        <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
          B. Sector Rankings — 6–12M Horizon
        </h2>
      </div>

      <div className="border border-border rounded-md overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[2rem_1fr_7rem_1fr] gap-0 bg-secondary/60 border-b border-border px-4 py-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">#</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Sector</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">View</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hidden md:block">Rationale</span>
        </div>

        {/* Rows */}
        {sectors.map((s) => {
          const styles = ratingStyles(s.rating)
          return (
            <div
              key={s.sector}
              className={cn(
                "grid grid-cols-[2rem_1fr_7rem] md:grid-cols-[2rem_1fr_7rem_1fr] gap-0 px-4 py-3 border-b border-border/50 last:border-b-0 hover:bg-secondary/30 transition-colors",
              )}
            >
              {/* Rank */}
              <span className="font-mono text-sm font-bold text-muted-foreground/50 self-center">
                {s.rank}
              </span>

              {/* Sector */}
              <div className="self-center">
                <span className="text-sm font-semibold text-foreground">{s.sector}</span>
                {/* Bar indicator */}
                <div className="mt-1 h-0.5 w-24 bg-border rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", styles.bar, styles.barWidth)} />
                </div>
                {/* Rationale on mobile */}
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed md:hidden">
                  {s.rationale}
                </p>
              </div>

              {/* Rating badge */}
              <div className="self-center">
                <span
                  className={cn(
                    "font-mono text-[10px] font-semibold tracking-wide border rounded-sm px-2 py-0.5 whitespace-nowrap",
                    styles.badge
                  )}
                >
                  {s.rating.toUpperCase()}
                </span>
              </div>

              {/* Rationale — desktop */}
              <p className="hidden md:block self-center text-xs text-muted-foreground leading-relaxed">
                {s.rationale}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
