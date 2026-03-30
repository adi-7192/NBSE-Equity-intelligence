import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { auth, getAuthErrorMessage, getBootstrapStatus, getSession } from "@/lib/auth"

interface LoginPageProps {
  searchParams?: Promise<{
    error?: string
    message?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getSession()
  if (session) {
    redirect("/")
  }

  const params = searchParams ? await searchParams : {}
  const { canBootstrapAdmin, bootstrapEmail } = await getBootstrapStatus()

  async function signInAction(formData: FormData) {
    "use server"

    try {
      await auth.api.signInEmail({
        headers: await headers(),
        body: {
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
        },
      })

      redirect("/")
    } catch (error) {
      if (isRedirectError(error)) {
        throw error
      }

      redirect(`/login?error=${encodeURIComponent(getAuthErrorMessage(error))}`)
    }
  }

  async function bootstrapAdminAction(formData: FormData) {
    "use server"

    try {
      await auth.api.signUpEmail({
        headers: await headers(),
        body: {
          name: String(formData.get("name") ?? "Workspace Admin"),
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
        },
      })

      redirect("/")
    } catch (error) {
      if (isRedirectError(error)) {
        throw error
      }

      redirect(`/login?error=${encodeURIComponent(getAuthErrorMessage(error))}`)
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-3xl border border-border bg-card/50 p-8">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary">
            Equity Intelligence
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Private research workspace for your weekly India equities workflow.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
            Access is invite-only. Public signup is disabled after the first admin is bootstrapped.
            Once the workspace is live, the admin can create the remaining accounts from inside the
            app.
          </p>

          <div className="mt-8 grid gap-3 text-sm text-muted-foreground">
            <div className="rounded-2xl border border-border bg-background/70 p-4">
              Sign in with your approved email and password to access the dashboard, archives, and
              update workflows.
            </div>
            <div className="rounded-2xl border border-border bg-background/70 p-4">
              First-time setup uses a one-time bootstrap admin flow backed by the configured
              `BOOTSTRAP_ADMIN_*` environment variables.
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Sign in</CardTitle>
              <CardDescription>
                Use the credentials created by your workspace admin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={signInAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
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
                  Sign In
                </Button>
              </form>
            </CardContent>
          </Card>

          {canBootstrapAdmin && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Bootstrap admin</CardTitle>
                <CardDescription>
                  Use this once to initialize the first admin account for the workspace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={bootstrapAdminAction} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bootstrap-name">Name</Label>
                    <Input id="bootstrap-name" name="name" defaultValue="Workspace Admin" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bootstrap-email">Admin email</Label>
                    <Input
                      id="bootstrap-email"
                      name="email"
                      type="email"
                      defaultValue={bootstrapEmail ?? ""}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bootstrap-password">Bootstrap password</Label>
                    <Input id="bootstrap-password" name="password" type="password" required />
                  </div>
                  <Button type="submit" variant="outline" className="w-full">
                    Create Admin Account
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {!canBootstrapAdmin && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Need access?</CardTitle>
                <CardDescription>
                  Ask the workspace admin to create your account from the admin screen after they
                  sign in.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/">
                  <Button variant="ghost" className="w-full">
                    Return Home
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
