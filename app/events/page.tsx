import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo/site"
import { JsonLd } from "@/components/seo/json-ld"
import { getUpcomingEventsJsonLd } from "@/lib/seo/structured-data"
import { fetchCalendarData } from "@/lib/events/fetch"
import EventsClient from "./events-client"

export const metadata: Metadata = pageMetadata({
  title: "Events & Live Music",
  description:
    "Live music, trivia, and community events at Stubborn Goat Brewing in West Grove, PA. See the full calendar of what's happening at The Goat.",
  path: "/events",
})

// Uses cookies/DB via Supabase, so render per request.
export const dynamic = "force-dynamic"

export default async function Page() {
  let eventsJsonLd: Record<string, unknown>[] = []

  try {
    const { events } = await fetchCalendarData()
    eventsJsonLd = getUpcomingEventsJsonLd(events)
  } catch (error) {
    // Structured data is best-effort; never block the page on it.
    console.error("[v0] Failed to build events structured data:", error)
  }

  return (
    <>
      {eventsJsonLd.length > 0 && <JsonLd data={eventsJsonLd} />}
      <EventsClient />
    </>
  )
}
