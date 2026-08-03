import type { MetadataRoute } from "next"
import { absoluteUrl } from "@/lib/seo/site"
import { eventPath } from "@/lib/events/format"
import { fetchCalendarData } from "@/lib/events/fetch"

// Re-run periodically so newly scheduled events enter the sitemap.
export const revalidate = 3600

/** Public, indexable routes. Admin, API, and auth routes are intentionally omitted. */
const ROUTES: Array<{
  path: string
  priority: number
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
}> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/menu", priority: 0.9, changeFrequency: "weekly" },
  { path: "/events", priority: 0.9, changeFrequency: "daily" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
]

/** Upcoming, non-cancelled event occurrences, deduped and capped for a lean sitemap. */
async function eventEntries(lastModified: Date): Promise<MetadataRoute.Sitemap> {
  try {
    const todayKey = new Date().toISOString().slice(0, 10)
    const { events } = await fetchCalendarData()

    const seen = new Set<string>()
    const entries: MetadataRoute.Sitemap = []

    for (const event of events) {
      if (event.date < todayKey || event.isCancelled) continue
      const path = eventPath(event.id, event.date)
      if (seen.has(path)) continue
      seen.add(path)

      entries.push({
        url: absoluteUrl(path),
        lastModified,
        changeFrequency: "weekly",
        priority: 0.6,
      })

      if (entries.length >= 200) break
    }

    return entries
  } catch (error) {
    console.error("[v0] Failed to add events to sitemap:", error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date()

  const staticRoutes: MetadataRoute.Sitemap = ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  return [...staticRoutes, ...(await eventEntries(lastModified))]
}
