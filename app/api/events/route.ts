import { NextResponse } from "next/server"
import { fetchCalendarData } from "@/lib/events/fetch"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const { events, eventTypes, range } = await fetchCalendarData(
      searchParams.get("from"),
      searchParams.get("to"),
    )

    return NextResponse.json(
      { events, eventTypes, range },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
          "CDN-Cache-Control": "no-store",
          "Vercel-CDN-Cache-Control": "no-store",
        },
      },
    )
  } catch (error) {
    console.error("[v0] Error fetching events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
