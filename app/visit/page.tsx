import type { Metadata } from "next"
import { MapPin, Phone, Clock, CalendarCheck } from "lucide-react"
import { pageMetadata } from "@/lib/seo/site"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { HoursCard } from "@/components/hours-card"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = pageMetadata({
  title: "Visit",
  description:
    "Visit Stubborn Goat Brewing in West Grove, PA. Find our address, map, hours, phone number, and reserve a table for your next visit.",
  path: "/visit",
})

const RESERVATION_EMAIL = "reservations@stubborngoatbrewing.com"

export default function VisitPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="container flex-1 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-3">Visit The Goat</h1>
            <p className="text-xl text-primary font-medium">
              Craft beer, food &amp; live music in West Grove, PA
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Location & Map */}
            <Card className="border-2 border-primary/20">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Location</h2>
                </div>

                <address className="not-italic text-muted-foreground mb-6">
                  <p className="flex items-start gap-2 text-base md:text-lg">
                    <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>122 Rosehill Ave, West Grove, PA 19390</span>
                  </p>
                </address>

                <div className="h-[300px] overflow-hidden rounded-lg mb-6">
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

                <Button asChild variant="outline" className="w-full gap-2 bg-transparent">
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=122+Rosehill+Ave,+West+Grove,+PA+19390"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MapPin className="h-4 w-4" />
                    Get Directions
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Hours */}
            <Card className="border-2 border-primary/20">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Hours</h2>
                </div>

                <HoursCard />
              </CardContent>
            </Card>
          </div>

          {/* Contact & Reservations */}
          <Card className="mt-6 md:mt-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CalendarCheck className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-3">Plan Your Visit</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
                Give us a call or send an email to make a reservation. We look forward to hosting you at The Goat.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="w-full sm:w-auto gap-2">
                  <a href="tel:6106799017">
                    <Phone className="h-5 w-5" />
                    (610) 679-9017
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto gap-2 bg-transparent">
                  <a href={`mailto:${RESERVATION_EMAIL}?subject=Reservation%20Request`}>
                    <CalendarCheck className="h-5 w-5" />
                    Make a Reservation
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
