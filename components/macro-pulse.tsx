import { BarChart2, TrendingDown, DollarSign, ShoppingCart, Building2 } from "lucide-react"
import type { MacroBullet } from "@/lib/data"

const iconMap: Record<string, React.ElementType> = {
  rate: BarChart2,
  fii: TrendingDown,
  crude: DollarSign,
  gst: ShoppingCart,
  capex: Building2,
}

export default function MacroPulse({ bullets }: { bullets: MacroBullet[] }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 className="size-4 text-primary" />
        <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
          A. Macro Pulse
        </h2>
      </div>
      <div className="space-y-2">
        {bullets.map((b, i) => {
          const Icon = iconMap[b.icon] ?? BarChart2
          return (
            <div
              key={i}
              className="flex items-start gap-3 border border-border bg-card rounded-md px-4 py-3"
            >
              <div className="shrink-0 mt-0.5 h-6 w-6 rounded-sm bg-primary/10 flex items-center justify-center">
                <Icon className="size-3.5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-foreground leading-relaxed">{b.text}</p>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground italic">
                  Source: {b.source}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
