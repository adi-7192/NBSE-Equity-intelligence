import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SecurityPanel({
  hasEncryptionKey,
}: {
  hasEncryptionKey: boolean
}) {
  return (
    <Card className="border-border/70 bg-card/80" id="security">
      <CardHeader>
        <CardTitle>Security</CardTitle>
        <CardDescription>
          How this workspace protects stored provider credentials and account access.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-background/75 px-4 py-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Session boundary
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Better Auth protects all signed-in routes. Admin controls remain role-gated and hidden
            from non-admin accounts.
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/75 px-4 py-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Secret storage
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Provider credentials are encrypted server-side before they are written to Postgres and
            are never returned raw to the browser.
          </p>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
            {hasEncryptionKey ? "Encryption configured" : "Using fallback app secret"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
