import { NextResponse } from "next/server"
import { getCachedCalendarData } from "@/lib/events/fetch"

/**
 * Read-only, cached feed for the homepage "Upcoming Events" strip.
 *
 * Unlike the interactive `/api/events` route (which must stay fresh as visitors
 * change months and filters), this endpoint serves the default-range calendar
 * data from the Next Data Cache (revalidated every 60s and on admin edits via
 * `revalidateTag`). The CDN headers let edges serve it without re-invoking the
 * function, cutting both database load and server requests for the busiest page.
 */
export async function GET() {
  try {
    const { events } = await getCachedCalendarData()
    return NextResponse.json(
      { events },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    )
  } catch (error) {
    console.error("[v0] Error fetching featured events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
