import AppShell from "@/components/app-shell"
import { getRequiredSession, hasAdminRole } from "@/lib/auth"

export default async function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getRequiredSession()

  return (
    <AppShell
      email={session.user.email}
      isAdmin={hasAdminRole(session.user.role)}
    >
      {children}
    </AppShell>
  )
}
