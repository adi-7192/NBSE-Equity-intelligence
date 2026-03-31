"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ElementType } from "react"
import {
  Archive,
  BarChart3,
  Bot,
  ChevronRight,
  LayoutDashboard,
  Settings,
  Shield,
  WalletCards,
} from "lucide-react"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AppSidebarProps = {
  email: string
  isAdmin: boolean
}

type NavItem = {
  href: string
  label: string
  icon: ElementType
  summary: string
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    summary: "Live market and weekly intelligence",
  },
  {
    href: "/archives",
    label: "Archives",
    icon: Archive,
    summary: "Historical intelligence snapshots",
  },
  {
    href: "/screener",
    label: "Screener",
    icon: BarChart3,
    summary: "Fundamentals phase loading next",
  },
  {
    href: "/portfolio",
    label: "Portfolio",
    icon: WalletCards,
    summary: "Monitor holdings and risk in one place",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    summary: "Profile, integrations, security",
  },
  {
    href: "/admin",
    label: "Admin",
    icon: Shield,
    summary: "Users and shared workspace controls",
    adminOnly: true,
  },
]

function isItemActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

function SidebarBody({
  email,
  isAdmin,
  pathname,
  onNavigate,
}: AppSidebarProps & {
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pb-4 pt-5">
        <div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-4 shadow-[0_18px_80px_-48px_rgba(214,165,74,0.55)]">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
            Equity Intelligence
          </p>
          <h2 className="mt-3 text-lg font-semibold text-foreground">
            Private market terminal
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Live prices, archives, and personal integrations in one workspace.
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1 pb-6">
          {navItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => {
              const active = isItemActive(pathname, item.href)
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-start gap-3 rounded-2xl border px-3 py-3 transition-all",
                    active
                      ? "border-primary/45 bg-primary/10 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                      : "border-transparent bg-transparent text-muted-foreground hover:border-border/80 hover:bg-card/70 hover:text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 rounded-xl border p-2",
                      active
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border/70 bg-card/70 text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-semibold text-inherit">
                      {item.label}
                      {active && <ChevronRight className="size-3.5 text-primary" />}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                      {item.summary}
                    </span>
                  </span>
                </Link>
              )
            })}
        </nav>
      </ScrollArea>

      <div className="px-4 pb-4">
        <Separator className="mb-4 bg-border/70" />
        <div className="rounded-2xl border border-border/70 bg-card/80 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-sm font-semibold text-primary">
              {email.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{email}</p>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                {isAdmin ? "Admin access" : "Analyst access"}
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-border/70 bg-background/80 px-3 py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Bot className="size-3.5 text-primary" />
              Personal integrations and workspace status now live in Settings.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AppSidebar({ email, isAdmin }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[17.5rem] border-r border-border/80 bg-sidebar/95 backdrop-blur md:flex">
      <SidebarBody email={email} isAdmin={isAdmin} pathname={pathname} />
    </aside>
  )
}

export function MobileSidebar({ email, isAdmin }: AppSidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 rounded-xl border border-border/70 bg-card/70 p-0 md:hidden"
        >
          <LayoutDashboard className="size-4" />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[20rem] border-border bg-sidebar p-0 text-sidebar-foreground">
        <SheetTitle className="sr-only">Workspace navigation</SheetTitle>
        <SidebarBody
          email={email}
          isAdmin={isAdmin}
          pathname={pathname}
          onNavigate={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  )
}
