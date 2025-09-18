"use client"

import { Suspense, useState, useEffect } from "react"
import {
  Calendar,
  MapPin,
  Music,
  HelpCircle,
  Grid3X3,
  Hammer,
  Star,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Event {
  name: string
  date: string
  startTime: string
  endTime: string
  description: string
  type: string
}

function getEventTypeIcon(type: string) {
  switch (type?.toLowerCase()) {
    case "live music":
      return <Music className="h-4 w-4 text-primary" />
    case "trivia":
      return <HelpCircle className="h-4 w-4 text-primary" />
    case "bingo":
      return <Grid3X3 className="h-4 w-4 text-primary" />
    case "craft":
      return <Hammer className="h-4 w-4 text-primary" />
    default:
      return <Star className="h-4 w-4 text-primary" />
  }
}

function getEventTypeLabel(type: string) {
  if (!type) return ""
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
}

async function getEvents(): Promise<Event[]> {
  try {
    console.log("[v0] Fetching events from API route")
    const response = await fetch("/api/events", {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    })

    if (!response.ok) {
      console.log("[v0] Failed to fetch events from API")
      return []
    }

    const data = await response.json()
    console.log("[v0] Received events:", data.events?.length || 0)

    return data.events || []
  } catch (error) {
    console.error("[v0] Error fetching events:", error)
    return []
  }
}

function formatTime(timeString: string): string {
  if (!timeString) return ""

  try {
    // Parse datetime string and extract just the time portion
    const date = new Date(timeString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  } catch {
    return timeString
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return ""

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return dateString
  }
}

function EventDialog({ event, isOpen, onClose }: { event: Event | null; isOpen: boolean; onClose: () => void }) {
  if (!event) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getEventTypeIcon(event.type)}
            {event.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {formatDate(event.date)}
          </div>

          {(event.startTime || event.endTime) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {event.startTime && formatTime(event.startTime)}
              {event.startTime && event.endTime && " - "}
              {event.endTime && formatTime(event.endTime)}
            </div>
          )}

          <div className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">
            {getEventTypeLabel(event.type)}
          </div>

          {event.description && <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ListView({ events, onEventClick }: { events: Event[]; onEventClick: (event: Event) => void }) {
  const upcomingEvents = events.filter((event) => new Date(event.date) >= new Date())

  return (
    <div className="space-y-8">
      {upcomingEvents.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onEventClick(event)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">{getEventTypeIcon(event.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-lg leading-tight">{event.name}</h3>
                        <div className="flex-shrink-0 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">
                          {getEventTypeLabel(event.type)}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(event.date)}
                        </div>
                        {event.startTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(event.startTime)}
                            {event.endTime && ` - ${formatTime(event.endTime)}`}
                          </div>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Upcoming Events</h3>
          <p className="text-muted-foreground">Check back soon for upcoming events at Stubborn Goat Brewing!</p>
        </div>
      )}
    </div>
  )
}

function CalendarView({ events, onEventClick }: { events: Event[]; onEventClick: (event: Event) => void }) {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay() // 0 = Sunday
  const daysInMonth = lastDayOfMonth.getDate()

  // Create calendar grid
  const calendarDays = []

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  // Group events by date
  const eventsByDate = events.reduce(
    (acc, event) => {
      const eventDate = new Date(event.date)
      if (eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear) {
        const day = eventDate.getDate()
        if (!acc[day]) acc[day] = []
        acc[day].push(event)
      }
      return acc
    },
    {} as Record<number, Event[]>,
  )

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" disabled>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b">
            {dayNames.map((day) => (
              <div key={day} className="p-3 text-center font-medium text-muted-foreground border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b last:border-r-0 ${
                  day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
                    ? "bg-primary/5"
                    : ""
                }`}
              >
                {day && (
                  <>
                    <div
                      className={`text-sm font-medium mb-1 ${
                        day === today.getDate() &&
                        currentMonth === today.getMonth() &&
                        currentYear === today.getFullYear()
                          ? "text-primary"
                          : ""
                      }`}
                    >
                      {day}
                    </div>
                    {eventsByDate[day] && (
                      <div className="space-y-1">
                        {eventsByDate[day].slice(0, 2).map((event, eventIndex) => (
                          <div
                            key={eventIndex}
                            className="text-xs p-1 rounded bg-primary/10 text-primary border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors"
                            onClick={() => onEventClick(event)}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              {getEventTypeIcon(event.type)}
                              <span className="font-medium truncate">{event.name}</span>
                            </div>
                            {event.startTime && (
                              <div className="text-xs text-muted-foreground">{formatTime(event.startTime)}</div>
                            )}
                          </div>
                        ))}
                        {eventsByDate[day].length > 2 && (
                          <div
                            className="text-xs text-muted-foreground cursor-pointer hover:text-primary"
                            onClick={() => onEventClick(eventsByDate[day][2])}
                          >
                            +{eventsByDate[day].length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function EventsLoading() {
  return (
    <div className="space-y-6">
      <Card className="animate-pulse">
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="p-3 border-r last:border-r-0">
                <div className="h-4 bg-muted rounded"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="min-h-[120px] p-2 border-r border-b last:border-r-0">
                <div className="h-4 bg-muted rounded w-6 mb-2"></div>
                <div className="space-y-1">
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function EventsCalendar({ events }: { events: Event[] }) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedEvent(null)
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Events Scheduled</h3>
          <p className="text-muted-foreground text-center">
            Check back soon for upcoming events at Stubborn Goat Brewing!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="hidden md:block">
        <CalendarView events={events} onEventClick={handleEventClick} />
      </div>
      <div className="md:hidden">
        <ListView events={events} onEventClick={handleEventClick} />
      </div>

      <EventDialog event={selectedEvent} isOpen={isDialogOpen} onClose={handleCloseDialog} />
    </>
  )
}

function EventsWrapper() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("[v0] EventsWrapper useEffect triggered")
    getEvents()
      .then((fetchedEvents) => {
        console.log("[v0] Events fetched:", fetchedEvents.length)
        setEvents(fetchedEvents)
        setLoading(false)
        setError(null)
      })
      .catch((err) => {
        console.error("[v0] Error in useEffect:", err)
        setError("Failed to load events")
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <EventsLoading />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Configuration Required</h3>
          <p className="text-muted-foreground text-center max-w-md">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return <EventsCalendar events={events} />
}

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Events at The Goat</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join us for live music, special tastings, community gatherings, and more. There's always something
              happening at Stubborn Goat Brewing!
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>122 Rosehill Ave, West Grove, PA</span>
            </div>
          </div>

          <Suspense fallback={<EventsLoading />}>
            <EventsWrapper />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
