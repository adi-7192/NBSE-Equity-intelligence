import { formatDistanceToNow } from "date-fns"
import { CheckCircle2, KeyRound, ShieldAlert, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { UserIntegrationSummary } from "@/lib/db/queries/user-integrations"
import { getIntegrationDefinition } from "@/lib/integrations/catalog"

export default function ProviderStatusCard({
  integration,
  saveAction,
  disconnectAction,
}: {
  integration: UserIntegrationSummary
  saveAction: (formData: FormData) => Promise<void>
  disconnectAction: (formData: FormData) => Promise<void>
}) {
  const definition = getIntegrationDefinition(integration.provider)

  return (
    <Card className="border-border/70 bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
              {definition.eyebrow}
            </p>
            <span className="mt-2 block text-xl font-semibold">{definition.title}</span>
          </div>
          <div className="rounded-full border border-border/70 bg-background/80 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {integration.configured ? integration.connectionState : "missing"}
          </div>
        </CardTitle>
        <CardDescription>{definition.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-4">
          {integration.configured ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <CheckCircle2 className="size-4 text-primary" />
                Credentials stored securely
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground">
                {Object.entries(integration.maskedSummary).map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <span>{label}</span>
                    <span className="font-mono text-foreground">{value}</span>
                  </div>
                ))}
              </div>
              {integration.updatedAt && (
                <p className="text-xs text-muted-foreground">
                  Updated {formatDistanceToNow(integration.updatedAt, { addSuffix: true })}
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <KeyRound className="mt-0.5 size-4 text-primary" />
              <p>
                No credentials stored yet. Save the required values below and the app will keep
                them server-side only.
              </p>
            </div>
          )}
        </div>

        {integration.lastError && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 size-4" />
              <span>{integration.lastError}</span>
            </div>
          </div>
        )}

        <form action={saveAction} className="space-y-4">
          <input type="hidden" name="provider" value={integration.provider} />
          {definition.fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={`${integration.provider}-${field.name}`}>{field.label}</Label>
              <Input
                id={`${integration.provider}-${field.name}`}
                name={field.name}
                type={field.type ?? "text"}
                placeholder={field.placeholder}
                required
              />
            </div>
          ))}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" className="rounded-xl">
              {integration.configured ? "Replace Credentials" : "Save Credentials"}
            </Button>
          </div>
        </form>
        {integration.configured && (
          <form action={disconnectAction}>
            <input type="hidden" name="provider" value={integration.provider} />
            <Button type="submit" variant="outline" className="rounded-xl">
              <Trash2 className="size-4" />
              Remove Connection
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
