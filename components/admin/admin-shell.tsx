import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { CalendarDays, ExternalLink, LogOut, Music, Settings, Tags } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "@/app/admin/login/actions"
import { AdminNavLink } from "./admin-nav-link"

const NAV = [
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/artists", label: "Artists", icon: Music },
  { href: "/admin/event-types", label: "Event Types", icon: Tags },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminShell({
  email,
  children,
}: {
  email: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link href="/admin/events" className="flex shrink-0 items-center gap-2">
            <Image
              src="/images/full-logo.png"
              alt="Stubborn Goat Brewing"
              width={92}
              height={40}
              className="object-contain"
            />
            <span className="sr-only">Event admin home</span>
          </Link>

          <nav aria-label="Admin sections" className="flex items-center gap-1">
            {NAV.map(({ href, label, icon: Icon }) => (
              <AdminNavLink key={href} href={href}>
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{label}</span>
              </AdminNavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
              <Link href="/events" target="_blank" rel="noopener noreferrer">
                View site
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
            <span className="hidden max-w-[16ch] truncate text-sm text-muted-foreground lg:inline">
              {email}
            </span>
            <form action={signOut}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut className="h-4 w-4 sm:mr-1.5" aria-hidden="true" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}
