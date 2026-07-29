"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getAdminSession } from "@/lib/admin/guard"
import { normalizeForCompare, slugify } from "@/lib/admin/slug"

/**
 * These actions use `getAdminSession` rather than `requireAdmin` because they
 * are invoked from client components. `requireAdmin` throws a redirect, which
 * surfaces as an unhandled error mid-mutation instead of a message the picker
 * can show.
 */
const UNAUTHORIZED = "Your session expired. Sign in again." as const

const createArtistSchema = z.object({
  name: z.string().trim().min(1, "Enter the artist's name.").max(200),
  hometown: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v ? v : null)),
  website_url: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => (v ? v : null)),
})

export type CreateArtistResult =
  | { ok: true; artist: { id: string; name: string; slug: string } }
  | { ok: false; error: string }

/**
 * Creates an artist, or returns the existing one when the name already exists.
 *
 * Returning the existing row instead of erroring keeps the picker's
 * "type a new name" flow idempotent: adding "Joe Smith" twice links the same
 * roster entry rather than creating a near-duplicate.
 */
export async function createArtist(input: {
  name: string
  hometown?: string
  website_url?: string
}): Promise<CreateArtistResult> {
  const session = await getAdminSession()
  if (!session) return { ok: false, error: UNAUTHORIZED }
  const { supabase } = session

  const parsed = createArtistSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid artist details." }
  }
  const { name, hometown, website_url } = parsed.data

  // Exact-ish match check first so we reuse rather than duplicate.
  const { data: existing } = await supabase.from("artists").select("id, name, slug")
  const target = normalizeForCompare(name)
  const match = (existing ?? []).find((a) => normalizeForCompare(a.name) === target)
  if (match) {
    return { ok: true, artist: match }
  }

  const taken = new Set((existing ?? []).map((a) => a.slug))
  let slug = slugify(name)
  if (taken.has(slug)) {
    let n = 2
    while (taken.has(`${slug}-${n}`)) n += 1
    slug = `${slug}-${n}`
  }

  const { data, error } = await supabase
    .from("artists")
    .insert({ name, slug, hometown, website_url, is_active: true })
    .select("id, name, slug")
    .single()

  if (error) {
    // A concurrent insert could still win the race on the unique slug index.
    if (error.code === "23505") {
      return { ok: false, error: "That artist was just added. Search for them again." }
    }
    return { ok: false, error: error.message }
  }

  revalidatePath("/admin/artists")
  return { ok: true, artist: data }
}

const updateArtistSchema = createArtistSchema.extend({
  id: z.string().uuid(),
  description: z
    .string()
    .trim()
    .max(4000)
    .optional()
    .transform((v) => (v ? v : null)),
  image_url: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => (v ? v : null)),
  is_active: z.boolean().default(true),
})

export async function updateArtist(input: unknown): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession()
  if (!session) return { ok: false, error: UNAUTHORIZED }
  const { supabase } = session

  const parsed = updateArtistSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid artist details." }
  }
  const { id, ...fields } = parsed.data

  const { error } = await supabase.from("artists").update(fields).eq("id", id)
  if (error) return { ok: false, error: error.message }

  revalidatePath("/admin/artists")
  revalidatePath("/admin/events")
  return { ok: true }
}

/**
 * Flips just the active flag.
 *
 * Kept separate from `updateArtist` so the roster's inline switch cannot
 * accidentally clobber the bio fields it does not display.
 */
export async function setArtistActive(
  id: string,
  isActive: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession()
  if (!session) return { ok: false, error: UNAUTHORIZED }

  const { error } = await session.supabase
    .from("artists")
    .update({ is_active: isActive })
    .eq("id", id)

  if (error) return { ok: false, error: error.message }

  revalidatePath("/admin/artists")
  revalidatePath("/admin/events")
  return { ok: true }
}

export async function deleteArtist(id: string): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession()
  if (!session) return { ok: false, error: UNAUTHORIZED }
  const { supabase } = session

  // Refuse to delete while the artist is still booked: removing them would
  // silently strip the lineup from those events.
  const { count, error: countError } = await supabase
    .from("event_artists")
    .select("event_id", { count: "exact", head: true })
    .eq("artist_id", id)

  if (countError) return { ok: false, error: countError.message }
  if ((count ?? 0) > 0) {
    return {
      ok: false,
      error: `Still booked on ${count} event${count === 1 ? "" : "s"}. Mark them inactive instead.`,
    }
  }

  const { error } = await supabase.from("artists").delete().eq("id", id)
  if (error) return { ok: false, error: error.message }

  revalidatePath("/admin/artists")
  return { ok: true }
}
