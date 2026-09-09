import type { MetadataRoute } from "next"
import { absoluteUrl } from "@/lib/seo/site"
import { fetchCalendarData } from "@/lib/events/fetch"
import { eventPath } from "@/lib/events/format"

// Event data lives in Supabase, so regenerate the sitemap periodically rather
// than at build time. Keeps upcoming-event URLs fresh without a redeploy.
export const revalidate = 3600

/**
 * Last date the *static* content of each page was meaningfully edited.
 * Bump the relevant value when you change that page's copy so `lastmod` stays
 * truthful. It must NOT be `new Date()` — a lastmod that changes on every crawl
 * trains search engines to ignore the field entirely.
 */
const STATIC_CONTENT_UPDATED = "2026-09-09"

/** Static, publicly indexable routes. Admin/auth/api are intentionally excluded. */
const STATIC_ROUTES: Array<{
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
  priority: number
  /** When true, lastmod also reflects the most recent event edit. */
  eventDriven?: boolean
  lastContentUpdate: string
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1, eventDriven: true, lastContentUpdate: STATIC_CONTENT_UPDATED },
  { path: "/events", changeFrequency: "daily", priority: 0.9, eventDriven: true, lastContentUpdate: STATIC_CONTENT_UPDATED },
  { path: "/menu", changeFrequency: "weekly", priority: 0.8, lastContentUpdate: STATIC_CONTENT_UPDATED },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2, lastContentUpdate: STATIC_CONTENT_UPDATED },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2, lastContentUpdate: STATIC_CONTENT_UPDATED },
]

/** Returns the later of two date-ish values as a Date. */
function latest(a: string | Date, b: string | Date): Date {
  const da = new Date(a)
  const db = new Date(b)
  return da.getTime() >= db.getTime() ? da : db
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const todayKey = now.toISOString().slice(0, 10)

  let eventEntries: MetadataRoute.Sitemap = []
  // Newest event edit across the fetched window, used for event-driven pages.
  let latestEventUpdate: string | null = null

  try {
    const { events } = await fetchCalendarData()
    const seen = new Set<string>()

    for (const event of events) {
      if (event.updatedAt) {
        latestEventUpdate = latest(latestEventUpdate ?? 0, event.updatedAt).toISOString()
      }
    }

    eventEntries = events
      // Only index current/upcoming, non-cancelled occurrences.
      .filter((event) => !event.isCancelled && event.date >= todayKey)
      // One entry per unique occurrence URL.
      .filter((event) => {
        if (seen.has(event.occurrenceId)) return false
        seen.add(event.occurrenceId)
        return true
      })
      .map((event) => ({
        url: absoluteUrl(eventPath(event.id, event.date)),
        // Real content date: when this event (or its override) was last edited.
        lastModified: event.updatedAt ? new Date(event.updatedAt) : new Date(STATIC_CONTENT_UPDATED),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }))
  } catch (error) {
    // The sitemap must never fail to render; static routes are always emitted.
    console.error("[v0] Failed to add events to sitemap:", error)
  }

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    // Event-driven pages reflect the newest event edit; the rest use their own
    // stable content date. Neither depends on crawl time.
    lastModified:
      route.eventDriven && latestEventUpdate
        ? latest(route.lastContentUpdate, latestEventUpdate)
        : new Date(route.lastContentUpdate),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  return [...staticEntries, ...eventEntries]
}
