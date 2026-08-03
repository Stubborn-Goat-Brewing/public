"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EVENT_ICON_NAMES, getEventIcon, typeColorStyles } from "@/lib/events/format"
import { normalizeActionResult } from "@/lib/admin/action-result"
import type { AdminEventTypeRow } from "./page"
import {
  createEventType,
  deleteEventType,
  setEventTypeActive,
  updateEventType,
} from "./actions"

const OCCURRENCE_OPTIONS: { value: string; label: string }[] = [
  { value: "point_in_time", label: "Point in time" },
  { value: "all_day", label: "All day" },
  { value: "multi_day", label: "Multi-day" },
  { value: "recurring", label: "Recurring" },
]

const OCCURRENCE_LABELS: Record<string, string> = Object.fromEntries(
  OCCURRENCE_OPTIONS.map((o) => [o.value, o.label]),
)

/** "artists" is the only detail table wired into the site today. */
const DETAIL_OPTIONS: { value: string; label: string }[] = [
  { value: "none", label: "None" },
  { value: "artists", label: "Artist lineup (live music)" },
]

const DEFAULT_COLOR = "#7C3AED"
const DEFAULT_TEXT_COLOR = "#FFFFFF"

/**
 * Each event type needs a unique color (enforced by a DB constraint), so a new
 * type defaults to the first of these palette swatches not already in use.
 */
const COLOR_PALETTE = [
  "#B91C1C",
  "#C2410C",
  "#B45309",
  "#4D7C0F",
  "#047857",
  "#0F766E",
  "#0E7490",
  "#0369A1",
  "#1D4ED8",
  "#4338CA",
  "#6D28D9",
  "#A21CAF",
  "#BE185D",
  "#9F1239",
  "#44403C",
  "#1F2937",
]

type Draft = {
  name: string
  description: string
  icon: string
  color_hex: string
  text_color_hex: string
  default_occurrence_type: string
  detail_table: string
  sort_order: string
  is_active: boolean
}

function toDraft(type: AdminEventTypeRow): Draft {
  return {
    name: type.name,
    description: type.description ?? "",
    icon: type.icon ?? "",
    color_hex: type.color_hex ?? DEFAULT_COLOR,
    text_color_hex: type.text_color_hex ?? DEFAULT_TEXT_COLOR,
    default_occurrence_type: type.default_occurrence_type,
    detail_table: type.detail_table ?? "none",
    sort_order: String(type.sort_order ?? 0),
    is_active: type.is_active,
  }
}

function emptyDraft(nextSortOrder: number, color: string): Draft {
  return {
    name: "",
    description: "",
    icon: "Star",
    color_hex: color,
    text_color_hex: DEFAULT_TEXT_COLOR,
    default_occurrence_type: "point_in_time",
    detail_table: "none",
    sort_order: String(nextSortOrder),
    is_active: true,
  }
}

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

/** Solid + subtle previews so admins see both badge styles used on the site. */
function BadgePreview({ draft }: { draft: Draft }) {
  const Icon = getEventIcon(draft.icon)
  const name = draft.name.trim() || "Type name"
  const solidValid = HEX_COLOR.test(draft.color_hex) && HEX_COLOR.test(draft.text_color_hex)
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
        style={
          solidValid
            ? { backgroundColor: draft.color_hex, color: draft.text_color_hex }
            : { backgroundColor: DEFAULT_COLOR, color: DEFAULT_TEXT_COLOR }
        }
      >
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {name}
      </span>
      <span
        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium"
        style={typeColorStyles(HEX_COLOR.test(draft.color_hex) ? draft.color_hex : DEFAULT_COLOR)}
      >
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {name}
      </span>
    </div>
  )
}

