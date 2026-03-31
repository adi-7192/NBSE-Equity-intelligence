import Link from "next/link"
import { ArrowRight, CheckCircle2, PlugZap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function ConnectEmptyState({
  eyebrow,
  title,
  body,
  href,
  ctaLabel,
  tone = "setup",
}: {
  eyebrow: string
  title: string
  body: string
  href: string
  ctaLabel: string
  tone?: "setup" | "configured"
}) {
  const configured = tone === "configured"

  return (
    <div
      className={cn(
        "rounded-[24px] border p-5",
        configured
          ? "border-primary/25 bg-primary/10"
          : "border-border/70 bg-card/75"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-1 flex size-10 items-center justify-center rounded-2xl border",
            configured
              ? "border-primary/35 bg-primary/10 text-primary"
              : "border-border/70 bg-background/80 text-primary"
          )}
        >
          {configured ? <CheckCircle2 className="size-4" /> : <PlugZap className="size-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
            {eyebrow}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-foreground">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
          <Link href={href} className="mt-4 inline-flex">
            <Button variant={configured ? "outline" : "default"} className="rounded-xl">
              {ctaLabel}
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
