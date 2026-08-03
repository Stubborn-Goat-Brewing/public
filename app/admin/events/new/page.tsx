import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { requireAdmin } from "@/lib/admin/guard"
import { AdminShell } from "@/components/admin/admin-shell"
import { EventForm } from "@/components/admin/event-form"
import { createEvent } from "../actions"
import { loadFormOptions } from "../form-options"

export const metadata = { title: "New event | Admin" }

export default async function NewEventPage() {
  const { email, supabase } = await requireAdmin()
  const { eventTypes, artists } = await loadFormOptions(supabase)

  // Default to next Friday evening, the most common slot for this taproom.
  const today = new Date()
  const daysUntilFriday = (5 - today.getUTCDay() + 7) % 7 || 7
  const start = new Date(today)
  start.setUTCDate(start.getUTCDate() + daysUntilFriday)

  return (
    <AdminShell email={email}>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Link
            href="/admin/events"
            className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            All events
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">New event</h1>
          <p className="text-muted-foreground">
            Set the schedule once - recurring events fill the calendar automatically.
          </p>
        </div>

        <EventForm
          mode="create"
          eventTypes={eventTypes}
          artists={artists}
          onSubmitAction={createEvent}
          initialValues={{
            title: "",
            short_description: "",
            description: "",
            event_type_id: eventTypes[0]?.id ?? 0,
            occurrence_type: "point_in_time",
            start_date: start.toISOString().slice(0, 10),
            end_date: "",
            start_time: "18:00",
            end_time: "21:00",
            recurrence_frequency: "",
            recurrence_interval: 1,
            recurrence_days_of_week: [],
            recurrence_day_of_month: "",
            recurrence_week_of_month: "",
            recurrence_end_date: "",
            location: "",
            price_text: "",
            image_url: "",
            cta_label: "",
            cta_url: "",
            is_featured: false,
            is_cancelled: false,
            is_published: true,
            artist_ids: [],
          }}
        />
      </div>
    </AdminShell>
  )
}
