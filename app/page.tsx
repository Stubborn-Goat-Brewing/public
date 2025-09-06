"use client"

import Image from "next/image"
import Link from "next/link"
import { MapPin, Phone, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InstagramFeed } from "@/components/instagram-feed"
import { PopupButton } from "@/components/popup-button"
import { HoursCard } from "@/components/hours-card"
import { useState } from "react"

export default function Home() {
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
            <Link href="#get-connected" className="text-sm font-medium hover:underline underline-offset-4">
              Get Connected
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
                href="#get-connected"
                className="text-sm font-medium hover:underline underline-offset-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get Connected
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
          <div className="relative min-h-[80vh]">
            <Image
              src="/images/brewery-hero.png"
              alt="Brewery interior with copper tanks and wooden barrels"
              fill
              priority
              className="object-cover"
            />
            <div className="container relative z-20 flex h-full flex-col items-center justify-center text-center text-white">
              <div className="flex flex-col items-center max-w-4xl mx-auto pt-16 pb-16">
                <Image
                  src="/images/full-logo.png"
                  alt="Stubborn Goat Brewing"
                  width={300}
                  height={150}
                  className="mb-6 w-32 sm:w-40 md:w-52"
                />
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Welcome to Stubborn Goat Brewing
                </h1>
                <p className="mt-4 max-w-[700px] text-lg text-white/90">
                  At Stubborn Goat Brewing in West Grove, PA, we're more than just great craft beer (though we've got
                  plenty of that, too). We've created a space for everyone — families, friends, and neighbors — to
                  connect over local brews, PA-made wine and spirits, delicious food, creative mocktails, and an
                  always-fresh lineup of live music and events. Whether you're here for a pint, a plate, or a laid-back
                  outing with the kids, there's something for everyone at The Goat.
                </p>
                <div className="mt-6 flex justify-center">
                  <Button asChild size="lg">
                    <Link href="#visit">Visit Us</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}

        {/* Get Connected Section */}
        <section id="get-connected" className="bg-muted py-12 md:py-16">
          <div className="container">
            <h2 className="text-center text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Get Connected</h2>
            <p className="mx-auto mt-4 max-w-[700px] text-center text-muted-foreground">
              Stay updated with our latest brews, events, and happenings.
            </p>

            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {/* Follow The Herd */}
              <div className="flex flex-col items-center text-center p-6 rounded-lg bg-background shadow-sm">
                <Image
                  src="/images/icon_instagram.png"
                  alt="Instagram"
                  width={48}
                  height={48}
                  className="h-12 w-12 mb-4"
                />
                <h3 className="text-xl font-bold">Follow The Herd!</h3>
                <p className="mt-2 text-muted-foreground">
                  Follow us on Instagram for the latest photos, events, and behind-the-scenes content.
                </p>
                <div className="mt-8">
                  <Button asChild variant="default" size="lg">
                    <Link
                      href="https://instagram.com/StubbornGoatBrewing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <Image
                        src="/images/icon_instagram.png"
                        alt="Instagram"
                        width={20}
                        height={20}
                        className="h-5 w-5"
                      />
                      Follow Us on Instagram
                    </Link>
                  </Button>
                </div>
                <div className="mt-8 w-full">
                  <InstagramFeed username="StubbornGoatBrewing" />
                </div>
              </div>

              {/* Join Our Mailing List */}
              <div className="flex flex-col items-center text-center p-6 rounded-lg bg-background shadow-sm">
                <Image src="/images/icon_email.png" alt="Email" width={48} height={48} className="h-12 w-12 mb-4" />
                <h3 className="text-xl font-bold">Join Our Mailing List</h3>
                <p className="mt-2 text-muted-foreground">
                  Subscribe to our newsletter to stay updated on new beer releases, events, and special offers.
                </p>
                <div className="mt-8">
                  <PopupButton
                    url="http://eepurl.com/i7dgdc"
                    popupTitle="Mailing List Signup"
                    size="lg"
                    iconSrc="/images/icon_email.png"
                    iconAlt="Email"
                    className="border-[#2c5530] bg-[#2c5530] text-white hover:bg-[#2c5530] hover:border-[#2c5530] hover:text-white"
                  >
                    Subscribe to Our Newsletter
                  </PopupButton>
                </div>
                <div className="mt-8">
                  <p className="text-xs text-muted-foreground">
                    By subscribing, you agree to receive marketing emails from Stubborn Goat Brewing. You can
                    unsubscribe at any time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Visit Us Section */}
        <section id="visit" className="py-8 md:py-12">
          <div className="container">
            <h2 className="text-center text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Visit Us</h2>
            <p className="mx-auto max-w-[700px] text-center text-muted-foreground mb-8">
              Come spend some time with us in West Grove, PA.
            </p>

            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <div className="space-y-6">
                  <address className="not-italic text-muted-foreground text-center">
                    <p className="flex items-center justify-center gap-2 text-lg">
                      <MapPin className="h-5 w-5" />
                      122 Rosehill Ave, West Grove, PA 19390
                    </p>
                  </address>

                  <div className="h-[300px] overflow-hidden rounded-lg">
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
            </div>
          </div>
        </section>

        {/* Hours Section */}
        <section id="hours" className="bg-muted py-8 md:py-12">
          <div className="container">
            <h2 className="text-center text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              Hours of Operation
            </h2>
            <p className="mx-auto max-w-[700px] text-center text-muted-foreground mb-8">
              We're open and ready to welcome you! Check out our current hours below.
            </p>

            <div className="flex justify-center">
              <HoursCard />
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-8 md:py-12">
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
                    <a href="tel:4842619710" className="mt-4 text-lg font-medium hover:underline">
                      (484) 261-9710
                    </a>
                  </div>
                  <div className="flex flex-col items-center text-center p-6 rounded-lg bg-background shadow-sm">
                    <Image src="/images/icon_email.png" alt="Email" width={48} height={48} className="h-12 w-12 mb-4" />
                    <h3 className="text-xl font-bold">Email Us</h3>
                    <p className="mt-2 text-muted-foreground">Send us a message anytime</p>
                    <a
                      href="mailto:tribe@stubborngoatbrewing.com"
                      className="mt-4 text-lg font-medium hover:underline break-all"
                    >
                      tribe@stubborngoatbrewing.com
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
