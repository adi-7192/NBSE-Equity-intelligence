"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Target,
  AlertTriangle,
  RefreshCw,
  BookOpen,
  CheckCircle2,
  Info,
} from "lucide-react"
import type { StockPick } from "@/lib/data"

function PriceBar({
  cmp,
  target,
  stopLoss,
}: {
  cmp: number
  target: number
  stopLoss: number
}) {
  const range = target - stopLoss
  const cmpPct = ((cmp - stopLoss) / range) * 100
  const upside = (((target - cmp) / cmp) * 100).toFixed(1)
  const downside = (((cmp - stopLoss) / cmp) * 100).toFixed(1)

  return (
    <div className="space-y-1.5">
      <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
        {/* Stop loss to target range bar */}
        <div
          className="absolute top-0 left-0 h-full bg-bullish/20 rounded-full"
          style={{ width: "100%" }}
        />
        {/* CMP position marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-primary rounded-full"
          style={{ left: `${Math.min(Math.max(cmpPct, 2), 98)}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
        <span className="text-bearish">SL ₹{stopLoss.toLocaleString("en-IN")}</span>
        <span className="text-primary">CMP ₹{cmp.toLocaleString("en-IN")}</span>
        <span className="text-bullish">TGT ₹{target.toLocaleString("en-IN")}</span>
      </div>
      <div className="flex gap-3 text-[10px] font-mono">
        <span className="text-bullish">+{upside}% upside</span>
        <span className="text-muted-foreground">|</span>
        <span className="text-bearish">-{downside}% to SL</span>
      </div>
    </div>
  )
}

function StockPickCard({ pick }: { pick: StockPick }) {
  const [expanded, setExpanded] = useState(false)
  const upside = (((pick.target - pick.cmp) / pick.cmp) * 100).toFixed(1)

  return (
    <article className="border border-border bg-card rounded-md overflow-hidden">
      {/* Card header — always visible */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full text-left px-4 py-4 hover:bg-secondary/30 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Ticker badge */}
            <div className="shrink-0 bg-primary/10 border border-primary/30 rounded-sm px-2.5 py-1.5 text-center min-w-[4rem]">
              <div className="font-mono text-xs font-bold text-primary">{pick.ticker}</div>
              <div className="font-mono text-[10px] text-muted-foreground">{pick.capCategory === "Large-cap" ? "LG" : "MID"}</div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span className="font-mono text-[10px] font-semibold tracking-widest text-bullish border border-bullish/30 bg-bullish/10 rounded-sm px-1.5 py-0.5">
                  NEW PICK
                </span>
                <span className="font-mono text-[10px] text-muted-foreground border border-border rounded-sm px-1.5 py-0.5">
                  {pick.sector}
                </span>
                {pick.flags.map((f) => (
                  <span
                    key={f}
                    className="font-mono text-[10px] text-bearish border border-bearish/30 bg-bearish/10 rounded-sm px-1.5 py-0.5 flex items-center gap-0.5"
                  >
                    <AlertTriangle className="size-2.5" />
                    {f}
                  </span>
                ))}
              </div>
              <h3 className="text-sm font-bold text-foreground">{pick.company}</h3>
              <p className="font-mono text-xs text-muted-foreground">
                CMP ₹{pick.cmp.toLocaleString("en-IN")} · as of {pick.cmDate}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-end gap-1.5">
            <div className="text-right">
              <div className="font-mono text-xs text-muted-foreground">Target ({pick.targetMonths}M)</div>
              <div className="font-mono text-base font-bold text-bullish">
                ₹{pick.target.toLocaleString("en-IN")}
              </div>
              <div className="font-mono text-xs text-bullish">+{upside}%</div>
            </div>
            {expanded ? (
              <ChevronUp className="size-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Price bar — always visible */}
        <div className="mt-3">
          <PriceBar cmp={pick.cmp} target={pick.target} stopLoss={pick.stopLoss} />
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border/50 space-y-4">
          {/* Thesis */}
          <div className="pt-3">
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpen className="size-3.5 text-primary" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Investment Thesis
              </p>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{pick.thesis}</p>
          </div>

          {/* Valuation basis */}
          <div className="bg-primary/5 border border-primary/20 rounded-sm px-3 py-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-primary mb-1 flex items-center gap-1">
              <Target className="size-3" /> Valuation Basis
            </p>
            <p className="text-xs text-foreground">{pick.valuationBasis}</p>
          </div>

          {/* Evidence */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="size-3.5 text-bullish" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Evidence
              </p>
            </div>
            <div className="space-y-1.5">
              {pick.evidence.map((e, i) => (
                <a
                  key={i}
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 group hover:bg-secondary/40 rounded-sm px-2 py-1.5 transition-colors -mx-2"
                >
                  <ExternalLink className="size-3 text-muted-foreground mt-0.5 shrink-0 group-hover:text-primary transition-colors" />
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors leading-snug">
                    {e.headline}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Risks */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle className="size-3.5 text-bearish" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Risks
              </p>
            </div>
            <ul className="space-y-1.5">
              {pick.risks.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-foreground leading-relaxed">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-bearish shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Review trigger */}
          <div className="bg-secondary/50 border border-border rounded-sm px-3 py-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
              <RefreshCw className="size-3" /> Review Trigger
            </p>
            <p className="text-xs text-foreground leading-relaxed">{pick.reviewTrigger}</p>
          </div>
        </div>
      )}
    </article>
  )
}

export default function StockPicks({ picks }: { picks: StockPick[] }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Target className="size-4 text-primary" />
        <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">
          C. Stock Picks of the Week
        </h2>
        <span className="font-mono text-[10px] text-muted-foreground border border-border rounded-sm px-1.5 py-0.5">
          {picks.length} picks · 6–12M horizon
        </span>
      </div>
      <div className="flex items-center gap-1.5 mb-3 px-1">
        <Info className="size-3 text-muted-foreground" />
        <p className="text-[11px] text-muted-foreground font-mono">
          Click any card to expand thesis, evidence &amp; risks. All prices in INR.
        </p>
      </div>
      <div className="space-y-3">
        {picks.map((pick) => (
          <StockPickCard key={pick.id} pick={pick} />
        ))}
      </div>
    </section>
  )
}
