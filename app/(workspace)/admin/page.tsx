import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { revalidatePath } from "next/cache"
import { Shield, UserPlus, Radar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    <div className="space-y-6">
      <section className="rounded-[28px] border border-border/70 bg-card/75 p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
          Admin
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">Private workspace controls</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground md:text-[15px]">
          Manage account access and the shared market surfaces that all signed-in users rely on.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <Card className="border-border/70 bg-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="size-5 text-primary" />
                Create account
              </CardTitle>
              <CardDescription>
                This workspace stays private by keeping account creation admin-managed.
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
                  <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-3 text-sm text-destructive">
                    {params.error}
                  </p>
                )}
                {params?.message && (
                  <p className="rounded-2xl border border-border/70 bg-background/70 px-3 py-3 text-sm text-muted-foreground">
                    {params.message}
                  </p>
                )}
                <Button type="submit" className="w-full rounded-xl">
                  Create User Account
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-5 text-primary" />
                Current users
              </CardTitle>
              <CardDescription>
                Better Auth accounts visible to the workspace admin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.users.map((user) => (
                <div
                  key={user.id}
                  className="rounded-2xl border border-border/70 bg-background/75 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{user.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="rounded-full border border-border/70 bg-card/70 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      {hasAdminRole(user.role) ? "Admin" : "User"}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/70 bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radar className="size-5 text-primary" />
              Shared live watchlist
            </CardTitle>
            <CardDescription>
              This starter list powers the Phase 2 live market surface for every signed-in user.
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
              <Button type="submit" className="w-full rounded-xl">
                Add Tracked Symbol
              </Button>
            </form>

            <div className="space-y-3">
              {sharedWatchlist.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/80 bg-background/70 px-4 py-6 text-sm text-muted-foreground">
                  No tracked symbols yet. Add the first watchlist name here and the relay can pick
                  it up on the next sync.
                </div>
              ) : (
                sharedWatchlist.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-background/75 px-4 py-4 md:flex-row md:items-start md:justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">{item.displayName}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.exchange}:{item.symbol} · token {item.instrumentToken}
                      </p>
                      {item.notes && (
                        <p className="mt-2 text-sm text-muted-foreground">{item.notes}</p>
                      )}
                    </div>
                    <form action={removeSharedWatchlistAction}>
                      <input type="hidden" name="itemId" value={item.id} />
                      <Button variant="outline" className="rounded-xl">
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
    </div>
  )
}
