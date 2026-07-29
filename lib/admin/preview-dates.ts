import { expandEvents, type EventRow } from "@/lib/events/recurrence"
import type { EventFormParsed } from "./event-schema"
import { toEventRow } from "./event-schema"

/**
 * Computes the next occurrences for an in-progress form.
 *
 * This deliberately runs the SAME `expandEvents` engine the public calendar
 * uses rather than reimplementing the recurrence rules. A second
 * implementation would inevitably drift from the real one, and the whole point
 * of the preview is to promise "this is what will actually appear".
 */
export function previewOccurrences(
  values: EventFormParsed,
  limit = 8,
): { dates: string[]; truncated: boolean } {
  const row = toEventRow(values)

  const synthetic: EventRow = {
    id: "preview",
    title: row.title,
    description: row.description,
    occurrence_type: row.occurrence_type,
    start_date: row.start_date,
    end_date: row.end_date,
    start_time: row.start_time,
    end_time: row.end_time,
    recurrence_frequency: row.recurrence_frequency as EventRow["recurrence_frequency"],
    recurrence_interval: row.recurrence_interval,
    recurrence_days_of_week: row.recurrence_days_of_week,
    recurrence_day_of_month: row.recurrence_day_of_month,
    recurrence_week_of_month: row.recurrence_week_of_month,
    recurrence_end_date: row.recurrence_end_date,
    location: row.location,
    image_url: row.image_url,
    cta_label: row.cta_label,
    cta_url: row.cta_url,
    price_text: row.price_text,
    is_featured: row.is_featured,
    is_cancelled: row.is_cancelled,
    event_types: null,
  }

  // Look forward from the event's own start rather than from today, so a
  // series that begins next month still previews instead of showing nothing.
  const startKey = row.start_date
  const start = new Date(`${startKey}T00:00:00Z`)
  if (Number.isNaN(start.getTime())) return { dates: [], truncated: false }

  // A two-year window is enough to show a yearly pattern repeating while
  // staying cheap to expand.
  const end = new Date(start)
  end.setUTCFullYear(end.getUTCFullYear() + 2)
  const endKey = end.toISOString().slice(0, 10)

  const expanded = expandEvents([synthetic], startKey, endKey)
  const dates = expanded.map((o) => o.date)

  return {
    dates: dates.slice(0, limit),
    truncated: dates.length > limit,
  }
}
