import ProviderStatusCard from "@/components/integrations/provider-status-card"
import type { UserIntegrationSummary } from "@/lib/db/queries/user-integrations"

export default function IntegrationsPanel({
  integrations,
  saveAction,
  disconnectAction,
}: {
  integrations: UserIntegrationSummary[]
  saveAction: (formData: FormData) => Promise<void>
  disconnectAction: (formData: FormData) => Promise<void>
}) {
  return (
    <section className="space-y-4" id="integrations">
      {integrations.map((integration) => (
        <ProviderStatusCard
          key={integration.provider}
          integration={integration}
          saveAction={saveAction}
          disconnectAction={disconnectAction}
        />
      ))}
    </section>
  )
}
