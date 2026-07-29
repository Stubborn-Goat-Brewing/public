import type { SupabaseClient } from "@supabase/supabase-js"
import type { EventTypeOption } from "@/components/admin/event-form"
import type { ArtistOption } from "@/components/admin/artist-picker"

/**
 * Loads the dropdown data shared by the create and edit event pages.
 *
 * Both pages need the identical shape, so keeping this in one place avoids the
 * two queries drifting apart (a mismatch would make an event type selectable on
 * one page but not the other).
 */
export async function loadFormOptions(
  supabase: SupabaseClient,
): Promise<{ eventTypes: EventTypeOption[]; artists: ArtistOption[] }> {
  const [typesResult, artistsResult] = await Promise.all([
    supabase
      .from("event_types")
      .select("id, name, slug, color_hex, text_color_hex, detail_table")
      .order("name"),
    supabase.from("artists").select("id, name, hometown, is_active").order("name"),
  ])

  return {
    eventTypes: (typesResult.data ?? []) as EventTypeOption[],
    artists: (artistsResult.data ?? []) as ArtistOption[],
  }
}
