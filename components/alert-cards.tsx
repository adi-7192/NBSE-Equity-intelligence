"use client"

import { useState } from "react"
import { ExternalLink, ChevronDown, ChevronUp, AlertTriangle, Clock, TrendingUp, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AlertCard, AlertSeverity } from "@/lib/data"

function severityStyles(s: AlertSeverity) {
  if (s === "high")
    return {
      dot: "bg-bearish",
      badge: "text-bearish border-bearish/30 bg-bearish/10",
      border: "border-l-bearish",
      label: "HIGH IMPACT",
    }
  if (s === "medium")
    return {
      dot: "bg-amber",
      badge: "text-amber border-amber/30 bg-amber/10",
      border: "border-l-amber",
      label: "MEDIUM IMPACT",
    }
  return {
    dot: "bg-bullish",
    badge: "text-bullish border-bullish/30 bg-bullish/10",
    border: "border-l-bullish",
    label: "LOW IMPACT",
  }
}

function AlertCardItem({ card }: { card: AlertCard }) {
  const [expanded, setExpanded] = useState(false)
  const styles = severityStyles(card.severity)

  return (
    <article
      className={cn(
        "border border-border bg-card rounded-md border-l-4 overflow-hidden transition-all",
        styles.border
      )}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full text-left px-4 py-3 flex items-start justify-between gap-3 hover:bg-secondary/40 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-start gap-3 min-w-0">
          <span
            className={cn(
              "mt-1 shrink-0 h-2 w-2 rounded-full",
              styles.dot
            )}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span
                className={cn(
                  "font-mono text-[10px] font-semibold tracking-widest border rounded-sm px-1.5 py-0.5",
                  styles.badge
                )}
              >
                {styles.label}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {card.date}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-foreground leading-snug text-balance">
              {card.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              {card.source}
            </p>
          </div>
        </div>
        <span className="shrink-0 mt-1 text-muted-foreground">
          {expanded ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </span>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-border/50 space-y-3">
          {/* What happened */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              What happened
            </p>
            <p className="text-sm text-foreground leading-relaxed">{card.what}</p>
          </div>

          {/* Market implication */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
              <TrendingUp className="size-3" /> Market implication
            </p>
            <p className="text-sm text-foreground leading-relaxed">{card.implication}</p>
          </div>

          {/* Stocks + timeframe row */}
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                Stocks to watch
              </p>
              <div className="flex flex-wrap gap-1.5">
                {card.stocks.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-xs font-bold text-primary border border-primary/30 bg-primary/10 rounded-sm px-2 py-0.5"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1">
                <Clock className="size-3" /> Timeframe
              </p>
              <span className="font-mono text-xs text-foreground">{card.timeframe}</span>
            </div>
          </div>

          {/* Risk */}
          <div className="bg-bearish/5 border border-bearish/20 rounded-sm px-3 py-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-bearish mb-1 flex items-center gap-1">
              <Shield className="size-3" /> Risk / Invalidation
            </p>
            <p className="text-xs text-foreground leading-relaxed">{card.risk}</p>
          </div>

          {/* Source link */}
          <a
            href={card.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="size-3" />
            {card.source}
          </a>
        </div>
      )}
    </article>
  )
}

export default function AlertCards({ alerts }: { alerts: AlertCard[] }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="size-4 text-bearish" />
        <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Event Radar — Alert Cards
        </h2>
        <span className="font-mono text-[10px] text-muted-foreground border border-border rounded-sm px-1.5 py-0.5">
          {alerts.length} alerts this week
        </span>
      </div>
      <div className="space-y-2">
        {alerts.map((card) => (
          <AlertCardItem key={card.id} card={card} />
        ))}
      </div>
    </section>
  )
}
