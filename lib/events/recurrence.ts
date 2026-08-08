import type { CalendarEvent, EventArtist, OccurrenceType, RecurrenceFrequency } from "./types"

/**
 * Expands stored event rows into individual calendar occurrences.
 *
 * All date math is done with UTC getters on dates built from `Date.UTC`, so the
 * results are identical regardless of the server's timezone and immune to DST.
 */

export interface EventRow {
  id: string
  title: string
  description: string | null
  occurrence_type: OccurrenceType
  start_date: string
  end_date: string | null
  start_time: string | null
  end_time: string | null
  recurrence_frequency: RecurrenceFrequency | null
  recurrence_interval: number
  recurrence_days_of_week: number[] | null
  recurrence_day_of_month: number | null
  recurrence_week_of_month: number | null
  recurrence_end_date: string | null
  location: string | null
  image_url: string | null
  cta_label: string | null
  cta_url: string | null
  price_text: string | null
  is_featured: boolean
  is_cancelled: boolean
  event_types: {
    slug: string
    name: string
    color_hex: string
    text_color_hex: string
    icon: string | null
    detail_table: string | null
  } | null
  event_artists?: Array<{
    set_start_time: string | null
    set_end_time: string | null
    sort_order: number
    artists: {
      id: string
      slug: string
      name: string
      description: string | null
      hometown: string | null
      website_url: string | null
      image_url: string | null
      social_links: Record<string, string> | null
      facebook_url: string | null
      instagram_url: string | null
      tiktok_url: string | null
      youtube_url: string | null
      apple_music_url: string | null
      spotify_url: string | null
      soundcloud_url: string | null
      artist_genres?: Array<{ genres: { name: string } | null }>
    } | null
  }>
  event_occurrence_overrides?: Array<{
    occurrence_date: string
    is_cancelled: boolean
    override_title: string | null
    override_description: string | null
    override_start_time: string | null
    override_end_time: string | null
  }>
}

/** `YYYY-MM-DD` -> UTC Date */
function toDate(date: string): Date {
  const [y, m, d] = date.split("-").map(Number)
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1))
}

/** UTC Date -> `YYYY-MM-DD` */
function toKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date)
  next.setUTCDate(1)
  next.setUTCMonth(next.getUTCMonth() + months)
  return next
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}

/** Trims `HH:MM:SS` from Postgres down to `HH:MM`. */
function trimTime(time: string | null): string {
  return time ? time.slice(0, 5) : ""
}

/**
 * Resolves the nth weekday of a month, e.g. "the first Tuesday" or, when
 * `week` is -1, "the last Tuesday".
 */
function nthWeekdayOfMonth(year: number, month: number, weekday: number, week: number): Date | null {
  if (week === -1) {
    const lastDay = new Date(Date.UTC(year, month + 1, 0))
    const diff = (lastDay.getUTCDay() - weekday + 7) % 7
    return addDays(lastDay, -diff)
  }

  const firstDay = new Date(Date.UTC(year, month, 1))
  const diff = (weekday - firstDay.getUTCDay() + 7) % 7
  const result = addDays(firstDay, diff + (week - 1) * 7)

  // Guard against e.g. asking for a 5th Friday in a month that has only four.
  return result.getUTCMonth() === month ? result : null
}

/** Computes the calendar dates a single event row lands on within a window. */
function occurrenceDates(event: EventRow, rangeStart: Date, rangeEnd: Date): Date[] {
  const start = toDate(event.start_date)
  const dates: Date[] = []

  if (event.occurrence_type === "point_in_time" || event.occurrence_type === "all_day") {
    if (start >= rangeStart && start <= rangeEnd) dates.push(start)
    return dates
  }

  if (event.occurrence_type === "multi_day") {
    // Emit every day in the span so the event appears on each calendar cell.
    const spanEnd = event.end_date ? toDate(event.end_date) : start
    let cursor = start > rangeStart ? start : rangeStart
    const stop = spanEnd < rangeEnd ? spanEnd : rangeEnd
    while (cursor <= stop) {
      dates.push(cursor)
      cursor = addDays(cursor, 1)
    }
    return dates
  }

  // ---- recurring ----
  const interval = Math.max(1, event.recurrence_interval || 1)
  const patternEnd = event.recurrence_end_date ? toDate(event.recurrence_end_date) : null
  const hardStop = patternEnd && patternEnd < rangeEnd ? patternEnd : rangeEnd
  if (start > hardStop) return dates

  switch (event.recurrence_frequency) {
    case "daily": {
      // Jump straight to the first occurrence at or after the window start.
      let cursor = start
      if (cursor < rangeStart) {
        const skipped = Math.ceil(daysBetween(cursor, rangeStart) / interval)
        cursor = addDays(cursor, skipped * interval)
      }
      while (cursor <= hardStop) {
        dates.push(cursor)
        cursor = addDays(cursor, interval)
      }
      break
    }

    case "weekly": {
      const weekdays = event.recurrence_days_of_week ?? []
      if (weekdays.length === 0) break

      // Align to the Sunday of the pattern's first week, then step by interval.
      const firstWeekStart = addDays(start, -start.getUTCDay())
      let weekStart = firstWeekStart
      if (weekStart < rangeStart) {
        const weeksElapsed = Math.floor(daysBetween(firstWeekStart, rangeStart) / 7)
        const alignedWeeks = Math.floor(weeksElapsed / interval) * interval
        weekStart = addDays(firstWeekStart, alignedWeeks * 7)
      }

      while (weekStart <= hardStop) {
        for (const weekday of weekdays) {
          const candidate = addDays(weekStart, weekday)
          if (candidate >= start && candidate >= rangeStart && candidate <= hardStop) {
            dates.push(candidate)
          }
        }
        weekStart = addDays(weekStart, interval * 7)
      }
      break
    }

    case "monthly": {
      let monthCursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1))
      const monthsToRange =
        (rangeStart.getUTCFullYear() - start.getUTCFullYear()) * 12 +
        (rangeStart.getUTCMonth() - start.getUTCMonth())
      if (monthsToRange > 0) {
        const aligned = Math.floor(monthsToRange / interval) * interval
        monthCursor = addMonths(monthCursor, aligned)
      }

      while (monthCursor <= hardStop) {
        const year = monthCursor.getUTCFullYear()
        const month = monthCursor.getUTCMonth()
        let candidate: Date | null = null

        if (event.recurrence_week_of_month != null && event.recurrence_days_of_week?.length) {
          candidate = nthWeekdayOfMonth(year, month, event.recurrence_days_of_week[0], event.recurrence_week_of_month)
        } else {
          const dayOfMonth = event.recurrence_day_of_month ?? start.getUTCDate()
          const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
          // Skip months that are too short rather than rolling into the next one.
          if (dayOfMonth <= daysInMonth) candidate = new Date(Date.UTC(year, month, dayOfMonth))
        }

        if (candidate && candidate >= start && candidate >= rangeStart && candidate <= hardStop) {
          dates.push(candidate)
        }
        monthCursor = addMonths(monthCursor, interval)
      }
      break
    }

    case "yearly": {
      let year = start.getUTCFullYear()
      if (rangeStart.getUTCFullYear() > year) {
        const aligned = Math.floor((rangeStart.getUTCFullYear() - year) / interval) * interval
        year += aligned
      }
      while (year <= hardStop.getUTCFullYear()) {
        const candidate = new Date(Date.UTC(year, start.getUTCMonth(), start.getUTCDate()))
        if (candidate >= start && candidate >= rangeStart && candidate <= hardStop) {
          dates.push(candidate)
        }
        year += interval
      }
      break
    }
  }

  return dates
}

