/**
 * Shared event types for the calendar.
 *
 * `CalendarEvent` is the shape returned by /api/events. It is one *occurrence*
 * of an event: a recurring event like "Dollar Wings every Tuesday" is expanded
 * into one CalendarEvent per Tuesday in the requested window.
 */

export type OccurrenceType = "point_in_time" | "all_day" | "multi_day" | "recurring"

export type RecurrenceFrequency = "daily" | "weekly" | "monthly" | "yearly"

export interface EventArtist {
  id: string
  slug: string
  name: string
  description: string | null
  hometown: string | null
  websiteUrl: string | null
  imageUrl: string | null
  socialLinks: Record<string, string>
  genres: string[]
  setStartTime: string | null
  setEndTime: string | null
}

export interface CalendarEvent {
  /** Stable id of the parent event row. Not unique across occurrences. */
  id: string
  /** Unique per occurrence: `${id}:${date}`. Safe to use as a React key. */
  occurrenceId: string

  name: string
  /** Calendar day of this occurrence, as `YYYY-MM-DD`. */
  date: string
  /** `HH:MM` in local taproom time, or "" for all-day events. */
  startTime: string
  endTime: string
  description: string

  /** Display name of the event type, e.g. "Live Music". */
  type: string
  typeSlug: string
  /** Unique display color for the event type, e.g. "#C2410C". */
  color: string
  textColor: string
  /** lucide-react icon name for the event type. */
  icon: string | null

  occurrenceType: OccurrenceType
  isAllDay: boolean
  /** True when this occurrence came from a recurring event. */
  isRecurring: boolean

  /** For multi-day events: the first and last day of the span. */
  spanStartDate: string | null
  spanEndDate: string | null

  location: string | null
  imageUrl: string | null
  ctaLabel: string | null
  ctaUrl: string | null
  priceText: string | null
  isFeatured: boolean
  isCancelled: boolean

  /** Populated for event types whose detail table is `artists`. */
  artists: EventArtist[]
}

export interface EventType {
  id: number
  slug: string
  name: string
  description: string | null
  color: string
  textColor: string
  icon: string | null
  detailTable: string | null
}

/**
 * Parses a `YYYY-MM-DD` calendar date into a Date at local midnight.
 *
 * `new Date("2025-09-17")` is parsed as UTC midnight, which becomes Sept 16 in
 * any timezone behind UTC and shifts the whole calendar grid by a day. Building
 * the Date from explicit parts keeps the calendar day intact everywhere.
 */
export function parseEventDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

/** Formats an `HH:MM` time as a friendly 12-hour string, e.g. "6:00 PM". */
export function formatEventTime(time: string): string {
  if (!time) return ""

  const match = time.match(/^(\d{1,2}):(\d{2})/)
  if (!match) return time

  const hours = Number(match[1])
  const minutes = match[2]
  const period = hours >= 12 ? "PM" : "AM"
  const displayHours = hours % 12 || 12

  return `${displayHours}:${minutes} ${period}`
}

/** Formats a time range, e.g. "6:00 PM - 8:00 PM". */
export function formatEventTimeRange(startTime: string, endTime: string): string {
  const start = formatEventTime(startTime)
  const end = formatEventTime(endTime)

  if (start && end) return `${start} - ${end}`
  return start || end || ""
}
