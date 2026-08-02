import Link from "next/link"
import { Plus } from "lucide-react"
import { requireAdmin } from "@/lib/admin/guard"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { EventsTable } from "./events-table"

export const metadata = {
  title: "Events | Admin",
  robots: { index: false, follow: false },
}

/** Server-rendered on every request so drafts and edits appear immediately. */
export const dynamic = "force-dynamic"

export interface AdminEventRow {
  id: string
  title: string
  occurrence_type: "point_in_time" | "all_day" | "multi_day" | "recurring"
  start_date: string
  end_date: string | null
  start_time: string | null
  end_time: string | null
  recurrence_frequency: "daily" | "weekly" | "monthly" | "yearly" | null
  recurrence_interval: number
  recurrence_days_of_week: number[] | null
  recurrence_day_of_month: number | null
  recurrence_week_of_month: number | null
  recurrence_end_date: string | null
  is_published: boolean
  is_featured: boolean
  is_cancelled: boolean
  event_types: { name: string; color_hex: string; text_color_hex: string } | null
}

const SELECT_COLUMNS = `id, title, occurrence_type, start_date, end_date, start_time, end_time,
   recurrence_frequency, recurrence_interval, recurrence_days_of_week,
   recurrence_day_of_month, recurrence_week_of_month, recurrence_end_date,
   is_published, is_featured, is_cancelled,
   event_types ( name, color_hex, text_color_hex )`

const PAGE_SIZE = 50

/** Today as `YYYY-MM-DD` in the taproom's local timezone. */
function todayKey(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" })
}

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string; page?: string }>
}) {
  const { email, supabase } = await requireAdmin()
  const { scope: scopeParam, page: pageParam } = await searchParams

  // The table holds hundreds of rows going back years. Default to what staff
  // actually manage - upcoming events - and page through the rest, rather than
  // shipping the entire history to the browser on every visit.
  const scope = scopeParam === "past" ? "past" : "upcoming"
  const page = Math.max(1, Number(pageParam) || 1)
  const from = (page - 1) * PAGE_SIZE
  const today = todayKey()

  let query = supabase.from("events").select(SELECT_COLUMNS, { count: "exact" })

  if (scope === "upcoming") {
    // A recurring series stays relevant as long as its pattern has not ended,
    // even though its start_date is in the past.
    query = query.or(
      `start_date.gte.${today},occurrence_type.eq.recurring,end_date.gte.${today}`,
    )
    query = query.order("start_date", { ascending: true })
  } else {
    query = query.lt("start_date", today).neq("occurrence_type", "recurring")
    query = query.order("start_date", { ascending: false })
  }

  const { data: events, error, count } = await query.range(from, from + PAGE_SIZE - 1)

  const total = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <AdminShell email={email}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything on the public calendar, plus unpublished drafts.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            New event
          </Link>
        </Button>
      </div>

      {error ? (
        <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          Could not load events: {error.message}
        </p>
      ) : (
        <EventsTable
          events={(events ?? []) as unknown as AdminEventRow[]}
          scope={scope}
          page={page}
          totalPages={totalPages}
          total={total}
        />
      )}
    </AdminShell>
  )
}
