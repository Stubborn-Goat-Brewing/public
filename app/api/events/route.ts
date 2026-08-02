import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { expandEvents, type EventRow } from "@/lib/events/recurrence"

export const dynamic = "force-dynamic"

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
      artist_genres ( genres ( name ) )
    )
  ),
  event_occurrence_overrides (
    occurrence_date,
    is_cancelled,
    override_title,
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const today = new Date()
    const fromParam = searchParams.get("from")
    const toParam = searchParams.get("to")

    const from = isDateKey(fromParam)
      ? fromParam
      : toKey(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - DEFAULT_MONTHS_BACK, 1)))

    const to = isDateKey(toParam)
      ? toParam
      : toKey(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + DEFAULT_MONTHS_FORWARD + 1, 0)))

    const supabase = createClient()

    // Only fetch rows that could possibly land inside the window. Recurring
    // events are open-ended, so they are always candidates.
    const { data, error } = await supabase
      .from("events")
      .select(EVENT_SELECT)
      .lte("start_date", to)
      .or(`occurrence_type.eq.recurring,end_date.gte.${from},start_date.gte.${from}`)
      .order("start_date", { ascending: true })

    if (error) {
      console.error("[v0] Supabase error fetching events:", error.message)
      return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
    }

    const events = expandEvents((data ?? []) as unknown as EventRow[], from, to)

    const { data: eventTypes, error: typesError } = await supabase
      .from("event_types")
      .select("id, slug, name, description, color_hex, text_color_hex, icon, detail_table")
      .order("sort_order", { ascending: true })

    if (typesError) {
      console.error("[v0] Supabase error fetching event types:", typesError.message)
    }

    return NextResponse.json(
      {
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
        })),
        range: { from, to },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
          "CDN-Cache-Control": "no-store",
          "Vercel-CDN-Cache-Control": "no-store",
        },
      },
    )
  } catch (error) {
    console.error("[v0] Error fetching events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
