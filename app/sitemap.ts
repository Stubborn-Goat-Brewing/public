import type { MetadataRoute } from "next"
import { absoluteUrl } from "@/lib/seo/site"
import { fetchCalendarData } from "@/lib/events/fetch"
import { eventPath } from "@/lib/events/format"

// Event data lives in Supabase, so regenerate the sitemap periodically rather
// than at build time. Keeps upcoming-event URLs fresh without a redeploy.
export const revalidate = 3600

/** Static, publicly indexable routes. Admin/auth/api are intentionally excluded. */
const STATIC_ROUTES: Array<{
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
  priority: number
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/events", changeFrequency: "daily", priority: 0.9 },
  { path: "/menu", changeFrequency: "weekly", priority: 0.8 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  let eventEntries: MetadataRoute.Sitemap = []

  try {
    const { events } = await fetchCalendarData()
    const todayKey = now.toISOString().slice(0, 10)
    const seen = new Set<string>()

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
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }))
  } catch (error) {
    // The sitemap must never fail to render; static routes are always emitted.
    console.error("[v0] Failed to add events to sitemap:", error)
  }

  return [...staticEntries, ...eventEntries]
}
