import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function WorkspaceStatusPanel({
  relayConfigured,
  sharedWatchlistCount,
  configuredProviders,
}: {
  relayConfigured: boolean
  sharedWatchlistCount: number
  configuredProviders: number
}) {
  return (
    <Card className="border-border/70 bg-card/80" id="workspace-status">
      <CardHeader>
        <CardTitle>Workspace Status</CardTitle>
        <CardDescription>
          Snapshot of the current shell, market infrastructure, and personal setup state.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-background/75 px-4 py-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Live relay
          </p>
          <p className="mt-2 text-lg font-semibold text-foreground">
            {relayConfigured ? "Configured" : "Not configured"}
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/75 px-4 py-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Shared watchlist
          </p>
          <p className="mt-2 text-lg font-semibold text-foreground">{sharedWatchlistCount} symbols</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/75 px-4 py-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Personal providers
          </p>
          <p className="mt-2 text-lg font-semibold text-foreground">{configuredProviders} connected</p>
        </div>
      </CardContent>
    </Card>
  )
}
