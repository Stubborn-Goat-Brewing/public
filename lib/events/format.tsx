import type { LucideIcon } from "lucide-react"
import {
  Beer,
  Calendar,
  DollarSign,
  Grid3X3,
  Hammer,
  Heart,
  HelpCircle,
  Lock,
  Mic,
  Mic2,
  Music,
  Star,
  Tag,
  Trophy,
  Users,
  Utensils,
  UtensilsCrossed,
  Wine,
  XCircle,
} from "lucide-react"

/**
 * Maps the `icon` column on `event_types` to a lucide component so event type
 * icons are driven by the database rather than hardcoded per component.
 */
const ICONS: Record<string, LucideIcon> = {
  Beer,
  Calendar,
  DollarSign,
  Grid3X3,
  Hammer,
  Heart,
  HelpCircle,
  Lock,
  Mic,
  Mic2,
  Music,
  Star,
  Tag,
  Trophy,
  Users,
  Utensils,
  UtensilsCrossed,
  Wine,
  XCircle,
}

export function getEventIcon(icon: string | null | undefined): LucideIcon {
  return (icon && ICONS[icon]) || Star
}

/** Parses a `YYYY-MM-DD` key into a LOCAL date (avoids UTC off-by-one bugs). */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/** `YYYY-MM-DD` for a local Date. */
export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/** `HH:MM` (24h) -> `H:MM AM/PM`. Also tolerates legacy ISO datetime strings. */
export function formatTime(time: string | null | undefined): string {
  if (!time) return ""

  let hours: number
  let minutes: string

  if (time.includes("T")) {
    const parsed = new Date(time)
    if (Number.isNaN(parsed.getTime())) return ""
    hours = parsed.getUTCHours()
    minutes = String(parsed.getUTCMinutes()).padStart(2, "0")
  } else {
    const match = time.match(/^(\d{1,2}):(\d{2})/)
    if (!match) return time
    hours = Number.parseInt(match[1], 10)
    minutes = match[2]
  }

  const period = hours >= 12 ? "PM" : "AM"
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes} ${period}`
}

/** Renders "6:00 PM - 8:00 PM", a single time, or "All Day". */
export function formatTimeRange(startTime: string | null | undefined, endTime: string | null | undefined): string {
  const start = formatTime(startTime)
  const end = formatTime(endTime)
  if (start && end) return `${start} - ${end}`
  return start || end || "All Day"
}

/** `YYYY-MM-DD` -> "Tuesday, August 4, 2026" */
export function formatDateLong(key: string): string {
  if (!key) return ""
  return parseDateKey(key).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/** Sorts occurrences by date, then all-day first, then start time. */
export function compareOccurrences(
  a: { date: string; startTime: string },
  b: { date: string; startTime: string },
): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1
  if (!a.startTime) return b.startTime ? -1 : 0
  if (!b.startTime) return 1
  return a.startTime.localeCompare(b.startTime)
}

/** Converts a `#RRGGBB` type color into subtle background/border/text styles. */
export function typeColorStyles(color: string | null | undefined) {
  const base = color || "#57534E"
  return {
    backgroundColor: `${base}1A`,
    borderColor: `${base}59`,
    color: base,
  }
}