export function EventTypesTable({ eventTypes }: { eventTypes: AdminEventTypeRow[] }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [editing, setEditing] = useState<AdminEventTypeRow | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [pendingDelete, setPendingDelete] = useState<AdminEventTypeRow | null>(null)
  const [isPending, startTransition] = useTransition()

  const nextSortOrder = useMemo(() => {
    const max = eventTypes.reduce((acc, t) => Math.max(acc, t.sort_order ?? 0), 0)
    return Math.ceil((max + 10) / 10) * 10
  }, [eventTypes])

  // Colors are unique per type (DB constraint). Map each used color to its owner
  // so we can pick an unused default and flag collisions before saving.
  const colorOwners = useMemo(
    () => new Map(eventTypes.map((t) => [t.color_hex.toLowerCase(), t.id])),
    [eventTypes],
  )
  const firstUnusedColor = useMemo(
    () => COLOR_PALETTE.find((c) => !colorOwners.has(c.toLowerCase())) ?? DEFAULT_COLOR,
    [colorOwners],
  )

  const colorConflict = useMemo(() => {
    if (!draft || !HEX_COLOR.test(draft.color_hex)) return false
    const owner = colorOwners.get(draft.color_hex.toLowerCase())
    return owner !== undefined && owner !== editing?.id
  }, [draft, colorOwners, editing])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return eventTypes
    return eventTypes.filter(
      (t) =>
        t.name.toLowerCase().includes(needle) || t.slug.toLowerCase().includes(needle),
    )
  }, [eventTypes, query])

  function run(label: string, fn: () => Promise<{ ok: boolean; error?: string } | undefined>) {
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

  function openEditor(type: AdminEventTypeRow) {
    setIsCreating(false)
    setEditing(type)
    setDraft(toDraft(type))
  }

  function openCreate() {
    setIsCreating(true)
    setEditing(null)
    setDraft(emptyDraft(nextSortOrder, firstUnusedColor))
  }

  function closeEditor() {
    setEditing(null)
    setIsCreating(false)
    setDraft(null)
  }

  function saveDraft() {
    if (!draft) return
    const payload = {
      name: draft.name,
      description: draft.description,
      icon: draft.icon || null,
      color_hex: draft.color_hex,
      text_color_hex: draft.text_color_hex,
      default_occurrence_type: draft.default_occurrence_type,
      detail_table: draft.detail_table === "none" ? null : draft.detail_table,
      sort_order: draft.sort_order,
      is_active: draft.is_active,
    }

    run(isCreating ? "Event type created." : "Event type updated.", async () => {
      const result = isCreating
        ? await createEventType(payload)
        : await updateEventType({ ...payload, id: editing?.id })
      if (result.ok) closeEditor()
      return result
    })
  }

  const dialogOpen = isCreating || editing !== null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search event types"
            className="pl-8"
            aria-label="Search event types"
          />
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
          New event type
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead className="hidden md:table-cell">Occurrence</TableHead>
              <TableHead className="hidden lg:table-cell">Detail</TableHead>
              <TableHead className="hidden sm:table-cell text-right">Events</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-[52px] text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No event types found.
                </TableCell>
              </TableRow>
            ) : (
              visible.map((type) => {
                const Icon = getEventIcon(type.icon)
                return (
                  <TableRow key={type.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: type.color_hex,
                            color: type.text_color_hex,
                          }}
                        >
                          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                          {type.name}
                        </span>
                        <code className="hidden text-xs text-muted-foreground xl:inline">
                          {type.slug}
                        </code>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {OCCURRENCE_LABELS[type.default_occurrence_type] ??
                        type.default_occurrence_type}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {type.detail_table === "artists" ? "Artist lineup" : "—"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-right text-sm tabular-nums text-muted-foreground">
                      {type.usage}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={type.is_active}
                        disabled={isPending}
                        onCheckedChange={(checked) =>
                          run(checked ? "Type activated." : "Type hidden.", () =>
                            setEventTypeActive(type.id, checked),
                          )
                        }
                        aria-label={`${type.is_active ? "Deactivate" : "Activate"} ${type.name}`}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Actions for {type.name}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditor(type)}>
                            <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setPendingDelete(type)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => (open ? null : closeEditor())}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {draft && (
            <>
              <DialogHeader>
                <DialogTitle>{isCreating ? "New event type" : `Edit ${editing?.name}`}</DialogTitle>
                <DialogDescription>
                  Controls how events of this type look and behave across the site.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 py-2">
                <div className="rounded-md border border-border bg-muted/40 p-3">
                  <span className="mb-2 block text-xs font-medium text-muted-foreground">
                    Preview
                  </span>
                  <BadgePreview draft={draft} />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="et-name">Name</Label>
                  <Input
                    id="et-name"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="Live Music"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="et-description">
                    Description <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea
                    id="et-description"
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    placeholder="Short summary shown where this type is described."
                    rows={2}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="et-icon">Icon</Label>
                  <Select
                    value={draft.icon || "Star"}
                    onValueChange={(value) => setDraft({ ...draft, icon: value })}
                  >
                    <SelectTrigger id="et-icon">
                      <SelectValue placeholder="Choose an icon" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {EVENT_ICON_NAMES.map((name) => {
                        const Icon = getEventIcon(name)
                        return (
                          <SelectItem key={name} value={name}>
                            <span className="flex items-center gap-2">
                              <Icon className="h-4 w-4" aria-hidden="true" />
                              {name}
                            </span>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="et-color">Background color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        aria-label="Background color picker"
                        value={HEX_COLOR.test(draft.color_hex) ? draft.color_hex : DEFAULT_COLOR}
                        onChange={(e) => setDraft({ ...draft, color_hex: e.target.value })}
                        className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-border bg-background p-1"
                      />
                      <Input
                        id="et-color"
                        value={draft.color_hex}
                        onChange={(e) => setDraft({ ...draft, color_hex: e.target.value })}
                        placeholder="#7C3AED"
                        aria-invalid={colorConflict}
                      />
                    </div>
                    {colorConflict && (
                      <p className="text-xs text-destructive">
                        Another event type already uses this color. Pick a different one.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="et-text-color">Text color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        aria-label="Text color picker"
                        value={
                          HEX_COLOR.test(draft.text_color_hex)
                            ? draft.text_color_hex
                            : DEFAULT_TEXT_COLOR
                        }
                        onChange={(e) => setDraft({ ...draft, text_color_hex: e.target.value })}
                        className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-border bg-background p-1"
                      />
                      <Input
                        id="et-text-color"
                        value={draft.text_color_hex}
                        onChange={(e) => setDraft({ ...draft, text_color_hex: e.target.value })}
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="et-occurrence">Default schedule</Label>
                    <Select
                      value={draft.default_occurrence_type}
                      onValueChange={(value) =>
                        setDraft({ ...draft, default_occurrence_type: value })
                      }
                    >
                      <SelectTrigger id="et-occurrence">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OCCURRENCE_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="et-sort">Sort order</Label>
                    <Input
                      id="et-sort"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={draft.sort_order}
                      onChange={(e) => setDraft({ ...draft, sort_order: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="et-detail">Extra details</Label>
                  <Select
                    value={draft.detail_table}
                    onValueChange={(value) => setDraft({ ...draft, detail_table: value })}
                  >
                    <SelectTrigger id="et-detail">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DETAIL_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choosing &quot;Artist lineup&quot; makes events of this type show the artist
                    picker and lineup.
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-md border border-border p-3">
                  <div>
                    <Label htmlFor="et-active">Active</Label>
                    <p className="text-xs text-muted-foreground">
                      Inactive types stay on existing events but can&apos;t be chosen for new ones.
                    </p>
                  </div>
                  <Switch
                    id="et-active"
                    checked={draft.is_active}
                    onCheckedChange={(checked) => setDraft({ ...draft, is_active: checked })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={closeEditor} disabled={isPending}>
                  Cancel
                </Button>
                <Button
                  onClick={saveDraft}
                  disabled={isPending || !draft.name.trim() || colorConflict}
                >
                  {isCreating ? "Create event type" : "Save changes"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => (open ? null : setPendingDelete(null))}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {pendingDelete?.name}?</DialogTitle>
            <DialogDescription>
              {pendingDelete && pendingDelete.usage > 0
                ? `This type is used by ${pendingDelete.usage} event${
                    pendingDelete.usage === 1 ? "" : "s"
                  }. Reassign or remove those events first, or mark it inactive instead.`
                : "This permanently removes the event type. This can't be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isPending || (pendingDelete?.usage ?? 0) > 0}
              onClick={() => {
                if (!pendingDelete) return
                const target = pendingDelete
                run("Event type deleted.", async () => {
                  const result = normalizeActionResult(await deleteEventType(target.id))
                  if (result.ok) setPendingDelete(null)
                  return result
                })
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
