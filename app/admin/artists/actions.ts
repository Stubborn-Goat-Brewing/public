"use server"

import { revalidatePath } from "next/cache"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { z } from "zod"
import { getAdminSession } from "@/lib/admin/guard"
import { normalizeForCompare, slugify } from "@/lib/admin/slug"

const ARTIST_IMAGE_BUCKET = "artist-images"
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
])

export type UploadArtistImageResult = { ok: true; url: string } | { ok: false; error: string }

/**
 * Uploads an artist photo to Supabase Storage and returns its public URL.
 *
 * Uses the service-role key so the upload bypasses storage RLS - the admin
 * session is already verified here, and the browser client never sees that key.
 * The returned public URL is what gets saved into artists.image_url.
 */
export async function uploadArtistImage(formData: FormData): Promise<UploadArtistImageResult> {
  const session = await getAdminSession()
  if (!session) return { ok: false, error: UNAUTHORIZED }

  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose an image to upload." }
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "Image must be 5MB or smaller." }
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { ok: false, error: "Use a JPG, PNG, WebP, GIF, or AVIF image." }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    return { ok: false, error: "Image uploads are not configured." }
  }

  const admin = createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"
  const path = `${crypto.randomUUID()}.${extension}`

  const { error } = await admin.storage
    .from(ARTIST_IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })

  if (error) return { ok: false, error: error.message }

  const {
    data: { publicUrl },
  } = admin.storage.from(ARTIST_IMAGE_BUCKET).getPublicUrl(path)

  return { ok: true, url: publicUrl }
}

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

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .optional()
  .transform((v) => (v ? v : null))

/** Full detail fields shared by the roster create and update forms. */
const artistDetailSchema = createArtistSchema.extend({
  description: z
    .string()
    .trim()
    .max(4000)
    .optional()
    .transform((v) => (v ? v : null)),
  image_url: optionalUrl,
  facebook_url: optionalUrl,
  instagram_url: optionalUrl,
  tiktok_url: optionalUrl,
  youtube_url: optionalUrl,
  apple_music_url: optionalUrl,
  spotify_url: optionalUrl,
  soundcloud_url: optionalUrl,
  is_active: z.boolean().default(true),
})

const updateArtistSchema = artistDetailSchema.extend({
  id: z.string().uuid(),
})

/**
 * Creates a roster artist with the full detail form (bio, photo, socials).
 *
 * Unlike `createArtist` - which reuses an existing row on a name match to keep
 * the event picker's quick-add idempotent - this refuses a duplicate name so an
 * admin filling out full details never silently edits a different artist.
 */
export async function createArtistFull(input: unknown): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession()
  if (!session) return { ok: false, error: UNAUTHORIZED }
  const { supabase } = session

  const parsed = artistDetailSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid artist details." }
  }
  const fields = parsed.data

  const { data: existing } = await supabase.from("artists").select("slug, name")
  const target = normalizeForCompare(fields.name)
  if ((existing ?? []).some((a) => normalizeForCompare(a.name) === target)) {
    return { ok: false, error: "An artist with that name already exists." }
  }

  const taken = new Set((existing ?? []).map((a) => a.slug))
  let slug = slugify(fields.name)
  if (taken.has(slug)) {
    let n = 2
    while (taken.has(`${slug}-${n}`)) n += 1
    slug = `${slug}-${n}`
  }

  const { error } = await supabase.from("artists").insert({ ...fields, slug })
  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "That artist was just added. Refresh and try again." }
    }
    return { ok: false, error: error.message }
  }

  revalidatePath("/admin/artists")
  revalidatePath("/admin/events")
  return { ok: true }
}

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
