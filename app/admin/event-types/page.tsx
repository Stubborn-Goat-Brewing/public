import { requireAdmin } from "@/lib/admin/guard"
import { AdminShell } from "@/components/admin/admin-shell"
import { EventTypesTable } from "./event-types-table"

export const metadata = {
  title: "Event Types | Admin",
  robots: { index: false, follow: false },
}

/** Server-rendered on every request so edits appear immediately. */
export const dynamic = "force-dynamic"

export interface AdminEventTypeRow {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  color_hex: string
  text_color_hex: string
  default_occurrence_type: string
  detail_table: string | null
  sort_order: number
  is_active: boolean
  /** How many events use this type; blocks deletion when > 0. */
  usage: number
}

export default async function AdminEventTypesPage() {
  const { email, supabase } = await requireAdmin()

  // The list is small (dozens), so we load it whole and tally usage in memory
  // rather than paying for a grouped aggregate.
  const [{ data: types, error }, { data: events }] = await Promise.all([
    supabase
      .from("event_types")
      .select(
        "id, name, slug, description, icon, color_hex, text_color_hex, default_occurrence_type, detail_table, sort_order, is_active",
      )
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase.from("events").select("event_type_id"),
  ])

  const usageCounts = new Map<number, number>()
  for (const event of events ?? []) {
    const key = event.event_type_id as number
    usageCounts.set(key, (usageCounts.get(key) ?? 0) + 1)
  }

  const rows: AdminEventTypeRow[] = (types ?? []).map((type) => ({
    ...type,
    usage: usageCounts.get(type.id) ?? 0,
  }))

  return (
    <AdminShell email={email}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Event Types</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The categories used to label events across the calendar. Control each type&apos;s name,
          color, icon, and behavior here.
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
        >
          Could not load event types: {error.message}
        </p>
      ) : (
        <EventTypesTable eventTypes={rows} />
      )}
    </AdminShell>
  )
}
