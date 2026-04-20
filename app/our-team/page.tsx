"use client"

import Image from "next/image"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"

interface TeamMember {
  firstName: string
  nickname: string
  lastName: string
  image: string
  description: string
}

const teamMembers: TeamMember[] = [
  {
    firstName: "Matt",
    nickname: "Sugarcone",
    lastName: "McLaughlin",
    image: "/images/team/matt-mclaughlin.png",
    description:
      "Matt brings infectious energy and a consistently positive attitude to the brewery every single day. Known for his attentiveness to customers' needs (when not momentarily distracted), he has a natural talent for making everyone feel welcome. Beyond the taproom, Matt is the founder and fearless leader of the Stubborn Goat Run Club, where he channels his boundless enthusiasm into building community one mile at a time. When he's not pouring pints or logging miles, you'll find him at home cuddling with his beloved kittens.",
  },
]

export default function OurTeamPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/goat-head-new.png"
              alt="Stubborn Goat Brewing Logo"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <span className="hidden font-bold sm:inline-block">Stubborn Goat Brewing</span>
          </Link>

          <nav className="hidden md:flex items-center gap-4 sm:gap-6">
            <Link href="/menu" className="text-sm font-medium hover:underline underline-offset-4">
              Menu
            </Link>
            <Link href="/events" className="text-sm font-medium hover:underline underline-offset-4">
              Events
            </Link>
            <Link href="/our-team" className="text-sm font-medium hover:underline underline-offset-4">
              Our Team
            </Link>
            <Link href="/#visit" className="text-sm font-medium hover:underline underline-offset-4">
              Visit Us
            </Link>
            <Link href="/#hours" className="text-sm font-medium hover:underline underline-offset-4">
              Hours
            </Link>
            <Link href="/#contact" className="text-sm font-medium hover:underline underline-offset-4">
              Contact
            </Link>
            <Link
              href="https://www.toasttab.com/stubborn-goat-brewing-122-rosehill-ave/giftcards"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Gift Cards
            </Link>
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <nav className="container py-4 flex flex-col space-y-4">
              <Link
                href="/menu"
                className="text-sm font-medium hover:underline underline-offset-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Menu
              </Link>
              <Link
                href="/events"
                className="text-sm font-medium hover:underline underline-offset-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Events
              </Link>
              <Link
                href="/our-team"
                className="text-sm font-medium hover:underline underline-offset-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Our Team
              </Link>
              <Link
                href="/#visit"
                className="text-sm font-medium hover:underline underline-offset-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Visit Us
              </Link>
              <Link
                href="/#hours"
                className="text-sm font-medium hover:underline underline-offset-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Hours
              </Link>
              <Link
                href="/#contact"
                className="text-sm font-medium hover:underline underline-offset-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                href="https://www.toasttab.com/stubborn-goat-brewing-122-rosehill-ave/giftcards"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:underline underline-offset-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Gift Cards
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-16 bg-primary/5">
          <div className="container px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                Meet Our Team
              </h1>
              <p className="text-muted-foreground text-lg">
                The passionate people behind Stubborn Goat Brewing who make every visit memorable.
              </p>
            </div>
          </div>
        </section>

        {/* Team Members Grid */}
        <section className="py-12 md:py-16">
          <div className="container px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {teamMembers.map((member, index) => (
                <Card key={index} className="overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors">
                  <div className="aspect-square relative bg-muted overflow-hidden">
                    <Image
                      src={member.image}
                      alt={`${member.firstName} "${member.nickname}" ${member.lastName}`}
                      fill
                      className="object-cover object-[center_25%] scale-150"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-3">
                      {member.firstName} <span className="text-primary">&quot;{member.nickname}&quot;</span> {member.lastName}
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {member.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background">
        <div className="container py-8 md:py-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <Image
                src="/images/goat-head-new.png"
                alt="Stubborn Goat Brewing Logo"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="font-bold">Stubborn Goat Brewing</span>
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://instagram.com/StubbornGoatBrewing" target="_blank" rel="noopener noreferrer">
                  <Image src="/images/icon_instagram.png" alt="Instagram" width={24} height={24} className="h-6 w-6" />
                  <span className="sr-only">Instagram</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://www.facebook.com/profile.php?id=61575081059536" target="_blank" rel="noopener noreferrer">
                  <Image src="/images/icon_facebook.png" alt="Facebook" width={24} height={24} className="h-6 w-6" />
                  <span className="sr-only">Facebook</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://untappd.com/StubbornGoatBrewing" target="_blank" rel="noopener noreferrer">
                  <Image src="/images/icon_untappd.png" alt="Untappd" width={24} height={24} className="h-6 w-6" />
                  <span className="sr-only">Untappd</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="mailto:tribe@stubborngoatbrewing.com">
                  <Image src="/images/icon_email.png" alt="Email" width={24} height={24} className="h-6 w-6" />
                  <span className="sr-only">Email</span>
                </Link>
              </Button>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Stubborn Goat Brewing. All rights reserved.</p>
            <p className="mt-1">
              <Link href="/privacy" className="hover:underline">
                Privacy Policy
              </Link>{" "}
              |
              <Link href="/terms" className="hover:underline">
                {" "}
                Terms of Service
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
