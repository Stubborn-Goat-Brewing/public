import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { fetchEventOccurrence } from "@/lib/events/fetch"
import { formatDateLong, formatTimeRange } from "@/lib/events/format"
import { BUSINESS, SITE_NAME } from "@/lib/seo/site"

export const runtime = "nodejs"
export const alt = "Stubborn Goat Brewing event"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// Brand palette (kept literal because ImageResponse can't read CSS variables).
const BG = "#18181b"
const SURFACE = "#27272a"
const CREAM = "#fafaf9"
const MUTED = "#a1a1aa"
const AMBER = "#b0651f"

/** Loads the goat emblem as a data URI so it renders inside the OG image. */
async function loadLogo(): Promise<string | null> {
  try {
    const file = await readFile(join(process.cwd(), "public/images/goat-head-white.png"))
    return `data:image/png;base64,${file.toString("base64")}`
  } catch {
    return null
  }
}

export default async function Image({
  params,
}: {
  params: { id: string; date: string }
}) {
  const [event, logo] = await Promise.all([
    fetchEventOccurrence(params.id, params.date),
    loadLogo(),
  ])

  const accent = event?.color || AMBER
  const title = event?.name || "Live at Stubborn Goat"
  const dateLabel = event ? formatDateLong(event.date) : ""
  const timeLabel = event ? formatTimeRange(event.startTime, event.endTime) : ""
  const typeLabel = event?.type || "Event"

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: BG,
          color: CREAM,
          fontFamily: "sans-serif",
        }}
      >
        {/* Left accent bar in the event type color */}
        <div style={{ width: 24, height: "100%", backgroundColor: accent, display: "flex" }} />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 64px",
          }}
        >
          {/* Brand row */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="" width={64} height={64} style={{ objectFit: "contain" }} />
            ) : null}
            <span
              style={{
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: CREAM,
              }}
            >
              {SITE_NAME}
            </span>
          </div>

          {/* Event details */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                backgroundColor: accent,
                color: CREAM,
                fontSize: 24,
                fontWeight: 600,
                padding: "8px 20px",
                borderRadius: 999,
                marginBottom: 24,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {typeLabel}
            </div>
            <div
              style={{
                fontSize: title.length > 40 ? 60 : 76,
                fontWeight: 800,
                lineHeight: 1.05,
                color: CREAM,
                display: "flex",
              }}
            >
              {title}
            </div>
          </div>

          {/* Meta row */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {dateLabel ? (
              <span style={{ fontSize: 34, fontWeight: 600, color: CREAM }}>{dateLabel}</span>
            ) : null}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {timeLabel ? <span style={{ fontSize: 28, color: MUTED }}>{timeLabel}</span> : null}
              {timeLabel ? (
                <span style={{ fontSize: 28, color: SURFACE }}>|</span>
              ) : null}
              <span style={{ fontSize: 28, color: MUTED }}>
                {BUSINESS.addressLocality}, {BUSINESS.addressRegion}
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  )
}
