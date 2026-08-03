"use client"

import { Suspense, useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Clock,
  Utensils,
  Beer,
  Mail,
  X,
  Menu,
  Repeat,
  CalendarRange,
  Ban,
  Loader2,
  Share2,
  Check,
  ExternalLink,
  Link2,
  Facebook,
  Instagram,
} from "lucide-react"
import type { CalendarEvent as Event } from "@/lib/events/types"
import {
  compareOccurrences,
  eventPath,
  formatDateLong,
  formatTime,
  formatTimeRange,
  getEventIcon,
  parseDateKey,
  toDateKey,
  typeColorStyles,
} from "@/lib/events/format"
import { SocialLinks } from "@/components/events/social-links"

/** Renders the event type icon in its type color, driven by the database. */
function EventTypeIcon({ event, className = "h-4 w-4" }: { event: Event; className?: string }) {
  const Icon = getEventIcon(event.icon)
  return <Icon className={className} style={{ color: event.color }} />
}

/** Small colored pill showing the event type name. */
function EventTypeBadge({ event }: { event: Event }) {
  return (
    <div
      className="flex-shrink-0 px-2 py-1 text-xs rounded-full border font-medium"
      style={typeColorStyles(event.color)}
    >
      {event.type}
    </div>
  )
}

async function getEvents(from: string, to: string): Promise<Event[]> {
  try {
    const params = new URLSearchParams({ from, to, t: String(Date.now()) })
    const response = await fetch(`/api/events?${params.toString()}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })

    if (!response.ok) {
      console.log("[v0] Failed to fetch events from API")
      return []
    }

    const data = await response.json()
    return data.events || []
  } catch (error) {
    console.error("[v0] Error fetching events:", error)
    return []
  }
}

/**
 * The window we request for a given viewing month: a one-month buffer on each
 * side so multi-day spans crossing boundaries and quick prev/next navigation
 * are already loaded. Uses UTC so the `YYYY-MM-DD` keys are timezone-stable.
 */
function monthRange(year: number, month: number): { from: string; to: string } {
  const from = new Date(Date.UTC(year, month - 1, 1)).toISOString().slice(0, 10)
  const to = new Date(Date.UTC(year, month + 2, 0)).toISOString().slice(0, 10)
  return { from, to }
}

/** Merges freshly fetched occurrences into the accumulated set, deduped by id. */
function mergeEvents(prev: Event[], next: Event[]): Event[] {
  const byId = new Map<string, Event>()
  for (const event of prev) byId.set(event.occurrenceId, event)
  for (const event of next) byId.set(event.occurrenceId, event)
  return Array.from(byId.values())
}

/** Describes a multi-day span, e.g. "Sep 7 - Sep 13". */
function formatSpan(event: Event): string | null {
  if (!event.spanStartDate || !event.spanEndDate) return null
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
  const start = parseDateKey(event.spanStartDate).toLocaleDateString("en-US", opts)
  const end = parseDateKey(event.spanEndDate).toLocaleDateString("en-US", opts)
  return `${start} - ${end}`
}

/**
 * Copies text to the clipboard, with a fallback for browsers/iframes where the
 * async Clipboard API is unavailable or blocked (common in embedded previews).
 * Returns whether the copy succeeded so the UI can always show feedback.
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Fall through to the execCommand fallback below.
  }

  try {
    const textarea = document.createElement("textarea")
    textarea.value = text
    textarea.setAttribute("readonly", "")
    textarea.style.position = "fixed"
    textarea.style.opacity = "0"
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand("copy")
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}

/**
 * Share controls for an event, rendered inline (always visible) inside the
 * event dialog. Inline buttons are used instead of a dropdown because a Radix
 * dropdown nested in the modal Dialog conflicts with the Dialog's
 * pointer-events lock and often fails to open. This approach works everywhere,
 * including desktop browsers with no Web Share support.
 */
function ShareEvent({ event }: { event: Event }) {
  const [copied, setCopied] = useState(false)
  const path = eventPath(event.id, event.date)
  const [shareUrl, setShareUrl] = useState(path)
  const urlInputRef = useRef<HTMLInputElement>(null)
  // Native share is only available on mobile browsers; Instagram sharing only
  // works through that sheet, so the Instagram button is gated on this flag.
  // Detected after mount to avoid a hydration mismatch.
  const [canNativeShare, setCanNativeShare] = useState(false)

  // Build the absolute URL on the client where window is available.
  useEffect(() => {
    setShareUrl(new URL(path, window.location.origin).toString())
  }, [path])

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function")
  }, [])

  const shareText = `${event.name} at Stubborn Goat Brewing`
  const caption = `${shareText}\n${shareUrl}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
  const emailUrl = `mailto:?subject=${encodeURIComponent(event.name)}&body=${encodeURIComponent(caption)}`

  async function handleCopy() {
    // Always select the visible field so a manual copy works even when the
    // programmatic clipboard write is blocked (e.g. inside embedded previews).
    urlInputRef.current?.select()
    const ok = await copyToClipboard(shareUrl)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Instagram offers no web share URL that accepts a link. The only way to pass
  // event info to Instagram is the mobile native share sheet, so this handler
  // (and its button) is only used when native share is available.
  async function handleInstagram() {
    try {
      await navigator.share({ title: event.name, text: shareText, url: shareUrl })
    } catch {
      // User dismissed the sheet - nothing to do.
    }
  }

  return (
    <div className="space-y-2 pt-3 border-t">
      <div className="flex items-center gap-2">
        <Share2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Share this event</span>
      </div>

      {/* Selectable URL + copy button: manual copy always works as a fallback. */}
      <div className="flex items-center gap-2">
        <input
          ref={urlInputRef}
          type="text"
          readOnly
          value={shareUrl}
          onFocus={(e) => e.currentTarget.select()}
          aria-label="Event link"
          className="flex-1 min-w-0 rounded-md border bg-muted/50 px-2 py-1.5 text-sm text-muted-foreground"
        />
        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 flex-shrink-0">
          {copied ? <Check className="h-4 w-4 text-primary" /> : <Link2 className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="icon" asChild aria-label="Share on Facebook">
          <a href={facebookUrl} target="_blank" rel="noopener noreferrer">
            <Facebook className="h-4 w-4" />
          </a>
        </Button>
        {canNativeShare && (
          <Button variant="outline" size="icon" onClick={handleInstagram} aria-label="Share to Instagram">
            <Instagram className="h-4 w-4" />
          </Button>
        )}
        <Button variant="outline" size="icon" asChild aria-label="Share via email">
          <a href={emailUrl}>
            <Mail className="h-4 w-4" />
          </a>
        </Button>
        <Button variant="ghost" size="sm" asChild className="gap-1.5">
          <Link href={path}>
            View event page
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

function EventDialog({ event, isOpen, onClose }: { event: Event | null; isOpen: boolean; onClose: () => void }) {
  if (!event) return null

  const span = formatSpan(event)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-left">
            <EventTypeIcon event={event} className="h-5 w-5 flex-shrink-0" />
            {event.name}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {`${event.type} on ${formatDateLong(event.date)}, ${formatTimeRange(event.startTime, event.endTime)}`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <EventTypeBadge event={event} />
            {event.isCancelled && (
              <div className="flex items-center gap-1 px-2 py-1 text-xs rounded-full border border-destructive/40 bg-destructive/10 text-destructive font-medium">
                <Ban className="h-3 w-3" />
                Cancelled
              </div>
            )}
            {event.isRecurring && (
              <div className="flex items-center gap-1 px-2 py-1 text-xs rounded-full border bg-muted text-muted-foreground">
                <Repeat className="h-3 w-3" />
                Recurring
              </div>
            )}
            {span && (
              <div className="flex items-center gap-1 px-2 py-1 text-xs rounded-full border bg-muted text-muted-foreground">
                <CalendarRange className="h-3 w-3" />
                {span}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            {formatDateLong(event.date)}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" />
            {formatTimeRange(event.startTime, event.endTime)}
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              {event.location}
            </div>
          )}

          {event.description && (
            <div
              className="text-sm text-muted-foreground leading-relaxed prose prose-sm prose-neutral dark:prose-invert max-w-none [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-primary/80"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          )}

          {event.artists.length > 0 && (
            <div className="space-y-3 pt-2 border-t">
              <h4 className="text-sm font-semibold">
                {event.artists.length > 1 ? "Performing Artists" : "About the Artist"}
              </h4>
              {event.artists.map((artist) => (
                <div key={artist.id} className="flex gap-3">
                  {artist.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={artist.imageUrl || "/placeholder.svg"}
                      alt={artist.name}
                      className="h-16 w-16 rounded-md object-cover flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{artist.name}</p>
                    {artist.hometown && <p className="text-xs text-muted-foreground">{artist.hometown}</p>}
                    {artist.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {artist.genres.map((genre) => (
                          <span key={genre} className="px-1.5 py-0.5 text-xs rounded bg-muted text-muted-foreground">
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}
                    {(artist.setStartTime || artist.setEndTime) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Set: {formatTimeRange(artist.setStartTime, artist.setEndTime)}
                      </p>
                    )}
                    {artist.description && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{artist.description}</p>
                    )}
                    <SocialLinks
                      variant="inline"
                      className="mt-1.5"
                      links={[
                        ...(artist.websiteUrl ? [{ label: "Website", url: artist.websiteUrl }] : []),
                        ...Object.entries(artist.socialLinks).map(([label, url]) => ({ label, url })),
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {event.ctaUrl && (
            <Button asChild className="w-full">
              <a href={event.ctaUrl} target="_blank" rel="noopener noreferrer">
                {event.ctaLabel || "Learn More"}
              </a>
            </Button>
          )}

          <ShareEvent event={event} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ListView({ events, onEventClick }: { events: Event[]; onEventClick: (event: Event) => void }) {
  const todayKey = toDateKey(new Date())
  const upcomingEvents = events.filter((event) => event.date >= todayKey)

  return (
    <div className="space-y-8">
      {upcomingEvents.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <Card
                key={event.occurrenceId}
                className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
                style={{ borderLeftColor: event.color }}
                onClick={() => onEventClick(event)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <EventTypeIcon event={event} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-lg leading-tight">{event.name}</h3>
                        <EventTypeBadge event={event} />
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateLong(event.date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeRange(event.startTime, event.endTime)}
                        </div>
                      </div>
                      {event.description && (
                        <div
                          className="text-sm text-muted-foreground line-clamp-2 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2"
                          dangerouslySetInnerHTML={{ __html: event.description }}
                        />
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

function CalendarView({
  events,
  onEventClick,
  viewingMonth,
  viewingYear,
  onPreviousMonth,
  onNextMonth,
  isFetching,
}: MonthNavProps) {
  const today = new Date()

  const firstDayOfMonth = new Date(viewingYear, viewingMonth, 1)
  const lastDayOfMonth = new Date(viewingYear, viewingMonth + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay() // 0 = Sunday
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
      const eventDate = parseDateKey(event.date)
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
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          {monthNames[viewingMonth]} {viewingYear}
          {isFetching && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-label="Loading events" />}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onPreviousMonth} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onNextMonth} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b">
            {dayNames.map((day) => (
              <div key={day} className="p-3 text-center font-medium text-muted-foreground border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const isToday =
                day !== null &&
                day === today.getDate() &&
                viewingMonth === today.getMonth() &&
                viewingYear === today.getFullYear()

              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border-r border-b last:border-r-0 ${
                    isToday ? "bg-primary/5 ring-2 ring-primary/20" : ""
                  }`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-1 ${isToday ? "text-primary font-bold" : ""}`}>{day}</div>
                      {eventsByDate[day] && (
                        <div className="space-y-1">
                          {eventsByDate[day].slice(0, 3).map((event) => (
                            <button
                              key={event.occurrenceId}
                              type="button"
                              className="w-full text-left text-xs p-1 rounded border cursor-pointer hover:brightness-95 transition-all"
                              style={typeColorStyles(event.color)}
                              onClick={() => onEventClick(event)}
                            >
                              <div className="flex items-center gap-1">
                                <EventTypeIcon event={event} className="h-3 w-3 flex-shrink-0" />
                                <span
                                  className={`font-medium truncate ${event.isCancelled ? "line-through opacity-70" : ""}`}
                                >
                                  {event.name}
                                </span>
                              </div>
                              <div className="text-[11px] opacity-80">
                                {event.startTime ? formatTime(event.startTime) : "All Day"}
                              </div>
                            </button>
                          ))}
                          {eventsByDate[day].length > 3 && (
                            <div
                              className="text-xs text-muted-foreground cursor-pointer hover:text-primary"
                              onClick={() => onEventClick(eventsByDate[day][3])}
                            >
                              +{eventsByDate[day].length - 3} more
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
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

interface MonthNavProps {
  events: Event[]
  onEventClick: (event: Event) => void
  viewingMonth: number
  viewingYear: number
  onPreviousMonth: () => void
  onNextMonth: () => void
  isFetching: boolean
}

function CompactCalendarView({
  events,
  onEventClick,
  viewingMonth,
  viewingYear,
  onPreviousMonth,
  onNextMonth,
  isFetching,
}: MonthNavProps) {
  const today = new Date()
  const [selectedDay, setSelectedDay] = useState<number | null>(() => {
    const isCurrentMonth = viewingMonth === today.getMonth() && viewingYear === today.getFullYear()
    return isCurrentMonth ? today.getDate() : null
  })

  // The month is controlled by the parent now; reset the selected day whenever
  // it changes, defaulting to today when the current month is in view.
  useEffect(() => {
    const isCurrentMonth = viewingMonth === today.getMonth() && viewingYear === today.getFullYear()
    setSelectedDay(isCurrentMonth ? today.getDate() : null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingMonth, viewingYear])

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
      const eventDate = parseDateKey(event.date)
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
        const eventDate = parseDateKey(event.date)
        return (
          eventDate.getMonth() === viewingMonth &&
          eventDate.getFullYear() === viewingYear &&
          eventDate.getDate() === selectedDay
        )
      })
    : events.filter((event) => {
        const eventDate = parseDateKey(event.date)
        return eventDate.getMonth() === viewingMonth && eventDate.getFullYear() === viewingYear
      })

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              {monthNames[viewingMonth]} {viewingYear}
              {isFetching && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label="Loading events" />
              )}
            </h2>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={onPreviousMonth} aria-label="Previous month">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onNextMonth} aria-label="Next month">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="grid grid-cols-7 mb-2">
            {dayNames.map((day, dayIndex) => (
              <div key={dayIndex} className="p-2 text-center text-xs font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const isToday =
                day !== null &&
                day === today.getDate() &&
                viewingMonth === today.getMonth() &&
                viewingYear === today.getFullYear()

              const hasEvents = day && eventsByDate[day] && eventsByDate[day].length > 0

              return (
                <div
                  key={index}
                  className={`aspect-square p-2 text-center relative cursor-pointer hover:bg-muted/50 rounded-md transition-colors ${
                    isToday ? "bg-primary/10 ring-2 ring-primary/30" : ""
                  } ${selectedDay === day ? "ring-2 ring-primary bg-primary/5" : ""}`}
                  onClick={() => day && setSelectedDay(selectedDay === day ? null : day)}
                >
                  {day && (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className={`text-sm font-medium ${isToday ? "text-primary font-bold" : ""}`}>{day}</div>
                      {hasEvents && (
                        <div className="mt-1 flex gap-0.5">
                          {eventsByDate[day].slice(0, 3).map((event) => (
                            <div
                              key={event.occurrenceId}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: event.color }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
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

      <div className="space-y-3">
        {[...filteredEvents].sort(compareOccurrences).map((event) => {
          const eventDate = parseDateKey(event.date)
          return (
            <Card
              key={event.occurrenceId}
              className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
              style={{ borderLeftColor: event.color }}
              onClick={() => onEventClick(event)}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 text-center">
                    <div className="rounded-lg p-2 border" style={typeColorStyles(event.color)}>
                      <div className="text-xs font-medium">
                        {eventDate.toLocaleDateString("en-US", { month: "short" })}
                      </div>
                      <div className="text-lg font-bold">{eventDate.getDate()}</div>
                      <div className="text-xs">{eventDate.toLocaleDateString("en-US", { weekday: "short" })}</div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-base leading-tight">{event.name}</h3>
                      <EventTypeBadge event={event} />
                    </div>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <Clock className="h-3 w-3" />
                      {formatTimeRange(event.startTime, event.endTime)}
                    </div>

                    {event.description && (
                      <div
                        className="text-sm text-muted-foreground line-clamp-2 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2"
                        dangerouslySetInnerHTML={{ __html: event.description }}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

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

interface EventsCalendarProps {
  events: Event[]
  viewingMonth: number
  viewingYear: number
  onPreviousMonth: () => void
  onNextMonth: () => void
  isFetching: boolean
}

function EventsCalendar({
  events,
  viewingMonth,
  viewingYear,
  onPreviousMonth,
  onNextMonth,
  isFetching,
}: EventsCalendarProps) {
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

  const navProps = {
    viewingMonth,
    viewingYear,
    onPreviousMonth,
    onNextMonth,
    isFetching,
    onEventClick: handleEventClick,
  }

  return (
    <>
      <div className="hidden lg:block">
        <CalendarView events={events} {...navProps} />
      </div>
      <div className="lg:hidden">
        <CompactCalendarView events={events} {...navProps} />
      </div>

      <EventDialog event={selectedEvent} isOpen={isDialogOpen} onClose={handleCloseDialog} />
    </>
  )
}

function EventsWrapper() {
  const today = new Date()
  const [viewingMonth, setViewingMonth] = useState(today.getMonth())
  const [viewingYear, setViewingYear] = useState(today.getFullYear())

  const [events, setEvents] = useState<Event[]>([])
  const [loadedRanges, setLoadedRanges] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  // Fetch the visible month (with buffer) whenever it changes, so recurring
  // occurrences far in the future - e.g. next year's Christmas closure - are
  // expanded and shown. Months already loaded are served from state.
  useEffect(() => {
    const rangeKey = `${viewingYear}-${viewingMonth}`
    if (loadedRanges.has(rangeKey)) return

    const { from, to } = monthRange(viewingYear, viewingMonth)
    let cancelled = false
    setIsFetching(true)

    getEvents(from, to)
      .then((fetched) => {
        if (cancelled) return
        setEvents((prev) => mergeEvents(prev, fetched))
        setLoadedRanges((prev) => new Set(prev).add(rangeKey))
        setError(null)
      })
      .catch((err) => {
        if (cancelled) return
        console.error("[v0] Error loading events:", err)
        // Only surface a blocking error if we have nothing to show yet.
        if (events.length === 0) setError("Failed to load events")
      })
      .finally(() => {
        if (cancelled) return
        setIsFetching(false)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [viewingMonth, viewingYear, loadedRanges, events.length])

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

  return (
    <EventsCalendar
      events={events}
      viewingMonth={viewingMonth}
      viewingYear={viewingYear}
      onPreviousMonth={goToPreviousMonth}
      onNextMonth={goToNextMonth}
      isFetching={isFetching}
    />
  )
}

export default function EventsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="sticky top-0 z-40">
        {/* <AnnouncementBanner
          message="Buy $50.00 or more in gift cards and get a bonus card for $5.00 off your next visit."
          linkText="Show me more"
          linkHref="https://order.toasttab.com/egiftcards/stubborn-goat-brewing-122-rosehill-ave"
          disclaimer="Offer available in-store or online through 12/23/25. Bonus cards are redeemable 12/26/25 through 3/31/26 and must be used in full on one check."
        /> */}

        <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
      </div>

      <div className="container py-12">
        <div className="max-w-6xl mx-auto">
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
                <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
                  <Button asChild size="lg" className="gap-2">
                    <a
                      href="https://www.toasttab.com/invoice/lead?rx=8be4c691-2b25-4588-8823-9e8f7cb3f600&ot=f579e56b-2f56-404a-9da3-9507554ce832"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Calendar className="h-4 w-4" />
                      Submit Event Inquiry
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="gap-2 bg-transparent">
                    <a href="mailto:events@stubborngoatbrewing.com">
                      <Mail className="h-4 w-4" />
                      Email Our Events Team
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

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
