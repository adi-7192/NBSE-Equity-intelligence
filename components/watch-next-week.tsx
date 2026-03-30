import { Eye } from "lucide-react"
import type { WatchItem } from "@/lib/data"

export default function WatchNextWeek({ items }: { items: WatchItem[] }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Eye className="size-4 text-primary" />
        <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
          E. What to Watch Next Week
        </h2>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="border border-border bg-card rounded-md px-4 py-3 flex gap-4"
          >
            {/* Date column */}
            <div className="shrink-0 text-center min-w-[4.5rem]">
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                {item.date.split(" ")[1]} {item.date.split(" ")[2]}
              </div>
              <div className="font-mono text-2xl font-bold text-primary leading-none">
                {item.date.split(" ")[0]}
              </div>
            </div>

            <div className="border-l border-border/50 pl-4 min-w-0">
              <h3 className="text-sm font-semibold text-foreground mb-1 text-balance">
                {item.event}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                {item.relevance}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {item.tickers.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-[10px] font-bold text-primary border border-primary/30 bg-primary/10 rounded-sm px-1.5 py-0.5"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