function mapArtists(event: EventRow): EventArtist[] {
  if (event.event_types?.detail_table !== "artists") return []

  return (event.event_artists ?? [])
    .filter((link) => link.artists)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((link) => {
      const artist = link.artists!
      return {
        id: artist.id,
        slug: artist.slug,
        name: artist.name,
        description: artist.description,
        hometown: artist.hometown,
        websiteUrl: artist.website_url,
        imageUrl: artist.image_url,
        socialLinks: {
          ...(artist.social_links ?? {}),
          // Dedicated columns take precedence over any legacy jsonb entries.
          ...(artist.facebook_url ? { Facebook: artist.facebook_url } : {}),
          ...(artist.instagram_url ? { Instagram: artist.instagram_url } : {}),
          ...(artist.tiktok_url ? { TikTok: artist.tiktok_url } : {}),
          ...(artist.youtube_url ? { YouTube: artist.youtube_url } : {}),
          ...(artist.apple_music_url ? { "Apple Music": artist.apple_music_url } : {}),
          ...(artist.spotify_url ? { Spotify: artist.spotify_url } : {}),
          ...(artist.soundcloud_url ? { SoundCloud: artist.soundcloud_url } : {}),
        },
        genres: (artist.artist_genres ?? []).map((g) => g.genres?.name).filter((n): n is string => Boolean(n)),
        setStartTime: trimTime(link.set_start_time),
        setEndTime: trimTime(link.set_end_time),
      }
    })
}

/**
 * Expands every event row into calendar occurrences between two `YYYY-MM-DD`
 * dates, applying per-occurrence overrides and sorting by date then start time.
 */
export function expandEvents(events: EventRow[], rangeStartKey: string, rangeEndKey: string): CalendarEvent[] {
  const rangeStart = toDate(rangeStartKey)
  const rangeEnd = toDate(rangeEndKey)
  const results: CalendarEvent[] = []

  for (const event of events) {
    const type = event.event_types
    const artists = mapArtists(event)

    const overrides = new Map(
      (event.event_occurrence_overrides ?? []).map((o) => [o.occurrence_date, o] as const),
    )

    for (const date of occurrenceDates(event, rangeStart, rangeEnd)) {
      const key = toKey(date)
      const override = overrides.get(key)

      // A cancelled single occurrence is removed from the calendar entirely.
      if (override?.is_cancelled) continue

      const startTime = trimTime(override?.override_start_time ?? event.start_time)
      const endTime = trimTime(override?.override_end_time ?? event.end_time)

      results.push({
        id: event.id,
        occurrenceId: `${event.id}:${key}`,
        name: override?.override_title ?? event.title,
        date: key,
        startTime,
        endTime,
        description: override?.override_description ?? event.description ?? "",
        type: type?.name ?? "General",
        typeSlug: type?.slug ?? "general",
        color: type?.color_hex ?? "#57534E",
        textColor: type?.text_color_hex ?? "#FFFFFF",
        icon: type?.icon ?? null,
        occurrenceType: event.occurrence_type,
        isAllDay: !startTime,
        isRecurring: event.occurrence_type === "recurring",
        spanStartDate: event.occurrence_type === "multi_day" ? event.start_date : null,
        spanEndDate: event.occurrence_type === "multi_day" ? event.end_date : null,
        location: event.location,
        imageUrl: event.image_url,
        ctaLabel: event.cta_label,
        ctaUrl: event.cta_url,
        priceText: event.price_text,
        isFeatured: event.is_featured,
        isCancelled: event.is_cancelled,
        artists,
      })
    }
  }

  results.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1
    // All-day events sort above timed events on the same day.
    if (!a.startTime) return b.startTime ? -1 : 0
    if (!b.startTime) return 1
    return a.startTime.localeCompare(b.startTime)
  })

  return results
}
