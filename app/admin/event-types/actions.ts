"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import type { SupabaseClient } from "@supabase/supabase-js"
import { z } from "zod"
import { getAdminSession } from "@/lib/admin/guard"
import { slugify } from "@/lib/admin/slug"
import { EVENT_ICON_NAMES } from "@/lib/events/format"
import { EVENTS_CACHE_TAG } from "@/lib/events/fetch"

/**
 * These actions use `getAdminSession` rather than `requireAdmin` because they
 * are invoked from a client component. `requireAdmin` throws a redirect, which
 * would surface as an unhandled error mid-mutation instead of a message the
 * dialog can show.
 */
const UNAUTHORIZED = "Your session expired. Sign in again." as const

/** Enum values on events.occurrence_type / event_types.default_occurrence_type. */
const OCCURRENCE_TYPES = ["point_in_time", "all_day", "multi_day", "recurring"] as const

/**
 * Values the site actually understands for `detail_table`. "artists" is the
 * only one wired up (it makes the event form show the lineup picker and the
 * public page render the artist block); everything else means "no extra data".
 */
const DETAIL_TABLES = ["artists"] as const

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

const baseSchema = z.object({
  name: z.string().trim().min(1, "Enter a name.").max(120),
  description: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => (v ? v : null)),
  icon: z
    .string()
    .trim()
    .refine((v) => EVENT_ICON_NAMES.includes(v), "Choose an icon.")
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  color_hex: z.string().trim().regex(HEX_COLOR, "Use a hex color like #7C3AED."),
  text_color_hex: z.string().trim().regex(HEX_COLOR, "Use a hex color like #FFFFFF."),
  default_occurrence_type: z.enum(OCCURRENCE_TYPES),
  detail_table: z
    .union([z.enum(DETAIL_TABLES), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v ? v : null)),
  sort_order: z.coerce.number().int().min(0).max(100000),
  is_active: z.boolean().default(true),
})

const createSchema = baseSchema
const updateSchema = baseSchema.extend({ id: z.coerce.number().int().positive() })

async function uniqueSlug(
  supabase: SupabaseClient,
  name: string,
  excludeId?: number,
): Promise<string> {
  const { data } = await supabase.from("event_types").select("id, slug")
  const taken = new Set((data ?? []).filter((r) => r.id !== excludeId).map((r) => r.slug))
  let slug = slugify(name) || "event-type"
  if (taken.has(slug)) {
    let n = 2
    while (taken.has(`${slug}-${n}`)) n += 1
    slug = `${slug}-${n}`
  }
  return slug
}

function revalidate() {
  revalidatePath("/admin/event-types")
  revalidatePath("/admin/events")
  revalidatePath("/events")
  // Type color/icon/name changes affect how events render publicly, so bust the
  // cached homepage "Upcoming Events" feed too.
  revalidateTag(EVENTS_CACHE_TAG)
}

/**
 * `event_types` has unique indexes on name, slug, and color_hex. Map the raw
 * Postgres unique-violation (23505) to a message that points at the field the
 * admin actually needs to change, instead of a generic "duplicate key" error.
 */
function uniqueViolationMessage(error: { code?: string; message?: string }): string | null {
  if (error.code !== "23505") return null
  const detail = error.message ?? ""
  if (detail.includes("color_hex")) {
    return "Another event type already uses that color. Pick a different one."
  }
  if (detail.includes("name")) {
    return "An event type with that name already exists."
  }
  if (detail.includes("slug")) {
    return "That name collides with an existing event type. Try a different name."
  }
  return "An event type with those details already exists."
}

export async function createEventType(input: unknown): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession()
  if (!session) return { ok: false, error: UNAUTHORIZED }
  const { supabase } = session

  const parsed = createSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid event type details." }
  }

  const slug = await uniqueSlug(supabase, parsed.data.name)
  const { error } = await supabase.from("event_types").insert({ ...parsed.data, slug })
  if (error) {
    return { ok: false, error: uniqueViolationMessage(error) ?? error.message }
  }

  revalidate()
  return { ok: true }
}

export async function updateEventType(input: unknown): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession()
  if (!session) return { ok: false, error: UNAUTHORIZED }
  const { supabase } = session

  const parsed = updateSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid event type details." }
  }
  const { id, ...fields } = parsed.data

  const slug = await uniqueSlug(supabase, fields.name, id)
  const { error } = await supabase
    .from("event_types")
    .update({ ...fields, slug })
    .eq("id", id)

  if (error) return { ok: false, error: uniqueViolationMessage(error) ?? error.message }

  revalidate()
  return { ok: true }
}

/**
 * Flips just the active flag. Kept separate from `updateEventType` so the
 * table's inline switch cannot clobber the styling fields it does not display.
 */
export async function setEventTypeActive(
  id: number,
  isActive: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession()
  if (!session) return { ok: false, error: UNAUTHORIZED }

  const { error } = await session.supabase
    .from("event_types")
    .update({ is_active: isActive })
    .eq("id", id)

  if (error) return { ok: false, error: error.message }

  revalidate()
  return { ok: true }
}

export async function deleteEventType(id: number): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession()
  if (!session) return { ok: false, error: UNAUTHORIZED }
  const { supabase } = session

  // Refuse to delete while events still use this type: removing it would
  // orphan those events (events.event_type_id is required).
  const { count, error: countError } = await supabase
    .from("events")
    .select("id", { count: "exact", head: true })
    .eq("event_type_id", id)

  if (countError) return { ok: false, error: countError.message }
  if ((count ?? 0) > 0) {
    return {
      ok: false,
      error: `${count} event${count === 1 ? "" : "s"} still use this type. Reassign them or mark it inactive instead.`,
    }
  }

  const { error } = await supabase.from("event_types").delete().eq("id", id)
  if (error) return { ok: false, error: error.message }

  revalidate()
  return { ok: true }
}
