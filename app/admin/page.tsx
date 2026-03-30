import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { revalidatePath } from "next/cache"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import SessionToolbar from "@/components/session-toolbar"
import { auth, getAuthErrorMessage, getRequiredSession, hasAdminRole } from "@/lib/auth"
import {
  addSharedWatchlistItem,
  listSharedWatchlistItems,
  removeSharedWatchlistItem,
} from "@/lib/db/queries/shared-watchlist"
import { syncRelaySubscriptions } from "@/lib/live-market/relay-client"

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
  const sharedWatchlist = await listSharedWatchlistItems()

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
      if (isRedirectError(error)) {
        throw error
      }

      redirect(`/admin?error=${encodeURIComponent(getAuthErrorMessage(error))}`)
    }
  }

  async function createSharedWatchlistAction(formData: FormData) {
    "use server"

    try {
      const currentSession = await auth.api.getSession({
        headers: await headers(),
      })

      if (!currentSession || !hasAdminRole(currentSession.user.role)) {
        redirect("/login?error=Admin%20session%20required")
      }

      await addSharedWatchlistItem({
        exchange: String(formData.get("exchange") ?? "NSE"),
        symbol: String(formData.get("symbol") ?? ""),
        displayName: String(formData.get("displayName") ?? ""),
        instrumentToken: Number(formData.get("instrumentToken") ?? 0),
        sortOrder:
          formData.get("sortOrder") && String(formData.get("sortOrder")).trim().length > 0
            ? Number(formData.get("sortOrder"))
            : undefined,
        notes: String(formData.get("notes") ?? ""),
      })

      const nextWatchlist = await listSharedWatchlistItems()

      let message = "Tracked symbol added"
      try {
        await syncRelaySubscriptions(nextWatchlist)
      } catch {
        message = "Tracked symbol saved, but relay sync is pending"
      }

      revalidatePath("/admin")
      revalidatePath("/")
      redirect(`/admin?message=${encodeURIComponent(message)}`)
    } catch (error) {
      if (isRedirectError(error)) {
        throw error
      }

      redirect(`/admin?error=${encodeURIComponent(getAuthErrorMessage(error))}`)
    }
  }

  async function removeSharedWatchlistAction(formData: FormData) {
    "use server"

    try {
      const currentSession = await auth.api.getSession({
        headers: await headers(),
      })

      if (!currentSession || !hasAdminRole(currentSession.user.role)) {
        redirect("/login?error=Admin%20session%20required")
      }

      await removeSharedWatchlistItem(String(formData.get("itemId") ?? ""))

      const nextWatchlist = await listSharedWatchlistItems()

      let message = "Tracked symbol removed"
      try {
        await syncRelaySubscriptions(nextWatchlist)
      } catch {
        message = "Tracked symbol removed, but relay sync is pending"
      }

      revalidatePath("/admin")
      revalidatePath("/")
      redirect(`/admin?message=${encodeURIComponent(message)}`)
    } catch (error) {
      if (isRedirectError(error)) {
        throw error
      }

      redirect(`/admin?error=${encodeURIComponent(getAuthErrorMessage(error))}`)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SessionToolbar email={session.user.email} isAdmin={true} />

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
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
              <CardTitle>Shared live watchlist</CardTitle>
              <CardDescription>
                This starter list feeds the live market surface for every signed-in user. Save
                relay-ready values here so the price stream can subscribe without extra lookups.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form action={createSharedWatchlistAction} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="exchange">Exchange</Label>
                    <Input id="exchange" name="exchange" defaultValue="NSE" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input id="symbol" name="symbol" placeholder="RELIANCE" required />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display name</Label>
                    <Input id="displayName" name="displayName" placeholder="Reliance Industries" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instrumentToken">Instrument token</Label>
                    <Input id="instrumentToken" name="instrumentToken" type="number" required />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sortOrder">Sort order</Label>
                    <Input id="sortOrder" name="sortOrder" type="number" placeholder="Optional" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input id="notes" name="notes" placeholder="Optional" />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Add Tracked Symbol
                </Button>
              </form>

              <div className="space-y-3">
                {sharedWatchlist.length === 0 ? (
                  <p className="rounded-2xl border border-border bg-background/70 px-4 py-5 text-sm text-muted-foreground">
                    No live watchlist symbols yet. Add the first tracked name here.
                  </p>
                ) : (
                  sharedWatchlist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-background/70 px-4 py-4"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{item.displayName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.exchange}:{item.symbol} · token {item.instrumentToken}
                        </p>
                        {item.notes && (
                          <p className="mt-1 text-xs text-muted-foreground">{item.notes}</p>
                        )}
                      </div>
                      <form action={removeSharedWatchlistAction}>
                        <input type="hidden" name="itemId" value={item.id} />
                        <Button type="submit" variant="outline" size="sm">
                          Remove
                        </Button>
                      </form>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

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
