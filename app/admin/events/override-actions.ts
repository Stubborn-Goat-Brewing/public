"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { z } from "zod"

import { getAdminSession } from "@/lib/admin/guard"
import { sanitizeHtml } from "@/lib/sanitize-html"
import { EVENTS_CACHE_TAG } from "@/lib/events/fetch"

const UNAUTHORIZED = "Your session expired. Sign in again." as const

type Result = { ok: boolean; error?: string }

const timeField = z
  .string()
  .trim()
  .regex(/^\d{2}:\d{2}$/, "Use HH:MM")
  .optional()
  .or(z.literal(""))

const overrideSchema = z
  .object({
    eventId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
    isCancelled: z.boolean(),
    overrideTitle: z.string().trim().max(200).optional().or(z.literal("")),
    overrideDescription: z.string().trim().max(8000).optional().or(z.literal("")),
    overrideStartTime: timeField,
    overrideEndTime: timeField,
    note: z.string().trim().max(500).optional().or(z.literal("")),
  })
  // Mirrors the events table rule: an end time may not precede its start.
  .refine(
    (v) =>
      !v.overrideStartTime ||
      !v.overrideEndTime ||
      v.overrideEndTime >= v.overrideStartTime,
    { message: "End time cannot be before start time", path: ["overrideEndTime"] },
  )
  // Times are stored as a pair so the generated `is_all_day` column on events
  // stays meaningful; a lone start time would be ambiguous.
  .refine((v) => Boolean(v.overrideStartTime) === Boolean(v.overrideEndTime), {
    message: "Set both times or neither",
    path: ["overrideStartTime"],
  })

/**
 * Creates or replaces the exception for a single date.
 *
 * Upserts on the `(event_id, occurrence_date)` unique constraint so repeatedly
 * editing the same date updates one row instead of failing on a duplicate.
 */
export async function saveOccurrenceOverride(input: unknown): Promise<Result> {
  const session = await getAdminSession()
  if (!session) return { ok: false, error: UNAUTHORIZED }

  const parsed = overrideSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid exception" }
  }
  const v = parsed.data

  const { error } = await session.supabase.from("event_occurrence_overrides").upsert(
    {
      event_id: v.eventId,
      occurrence_date: v.date,
      is_cancelled: v.isCancelled,
      override_title: v.overrideTitle || null,
      override_description: sanitizeHtml(v.overrideDescription || null),
      override_start_time: v.overrideStartTime || null,
      override_end_time: v.overrideEndTime || null,
      note: v.note || null,
    },
    { onConflict: "event_id,occurrence_date" },
  )

  if (error) return { ok: false, error: error.message }

  revalidatePath(`/admin/events/${v.eventId}`)
  revalidatePath("/admin/events")
  revalidatePath("/")
  revalidateTag(EVENTS_CACHE_TAG)
  return { ok: true }
}

/** Removes the exception entirely, restoring the date to the series defaults. */
export async function clearOccurrenceOverride(
  eventId: string,
  date: string,
): Promise<Result> {
  const session = await getAdminSession()
  if (!session) return { ok: false, error: UNAUTHORIZED }

  const { error } = await session.supabase
    .from("event_occurrence_overrides")
    .delete()
    .eq("event_id", eventId)
    .eq("occurrence_date", date)

  if (error) return { ok: false, error: error.message }

  revalidatePath(`/admin/events/${eventId}`)
  revalidatePath("/admin/events")
  revalidatePath("/")
  revalidateTag(EVENTS_CACHE_TAG)
  return { ok: true }
}
