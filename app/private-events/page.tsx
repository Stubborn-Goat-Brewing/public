import type { Metadata } from "next"
import Link from "next/link"
import { Calendar, Utensils, Beer, Mail, Users, MapPin } from "lucide-react"
import { pageMetadata } from "@/lib/seo/site"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = pageMetadata({
  title: "Private Events",
  description:
    "Host your private or semi-private event at Stubborn Goat Brewing in West Grove, PA. On-site spaces, full catering, and craft beer and cocktails for parties, corporate events, and celebrations.",
  path: "/private-events",
})

const INQUIRY_URL =
  "https://www.toasttab.com/invoice/lead?rx=8be4c691-2b25-4588-8823-9e8f7cb3f600&ot=f579e56b-2f56-404a-9da3-9507554ce832"

export default function PrivateEventsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="container flex-1 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">Private Events</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              From birthday parties and showers to corporate gatherings and celebrations of life, The Goat is a warm,
              welcoming space to bring your people together.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>122 Rosehill Ave, West Grove, PA</span>
            </div>
          </div>

          <Card className="mb-12 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Host Your Event at The Goat</h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  Looking to host a memorable event? We offer private and semi-private on-site spaces perfect for your
                  celebration, meeting, or gathering.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="flex flex-col items-center text-center p-6 rounded-lg bg-background/50">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Private & Semi-Private Events</h3>
                  <p className="text-sm text-muted-foreground">
                    Reserve our space for your next party, corporate event, or special occasion
                  </p>
                </div>

                <div className="flex flex-col items-center text-center p-6 rounded-lg bg-background/50">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Utensils className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Full Catering Services</h3>
                  <p className="text-sm text-muted-foreground">
                    Enjoy our complete menu with catering options for both on-site and off-site events
                  </p>
                </div>

                <div className="flex flex-col items-center text-center p-6 rounded-lg bg-background/50">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Beer className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Craft Beer & Cocktails</h3>
                  <p className="text-sm text-muted-foreground">
                    Feature our craft beers and specialty cocktails at your event
                  </p>
                </div>
              </div>

              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Ready to plan your event? Our events team is here to help make it unforgettable.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-4 text-muted-foreground">
                  <Button asChild size="lg" className="gap-2 w-full sm:w-auto">
                    <a href={INQUIRY_URL} target="_blank" rel="noopener noreferrer">
                      <Calendar className="h-4 w-4" />
                      Submit Event Inquiry
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="gap-2 bg-transparent w-full sm:w-auto">
                    <a href="mailto:events@stubborngoatbrewing.com">
                      <Mail className="h-4 w-4" />
                      Email Our Events Team
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Occasions — editable starter copy; refine as needed. */}
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex flex-col items-center mb-6">
              <Users className="h-10 w-10 text-primary mb-3" />
              <h2 className="text-2xl md:text-3xl font-bold">Perfect for Any Occasion</h2>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
              Whatever you&apos;re celebrating, we&apos;ll help you make it happen. A few of the gatherings we love to
              host:
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "Birthday Parties",
                "Corporate Events & Meetings",
                "Rehearsal Dinners",
                "Bridal & Baby Showers",
                "Retirement Parties",
                "Holiday Gatherings",
                "Fundraisers",
                "Celebrations of Life",
              ].map((occasion) => (
                <span key={occasion} className="px-4 py-2 bg-primary/10 rounded-full text-sm font-medium">
                  {occasion}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-8">
              Prefer to browse first? Check out our{" "}
              <Link href="/food" className="text-primary underline underline-offset-2 hover:text-primary/80">
                food
              </Link>{" "}
              and{" "}
              <Link href="/drinks" className="text-primary underline underline-offset-2 hover:text-primary/80">
                drinks
              </Link>{" "}
              menus.
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
