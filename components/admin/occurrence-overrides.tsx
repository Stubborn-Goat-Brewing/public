"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CalendarX2, RotateCcw, Pencil } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import type { OccurrenceEntry } from "@/lib/admin/occurrence-list"
import { normalizeActionResult } from "@/lib/admin/action-result"
import {
  clearOccurrenceOverride,
  saveOccurrenceOverride,
} from "@/app/admin/events/override-actions"

function formatDate(key: string) {
  // Parsed as UTC to match how occurrence keys are generated. Using local
  // parsing here would shift the date by one day for west-of-UTC viewers.
  return new Date(`${key}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}

type Draft = {
  date: string
  overrideTitle: string
  overrideDescription: string
  overrideStartTime: string
  overrideEndTime: string
  note: string
  isCancelled: boolean
}

export function OccurrenceOverrides({
  eventId,
  occurrences,
  defaultStartTime,
  defaultEndTime,
}: {
  eventId: string
  occurrences: OccurrenceEntry[]
  defaultStartTime: string | null
  defaultEndTime: string | null
}) {
  const router = useRouter()
  const [draft, setDraft] = useState<Draft | null>(null)
  const [isPending, startTransition] = useTransition()

  function run(
    label: string,
    fn: () => Promise<{ ok: boolean; error?: string } | undefined>,
  ) {
    startTransition(async () => {
      const result = normalizeActionResult(await fn())
      if (result.ok) {
        toast.success(label)
        router.refresh()
      } else {
        toast.error(result.error ?? "Something went wrong.")
      }
    })
  }

  function toggleCancelled(entry: OccurrenceEntry) {
    const next = !entry.isCancelled

    // Un-cancelling a date that has no other customisation removes the row
    // outright rather than leaving an all-null exception behind.
    const isBareCancellation =
      !next &&
      !entry.overrideTitle &&
      !entry.overrideDescription &&
      !entry.overrideStartTime &&
      !entry.note

    if (isBareCancellation) {
      run("Date restored.", () => clearOccurrenceOverride(eventId, entry.date))
      return
    }

    run(next ? "Date cancelled." : "Date restored.", () =>
      saveOccurrenceOverride({
        eventId,
        date: entry.date,
        isCancelled: next,
        overrideTitle: entry.overrideTitle ?? "",
        overrideDescription: entry.overrideDescription ?? "",
        overrideStartTime: (entry.overrideStartTime ?? "").slice(0, 5),
        overrideEndTime: (entry.overrideEndTime ?? "").slice(0, 5),
        note: entry.note ?? "",
      }),
    )
  }

  function openEditor(entry: OccurrenceEntry) {
    setDraft({
      date: entry.date,
      overrideTitle: entry.overrideTitle ?? "",
      overrideDescription: entry.overrideDescription ?? "",
      overrideStartTime: (entry.overrideStartTime ?? "").slice(0, 5),
      overrideEndTime: (entry.overrideEndTime ?? "").slice(0, 5),
      note: entry.note ?? "",
      isCancelled: entry.isCancelled,
    })
  }

  function saveDraft() {
    if (!draft) return
    const target = draft

    // The dialog stays open until the write succeeds. Closing first would throw
    // away everything typed whenever validation rejects the input, forcing the
    // whole exception to be re-entered just to fix one field.
    startTransition(async () => {
      const result = normalizeActionResult(
        await saveOccurrenceOverride({
          eventId,
          date: target.date,
          isCancelled: target.isCancelled,
          overrideTitle: target.overrideTitle,
          overrideDescription: target.overrideDescription,
          overrideStartTime: target.overrideStartTime,
          overrideEndTime: target.overrideEndTime,
          note: target.note,
        }),
      )

      if (result.ok) {
        setDraft(null)
        toast.success("Exception saved.")
        router.refresh()
      } else {
        toast.error(result.error ?? "Something went wrong.")
      }
    })
  }

  if (occurrences.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This series has no upcoming dates, so there is nothing to make exceptions for.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Cancel a single date or give it its own title and times. Everything else in the
        series is unaffected.
      </p>

      <ul className="divide-y divide-border rounded-lg border border-border">
        {occurrences.map((entry) => {
          const customTime = entry.overrideStartTime
          return (
            <li
              key={entry.date}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={
                      entry.isCancelled
                        ? "text-sm font-medium text-muted-foreground line-through"
                        : "text-sm font-medium text-foreground"
                    }
                  >
                    {formatDate(entry.date)}
                  </span>
                  {entry.isCancelled && <Badge variant="destructive">Cancelled</Badge>}
                  {!entry.isCancelled && entry.hasOverride && (
                    <Badge variant="secondary">Customised</Badge>
                  )}
                </div>

                {(entry.overrideTitle ||
                  entry.overrideDescription ||
                  customTime ||
                  entry.note) && (
                  <p className="truncate text-xs text-muted-foreground">
                    {[
                      entry.overrideTitle,
                      customTime
                        ? `${customTime.slice(0, 5)}${
                            entry.overrideEndTime
                              ? `-${entry.overrideEndTime.slice(0, 5)}`
                              : ""
                          }`
                        : null,
                      entry.overrideDescription ? "Custom description" : null,
                      entry.note,
                    ]
                      .filter(Boolean)
                      .join(" | ")}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditor(entry)}
                  disabled={isPending}
                >
                  <Pencil className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                  Edit
                </Button>
                <Button
                  variant={entry.isCancelled ? "outline" : "ghost"}
                  size="sm"
                  onClick={() => toggleCancelled(entry)}
                  disabled={isPending}
                  // The visible label is just "Cancel"/"Restore", which is
                  // ambiguous out of context; aria-label names the date instead
                  // of appending a duplicate sr-only copy of the same word.
                  aria-label={`${entry.isCancelled ? "Restore" : "Cancel"} ${formatDate(entry.date)}`}
                >
                  {entry.isCancelled ? (
                    <>
                      <RotateCcw className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                      Restore
                    </>
                  ) : (
                    <>
                      <CalendarX2 className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                      Cancel
                    </>
                  )}
                </Button>
              </div>
            </li>
          )
        })}
      </ul>

      <Dialog open={draft !== null} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {draft ? formatDate(draft.date) : "Edit exception"}
            </DialogTitle>
            <DialogDescription>
              Leave a field blank to use the series default.
            </DialogDescription>
          </DialogHeader>

          {draft && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="override-title">Title for this date</Label>
                <Input
                  id="override-title"
                  value={draft.overrideTitle}
                  onChange={(e) => setDraft({ ...draft, overrideTitle: e.target.value })}
                  placeholder="Series default"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="override-description">Description for this date</Label>
                <Textarea
                  id="override-description"
                  value={draft.overrideDescription}
                  onChange={(e) =>
                    setDraft({ ...draft, overrideDescription: e.target.value })
                  }
                  rows={3}
                  placeholder="Series default"
                />
                <p className="text-xs text-muted-foreground">
                  Shown publicly for this date only. Leave blank to use the series
                  description.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="override-start">Start time</Label>
                  <Input
                    id="override-start"
                    type="time"
                    value={draft.overrideStartTime}
                    onChange={(e) =>
                      setDraft({ ...draft, overrideStartTime: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {defaultStartTime
                      ? `Series default ${defaultStartTime.slice(0, 5)}`
                      : "Series has no set time"}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="override-end">End time</Label>
                  <Input
                    id="override-end"
                    type="time"
                    value={draft.overrideEndTime}
                    onChange={(e) =>
                      setDraft({ ...draft, overrideEndTime: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {defaultEndTime
                      ? `Series default ${defaultEndTime.slice(0, 5)}`
                      : "Series has no set time"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="override-note">
                  Internal note <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="override-note"
                  value={draft.note}
                  onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                  rows={2}
                  placeholder="Why this date differs. Not shown on the public site."
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-between">
            {draft?.isCancelled ? (
              <span className="text-xs text-muted-foreground">
                This date is cancelled and hidden from the calendar.
              </span>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDraft(null)} disabled={isPending}>
                Cancel
              </Button>
              <Button onClick={saveDraft} disabled={isPending}>
                {isPending ? "Saving..." : "Save exception"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
