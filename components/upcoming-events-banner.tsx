"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Event {
  name: string
  date: string
  startTime: string
  endTime: string
  description: string
  type: string
}

interface DayEvents {
  date: Date
  dayName: string
  monthDay: string
  events: Event[]
}

export function UpcomingEventsBanner() {
  const [upcomingDays, setUpcomingDays] = useState<DayEvents[]>([])
  const [loading, setLoading] = useState(true)

  const formatTime12Hour = (time: string | Date, eventDate: string) => {
    if (!time) return ""

    let hours: number
    let minutes: string

    // Check if time is a Date object (ISO string from API)
    if (typeof time === "string" && time.includes("T")) {
      const timeDate = new Date(time)
      // Get UTC hours and subtract 5 for EST
      hours = timeDate.getUTCHours() - 5
      // Handle negative hours (wrap to previous day)
      if (hours < 0) hours += 24
      minutes = timeDate.getUTCMinutes().toString().padStart(2, "0")
    } else {
      // Parse regular time format "HH:MM"
      const timeStr = typeof time === "string" ? time : time.toString()
      const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/)
      if (!timeMatch) return timeStr
      hours = Number.parseInt(timeMatch[1], 10)
      minutes = timeMatch[2]
    }

    // Convert to 12-hour format
    const period = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12

    return `${displayHours}:${minutes} ${period}`
  }

  const formatEventTime = (event: Event) => {
    const startTime = formatTime12Hour(event.startTime, event.date)
    const endTime = formatTime12Hour(event.endTime, event.date)

    if (startTime && endTime) {
      return `${startTime} - ${endTime}`
    }
    return startTime || ""
  }

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

        // Get the next 5 days starting from today
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const next5Days: DayEvents[] = []

        for (let i = 0; i < 5; i++) {
          const date = new Date(today)
          date.setDate(today.getDate() + i)

          const dayEvents = events.filter((event) => {
            const eventDate = new Date(event.date)
            eventDate.setHours(0, 0, 0, 0)
            return eventDate.getTime() === date.getTime()
          })

          dayEvents.sort((a, b) => {
            const getEndTimeValue = (time: string | Date) => {
              if (!time) return 999999 // Events without end time go last

              let hours: number
              let minutes: number

              // Check if time is a Date object (ISO string from API)
              if (typeof time === "string" && time.includes("T")) {
                const timeDate = new Date(time)
                hours = timeDate.getUTCHours() - 5 // Convert to EST
                if (hours < 0) hours += 24
                minutes = timeDate.getUTCMinutes()
              } else {
                // Parse regular time format "HH:MM"
                const timeStr = typeof time === "string" ? time : time.toString()
                const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/)
                if (!timeMatch) return 999999
                hours = Number.parseInt(timeMatch[1], 10)
                minutes = Number.parseInt(timeMatch[2], 10)
              }

              return hours * 60 + minutes // Convert to minutes for comparison
            }

            return getEndTimeValue(a.endTime) - getEndTimeValue(b.endTime)
          })

          next5Days.push({
            date,
            dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
            monthDay: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            events: dayEvents,
          })
        }

        setUpcomingDays(next5Days)
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
            <h3 className="text-white font-semibold text-sm md:text-lg">Coming Up This Week</h3>
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

        <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 snap-x snap-mandatory md:snap-none scrollbar-hide">
          {upcomingDays.map((day, idx) => (
            <div
              key={idx}
              className={`flex-shrink-0 w-[85vw] md:w-48 snap-center rounded-lg border ${
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
                  {day.events.slice(0, 3).map((event, eventIdx) => (
                    <div key={eventIdx} className="text-left">
                      <p className="text-sm font-semibold text-zinc-900 line-clamp-2 leading-tight">{event.name}</p>
                      {event.startTime && (
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 text-amber-600" />
                          <p className="text-xs text-zinc-600">{formatEventTime(event)}</p>
                        </div>
                      )}
                    </div>
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
