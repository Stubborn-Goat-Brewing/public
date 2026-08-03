/**
 * One-time migration: copies the events from the legacy EVENTS_JSON_URL feed
 * (a spreadsheet export) into the Supabase `events` table.
 *
 * Usage:
 *   node --env-file-if-exists=/vercel/share/.env.project scripts/import-events-from-feed.mjs --dry-run
 *   node --env-file-if-exists=/vercel/share/.env.project scripts/import-events-from-feed.mjs --commit
 *
 * `--commit` replaces the contents of the events table with the feed contents,
 * so it is safe to re-run.
 */

import { createClient } from "@supabase/supabase-js"

const DRY_RUN = !process.argv.includes("--commit")

/**
 * The feed stores times as spreadsheet time serials exported as
 * "1899-12-30T23:00:00.000Z". The sheet's wall-clock time is US Eastern, which
 * the legacy site recovered by subtracting 5 hours from the UTC hours.
 */
const SHEET_UTC_OFFSET_HOURS = 5

/** Feed `type` string (trimmed, lowercased) -> event_types.slug */
const TYPE_SLUG_BY_FEED_NAME = {
  "live music": "live-music",
  trivia: "trivia",
  bingo: "bingo",
  craft: "craft",
  sports: "sports",
  "food special": "food-special",
  "food specials": "food-special",
  "drink special": "drink-special",
  "drink specials": "drink-special",
  "community event": "community-event",
  "private event (closed to public)": "private-event",
  closed: "closed",
  "dine and donate": "dine-and-donate",
  fundraiser: "fundraiser",
  general: "general",
  "happy hour": "happy-hour",
  brunch: "brunch",
  workshop: "workshop",
  "comedy show": "comedy-show",
  "karaoke/open mic": "karaoke-open-mic",
  "weekly specials": "weekly-specials",
}

function extractDate(value) {
  if (!value) return null
  const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : null
}

/** "1899-12-30T23:00:00.000Z" -> "18:00" */
function extractTime(value) {
  if (!value) return null
  const raw = String(value)

  if (raw.includes("T")) {
    const date = new Date(raw)
    if (Number.isNaN(date.getTime())) return null
    let hours = date.getUTCHours() - SHEET_UTC_OFFSET_HOURS
    if (hours < 0) hours += 24
    const minutes = String(date.getUTCMinutes()).padStart(2, "0")
    return `${String(hours).padStart(2, "0")}:${minutes}`
  }

  const match = raw.match(/^(\d{1,2}):(\d{2})/)
  return match ? `${match[1].padStart(2, "0")}:${match[2]}` : null
}

async function main() {
  const feedUrl = process.env.EVENTS_JSON_URL
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!feedUrl) throw new Error("Missing EVENTS_JSON_URL")
  if (!supabaseUrl || !serviceKey) throw new Error("Missing Supabase URL or service role key")

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: types, error: typesError } = await supabase.from("event_types").select("id, slug")
  if (typesError) throw new Error(`Failed to load event types: ${typesError.message}`)
  const typeIdBySlug = new Map(types.map((t) => [t.slug, t.id]))

  console.log(`[v0] Fetching feed...`)
  const response = await fetch(feedUrl, { headers: { Accept: "application/json" } })
  if (!response.ok) throw new Error(`Feed request failed: ${response.status}`)
  const payload = await response.json()
  const rawEvents = Array.isArray(payload) ? payload : (payload.events ?? [])
  console.log(`[v0] Feed rows: ${rawEvents.length}`)

  const rows = []
  const seen = new Set()
  const stats = {
    skippedNoNameOrDate: 0,
    duplicates: 0,
    unknownTypes: new Map(),
    startWithoutEnd: 0,
    pointInTime: 0,
    allDay: 0,
  }

  for (const raw of rawEvents) {
    const name = String(raw.name ?? "").trim()
    const date = extractDate(raw.date)

    if (!name || !date) {
      stats.skippedNoNameOrDate++
      continue
    }

    const feedType = String(raw.type ?? "").trim().toLowerCase()
    const slug = TYPE_SLUG_BY_FEED_NAME[feedType] ?? "general"
    if (!TYPE_SLUG_BY_FEED_NAME[feedType]) {
      stats.unknownTypes.set(feedType || "(blank)", (stats.unknownTypes.get(feedType || "(blank)") ?? 0) + 1)
    }

    const eventTypeId = typeIdBySlug.get(slug)
    if (!eventTypeId) throw new Error(`Event type slug not found in database: ${slug}`)

    let startTime = extractTime(raw.startTime)
    let endTime = extractTime(raw.endTime)

    // The schema requires start and end times as a pair. A lone start time
    // becomes an all-day entry rather than inventing an end time.
    if (startTime && !endTime) {
      stats.startWithoutEnd++
      startTime = null
      endTime = null
    } else if (!startTime && endTime) {
      endTime = null
    }

    const dedupeKey = `${date}|${name.toLowerCase()}|${startTime ?? ""}`
    if (seen.has(dedupeKey)) {
      stats.duplicates++
      continue
    }
    seen.add(dedupeKey)

    const isTimed = Boolean(startTime && endTime)
    if (isTimed) stats.pointInTime++
    else stats.allDay++

    rows.push({
      event_type_id: eventTypeId,
      title: name,
      description: String(raw.description ?? "").trim() || null,
      occurrence_type: isTimed ? "point_in_time" : "all_day",
      start_date: date,
      start_time: startTime,
      end_time: endTime,
      is_published: true,
    })
  }

  console.log(`[v0] Prepared ${rows.length} rows`)
  console.log(`[v0] Stats:`, {
    ...stats,
    unknownTypes: Object.fromEntries(stats.unknownTypes),
  })
  console.log(`[v0] Sample:`, rows.slice(0, 3))

  if (DRY_RUN) {
    console.log(`[v0] Dry run - nothing written. Re-run with --commit to import.`)
    return
  }

  console.log(`[v0] Clearing existing events...`)
  const { error: deleteError } = await supabase.from("events").delete().not("id", "is", null)
  if (deleteError) throw new Error(`Failed to clear events: ${deleteError.message}`)

  const BATCH = 200
  let inserted = 0
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { error } = await supabase.from("events").insert(batch)
    if (error) throw new Error(`Insert failed at row ${i}: ${error.message}`)
    inserted += batch.length
    console.log(`[v0] Inserted ${inserted}/${rows.length}`)
  }

  const { count } = await supabase.from("events").select("*", { count: "exact", head: true })
  console.log(`[v0] Done. events table now has ${count} rows.`)
}

main().catch((error) => {
  console.error("[v0] Import failed:", error.message)
  process.exit(1)
})
