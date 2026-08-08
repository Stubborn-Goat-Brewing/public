import "server-only"
import { createClient } from "@/lib/supabase/server"
import { expandEvents, type EventRow } from "@/lib/events/recurrence"
import type { CalendarEvent, EventType } from "@/lib/events/types"

/** How far back and forward we expand occurrences when no range is given. */
const DEFAULT_MONTHS_BACK = 3
const DEFAULT_MONTHS_FORWARD = 12

const EVENT_SELECT = `
  id,
  title,
  description,
  occurrence_type,
  start_date,
  end_date,
  start_time,
  end_time,
  recurrence_frequency,
  recurrence_interval,
  recurrence_days_of_week,
  recurrence_day_of_month,
  recurrence_week_of_month,
  recurrence_end_date,
  location,
  image_url,
  cta_label,
  cta_url,
  price_text,
  is_featured,
  is_cancelled,
  event_types (
    slug,
    name,
    color_hex,
    text_color_hex,
    icon,
    detail_table
  ),
  event_artists (
    set_start_time,
    set_end_time,
    sort_order,
    artists (
      id,
      slug,
      name,
      description,
      hometown,
      website_url,
      image_url,
      social_links,
      facebook_url,
      instagram_url,
      tiktok_url,
      youtube_url,
      apple_music_url,
      spotify_url,
      soundcloud_url,
      artist_genres ( genres ( name ) )
    )
  ),
  event_occurrence_overrides (
    occurrence_date,
    is_cancelled,
    override_title,
    override_description,
    override_start_time,
    override_end_time
  )
`

function toKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function isDateKey(value: string | null): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export interface CalendarData {
  events: CalendarEvent[]
  eventTypes: EventType[]
  range: { from: string; to: string }
}

/** Resolves a from/to window, falling back to the default look-back/look-ahead. */
export function resolveRange(fromParam?: string | null, toParam?: string | null) {
  const today = new Date()

  const from = isDateKey(fromParam ?? null)
    ? (fromParam as string)
    : toKey(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - DEFAULT_MONTHS_BACK, 1)))

  const to = isDateKey(toParam ?? null)
    ? (toParam as string)
    : toKey(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + DEFAULT_MONTHS_FORWARD + 1, 0)))

  return { from, to }
}

/**
 * Fetches events from Supabase and expands recurring rows into occurrences.
 * Shared by the /api/events route and the server-rendered events page (for
 * structured data), so both stay in sync.
 */
export async function fetchCalendarData(fromParam?: string | null, toParam?: string | null): Promise<CalendarData> {
  const { from, to } = resolveRange(fromParam, toParam)
  const supabase = createClient()

  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .lte("start_date", to)
    .or(`occurrence_type.eq.recurring,end_date.gte.${from},start_date.gte.${from}`)
    .order("start_date", { ascending: true })

  if (error) {
    console.error("[v0] Supabase error fetching events:", error.message)
    throw new Error("Failed to fetch events")
  }

  const events = expandEvents((data ?? []) as unknown as EventRow[], from, to)

  const { data: eventTypes, error: typesError } = await supabase
    .from("event_types")
    .select("id, slug, name, description, color_hex, text_color_hex, icon, detail_table")
    .order("sort_order", { ascending: true })

  if (typesError) {
    console.error("[v0] Supabase error fetching event types:", typesError.message)
  }

  return {
    events,
    eventTypes: (eventTypes ?? []).map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      description: t.description,
      color: t.color_hex,
      textColor: t.text_color_hex,
      icon: t.icon,
      detailTable: t.detail_table,
    })) as EventType[],
    range: { from, to },
  }
}

/**
 * Fetches a single event row and expands it to the one occurrence on `date`.
 *
 * Used by the standalone event detail page (`/events/[id]/[date]`) and its
 * dynamic share image. Returns null when the id is unknown or no occurrence of
 * that event falls on the requested date (e.g. a bad or tampered share URL).
 */
export async function fetchEventOccurrence(id: string, date: string): Promise<CalendarEvent | null> {
  if (!isDateKey(date)) return null

  const supabase = createClient()

  const { data, error } = await supabase.from("events").select(EVENT_SELECT).eq("id", id).limit(1)

  if (error) {
    console.error("[v0] Supabase error fetching event:", error.message)
    return null
  }
  if (!data || data.length === 0) return null

  // Expand a generous window around the target date so recurring and multi-day
  // occurrences are produced, then match the exact occurrence by its id:date key.
  const [y, m] = date.split("-").map(Number)
  const from = toKey(new Date(Date.UTC(y, (m ?? 1) - 2, 1)))
  const to = toKey(new Date(Date.UTC(y, (m ?? 1) + 1, 0)))

  const occurrences = expandEvents(data as unknown as EventRow[], from, to)
  return occurrences.find((occurrence) => occurrence.occurrenceId === `${id}:${date}`) ?? null
}
