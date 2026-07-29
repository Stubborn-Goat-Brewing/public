import { WEEKDAYS } from "./event-schema"
import { formatEventTimeRange, parseEventDate } from "@/lib/events/types"
import type { EventRow } from "@/lib/events/recurrence"

const ORDINALS: Record<number, string> = {
  1: "first",
  2: "second",
  3: "third",
  4: "fourth",
  5: "fifth",
  [-1]: "last",
}

function formatDay(date: string): string {
  return parseEventDate(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function dayName(weekday: number): string {
  return WEEKDAYS.find((d) => d.value === weekday)?.label ?? ""
}

/**
 * Renders an event's schedule as a human sentence, e.g.
 * "Every Tuesday" or "Every 2 weeks on Mon, Wed".
 *
 * Used in the admin list so staff can confirm a recurrence rule at a glance
 * instead of decoding the raw recurrence columns.
 */
export function describeSchedule(
  event: Pick<
    EventRow,
    | "occurrence_type"
    | "start_date"
    | "end_date"
    | "start_time"
    | "end_time"
    | "recurrence_frequency"
    | "recurrence_interval"
    | "recurrence_days_of_week"
    | "recurrence_day_of_month"
    | "recurrence_week_of_month"
    | "recurrence_end_date"
  >,
): string {
  const time = formatEventTimeRange(
    event.start_time?.slice(0, 5) ?? "",
    event.end_time?.slice(0, 5) ?? "",
  )

  if (event.occurrence_type === "point_in_time") {
    return [formatDay(event.start_date), time].filter(Boolean).join(" · ")
  }

  if (event.occurrence_type === "all_day") {
    return `${formatDay(event.start_date)} · All day`
  }

  if (event.occurrence_type === "multi_day") {
    const span = event.end_date
      ? `${formatDay(event.start_date)} – ${formatDay(event.end_date)}`
      : formatDay(event.start_date)
    return [span, time].filter(Boolean).join(" · ")
  }

  // ---- recurring ----
  const interval = Math.max(1, event.recurrence_interval || 1)
  const days = (event.recurrence_days_of_week ?? []).map((d) => dayName(d))
  let pattern = ""

  switch (event.recurrence_frequency) {
    case "daily":
      pattern = interval === 1 ? "Every day" : `Every ${interval} days`
      break
    case "weekly": {
      const list = days.length > 0 ? days.join(", ") : "—"
      pattern = interval === 1 ? `Every ${list}` : `Every ${interval} weeks on ${list}`
      break
    }
    case "monthly": {
      if (event.recurrence_week_of_month != null && days.length > 0) {
        const ordinal = ORDINALS[event.recurrence_week_of_month] ?? `${event.recurrence_week_of_month}th`
        pattern = `The ${ordinal} ${days[0]} of ${interval === 1 ? "every month" : `every ${interval} months`}`
      } else {
        const day = event.recurrence_day_of_month ?? parseEventDate(event.start_date).getDate()
        pattern = `Day ${day} of ${interval === 1 ? "every month" : `every ${interval} months`}`
      }
      break
    }
    case "yearly":
      pattern = `Every ${interval === 1 ? "year" : `${interval} years`} on ${parseEventDate(
        event.start_date,
      ).toLocaleDateString("en-US", { month: "long", day: "numeric" })}`
      break
    default:
      pattern = "Repeating"
  }

  const parts = [pattern]
  if (time) parts.push(time)
  if (event.recurrence_end_date) parts.push(`until ${formatDay(event.recurrence_end_date)}`)

  return parts.join(" · ")
}
