import { NextResponse } from "next/server"

interface Event {
  name: string
  date: string
  startTime: string
  endTime: string
  description: string
  type: string
}

export async function GET() {
  try {
    const EVENTS_JSON_URL = process.env.EVENTS_JSON_URL

    console.log("[v0] Fetching events from URL:", !!EVENTS_JSON_URL ? "configured" : "missing")

    if (!EVENTS_JSON_URL) {
      return NextResponse.json({ error: "Missing EVENTS_JSON_URL configuration" }, { status: 500 })
    }

    const response = await fetch(EVENTS_JSON_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
    })

    console.log("[v0] Response status:", response.status)

    if (!response.ok) {
      console.log("[v0] Failed to fetch events, status:", response.status)
      return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
    }

    const data = await response.json()
    console.log("[v0] Fetched data structure:", {
      type: typeof data,
      isArray: Array.isArray(data),
      eventCount: data?.events?.length || data?.length || 0,
    })

    let events: Event[]
    if (Array.isArray(data)) {
      events = data
    } else if (data.events && Array.isArray(data.events)) {
      events = data.events
    } else {
      console.log("[v0] Invalid data format - expected array or {events: []} structure")
      return NextResponse.json({ error: "Invalid data format" }, { status: 500 })
    }

    const processedEvents: Event[] = events
      .filter((event: any) => event.name && event.date)
      .map((event: any) => ({
        name: event.name || "",
        date: event.date || "",
        startTime: event.startTime || "",
        endTime: event.endTime || "",
        description: event.description || "",
        type: event.type || "Other",
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    console.log("[v0] Processed events count:", processedEvents.length)

    return NextResponse.json({ events: processedEvents })
  } catch (error) {
    console.error("[v0] Error fetching events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
