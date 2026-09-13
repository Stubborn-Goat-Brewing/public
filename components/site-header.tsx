"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * Shared site navigation used on every public page so the header looks and
 * behaves identically everywhere. Matches the homepage design (dark bar, white
 * goat logo, full nav) and uses root-relative "/#section" anchors so the Visit
 * Us / Hours / Contact links work from any page, not just the homepage.
 *
 * Drinks and Food are dropdown menus whose sub-items deep-link to section
 * anchors on the `/drinks` and `/food` pages; the trigger itself links to the
 * top of the respective page.
 */
type NavLink = { href: string; label: string; external?: boolean }

type NavMenu = { label: string; href: string; items: NavLink[] }

const DRINKS_MENU: NavMenu = {
  label: "Drinks",
  href: "/drinks",
  items: [
    { href: "/drinks#beer", label: "Beer" },
    { href: "/drinks#cocktails", label: "Cocktails" },
    { href: "/drinks#wine", label: "Wine" },
    { href: "/drinks#na-beverages", label: "N/A Beverages" },
  ],
}

const FOOD_MENU: NavMenu = {
  label: "Food",
  href: "/food",
  items: [
    { href: "/food#shareables", label: "Shareables" },
    { href: "/food#wings", label: "Wings" },
    { href: "/food#smash-burgers", label: "Smash Burgers" },
    { href: "/food#cheesesteaks", label: "Cheesesteaks" },
    { href: "/food#handhelds", label: "Handhelds" },
    { href: "/food#tacos", label: "Tacos" },
    { href: "/food#flatbreads", label: "Flatbreads" },
    { href: "/food#salads", label: "Salads" },
    { href: "/food#desserts", label: "Desserts" },
    { href: "/food#little-goats", label: "Little Goats" },
  ],
}

const NAV_LINKS: NavLink[] = [
  { href: "/events", label: "Calendar" },
  { href: "/private-events", label: "Private Events" },
  { href: "/visit", label: "Visit" },
  { href: "/#contact", label: "Contact" },
  {
    href: "https://www.toasttab.com/stubborn-goat-brewing-122-rosehill-ave/giftcards",
    label: "Gift Cards",
    external: true,
  },
]

/**
 * Handles clicks on category sub-items. When the user is already on the target
 * page (e.g. clicking "Cocktails" while on `/drinks`), a hash-only URL change
 * inside the dropdown does not reliably scroll, so we prevent the default and
 * scroll to the section ourselves. Cross-page clicks fall through to the normal
 * Link navigation, which scrolls to the hash on load.
 */
function useAnchorNavigate() {
  const pathname = usePathname()

  return (event: React.MouseEvent, href: string) => {
    const hashIndex = href.indexOf("#")
    if (hashIndex === -1) return

    const targetPath = href.slice(0, hashIndex)
    const targetId = href.slice(hashIndex + 1)
    if (pathname !== targetPath) return

    const element = document.getElementById(targetId)
    if (!element) return

    event.preventDefault()
    element.scrollIntoView({ behavior: "smooth" })
    window.history.replaceState(null, "", href)
  }
}

/** Desktop dropdown for a top-level menu (Drinks / Food). */
function NavDropdown({ menu }: { menu: NavMenu }) {
  const handleAnchorNavigate = useAnchorNavigate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium outline-none hover:underline underline-offset-4 data-[state=open]:underline">
        {menu.label}
        <ChevronDown className="h-4 w-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        <DropdownMenuItem asChild className="font-medium">
          <Link href={menu.href}>{`All ${menu.label}`}</Link>
        </DropdownMenuItem>
        {menu.items.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link href={item.href} onClick={(event) => handleAnchorNavigate(event, item.href)}>
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Mobile expandable group for a top-level menu (Drinks / Food). */
function MobileNavGroup({ menu, onNavigate }: { menu: NavMenu; onNavigate: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const handleAnchorNavigate = useAnchorNavigate()

  return (
    <div className="flex flex-col">
      <button
        type="button"
        className="flex items-center justify-between py-1 text-sm font-medium"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        {menu.label}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {isOpen && (
        <div className="mt-2 flex flex-col space-y-3 border-l border-white/15 pl-4">
          <Link
            href={menu.href}
            className="text-sm font-medium text-white/80 hover:underline underline-offset-4"
            onClick={onNavigate}
          >
            {`All ${menu.label}`}
          </Link>
          {menu.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-white/80 hover:underline underline-offset-4"
              onClick={(event) => {
                handleAnchorNavigate(event, item.href)
                onNavigate()
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

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

        <nav className="hidden lg:flex items-center gap-4">
          <NavDropdown menu={DRINKS_MENU} />
          <NavDropdown menu={FOOD_MENU} />
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
          className="lg:hidden text-white hover:bg-white/10 hover:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-zinc-900">
          <nav className="container py-4 flex flex-col space-y-4">
            <MobileNavGroup menu={DRINKS_MENU} onNavigate={closeMobileMenu} />
            <MobileNavGroup menu={FOOD_MENU} onNavigate={closeMobileMenu} />
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium hover:underline underline-offset-4"
                onClick={closeMobileMenu}
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
