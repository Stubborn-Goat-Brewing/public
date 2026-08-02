import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { requireAdmin } from "@/lib/admin/guard"
import { AdminShell } from "@/components/admin/admin-shell"
import { EventForm } from "@/components/admin/event-form"
import { OccurrenceOverrides } from "@/components/admin/occurrence-overrides"
import { listUpcomingOccurrences } from "@/lib/admin/occurrence-list"
import type { EventRow } from "@/lib/events/recurrence"
import type { EventFormValues } from "@/lib/admin/event-schema"
import { updateEvent } from "../actions"
import { loadFormOptions } from "../form-options"

export const metadata = { title: "Edit event | Admin" }

/** DB `HH:MM:SS` -> the `HH:MM` an <input type="time"> expects. */
function toTimeInput(value: string | null): string {
  return value ? value.slice(0, 5) : ""
}

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { email, supabase } = await requireAdmin()

  const [{ data: event }, options] = await Promise.all([
    supabase
      .from("events")
      .select(
        `id, title, short_description, description, event_type_id, occurrence_type,
         start_date, end_date, start_time, end_time,
         recurrence_frequency, recurrence_interval, recurrence_days_of_week,
         recurrence_day_of_month, recurrence_week_of_month, recurrence_end_date,
         location, price_text, image_url, cta_label, cta_url,
         is_featured, is_cancelled, is_published,
         event_artists(artist_id, sort_order),
         event_occurrence_overrides(occurrence_date, is_cancelled, override_title,
           override_start_time, override_end_time, note)`,
      )
      .eq("id", id)
      .maybeSingle(),
    loadFormOptions(supabase),
  ])

  if (!event) notFound()

  // Preserve the saved lineup order; sort_order drives the public display.
  const artistIds = [...(event.event_artists ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((link) => link.artist_id as string)

  const initialValues: EventFormValues = {
    title: event.title,
    short_description: event.short_description ?? "",
    description: event.description ?? "",
    event_type_id: event.event_type_id,
    occurrence_type: event.occurrence_type,
    start_date: event.start_date,
    end_date: event.end_date ?? "",
    start_time: toTimeInput(event.start_time),
    end_time: toTimeInput(event.end_time),
    recurrence_frequency: event.recurrence_frequency ?? "",
    recurrence_interval: event.recurrence_interval ?? 1,
    recurrence_days_of_week: event.recurrence_days_of_week ?? [],
    recurrence_day_of_month: event.recurrence_day_of_month ?? "",
    recurrence_week_of_month: event.recurrence_week_of_month ?? "",
    recurrence_end_date: event.recurrence_end_date ?? "",
    location: event.location ?? "",
    price_text: event.price_text ?? "",
    image_url: event.image_url ?? "",
    cta_label: event.cta_label ?? "",
    cta_url: event.cta_url ?? "",
    is_featured: event.is_featured,
    is_cancelled: event.is_cancelled,
    is_published: event.is_published,
    artist_ids: artistIds,
  }

  // Exceptions only apply to a series; a single-date event is edited directly.
  const occurrences =
    event.occurrence_type === "recurring"
      ? listUpcomingOccurrences(
          {
            ...event,
            event_types: null,
          } as unknown as EventRow,
          event.event_occurrence_overrides ?? [],
          { limit: 24 },
        )
      : []

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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{event.title}</h1>
          <p className="text-muted-foreground">Changes go live as soon as you save.</p>
        </div>

        <EventForm
          mode="edit"
          eventId={event.id}
          eventTypes={options.eventTypes}
          artists={options.artists}
          initialValues={initialValues}
          onSubmitAction={updateEvent.bind(null, event.id)}
        />

        {event.occurrence_type === "recurring" && (
          <section
            id="individual-dates"
            className="flex scroll-mt-6 flex-col gap-3 rounded-lg border border-border bg-card p-6"
          >
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Individual dates
            </h2>
            <OccurrenceOverrides
              eventId={event.id}
              occurrences={occurrences}
              defaultStartTime={event.start_time}
              defaultEndTime={event.end_time}
            />
          </section>
        )}
      </div>
    </AdminShell>
  )
}
