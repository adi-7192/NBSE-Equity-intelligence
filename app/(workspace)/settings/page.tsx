import { redirect } from "next/navigation"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { ChevronRight, PlugZap, Shield, UserCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ProfilePanel from "@/components/settings/profile-panel"
import IntegrationsPanel from "@/components/settings/integrations-panel"
import SecurityPanel from "@/components/settings/security-panel"
import WorkspaceStatusPanel from "@/components/settings/workspace-status-panel"
import {
  listUserIntegrations,
  removeUserIntegration,
  saveUserIntegration,
} from "@/lib/db/queries/user-integrations"
import { getRequiredSession, getAuthErrorMessage } from "@/lib/auth"
import { getIntegrationDefinition, type IntegrationProvider } from "@/lib/integrations/catalog"
import { listSharedWatchlistItems } from "@/lib/db/queries/shared-watchlist"
import { isRelayConfigured } from "@/lib/live-market/relay-client"

const settingsSections = [
  { id: "profile", label: "Profile", icon: UserCircle2 },
  { id: "integrations", label: "Integrations", icon: PlugZap },
  { id: "security", label: "Security", icon: Shield },
  { id: "workspace-status", label: "Workspace Status", icon: ChevronRight },
] as const

type SettingsPageProps = {
  searchParams?: Promise<{
    error?: string
    message?: string
  }>
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const session = await getRequiredSession()
  const params = searchParams ? await searchParams : {}
  const integrations = await listUserIntegrations(session.user.id)
  const sharedWatchlist = await listSharedWatchlistItems()

  async function saveIntegrationAction(formData: FormData) {
    "use server"

    try {
      const provider = String(formData.get("provider") ?? "") as IntegrationProvider
      const definition = getIntegrationDefinition(provider)

      const payload = definition.fields.reduce<Record<string, string>>((accumulator, field) => {
        const value = String(formData.get(field.name) ?? "").trim()
        if (!value) {
          throw new Error(`Missing ${field.label}.`)
        }
        accumulator[field.name] = value
        return accumulator
      }, {})

      const currentSession = await getRequiredSession()

      await saveUserIntegration({
        ownerUserId: currentSession.user.id,
        provider,
        payload,
      })

      revalidatePath("/settings")
      revalidatePath("/")
      redirect(`/settings?message=${encodeURIComponent(`${definition.title} credentials saved`)}`)
    } catch (error) {
      if (isRedirectError(error)) {
        throw error
      }

      redirect(`/settings?error=${encodeURIComponent(getAuthErrorMessage(error))}`)
    }
  }

  async function disconnectIntegrationAction(formData: FormData) {
    "use server"

    try {
      const provider = String(formData.get("provider") ?? "") as IntegrationProvider
      const definition = getIntegrationDefinition(provider)
      const currentSession = await getRequiredSession()

      await removeUserIntegration(currentSession.user.id, provider)

      revalidatePath("/settings")
      revalidatePath("/")
      redirect(`/settings?message=${encodeURIComponent(`${definition.title} connection removed`)}`)
    } catch (error) {
      if (isRedirectError(error)) {
        throw error
      }

      redirect(`/settings?error=${encodeURIComponent(getAuthErrorMessage(error))}`)
    }
  }

  const configuredProviders = integrations.filter((item) => item.configured).length

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-border/70 bg-card/75 p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
          Settings
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">
          Personal profile, provider connections, and workspace safety.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground md:text-[15px]">
          This is the control room for everything that should belong to your account personally:
          profile identity, provider access, security posture, and workspace readiness.
        </p>
        {params.error && (
          <div className="mt-5 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {params.error}
          </div>
        )}
        {params.message && (
          <div className="mt-5 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
            {params.message}
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[16rem_minmax(0,1fr)]">
        <Card className="h-fit border-border/70 bg-card/80 xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle>Sections</CardTitle>
            <CardDescription>
              Use this secondary navigation to move across settings quickly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {settingsSections.map((section) => {
              const Icon = section.icon
              return (
                <Link
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center justify-between rounded-2xl border border-transparent bg-background/70 px-4 py-3 text-sm text-muted-foreground transition hover:border-border/80 hover:bg-card/70 hover:text-foreground"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="size-4 text-primary" />
                    {section.label}
                  </span>
                  <ChevronRight className="size-4" />
                </Link>
              )
            })}
            <div className="pt-3">
              <Button asChild variant="outline" className="w-full rounded-xl">
                <Link href="/">Return to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <ProfilePanel
            name={session.user.name}
            email={session.user.email}
            role={session.user.role ?? "user"}
          />

          <IntegrationsPanel
            integrations={integrations}
            saveAction={saveIntegrationAction}
            disconnectAction={disconnectIntegrationAction}
          />

          <SecurityPanel hasEncryptionKey={Boolean(process.env.APP_ENCRYPTION_KEY)} />

          <WorkspaceStatusPanel
            relayConfigured={isRelayConfigured()}
            sharedWatchlistCount={sharedWatchlist.length}
            configuredProviders={configuredProviders}
          />
        </div>
      </div>
    </div>
  )
}
