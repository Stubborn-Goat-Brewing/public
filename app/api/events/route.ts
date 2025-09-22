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

    console.log("[v0] Checking events JSON URL config:", {
      hasUrl: !!EVENTS_JSON_URL,
    })

    if (!EVENTS_JSON_URL) {
      console.log("[v0] Missing EVENTS_JSON_URL configuration")
      return NextResponse.json({ error: "Missing EVENTS_JSON_URL configuration" }, { status: 500 })
    }

    console.log("[v0] Fetching events from JSON URL:", EVENTS_JSON_URL)

    const response = await fetch(EVENTS_JSON_URL, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Cache-Control": "no-cache",
      },
      redirect: "follow", // Follow redirects automatically
    })

    console.log("[v0] Response status:", response.status)
    console.log("[v0] Response URL:", response.url)
    console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

    const contentType = response.headers.get("content-type")
    console.log("[v0] Response content type:", contentType)

    const responseText = await response.text()
    console.log("[v0] Raw response (first 500 chars):", responseText.substring(0, 500))

    if (!response.ok) {
      console.log("[v0] Response not OK, status:", response.status)
      return NextResponse.json({ error: "Failed to fetch events from JSON URL" }, { status: 500 })
    }

    let data
    try {
      data = JSON.parse(responseText)
      console.log("[v0] Successfully parsed JSON data:", {
        type: typeof data,
        isArray: Array.isArray(data),
        keys: typeof data === "object" ? Object.keys(data) : "N/A",
        eventCount: data?.events?.length || data?.length || 0,
      })
    } catch (parseError) {
      console.log("[v0] Failed to parse JSON:", parseError)
      console.log("[v0] Response was not valid JSON")
      return NextResponse.json({ error: "Response is not valid JSON" }, { status: 500 })
    }

    let events: Event[]
    if (Array.isArray(data)) {
      events = data
    } else if (data.events && Array.isArray(data.events)) {
      events = data.events
    } else {
      console.log("[v0] Invalid JSON structure - expected array or {events: []} format")
      console.log("[v0] Actual data structure:", data)
      return NextResponse.json({ error: "Invalid JSON format" }, { status: 500 })
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

    console.log("[v0] Final processed events count:", processedEvents.length)
    console.log("[v0] Sample event:", processedEvents[0] || "No events")

    return NextResponse.json({ events: processedEvents })
  } catch (error) {
    console.error("[v0] Error fetching events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
