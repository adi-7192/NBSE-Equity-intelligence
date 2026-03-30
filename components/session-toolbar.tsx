import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"

interface SessionToolbarProps {
  email: string
  isAdmin: boolean
}

export default function SessionToolbar({ email, isAdmin }: SessionToolbarProps) {
  async function signOutAction() {
    "use server"

    await auth.api.signOut({
      headers: await headers(),
    })

    redirect("/login")
  }

  return (
    <div className="border-b border-border bg-card/60 px-4 py-3">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Private Workspace
          </p>
          <p className="text-sm text-foreground">{email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/archives">
            <Button variant="outline" size="sm">
              Archives
            </Button>
          </Link>
          {isAdmin && (
            <Link href="/admin">
              <Button variant="outline" size="sm">
                Account Admin
              </Button>
            </Link>
          )}
          <form action={signOutAction}>
            <Button size="sm">Sign Out</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
