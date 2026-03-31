import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Bolt, Settings, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppSidebar, MobileSidebar } from "@/components/app-sidebar"
import { auth } from "@/lib/auth"

type AppTopbarProps = {
  email: string
  isAdmin: boolean
}

export default function AppTopbar({ email, isAdmin }: AppTopbarProps) {
  async function signOutAction() {
    "use server"

    await auth.api.signOut({
      headers: await headers(),
    })

    redirect("/login")
  }

  return (
    <>
      <AppSidebar email={email} isAdmin={isAdmin} />

      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/85 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-[1400px] items-center gap-3 px-4 py-3 md:px-8">
          <MobileSidebar email={email} isAdmin={isAdmin} />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.26em] text-primary">
              <Bolt className="size-3.5" />
              Workspace Shell
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Private equities workspace with live market surfaces and personal integrations.
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-2 text-xs text-muted-foreground lg:flex">
            <ShieldCheck className="size-3.5 text-primary" />
            {isAdmin ? "Admin session" : "Authenticated session"}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="hidden rounded-xl border border-border/70 bg-card/70 px-3 md:flex">
                <Settings className="size-4" />
                Settings
              </Button>
            </Link>
            <div className="hidden rounded-xl border border-border/70 bg-card/70 px-3 py-2 text-right md:block">
              <p className="max-w-[14rem] truncate text-sm font-medium text-foreground">{email}</p>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {isAdmin ? "Admin" : "User"}
              </p>
            </div>
            <form action={signOutAction}>
              <Button size="sm" className="rounded-xl">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>
    </>
  )
}
