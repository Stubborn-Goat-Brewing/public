"use client"

import { useState, useEffect } from "react"
import { Calendar, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { CalendarEvent as Event } from "@/lib/events/types"
import { compareOccurrences, eventPath, formatTimeRange, getEventIcon, toDateKey } from "@/lib/events/format"

interface DayEvents {
  date: Date
  dayName: string
  monthDay: string
  events: Event[]
}

/** Event type icon tinted with the type's color from the database. */
function EventTypeIcon({ event }: { event: Event }) {
  const Icon = getEventIcon(event.icon)
  return <Icon className="h-3 w-3" style={{ color: event.color }} />
}

export function UpcomingEventsBanner() {
  const [upcomingDays, setUpcomingDays] = useState<DayEvents[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const timestamp = Date.now()
        const response = await fetch(`/api/events?t=${timestamp}`, {
          cache: "no-store",
        })

        if (!response.ok) {
          setLoading(false)
          return
        }

        const data = await response.json()
        const events: Event[] = data.events || []

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const next10Days: DayEvents[] = []

        for (let i = 0; i < 10; i++) {
          const date = new Date(today)
          date.setDate(today.getDate() + i)

          // Compare on `YYYY-MM-DD` keys so no timezone shifting can occur.
          const dateKey = toDateKey(date)
          const dayEvents = events.filter((event) => event.date === dateKey).sort(compareOccurrences)

          next10Days.push({
            date,
            dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
            monthDay: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            events: dayEvents,
          })
        }

        setUpcomingDays(next10Days)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching events:", error)
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  if (loading) {
    return (
      <div className="w-full bg-zinc-900/80 backdrop-blur-sm border-t border-white/10 py-4">
        <div className="container">
          <div className="flex items-center justify-center">
            <p className="text-white/60 text-sm">Loading upcoming events...</p>
          </div>
        </div>
      </div>
    )
  }

  const hasAnyEvents = upcomingDays.some((day) => day.events.length > 0)

  if (!hasAnyEvents) {
    return null
  }

  return (
    <div className="w-full bg-zinc-900/80 backdrop-blur-sm border-t border-white/10 py-4 md:py-6">
      <div className="container px-4">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 md:h-5 md:w-5 text-amber-400" />
            <h3 className="text-white font-semibold text-sm md:text-lg">Coming Up</h3>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-white hover:text-amber-400 hover:bg-white/10 text-xs md:text-sm"
          >
            <Link href="/events" className="flex items-center gap-1">
              See All
              <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
            </Link>
          </Button>
        </div>

        <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {upcomingDays.map((day, idx) => (
            <div
              key={idx}
              className={`flex-shrink-0 w-[85vw] sm:w-[45vw] md:w-[30vw] lg:w-40 xl:w-44 snap-center rounded-lg border ${
                day.events.length > 0 ? "bg-white/95 border-amber-400/50" : "bg-white/5 border-white/10"
              } p-3 md:p-4 transition-all hover:scale-105`}
            >
              <div className="flex flex-col items-center mb-2 md:mb-3 pb-2 md:pb-3 border-b border-zinc-200">
                <p
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    day.events.length > 0 ? "text-amber-600" : "text-white/40"
                  }`}
                >
                  {day.dayName}
                </p>
                <p
                  className={`text-xl md:text-2xl font-bold ${day.events.length > 0 ? "text-zinc-900" : "text-white/60"}`}
                >
                  {day.monthDay}
                </p>
              </div>

              {day.events.length > 0 ? (
                <div className="space-y-2">
                  {day.events.slice(0, 3).map((event) => (
                    <Link
                      key={event.occurrenceId}
                      href={eventPath(event.id, event.date)}
                      className="block text-left rounded-md -mx-1 px-1 py-0.5 transition-colors hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                    >
                      <div className="flex items-start gap-1.5 mb-1">
                        <div className="flex-shrink-0 mt-0.5">
                          <EventTypeIcon event={event} />
                        </div>
                        <p
                          className={`text-sm font-semibold text-zinc-900 line-clamp-2 leading-tight ${
                            event.isCancelled ? "line-through opacity-70" : ""
                          }`}
                        >
                          {event.name}
                        </p>
                      </div>
                      <p className="text-xs text-zinc-600 ml-5">
                        {formatTimeRange(event.startTime, event.endTime)}
                      </p>
                    </Link>
                  ))}
                  {day.events.length > 3 && (
                    <p className="text-xs text-zinc-500 italic">+{day.events.length - 3} more</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-white/40 text-center italic">No events</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
