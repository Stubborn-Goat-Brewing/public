"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  MoreHorizontal,
  Pencil,
  Repeat,
  Search,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { describeSchedule } from "@/lib/admin/schedule-summary"
import type { AdminEventRow } from "./page"
import { deleteEvent, duplicateEvent, setEventCancelled, setEventPublished } from "./actions"

type Filter = "all" | "recurring" | "one_time" | "drafts"

export function EventsTable({
  events,
  scope,
  page,
  totalPages,
  total,
}: {
  events: AdminEventRow[]
  scope: "upcoming" | "past"
  page: number
  totalPages: number
  total: number
}) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Filter>("all")
  const [pendingDelete, setPendingDelete] = useState<AdminEventRow | null>(null)
  const [isPending, startTransition] = useTransition()

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()

    return events.filter((event) => {
      if (filter === "recurring" && event.occurrence_type !== "recurring") return false
      if (filter === "one_time" && event.occurrence_type === "recurring") return false
      if (filter === "drafts" && event.is_published) return false

      if (!needle) return true
      return (
        event.title.toLowerCase().includes(needle) ||
        (event.event_types?.name ?? "").toLowerCase().includes(needle)
      )
    })
  }, [events, query, filter])

  function run(label: string, fn: () => Promise<{ ok: boolean; error?: string }>) {
    startTransition(async () => {
      const result = await fn()
      if (result.ok) {
        toast.success(label)
        router.refresh()
      } else {
        toast.error(result.error ?? "Something went wrong.")
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events"
            className="pl-9"
            aria-label="Search events by title or type"
          />
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="recurring">Recurring</TabsTrigger>
            <TabsTrigger value="one_time">One-time</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Scope changes the DB query, so these are links rather than local state. */}
        <Tabs value={scope}>
          <TabsList>
            <TabsTrigger value="upcoming" asChild>
              <Link href="/admin/events?scope=upcoming">Upcoming</Link>
            </TabsTrigger>
            <TabsTrigger value="past" asChild>
              <Link href="/admin/events?scope=past">Past</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <p className="text-sm text-muted-foreground">
        {query.trim() || filter !== "all"
          ? `${visible.length} shown of ${events.length} on this page`
          : `${total} ${scope} event${total === 1 ? "" : "s"}`}
        {query.trim() && " · search covers this page only"}
      </p>

      <div className="rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead className="hidden md:table-cell">Schedule</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead>Live</TableHead>
              <TableHead className="w-[52px]">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  {events.length === 0
                    ? "No events yet. Create your first one to get started."
                    : "No events match those filters."}
                </TableCell>
              </TableRow>
            ) : (
              visible.map((event) => (
                <TableRow key={event.id} className={event.is_published ? undefined : "bg-muted/30"}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        {event.title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {event.occurrence_type === "recurring" && (
                          <Badge variant="secondary" className="gap-1">
                            <Repeat className="h-3 w-3" aria-hidden="true" />
                            Recurring
                          </Badge>
                        )}
                        {!event.is_published && <Badge variant="outline">Draft</Badge>}
                        {event.is_featured && <Badge variant="secondary">Featured</Badge>}
                        {event.is_cancelled && <Badge variant="destructive">Cancelled</Badge>}
                      </div>
                      <span className="text-xs text-muted-foreground md:hidden">
                        {describeSchedule(event)}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {describeSchedule(event)}
                  </TableCell>

                  <TableCell className="hidden sm:table-cell">
                    {event.event_types && (
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: event.event_types.color_hex,
                          color: event.event_types.text_color_hex,
                        }}
                      >
                        {event.event_types.name}
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`publish-${event.id}`}
                        checked={event.is_published}
                        disabled={isPending}
                        onCheckedChange={(checked) =>
                          run(checked ? "Event published." : "Event moved to drafts.", () =>
                            setEventPublished(event.id, checked),
                          )
                        }
                      />
                      <Label htmlFor={`publish-${event.id}`} className="sr-only">
                        {`Publish ${event.title}`}
                      </Label>
                    </div>
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">{`Actions for ${event.title}`}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/events/${event.id}`}>
                            <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            run("Event duplicated as a draft.", () => duplicateEvent(event.id))
                          }
                        >
                          <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            run(
                              event.is_cancelled ? "Event restored." : "Event marked cancelled.",
                              () => setEventCancelled(event.id, !event.is_cancelled),
                            )
                          }
                        >
                          <Repeat className="mr-2 h-4 w-4" aria-hidden="true" />
                          {event.is_cancelled ? "Un-cancel" : "Mark cancelled"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setPendingDelete(event)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild disabled={page <= 1}>
              <Link
                href={`/admin/events?scope=${scope}&page=${page - 1}`}
                aria-disabled={page <= 1}
                className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
              >
                <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                Previous
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild disabled={page >= totalPages}>
              <Link
                href={`/admin/events?scope=${scope}&page=${page + 1}`}
                aria-disabled={page >= totalPages}
                className={page >= totalPages ? "pointer-events-none opacity-50" : undefined}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      <Dialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this event?</DialogTitle>
            <DialogDescription>
              {pendingDelete
                ? `"${pendingDelete.title}" will be removed from the calendar permanently. To hide it temporarily instead, turn off Live.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)} disabled={isPending}>
              Keep event
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => {
                const target = pendingDelete
                if (!target) return
                setPendingDelete(null)
                run("Event deleted.", () => deleteEvent(target.id))
              }}
            >
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
