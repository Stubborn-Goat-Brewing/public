"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CalendarClock, Loader2, Repeat } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArtistPicker, type ArtistOption } from "./artist-picker"
import {
  WEEKDAYS,
  eventFormSchema,
  recurrenceFrequencies,
  type EventFormValues,
} from "@/lib/admin/event-schema"
import { previewOccurrences } from "@/lib/admin/preview-dates"

export type EventTypeOption = {
  id: number
  name: string
  slug: string
  color_hex: string
  text_color_hex: string
  detail_table: string | null
}

type FieldErrors = Record<string, string>

export type EventFormProps = {
  mode: "create" | "edit"
  eventTypes: EventTypeOption[]
  artists: ArtistOption[]
  initialValues: EventFormValues
  eventId?: string
  onSubmitAction: (
    values: EventFormValues,
  ) => Promise<{ ok: boolean; error?: string; fieldErrors?: FieldErrors; id?: string }>
}

/** Human-readable label for a `YYYY-MM-DD` key, without timezone drift. */
function formatDateKey(key: string): string {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}

export function EventForm({
  mode,
  eventTypes,
  artists,
  initialValues,
  eventId,
  onSubmitAction,
}: EventFormProps) {
  const router = useRouter()
  const [values, setValues] = useState<EventFormValues>(initialValues)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isPending, startTransition] = useTransition()

  function set<K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    // Clear the error for a field as soon as the user edits it, so stale
    // messages don't linger while they are fixing the problem.
    setErrors((prev) => {
      if (!prev[key as string]) return prev
      const next = { ...prev }
      delete next[key as string]
      return next
    })
  }

  const isRecurring = values.occurrence_type === "recurring"
  const frequency = values.recurrence_frequency
  const monthlyByWeekday =
    values.recurrence_week_of_month !== "" && values.recurrence_week_of_month != null

  const selectedType = eventTypes.find((t) => t.id === Number(values.event_type_id))
  // Only artist-backed types get the lineup picker, mirroring how the public
  // calendar decides whether to render artists at all.
  const showArtists = selectedType?.detail_table === "artists"

  // Live preview of the computed dates. Runs through the same validation as
  // submit so a half-filled form previews nothing instead of throwing.
  const preview = useMemo(() => {
    const parsed = eventFormSchema.safeParse(values)
    if (!parsed.success) return null
    try {
      return previewOccurrences(parsed.data, 8)
    } catch {
      return null
    }
  }, [values])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const parsed = eventFormSchema.safeParse(values)
    if (!parsed.success) {
      const next: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form")
        if (!next[key]) next[key] = issue.message
      }
      setErrors(next)
      toast.error("Please fix the highlighted fields.")
      return
    }

    setErrors({})
    startTransition(async () => {
      const result = await onSubmitAction(values)
      if (result.ok) {
        toast.success(mode === "create" ? "Event created." : "Changes saved.")
        router.push("/admin/events")
        router.refresh()
      } else {
        if (result.fieldErrors) setErrors(result.fieldErrors)
        toast.error(result.error ?? "Could not save the event.")
      }
    })
  }

  const err = (field: string) =>
    errors[field] ? (
      <p role="alert" className="text-sm text-destructive">
        {errors[field]}
      </p>
    ) : null

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* ---------- Basics ---------- */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Basics
        </h2>

        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Event title</Label>
          <Input
            id="title"
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
            aria-invalid={Boolean(errors.title)}
            placeholder="Trivia with Pat"
          />
          {err("title")}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="event_type_id">Event type</Label>
          <Select
            value={values.event_type_id ? String(values.event_type_id) : undefined}
            onValueChange={(v) => set("event_type_id", Number(v) as EventFormValues["event_type_id"])}
          >
            <SelectTrigger id="event_type_id" aria-invalid={Boolean(errors.event_type_id)}>
              <SelectValue placeholder="Choose a type" />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map((type) => (
                <SelectItem key={type.id} value={String(type.id)}>
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: type.color_hex }}
                    />
                    {type.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {err("event_type_id")}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="short_description">
            Teaser <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="short_description"
            value={values.short_description ?? ""}
            onChange={(e) => set("short_description", e.target.value)}
            placeholder="One line shown on cards"
            maxLength={160}
          />
          {err("short_description")}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="description">
            Description <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="description"
            value={values.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
            rows={4}
          />
          {err("description")}
        </div>
      </section>

      <Separator />

      {/* ---------- Schedule ---------- */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Schedule
        </h2>

        <Tabs
          value={isRecurring ? "recurring" : "one_time"}
          onValueChange={(v) => {
            if (v === "recurring") {
              set("occurrence_type", "recurring")
              set("end_date", "")
              if (!values.recurrence_frequency) set("recurrence_frequency", "weekly")
            } else {
              set("occurrence_type", "point_in_time")
              set("recurrence_frequency", "")
            }
          }}
        >
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="one_time" className="gap-1.5">
              <CalendarClock className="h-4 w-4" aria-hidden="true" />
              One-time
            </TabsTrigger>
            <TabsTrigger value="recurring" className="gap-1.5">
              <Repeat className="h-4 w-4" aria-hidden="true" />
              Recurring
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {!isRecurring && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="occurrence_type">Kind of one-time event</Label>
            <Select
              value={values.occurrence_type}
              onValueChange={(v) => {
                set("occurrence_type", v as EventFormValues["occurrence_type"])
                if (v === "all_day") {
                  set("start_time", "")
                  set("end_time", "")
                }
                if (v !== "multi_day") set("end_date", "")
              }}
            >
              <SelectTrigger id="occurrence_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="point_in_time">Timed - has a start and end time</SelectItem>
                <SelectItem value="all_day">All day - no specific time</SelectItem>
                <SelectItem value="multi_day">Multi-day - spans several dates</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="start_date">{isRecurring ? "First date" : "Date"}</Label>
            <Input
              id="start_date"
              type="date"
              value={values.start_date}
              onChange={(e) => set("start_date", e.target.value)}
              aria-invalid={Boolean(errors.start_date)}
            />
            {err("start_date")}
          </div>

          {values.occurrence_type === "multi_day" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="end_date">Last date</Label>
              <Input
                id="end_date"
                type="date"
                value={values.end_date ?? ""}
                onChange={(e) => set("end_date", e.target.value)}
                aria-invalid={Boolean(errors.end_date)}
              />
              {err("end_date")}
            </div>
          )}

          {isRecurring && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="recurrence_end_date">
                Stop repeating <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="recurrence_end_date"
                type="date"
                value={values.recurrence_end_date ?? ""}
                onChange={(e) => set("recurrence_end_date", e.target.value)}
                aria-invalid={Boolean(errors.recurrence_end_date)}
              />
              {err("recurrence_end_date")}
            </div>
          )}
        </div>

        {values.occurrence_type !== "all_day" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="start_time">Start time</Label>
              <Input
                id="start_time"
                type="time"
                value={values.start_time ?? ""}
                onChange={(e) => set("start_time", e.target.value)}
                aria-invalid={Boolean(errors.start_time)}
              />
              {err("start_time")}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="end_time">End time</Label>
              <Input
                id="end_time"
                type="time"
                value={values.end_time ?? ""}
                onChange={(e) => set("end_time", e.target.value)}
                aria-invalid={Boolean(errors.end_time)}
              />
              {err("end_time")}
            </div>
          </div>
        )}

        {/* ---------- Recurrence pattern ---------- */}
        {isRecurring && (
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/30 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="recurrence_frequency">Repeats</Label>
                <Select
                  value={frequency || "weekly"}
                  onValueChange={(v) => {
                    set("recurrence_frequency", v as EventFormValues["recurrence_frequency"])
                    // Reset pattern-specific fields so a leftover value from
                    // another frequency can't fail the DB CHECK constraints.
                    set("recurrence_day_of_month", "")
                    set("recurrence_week_of_month", "")
                    if (v !== "weekly" && v !== "monthly") set("recurrence_days_of_week", [])
                  }}
                >
                  <SelectTrigger
                    id="recurrence_frequency"
                    aria-invalid={Boolean(errors.recurrence_frequency)}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {recurrenceFrequencies.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {err("recurrence_frequency")}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="recurrence_interval">Every</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="recurrence_interval"
                    type="number"
                    min={1}
                    max={52}
                    value={values.recurrence_interval ?? 1}
                    onChange={(e) =>
                      set("recurrence_interval", e.target.value as unknown as number)
                    }
                    className="w-24"
                    aria-invalid={Boolean(errors.recurrence_interval)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {frequency === "daily" && "day(s)"}
                    {(frequency === "weekly" || !frequency) && "week(s)"}
                    {frequency === "monthly" && "month(s)"}
                    {frequency === "yearly" && "year(s)"}
                  </span>
                </div>
                {err("recurrence_interval")}
              </div>
            </div>

            {(frequency === "weekly" || frequency === "monthly") && (
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-sm font-medium text-foreground">
                  {frequency === "weekly" ? "On these days" : "On this weekday"}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => {
                    const selected = (values.recurrence_days_of_week ?? []).includes(day.value)
                    return (
                      <button
                        key={day.value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          const current = values.recurrence_days_of_week ?? []
                          if (frequency === "monthly") {
                            // "nth weekday of the month" only supports one day.
                            set("recurrence_days_of_week", selected ? [] : [day.value])
                          } else {
                            set(
                              "recurrence_days_of_week",
                              selected
                                ? current.filter((d) => d !== day.value)
                                : [...current, day.value],
                            )
                          }
                        }}
                        className={`min-w-[52px] rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:bg-muted"
                        }`}
                      >
                        <span className="sr-only">{day.label}</span>
                        <span aria-hidden="true">{day.short}</span>
                      </button>
                    )
                  })}
                </div>
                {err("recurrence_days_of_week")}
              </fieldset>
            )}

            {frequency === "monthly" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="recurrence_week_of_month">Which week</Label>
                  <Select
                    value={
                      values.recurrence_week_of_month === "" ||
                      values.recurrence_week_of_month == null
                        ? "none"
                        : String(values.recurrence_week_of_month)
                    }
                    onValueChange={(v) => {
                      if (v === "none") {
                        set("recurrence_week_of_month", "")
                      } else {
                        set("recurrence_week_of_month", Number(v) as never)
                        set("recurrence_day_of_month", "")
                      }
                    }}
                  >
                    <SelectTrigger id="recurrence_week_of_month">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Use a day number instead</SelectItem>
                      <SelectItem value="1">First</SelectItem>
                      <SelectItem value="2">Second</SelectItem>
                      <SelectItem value="3">Third</SelectItem>
                      <SelectItem value="4">Fourth</SelectItem>
                      <SelectItem value="-1">Last</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {!monthlyByWeekday && (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="recurrence_day_of_month">Day of month</Label>
                    <Input
                      id="recurrence_day_of_month"
                      type="number"
                      min={1}
                      max={31}
                      value={
                        values.recurrence_day_of_month === "" ||
                        values.recurrence_day_of_month == null
                          ? ""
                          : String(values.recurrence_day_of_month)
                      }
                      onChange={(e) => set("recurrence_day_of_month", e.target.value as never)}
                      placeholder="15"
                      aria-invalid={Boolean(errors.recurrence_day_of_month)}
                    />
                    {err("recurrence_day_of_month")}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ---------- Live preview ---------- */}
        <div
          aria-live="polite"
          className="rounded-lg border border-border bg-background p-4"
        >
          <h3 className="mb-2 text-sm font-medium text-foreground">
            {isRecurring ? "Next dates on the calendar" : "Appears on"}
          </h3>
          {preview && preview.dates.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {preview.dates.map((d) => (
                <Badge key={d} variant="secondary" className="font-normal">
                  {formatDateKey(d)}
                </Badge>
              ))}
              {preview.truncated && (
                <Badge variant="outline" className="font-normal">
                  and more
                </Badge>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {preview
                ? "This pattern produces no dates. Check the days and end date."
                : "Fill in the schedule to preview the dates."}
            </p>
          )}
        </div>
      </section>

      <Separator />

      {/* ---------- Lineup ---------- */}
      {showArtists && (
        <>
          <section className="flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Lineup
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Search the roster, or type a new name to add them.
              </p>
            </div>
            <ArtistPicker
              artists={artists}
              value={values.artist_ids ?? []}
              onChange={(ids) => set("artist_ids", ids)}
            />
            {err("artist_ids")}
          </section>
          <Separator />
        </>
      )}

      {/* ---------- Details ---------- */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Details
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="location">
              Location <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="location"
              value={values.location ?? ""}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Taproom"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="price_text">
              Price <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="price_text"
              value={values.price_text ?? ""}
              onChange={(e) => set("price_text", e.target.value)}
              placeholder="Free"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="cta_label">
              Button label <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="cta_label"
              value={values.cta_label ?? ""}
              onChange={(e) => set("cta_label", e.target.value)}
              placeholder="Reserve a table"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cta_url">
              Button link <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="cta_url"
              value={values.cta_url ?? ""}
              onChange={(e) => set("cta_url", e.target.value)}
              placeholder="https://"
              aria-invalid={Boolean(errors.cta_url)}
            />
            {err("cta_url")}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="image_url">
            Image URL <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="image_url"
            value={values.image_url ?? ""}
            onChange={(e) => set("image_url", e.target.value)}
            placeholder="/images/event.jpg"
            aria-invalid={Boolean(errors.image_url)}
          />
          {err("image_url")}
        </div>
      </section>

      <Separator />

      {/* ---------- Visibility ---------- */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Visibility
        </h2>

        <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
          <div>
            <Label htmlFor="is_published" className="text-base">
              Live on the site
            </Label>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Turn off to keep this as a draft only you can see.
            </p>
          </div>
          <Switch
            id="is_published"
            checked={Boolean(values.is_published)}
            onCheckedChange={(v) => set("is_published", v)}
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
          <div>
            <Label htmlFor="is_featured" className="text-base">
              Featured
            </Label>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Highlights this event in featured spots.
            </p>
          </div>
          <Switch
            id="is_featured"
            checked={Boolean(values.is_featured)}
            onCheckedChange={(v) => set("is_featured", v)}
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
          <div>
            <Label htmlFor="is_cancelled" className="text-base">
              Cancelled
            </Label>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Keeps the event listed but marks it cancelled.
            </p>
          </div>
          <Switch
            id="is_cancelled"
            checked={Boolean(values.is_cancelled)}
            onCheckedChange={(v) => set("is_cancelled", v)}
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          {mode === "create" ? "Create event" : "Save changes"}
        </Button>
        <Button type="button" variant="outline" asChild disabled={isPending}>
          <Link href="/admin/events">Cancel</Link>
        </Button>
        {mode === "edit" && eventId && (
          <Button type="button" variant="ghost" asChild>
            <Link href={`/admin/events/${eventId}/dates`}>Manage individual dates</Link>
          </Button>
        )}
      </div>
    </form>
  )
}
