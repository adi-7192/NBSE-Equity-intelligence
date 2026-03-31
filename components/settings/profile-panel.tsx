import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProfilePanel({
  name,
  email,
  role,
}: {
  name: string
  email: string
  role: string
}) {
  return (
    <Card className="border-border/70 bg-card/80" id="profile">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          The account identity currently active inside this workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border/70 bg-background/75 px-4 py-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Name
          </p>
          <p className="mt-2 text-lg font-semibold text-foreground">{name}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/75 px-4 py-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Email
          </p>
          <p className="mt-2 text-lg font-semibold text-foreground">{email}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/75 px-4 py-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Role
          </p>
          <p className="mt-2 text-lg font-semibold text-foreground">{role}</p>
        </div>
      </CardContent>
    </Card>
  )
}
