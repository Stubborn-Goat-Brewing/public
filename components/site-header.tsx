"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * Shared site navigation used on every public page so the header looks and
 * behaves identically everywhere. Matches the homepage design (dark bar, white
 * goat logo, full nav) and uses root-relative "/#section" anchors so the Visit
 * Us / Hours / Contact links work from any page, not just the homepage.
 */
type NavLink = { href: string; label: string; external?: boolean }

const NAV_LINKS: NavLink[] = [
  { href: "/menu", label: "Menu" },
  { href: "/events", label: "Events" },
  { href: "/#visit", label: "Visit Us" },
  { href: "/#hours", label: "Hours" },
  { href: "/#contact", label: "Contact" },
  {
    href: "https://www.toasttab.com/stubborn-goat-brewing-122-rosehill-ave/giftcards",
    label: "Gift Cards",
    external: true,
  },
]

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-zinc-900 text-white">
      <div className="container flex h-16 items-center justify-between py-4">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/images/goat-head-white.png"
            alt="Stubborn Goat Brewing Logo"
            width={40}
            height={40}
            className="h-10 w-auto"
          />
          <span className="hidden font-bold sm:inline-block">Stubborn Goat Brewing</span>
        </Link>

        <nav className="hidden md:flex items-center gap-4 sm:gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium hover:underline underline-offset-4"
              {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-white hover:bg-white/10 hover:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-zinc-900">
          <nav className="container py-4 flex flex-col space-y-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium hover:underline underline-offset-4"
                onClick={() => setIsMobileMenuOpen(false)}
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
