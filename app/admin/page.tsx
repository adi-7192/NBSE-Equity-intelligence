import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import SessionToolbar from "@/components/session-toolbar"
import { auth, getAuthErrorMessage, getRequiredSession, hasAdminRole } from "@/lib/auth"

interface AdminPageProps {
  searchParams?: Promise<{
    error?: string
    message?: string
  }>
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await getRequiredSession()
  const isAdmin = hasAdminRole(session.user.role)

  if (!isAdmin) {
    redirect("/")
  }

  const params = searchParams ? await searchParams : {}
  const result = await auth.api.listUsers({
    headers: await headers(),
    query: {
      limit: 50,
    },
  })

  async function createUserAction(formData: FormData) {
    "use server"

    try {
      const currentSession = await auth.api.getSession({
        headers: await headers(),
      })

      if (!currentSession || !hasAdminRole(currentSession.user.role)) {
        redirect("/login?error=Admin%20session%20required")
      }

      await auth.api.createUser({
        headers: await headers(),
        body: {
          name: String(formData.get("name") ?? ""),
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
          role: "user",
        },
      })

      revalidatePath("/admin")
      redirect("/admin?message=Account%20created")
    } catch (error) {
      redirect(`/admin?error=${encodeURIComponent(getAuthErrorMessage(error))}`)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SessionToolbar email={session.user.email} isAdmin={true} />

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Create account</CardTitle>
            <CardDescription>
              Admin-managed access keeps the workspace private. New users are created here instead
              of through public signup.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createUserAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Temporary password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              {params?.error && (
                <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {params.error}
                </p>
              )}
              {params?.message && (
                <p className="rounded-xl border border-border bg-background/70 px-3 py-2 text-sm text-muted-foreground">
                  {params.message}
                </p>
              )}
              <Button type="submit" className="w-full">
                Create User Account
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Approved users</CardTitle>
            <CardDescription>
              Accounts already provisioned in the workspace. Roles stay intentionally simple in
              Phase 1.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Role
                    </p>
                    <p className="text-sm text-foreground">{user.role ?? "user"}</p>
                  </div>
                </div>
              ))}
              {result.users.length === 0 && (
                <p className="rounded-2xl border border-border bg-background/70 px-4 py-5 text-sm text-muted-foreground">
                  No users have been provisioned yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
