"use client"

import Image from "next/image"
import Link from "next/link"
import { MapPin, Phone, Menu, X, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HoursCard } from "@/components/hours-card"
import { UpcomingEventsBanner } from "@/components/upcoming-events-banner"
import { EventPromoCarousel } from "@/components/event-promo-carousel"
import { useState } from "react"

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <style jsx global>{`
        html {
          scroll-padding-top: 120px;
        }
      `}</style>

      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* <AnnouncementBanner
          message="Buy $50.00 or more in gift cards and get a bonus card for $5.00 off your next visit."
          linkText="Show me more"
          linkHref="https://order.toasttab.com/egiftcards/stubborn-goat-brewing-122-rosehill-ave"
          disclaimer="Offer available in-store or online through 12/23/25. Bonus cards are redeemable 12/26/25 through 3/31/26 and must be used in full on one check."
        /> */}
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
            <Link href="#visit" className="text-sm font-medium hover:underline underline-offset-4">
              Visit Us
            </Link>
            <Link href="#hours" className="text-sm font-medium hover:underline underline-offset-4">
              Hours
            </Link>
            <Link href="#contact" className="text-sm font-medium hover:underline underline-offset-4">
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
                href="#visit"
                className="text-sm font-medium hover:underline underline-offset-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Visit Us
              </Link>
              <Link
                href="#hours"
                className="text-sm font-medium hover:underline underline-offset-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Hours
              </Link>
              <Link
                href="#contact"
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
        <section className="relative">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <div className="relative min-h-[60vh] md:min-h-[80vh] bg-black">
            <Image
              src="/images/brewery-exterior-sunset.jpg"
              alt="Stubborn Goat Brewing exterior at sunset with outdoor patio"
              fill
              priority
              className="object-cover object-top"
            />
            <div className="container relative z-20 flex h-full flex-col items-center justify-center text-center text-white px-4">
              <div className="flex flex-col items-center max-w-4xl mx-auto py-8 md:pt-16 md:pb-16 w-full">
                <Image
                  src="/images/full-logo.png"
                  alt="Stubborn Goat Brewing"
                  width={300}
                  height={150}
                  className="mb-4 md:mb-6 w-24 sm:w-32 md:w-40 lg:w-52"
                />
                <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl px-4">
                  Welcome to Stubborn Goat Brewing
                </h1>
                <div className="w-full mt-4 md:mt-8 mb-2 md:mb-4 -mx-4">
                  <UpcomingEventsBanner />
                </div>
                <div className="w-full mt-2 md:mt-4 mb-2 md:mb-4 -mx-4">
                  <EventPromoCarousel />
                </div>
                <p className="mt-2 md:mt-4 max-w-[700px] text-sm sm:text-base md:text-lg text-white/90 px-4">
                  At Stubborn Goat Brewing in West Grove, PA, we're more than just great craft beer (though we've got
                  plenty of that, too). We've created a space for everyone — families, friends, and neighbors — to
                  connect over local brews, PA-made wine and spirits, delicious food, creative mocktails, and an
                  always-fresh lineup of live music and events. Whether you're here for a pint, a plate, or a laid-back
                  outing with the kids, there's something for everyone at The Goat.
                </p>
                <div className="mt-4 md:mt-6 flex justify-center">
                  <Button asChild size="lg">
                    <Link href="#visit">Visit Us</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-primary/5">
          <div className="container px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
              {/* Follow The Herd */}
              <div className="bg-background rounded-lg shadow-lg p-6 md:p-8 lg:p-10 text-center border-2 border-primary/20">
                <Image
                  src="/images/icon_instagram.png"
                  alt="Instagram"
                  width={64}
                  height={64}
                  className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 md:mb-6"
                />
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tighter mb-3 md:mb-4">
                  Follow The Herd!
                </h2>
                <p className="text-sm md:text-base lg:text-lg text-muted-foreground mb-6 md:mb-8">
                  Follow us on Instagram for the latest photos, events, and behind-the-scenes content. Join our
                  community and see what's brewing at The Goat!
                </p>
                <Button
                  asChild
                  size="lg"
                  className="text-sm md:text-base lg:text-lg px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6 w-full md:w-auto"
                >
                  <Link
                    href="https://instagram.com/StubbornGoatBrewing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <Image
                      src="/images/icon_instagram.png"
                      alt="Instagram"
                      width={20}
                      height={20}
                      className="h-4 w-4 md:h-5 md:w-5"
                    />
                    Follow Us on Instagram
                  </Link>
                </Button>
              </div>

              {/* Join Our Mailing List */}
              <div className="bg-background rounded-lg shadow-lg p-6 md:p-8 lg:p-10 text-center border-2 border-primary/20">
                <Mail className="h-12 w-12 md:h-16 md:w-16 text-primary mx-auto mb-4 md:mb-6" />
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tighter mb-3 md:mb-4">
                  Join Our Mailing List
                </h2>
                <p className="text-sm md:text-base lg:text-lg text-muted-foreground mb-6 md:mb-8">
                  Stay in the loop with exclusive updates on new beer releases, special events, promotions, and
                  everything happening at The Goat. Be the first to know!
                </p>
                <Button
                  asChild
                  size="lg"
                  className="text-sm md:text-base lg:text-lg px-4 md:px-6 lg:px-8 py-4 md:py-5 lg:py-6 w-full md:w-auto"
                >
                  <Link
                    href="https://www.toasttab.com/stubborn-goat-brewing-122-rosehill-ave/marketing-signup"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Sign Up Now
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground mt-4 md:mt-6">
                  We respect your privacy. Unsubscribe anytime.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Combined Visit Us and Hours Sections */}
        <section className="pb-6 md:pb-8 bg-primary/5">
          <div className="container px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
              {/* Visit Us */}
              <div
                id="visit"
                className="scroll-mt-32 bg-background rounded-lg shadow-lg p-6 md:p-8 lg:p-10 text-center border-2 border-primary/20"
              >
                <MapPin className="h-12 w-12 md:h-16 md:w-16 text-primary mx-auto mb-4 md:mb-6" />
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tighter mb-6 md:mb-8">Visit Us</h2>

                <div className="space-y-4 md:space-y-6">
                  <address className="not-italic text-muted-foreground text-center">
                    <p className="flex items-center justify-center gap-2 text-sm md:text-base lg:text-lg">
                      <MapPin className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                      <span className="break-words">122 Rosehill Ave, West Grove, PA 19390</span>
                    </p>
                  </address>

                  <div className="h-[250px] md:h-[300px] overflow-hidden rounded-lg">
                    <iframe
                      title="Stubborn Goat Brewing Location"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3071.5116035870707!2d-75.8293238!3d39.8224868!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c6579e4a5e4a8d%3A0x618460a2c2e8a04a!2s122%20Rosehill%20Ave%2C%20West%20Grove%2C%20PA%2019390!5e0!3m2!1sen!2sus!4v1712508081!5m2!1sen!2sus"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </div>
              </div>

              {/* Hours of Operation */}
              <div
                id="hours"
                className="scroll-mt-32 bg-background rounded-lg shadow-lg p-6 md:p-8 lg:p-10 text-center border-2 border-primary/20"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-12 w-12 md:h-16 md:w-16 text-primary mx-auto mb-4 md:mb-6"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tighter mb-6 md:mb-8">
                  Hours of Operation
                </h2>

                <HoursCard />
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-8 md:py-12 scroll-mt-32">
          <div className="container">
            <h2 className="text-center text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Get In Touch</h2>
            <p className="mx-auto mt-4 max-w-[700px] text-center text-muted-foreground">
              Have questions or want to book an event? Reach out to us!
            </p>
            <div className="mt-12">
              <div className="flex flex-col items-center justify-center gap-8">
                <div className="grid gap-8 md:grid-cols-2 w-full max-w-2xl">
                  <div className="flex flex-col items-center text-center p-6 rounded-lg bg-background shadow-sm">
                    <Phone className="h-12 w-12 mb-4 text-primary" />
                    <h3 className="text-xl font-bold">Call Us</h3>
                    <p className="mt-2 text-muted-foreground">We'd love to hear from you</p>
                    <a
                      href="tel:6106799017"
                      className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                    >
                      Give Us a Call
                    </a>
                  </div>
                  <div className="flex flex-col items-center text-center p-6 rounded-lg bg-background shadow-sm">
                    <Image src="/images/icon_email.png" alt="Email" width={48} height={48} className="h-12 w-12 mb-4" />
                    <h3 className="text-xl font-bold">Email Us</h3>
                    <p className="mt-2 text-muted-foreground">Send us a message anytime</p>
                    <a
                      href="mailto:tribe@stubborngoatbrewing.com"
                      className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                    >
                      Send Us a Message
                    </a>
                  </div>
                </div>
              </div>
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
