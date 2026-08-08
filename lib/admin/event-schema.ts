import { z } from "zod"

/**
 * Validation for the admin event form.
 *
 * These rules deliberately mirror the CHECK constraints on `public.events`, so
 * an invalid combination is reported as a field error in the form instead of
 * surfacing as an opaque Postgres constraint violation after submit. The DB
 * constraints remain the real guarantee; this is the friendly front door.
 *
 * Mirrored constraints:
 *   events_point_in_time_requires_times  - point_in_time needs both times, no end_date
 *   events_all_day_has_no_times          - all_day has no times and no end_date
 *   events_multi_day_requires_end_date   - multi_day needs end_date > start_date
 *   events_recurring_requires_frequency  - recurring needs a frequency, no end_date
 *   events_weekly_requires_days          - weekly needs >= 1 weekday
 *   events_time_pair                     - start_time and end_time are set together
 *   events_recurrence_*_valid            - numeric ranges on interval/day/week
 */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^\d{2}:\d{2}$/

const dateField = z.string().regex(DATE_RE, "Use the date picker to choose a date.")
const optionalDate = z.union([z.literal(""), dateField]).optional()
const optionalTime = z.union([z.literal(""), z.string().regex(TIME_RE, "Use HH:MM.")]).optional()

/** Trims, then converts "" to null for nullable text columns. */
const nullableText = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .transform((v) => (v ? v : null))

/**
 * Like `nullableText` but with more headroom, since rich-text descriptions
 * carry HTML markup (tags, hrefs) on top of the visible copy. The server
 * sanitizes this HTML on save; this only guards raw length.
 */
const nullableRichText = z
  .string()
  .trim()
  .max(8000, "That description is too long.")
  .optional()
  .transform((v) => (v ? v : null))

const urlField = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null))
  .refine(
    (v) => {
      if (!v) return true
      // Allow site-relative paths as well as absolute http(s) URLs.
      if (v.startsWith("/")) return true
      try {
        const parsed = new URL(v)
        return parsed.protocol === "http:" || parsed.protocol === "https:"
      } catch {
        return false
      }
    },
    { message: "Enter a full https:// URL or a path starting with /." },
  )

export const occurrenceTypes = ["point_in_time", "all_day", "multi_day", "recurring"] as const
export const recurrenceFrequencies = ["daily", "weekly", "monthly", "yearly"] as const

export const WEEKDAYS = [
  { value: 0, short: "Sun", label: "Sunday" },
  { value: 1, short: "Mon", label: "Monday" },
  { value: 2, short: "Tue", label: "Tuesday" },
  { value: 3, short: "Wed", label: "Wednesday" },
  { value: 4, short: "Thu", label: "Thursday" },
  { value: 5, short: "Fri", label: "Friday" },
  { value: 6, short: "Sat", label: "Saturday" },
] as const

