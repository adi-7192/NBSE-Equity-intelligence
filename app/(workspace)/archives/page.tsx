import { Archive, CalendarDays, FileJson2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getRequiredSession } from "@/lib/auth"
import { listArchives } from "@/lib/archive"

export default async function ArchivesPage() {
  const session = await getRequiredSession()
  const archives = await listArchives(session.user.id)

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-border/70 bg-card/75 p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
          Archives
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">Historical intelligence snapshots</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground md:text-[15px]">
          Every manual update preserves a dated snapshot of the intelligence layer so you can track
          how weekly market views evolved over time.
        </p>
      </section>

      <Card className="border-border/70 bg-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson2 className="size-5 text-primary" />
            Archive log
          </CardTitle>
          <CardDescription>
            Archived dashboard payloads tied to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {archives.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 bg-background/70 px-6 py-12 text-center">
              <Archive className="mx-auto size-10 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-semibold text-foreground">No archives yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Run a weekly refresh from the dashboard and your first dated intelligence snapshot
                will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {archives.map((archive) => (
                <div
                  key={archive.filename}
                  className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/75 px-4 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                      <CalendarDays className="size-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{archive.date}</p>
                      <p className="font-mono text-xs text-muted-foreground">{archive.filename}</p>
                    </div>
                  </div>
                  <div className="rounded-full border border-border/70 bg-card/70 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Snapshot
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
