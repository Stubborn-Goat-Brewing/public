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
    const BASE_ID = process.env.AIRTABLE_BASE_ID
    const API_KEY = process.env.AIRTABLE_API_KEY
    const TABLE_NAME = "Events"

    console.log("[v0] Checking Airtable config:", {
      hasBaseId: !!BASE_ID,
      hasApiKey: !!API_KEY,
    })

    if (!BASE_ID || !API_KEY) {
      console.log("[v0] Missing Airtable configuration")
      return NextResponse.json({ error: "Missing Airtable configuration" }, { status: 500 })
    }

    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`
    console.log("[v0] Fetching from Airtable:", url)

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    })

    console.log("[v0] Airtable response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] Airtable error:", errorText)
      return NextResponse.json({ error: "Failed to fetch events from Airtable" }, { status: 500 })
    }

    const data = await response.json()
    console.log("[v0] Airtable data:", { recordCount: data.records?.length || 0 })

    if (!data.records) {
      return NextResponse.json({ events: [] })
    }

    const events: Event[] = data.records
      .filter((record: any) => record.fields.Name && record.fields.Date)
      .map((record: any) => ({
        name: record.fields.Name || "",
        date: record.fields.Date || "",
        startTime: record.fields["Start Time"] || "",
        endTime: record.fields["End Time"] || "",
        description: record.fields.Description || "",
        type: record.fields["Event Type"] || "Other",
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    console.log("[v0] Processed events:", events.length)
    return NextResponse.json({ events })
  } catch (error) {
    console.error("[v0] Error fetching events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
