"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, ChevronRight, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CalendarEvent as Event } from "@/lib/events/types"
import {
  compareOccurrences,
  eventPath,
  formatDateLong,
  formatTimeRange,
  getEventIcon,
  toDateKey,
  typeColorStyles,
} from "@/lib/events/format"

/** How many upcoming events to feature on the homepage. */
const FEATURED_COUNT = 3

/** Event type icon tinted with the type's color from the database. */
function EventTypeIcon({ event }: { event: Event }) {
  const Icon = getEventIcon(event.icon)
  return <Icon className="h-5 w-5" style={{ color: event.color }} />
}

/**
 * A prominent-but-contained "Upcoming Events" section for the homepage. Pulls
 * the soonest events from the same /api/events source the hero strip uses, and
 * links each card to the shareable `/events/[id]/[date]` detail page so the
 * homepage has the same deep-link behavior as the events page.
 */
export function FeaturedEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch(`/api/events?t=${Date.now()}`, { cache: "no-store" })
        if (!response.ok) {
          setLoading(false)
          return
        }

        const data = await response.json()
        const all: Event[] = data.events || []

        const todayKey = toDateKey(new Date())
        const upcoming = all
          .filter((event) => event.date >= todayKey && !event.isCancelled)
          .sort(compareOccurrences)
          .slice(0, FEATURED_COUNT)

        setEvents(upcoming)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching featured events:", error)
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Render nothing (no empty gap) when there's nothing to show.
  if (loading || events.length === 0) return null

  return (
    <section className="py-10 md:py-14 bg-primary/5">
      <div className="container px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-balance">Upcoming Events</h2>
              </div>
              <p className="text-sm md:text-base text-muted-foreground">
                Live music, trivia, food specials, and more at The Goat.
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="flex-shrink-0">
              <Link href="/events" className="flex items-center gap-1">
                View calendar
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {events.map((event) => (
              <Link
                key={event.occurrenceId}
                href={eventPath(event.id, event.date)}
                className="group flex flex-col rounded-lg border-2 border-primary/20 bg-background p-5 shadow-lg transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
                    style={typeColorStyles(event.color)}
                  >
                    <EventTypeIcon event={event} />
                    {event.type}
                  </span>
                </div>

                <h3 className="mb-3 text-lg font-bold leading-tight text-balance group-hover:text-primary">
                  {event.name}
                </h3>

                <div className="mt-auto space-y-1.5 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 flex-shrink-0 text-primary" />
                    {formatDateLong(event.date)}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 flex-shrink-0 text-primary" />
                    {formatTimeRange(event.startTime, event.endTime)}
                  </p>
                  {event.location && (
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 flex-shrink-0 text-primary" />
                      {event.location}
                    </p>
                  )}
                </div>

                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  View details
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
