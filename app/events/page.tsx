"use client"

import { Suspense, useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, X } from "lucide-react"
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
  const [viewingMonth, setViewingMonth] = useState(today.getMonth())
  const [viewingYear, setViewingYear] = useState(today.getFullYear())

  const goToPreviousMonth = () => {
    if (viewingMonth === 0) {
      setViewingMonth(11)
      setViewingYear(viewingYear - 1)
    } else {
      setViewingMonth(viewingMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (viewingMonth === 11) {
      setViewingMonth(0)
      setViewingYear(viewingYear + 1)
    } else {
      setViewingMonth(viewingMonth + 1)
    }
  }

  const firstDayOfMonth = new Date(viewingYear, viewingMonth, 1)
  const lastDayOfMonth = new Date(viewingYear, viewingMonth + 1, 0)
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
      if (eventDate.getMonth() === viewingMonth && eventDate.getFullYear() === viewingYear) {
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
          {monthNames[viewingMonth]} {viewingYear}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
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
                  day === today.getDate() && viewingMonth === today.getMonth() && viewingYear === today.getFullYear()
                    ? "bg-primary/5"
                    : ""
                }`}
              >
                {day && (
                  <>
                    <div
                      className={`text-sm font-medium mb-1 ${
                        day === today.getDate() &&
                        viewingMonth === today.getMonth() &&
                        viewingYear === today.getFullYear()
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

function CompactCalendarView({ events, onEventClick }: { events: Event[]; onEventClick: (event: Event) => void }) {
  const today = new Date()
  const [viewingMonth, setViewingMonth] = useState(today.getMonth())
  const [viewingYear, setViewingYear] = useState(today.getFullYear())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const goToPreviousMonth = () => {
    setSelectedDay(null)
    if (viewingMonth === 0) {
      setViewingMonth(11)
      setViewingYear(viewingYear - 1)
    } else {
      setViewingMonth(viewingMonth - 1)
    }
  }

  const goToNextMonth = () => {
    setSelectedDay(null)
    if (viewingMonth === 11) {
      setViewingMonth(0)
      setViewingYear(viewingYear + 1)
    } else {
      setViewingMonth(viewingMonth + 1)
    }
  }

  const firstDayOfMonth = new Date(viewingYear, viewingMonth, 1)
  const lastDayOfMonth = new Date(viewingYear, viewingMonth + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const calendarDays = []
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  const eventsByDate = events.reduce(
    (acc, event) => {
      const eventDate = new Date(event.date)
      if (eventDate.getMonth() === viewingMonth && eventDate.getFullYear() === viewingYear) {
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

  const dayNames = ["S", "M", "T", "W", "T", "F", "S"]

  const filteredEvents = selectedDay
    ? events.filter((event) => {
        const eventDate = new Date(event.date)
        return (
          eventDate.getMonth() === viewingMonth &&
          eventDate.getFullYear() === viewingYear &&
          eventDate.getDate() === selectedDay
        )
      })
    : events.filter((event) => {
        const eventDate = new Date(event.date)
        return eventDate.getMonth() === viewingMonth && eventDate.getFullYear() === viewingYear
      })

  return (
    <div className="space-y-4">
      {/* Compact Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {monthNames[viewingMonth]} {viewingYear}
        </h2>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Compact Calendar Grid */}
      <Card>
        <CardContent className="p-2">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`aspect-square p-1 text-center relative cursor-pointer hover:bg-muted/50 rounded-md transition-colors ${
                  day === today.getDate() && viewingMonth === today.getMonth() && viewingYear === today.getFullYear()
                    ? "bg-primary/10"
                    : ""
                } ${selectedDay === day ? "ring-2 ring-primary bg-primary/5" : ""}`}
                onClick={() => day && setSelectedDay(selectedDay === day ? null : day)}
              >
                {day && (
                  <>
                    <div
                      className={`text-sm font-medium ${
                        day === today.getDate() &&
                        viewingMonth === today.getMonth() &&
                        viewingYear === today.getFullYear()
                          ? "text-primary"
                          : ""
                      }`}
                    >
                      {day}
                    </div>
                    {eventsByDate[day] && (
                      <div className="absolute bottom-0 left-0 right-0 px-0.5">
                        <div className="text-xs bg-primary/20 text-primary rounded px-1 py-0.5 truncate border border-primary/30">
                          {eventsByDate[day][0].name}
                        </div>
                        {eventsByDate[day].length > 1 && (
                          <div className="text-xs text-muted-foreground text-center mt-0.5">
                            +{eventsByDate[day].length - 1}
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

      {selectedDay && (
        <div className="flex items-center justify-between bg-primary/5 rounded-lg p-3 border border-primary/20">
          <div className="text-sm font-medium">
            Showing events for {monthNames[viewingMonth]} {selectedDay}, {viewingYear}
          </div>
          <Button variant="outline" size="sm" onClick={() => setSelectedDay(null)}>
            Show All Events
          </Button>
        </div>
      )}

      {/* Events list for selected month/day */}
      <div className="space-y-3">
        {filteredEvents
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map((event, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onEventClick(event)}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  {/* Date highlight */}
                  <div className="flex-shrink-0 text-center">
                    <div className="bg-primary/10 text-primary rounded-lg p-2 border border-primary/20">
                      <div className="text-xs font-medium">
                        {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                      </div>
                      <div className="text-lg font-bold">{new Date(event.date).getDate()}</div>
                      <div className="text-xs">
                        {new Date(event.date).toLocaleDateString("en-US", { weekday: "short" })}
                      </div>
                    </div>
                  </div>

                  {/* Event details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-base leading-tight">{event.name}</h3>
                      <div className="flex-shrink-0 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">
                        {getEventTypeLabel(event.type)}
                      </div>
                    </div>

                    {event.startTime && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <Clock className="h-3 w-3" />
                        {formatTime(event.startTime)}
                        {event.endTime && ` - ${formatTime(event.endTime)}`}
                      </div>
                    )}

                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

        {selectedDay && filteredEvents.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No events scheduled for this day</p>
          </div>
        )}
      </div>
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
      <div className="hidden lg:block">
        <CalendarView events={events} onEventClick={handleEventClick} />
      </div>
      <div className="lg:hidden">
        <CompactCalendarView events={events} onEventClick={handleEventClick} />
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
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
            <Link href="/#get-connected" className="text-sm font-medium hover:underline underline-offset-4">
              Get Connected
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
                href="/#get-connected"
                className="text-sm font-medium hover:underline underline-offset-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get Connected
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
