/**
 * Single source of truth for taproom hours.
 *
 * `WEEKLY_HOURS` drives the human-readable HoursCard, while `OPENING_HOURS`
 * expresses the same schedule in the 24-hour format Google expects for
 * LocalBusiness `openingHoursSpecification` structured data. Keep them in sync.
 */

export interface DayHours {
  day: string
  time: string
}

export const WEEKLY_HOURS: DayHours[] = [
  { day: "Sunday", time: "12pm - 8pm" },
  { day: "Monday", time: "Closed" },
  { day: "Tuesday", time: "4pm - 10pm" },
  { day: "Wednesday", time: "4pm - 10pm" },
  { day: "Thursday", time: "4pm - 10pm" },
  { day: "Friday", time: "3pm - 11pm" },
  { day: "Saturday", time: "12pm - 11pm" },
]

export interface OpeningHoursSpec {
  days: string[]
  opens: string
  closes: string
}

/** 24-hour opening hours for structured data. Monday is closed, so it is omitted. */
export const OPENING_HOURS: OpeningHoursSpec[] = [
  { days: ["Tuesday", "Wednesday", "Thursday"], opens: "16:00", closes: "22:00" },
  { days: ["Friday"], opens: "15:00", closes: "23:00" },
  { days: ["Saturday"], opens: "12:00", closes: "23:00" },
  { days: ["Sunday"], opens: "12:00", closes: "20:00" },
]