export const eventFormSchema = z
  .object({
    title: z.string().trim().min(1, "Give the event a title.").max(200),
    short_description: z
      .string()
      .trim()
      .max(160, "Keep the teaser under 160 characters.")
      .optional()
      .transform((v) => (v ? v : null)),
    description: nullableRichText,
    event_type_id: z.coerce.number().int().positive("Choose an event type."),

    occurrence_type: z.enum(occurrenceTypes),
    start_date: dateField,
    end_date: optionalDate,
    start_time: optionalTime,
    end_time: optionalTime,

    recurrence_frequency: z.union([z.literal(""), z.enum(recurrenceFrequencies)]).optional(),
    recurrence_interval: z.coerce.number().int().min(1, "Repeat every 1 or more.").max(52),
    recurrence_days_of_week: z.array(z.coerce.number().int().min(0).max(6)).default([]),
    recurrence_day_of_month: z
      .union([z.literal(""), z.coerce.number().int().min(1).max(31)])
      .optional(),
    recurrence_week_of_month: z
      .union([z.literal(""), z.coerce.number().int().min(-1).max(5)])
      .optional(),
    recurrence_end_date: optionalDate,

    location: nullableText,
    price_text: nullableText,
    image_url: urlField,
    cta_label: nullableText,
    cta_url: urlField,

    is_featured: z.boolean().default(false),
    is_cancelled: z.boolean().default(false),
    is_published: z.boolean().default(true),

    artist_ids: z.array(z.string().uuid()).default([]),
  })
  .superRefine((v, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message })

    // --- times ---
    if (v.occurrence_type === "point_in_time") {
      if (!v.start_time) issue("start_time", "Start time is required for a timed event.")
      if (!v.end_time) issue("end_time", "End time is required for a timed event.")
    }
    if (v.occurrence_type === "all_day" && (v.start_time || v.end_time)) {
      issue("start_time", "All-day events cannot have times.")
    }
    // events_time_pair applies to every type
    if (Boolean(v.start_time) !== Boolean(v.end_time)) {
      issue(v.start_time ? "end_time" : "start_time", "Set both a start and end time, or neither.")
    }
    if (v.start_time && v.end_time && v.end_time <= v.start_time && v.occurrence_type !== "multi_day") {
      // Overnight spans are legitimate for multi_day, but on a single day an end
      // before the start is almost always a typo.
      issue("end_time", "End time must be after the start time.")
    }

    // --- multi-day ---
    if (v.occurrence_type === "multi_day") {
      if (!v.end_date) {
        issue("end_date", "Choose the last day of the event.")
      } else if (v.end_date <= v.start_date) {
        issue("end_date", "The end date must be after the start date.")
      }
    } else if (v.end_date) {
      issue("end_date", "Only multi-day events use an end date.")
    }

    // --- recurrence ---
    if (v.occurrence_type === "recurring") {
      if (!v.recurrence_frequency) {
        issue("recurrence_frequency", "Choose how often this repeats.")
      }
      if (v.recurrence_frequency === "weekly" && v.recurrence_days_of_week.length === 0) {
        issue("recurrence_days_of_week", "Pick at least one day of the week.")
      }
      if (v.recurrence_frequency === "monthly") {
        const byWeekday = v.recurrence_week_of_month !== "" && v.recurrence_week_of_month != null
        if (byWeekday && v.recurrence_days_of_week.length === 0) {
          issue("recurrence_days_of_week", "Pick the weekday this falls on.")
        }
      }
      if (v.recurrence_end_date && v.recurrence_end_date < v.start_date) {
        issue("recurrence_end_date", "The last date cannot be before the first date.")
      }
    } else if (v.recurrence_frequency) {
      issue("recurrence_frequency", "Only recurring events use a repeat pattern.")
    }
  })

export type EventFormValues = z.input<typeof eventFormSchema>
export type EventFormParsed = z.output<typeof eventFormSchema>

/**
 * Converts validated form values into an `events` row.
 *
 * Fields that do not apply to the chosen occurrence type are forced to null
 * rather than left as empty strings, because the CHECK constraints test for
 * IS NULL and `''` would fail them.
 */
export function toEventRow(v: EventFormParsed) {
  const recurring = v.occurrence_type === "recurring"
  const monthlyByWeekday =
    recurring &&
    v.recurrence_frequency === "monthly" &&
    v.recurrence_week_of_month !== "" &&
    v.recurrence_week_of_month != null

  const emptyToNull = <T,>(value: T | "" | undefined): T | null =>
    value === "" || value === undefined ? null : value

  return {
    title: v.title,
    short_description: v.short_description,
    description: v.description,
    event_type_id: v.event_type_id,
    occurrence_type: v.occurrence_type,
    start_date: v.start_date,
    end_date: v.occurrence_type === "multi_day" ? emptyToNull(v.end_date) : null,
    start_time: v.occurrence_type === "all_day" ? null : emptyToNull(v.start_time),
    end_time: v.occurrence_type === "all_day" ? null : emptyToNull(v.end_time),

    recurrence_frequency: recurring ? emptyToNull(v.recurrence_frequency) : null,
    recurrence_interval: recurring ? v.recurrence_interval : 1,
    recurrence_days_of_week:
      recurring &&
      (v.recurrence_frequency === "weekly" || monthlyByWeekday) &&
      v.recurrence_days_of_week.length > 0
        ? // Monthly "nth weekday" only reads the first element.
          monthlyByWeekday
          ? [v.recurrence_days_of_week[0]]
          : [...v.recurrence_days_of_week].sort((a, b) => a - b)
        : null,
    recurrence_day_of_month:
      recurring && v.recurrence_frequency === "monthly" && !monthlyByWeekday
        ? emptyToNull(v.recurrence_day_of_month)
        : null,
    recurrence_week_of_month: monthlyByWeekday ? emptyToNull(v.recurrence_week_of_month) : null,
    recurrence_end_date: recurring ? emptyToNull(v.recurrence_end_date) : null,

    location: v.location,
    price_text: v.price_text,
    image_url: v.image_url,
    cta_label: v.cta_label,
    cta_url: v.cta_url,
    is_featured: v.is_featured,
    is_cancelled: v.is_cancelled,
    is_published: v.is_published,
  }
}
