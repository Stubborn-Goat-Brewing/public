import { requireAdmin } from "@/lib/admin/guard"
import { AdminShell } from "@/components/admin/admin-shell"
import { ArtistsTable } from "./artists-table"

export const metadata = {
  title: "Artists | Admin",
  robots: { index: false, follow: false },
}

/** Server-rendered on every request so new roster entries appear immediately. */
export const dynamic = "force-dynamic"

export interface AdminArtistRow {
  id: string
  name: string
  slug: string
  hometown: string | null
  description: string | null
  website_url: string | null
  image_url: string | null
  facebook_url: string | null
  instagram_url: string | null
  tiktok_url: string | null
  youtube_url: string | null
  apple_music_url: string | null
  is_active: boolean
  /** How many events currently book this artist; blocks deletion when > 0. */
  bookings: number
}

export default async function AdminArtistsPage() {
  const { email, supabase } = await requireAdmin()

  // The roster is small (dozens, not thousands), so we load it whole and
  // tally bookings in memory rather than paying for a grouped aggregate.
  const [{ data: artists, error }, { data: links }] = await Promise.all([
    supabase
      .from("artists")
      .select(
        "id, name, slug, hometown, description, website_url, image_url, facebook_url, instagram_url, tiktok_url, youtube_url, apple_music_url, is_active",
      )
      .order("name", { ascending: true }),
    supabase.from("event_artists").select("artist_id"),
  ])

  const bookingCounts = new Map<string, number>()
  for (const link of links ?? []) {
    const key = link.artist_id as string
    bookingCounts.set(key, (bookingCounts.get(key) ?? 0) + 1)
  }

  const rows: AdminArtistRow[] = (artists ?? []).map((artist) => ({
    ...artist,
    bookings: bookingCounts.get(artist.id) ?? 0,
  }))

  return (
    <AdminShell email={email}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Artists</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The roster used by live music events. Add artists while booking an event, then fill in
          their details here.
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
        >
          Could not load artists: {error.message}
        </p>
      ) : (
        <ArtistsTable artists={rows} />
      )}
    </AdminShell>
  )
}
