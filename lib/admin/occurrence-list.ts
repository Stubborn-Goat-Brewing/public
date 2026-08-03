import { expandEvents, type EventRow } from "@/lib/events/recurrence"

/** One computed date plus whatever exception is stored against it. */
export type OccurrenceEntry = {
  date: string
  isCancelled: boolean
  overrideTitle: string | null
  overrideStartTime: string | null
  overrideEndTime: string | null
  note: string | null
  hasOverride: boolean
}

export type StoredOverride = {
  occurrence_date: string
  is_cancelled: boolean
  override_title: string | null
  override_start_time: string | null
  override_end_time: string | null
  note: string | null
}

/**
 * Lists upcoming computed dates for a recurring event, each paired with its
 * stored exception.
 *
 * The event row is passed to `expandEvents` with its overrides deliberately
 * stripped. Overrides must NOT be applied here: a cancelled date would be
 * filtered out of the expansion, disappear from this panel, and there would be
 * no way left to un-cancel it. The panel needs the raw series, then layers the
 * exception data on top for display.
 */
export function listUpcomingOccurrences(
  event: EventRow,
  overrides: StoredOverride[],
  options: { from?: string; limit?: number } = {},
): OccurrenceEntry[] {
  const { from, limit = 24 } = options

  const fromKey = from ?? new Date().toISOString().slice(0, 10)
  // Start from whichever is later: today or the series start. Looking back
  // before the series begins just wastes expansion work.
  const startKey = event.start_date > fromKey ? event.start_date : fromKey

  const end = new Date(`${startKey}T00:00:00Z`)
  if (Number.isNaN(end.getTime())) return []
  end.setUTCFullYear(end.getUTCFullYear() + 2)
  const endKey = end.toISOString().slice(0, 10)

  const raw: EventRow = { ...event, event_occurrence_overrides: [] }
  const dates = expandEvents([raw], startKey, endKey)
    .map((o) => o.date)
    .slice(0, limit)

  const byDate = new Map(overrides.map((o) => [o.occurrence_date, o] as const))

  return dates.map((date) => {
    const o = byDate.get(date)
    return {
      date,
      isCancelled: o?.is_cancelled ?? false,
      overrideTitle: o?.override_title ?? null,
      overrideStartTime: o?.override_start_time ?? null,
      overrideEndTime: o?.override_end_time ?? null,
      note: o?.note ?? null,
      hasOverride: Boolean(o),
    }
  })
}
