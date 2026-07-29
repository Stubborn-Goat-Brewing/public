"use server"

import { revalidatePath } from "next/cache"
import { getAdminSession } from "@/lib/admin/guard"
import { eventFormSchema, toEventRow, type EventFormValues } from "@/lib/admin/event-schema"

export interface ActionResult {
  ok: boolean
  error?: string
  /** Field-level errors keyed by form field name. */
  fieldErrors?: Record<string, string>
  eventId?: string
}

/** Revalidates every surface that renders calendar data. */
function revalidateEventSurfaces() {
  revalidatePath("/admin/events")
  revalidatePath("/events")
  revalidatePath("/")
}

const UNAUTHORIZED: ActionResult = {
  ok: false,
  error: "Your session expired. Sign in again.",
}

/**
 * Maps a Postgres error to a message worth showing.
 *
 * Constraint names are translated to plain English; anything unrecognised gets
 * a generic message, since raw driver text can leak schema details.
 */
function describeDbError(error: { message: string; code?: string }): string {
  const text = error.message

  if (text.includes("events_multi_day_requires_end_date")) {
    return "Multi-day events need an end date after the start date."
  }
  if (text.includes("events_point_in_time_requires_times")) {
    return "Timed events need both a start and end time."
  }
  if (text.includes("events_all_day_has_no_times")) {
    return "All-day events cannot have start or end times."
  }
  if (text.includes("events_weekly_requires_days")) {
    return "Weekly events need at least one weekday selected."
  }
  if (text.includes("events_recurring_requires_frequency")) {
    return "Recurring events need a repeat frequency."
  }
  if (text.includes("events_title_not_blank")) {
    return "The title cannot be blank."
  }
  if (error.code === "23505" || error.code === "23503") {
    return "That event type or artist no longer exists. Reload and try again."
  }
  if (error.code === "42501") {
    return "You do not have permission to make that change."
  }

  console.log("[v0] unmapped event db error:", error.code, text)
  return "Could not save the event. Please try again."
}

/** Replaces the artist lineup for an event. */
async function syncArtists(
  supabase: NonNullable<Awaited<ReturnType<typeof getAdminSession>>>["supabase"],
  eventId: string,
  artistIds: string[],
) {
  // Clear links that are no longer selected, then upsert the current set. This
  // keeps sort_order aligned with the order shown in the form.
  const { error: deleteError } = await supabase
    .from("event_artists")
    .delete()
    .eq("event_id", eventId)
  if (deleteError) return deleteError

  if (artistIds.length === 0) return null

  const rows = artistIds.map((artistId, index) => ({
    event_id: eventId,
    artist_id: artistId,
    sort_order: index,
  }))

  const { error: insertError } = await supabase.from("event_artists").insert(rows)
  return insertError
}

export async function createEvent(values: EventFormValues): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return UNAUTHORIZED

  const parsed = eventFormSchema.safeParse(values)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".")
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors }
  }

  const { data, error } = await session.supabase
    .from("events")
    .insert(toEventRow(parsed.data))
    .select("id")
    .single()

  if (error) return { ok: false, error: describeDbError(error) }

  const artistError = await syncArtists(session.supabase, data.id, parsed.data.artist_ids)
  if (artistError) {
    return {
      ok: false,
      error: "The event was saved, but the lineup could not be attached.",
      eventId: data.id,
    }
  }

  revalidateEventSurfaces()
  return { ok: true, eventId: data.id }
}

export async function updateEvent(eventId: string, values: EventFormValues): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return UNAUTHORIZED

  const parsed = eventFormSchema.safeParse(values)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".")
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors }
  }

  const row = toEventRow(parsed.data)

  const { error } = await session.supabase.from("events").update(row).eq("id", eventId)
  if (error) return { ok: false, error: describeDbError(error) }

  const artistError = await syncArtists(session.supabase, eventId, parsed.data.artist_ids)
  if (artistError) {
    return { ok: false, error: "The event was saved, but the lineup could not be updated." }
  }

  // Switching away from recurring leaves per-date overrides orphaned; they would
  // silently reapply if the event were switched back, so clear them.
  if (parsed.data.occurrence_type !== "recurring") {
    await session.supabase.from("event_occurrence_overrides").delete().eq("event_id", eventId)
  }

  revalidateEventSurfaces()
  return { ok: true, eventId }
}

export async function setEventPublished(
  eventId: string,
  isPublished: boolean,
): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return UNAUTHORIZED

  const { error } = await session.supabase
    .from("events")
    .update({ is_published: isPublished })
    .eq("id", eventId)

  if (error) return { ok: false, error: describeDbError(error) }

  revalidateEventSurfaces()
  return { ok: true }
}

export async function setEventCancelled(
  eventId: string,
  isCancelled: boolean,
): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return UNAUTHORIZED

  const { error } = await session.supabase
    .from("events")
    .update({ is_cancelled: isCancelled })
    .eq("id", eventId)

  if (error) return { ok: false, error: describeDbError(error) }

  revalidateEventSurfaces()
  return { ok: true }
}

export async function deleteEvent(eventId: string): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return UNAUTHORIZED

  const { error } = await session.supabase.from("events").delete().eq("id", eventId)
  if (error) return { ok: false, error: describeDbError(error) }

  revalidateEventSurfaces()
  return { ok: true }
}

/** Copies an event (and its lineup) as an unpublished draft. */
export async function duplicateEvent(eventId: string): Promise<ActionResult> {
  const session = await getAdminSession()
  if (!session) return UNAUTHORIZED

  const { data: original, error: readError } = await session.supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single()

  if (readError || !original) {
    return { ok: false, error: "Could not find that event." }
  }

  // `is_all_day` is GENERATED ALWAYS AS (start_time IS NULL); Postgres rejects
  // any INSERT that supplies a value for it, so it must be stripped along with
  // the identity/timestamp columns.
  const {
    id: _id,
    created_at: _createdAt,
    updated_at: _updatedAt,
    is_all_day: _isAllDay,
    ...rest
  } = original as Record<string, unknown>

  const { data: copy, error: insertError } = await session.supabase
    .from("events")
    .insert({
      ...rest,
      title: `${String(rest.title)} (copy)`,
      // Copies start as drafts so a duplicate never appears publicly by accident.
      is_published: false,
    })
    .select("id")
    .single()

  if (insertError) return { ok: false, error: describeDbError(insertError) }

  const { data: lineup } = await session.supabase
    .from("event_artists")
    .select("artist_id, sort_order, set_start_time, set_end_time")
    .eq("event_id", eventId)

  if (lineup && lineup.length > 0) {
    await session.supabase
      .from("event_artists")
      .insert(lineup.map((link) => ({ ...link, event_id: copy.id })))
  }

  revalidateEventSurfaces()
  return { ok: true, eventId: copy.id }
}
