import AppTopbar from "@/components/app-topbar"

type AppShellProps = {
  email: string
  isAdmin: boolean
  children: React.ReactNode
}

export default function AppShell({ email, isAdmin, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppTopbar email={email} isAdmin={isAdmin} />
      <div className="md:pl-[17.5rem]">
        <main className="mx-auto max-w-[1400px] px-4 pb-10 pt-6 md:px-8 md:pt-8">
          {children}
        </main>
      </div>
    </div>
  )
}
