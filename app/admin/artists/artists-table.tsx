"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ExternalLink, MoreHorizontal, Pencil, Search, Trash2 } from "lucide-react"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { AdminArtistRow } from "./page"
import { deleteArtist, setArtistActive, updateArtist } from "./actions"
import { normalizeActionResult } from "@/lib/admin/action-result"

type Draft = {
  name: string
  hometown: string
  website_url: string
  description: string
  image_url: string
  is_active: boolean
}

function toDraft(artist: AdminArtistRow): Draft {
  return {
    name: artist.name,
    hometown: artist.hometown ?? "",
    website_url: artist.website_url ?? "",
    description: artist.description ?? "",
    image_url: artist.image_url ?? "",
    is_active: artist.is_active,
  }
}

export function ArtistsTable({ artists }: { artists: AdminArtistRow[] }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [editing, setEditing] = useState<AdminArtistRow | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [pendingDelete, setPendingDelete] = useState<AdminArtistRow | null>(null)
  const [isPending, startTransition] = useTransition()

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return artists
    return artists.filter(
      (a) =>
        a.name.toLowerCase().includes(needle) ||
        (a.hometown ?? "").toLowerCase().includes(needle),
    )
  }, [artists, query])

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

  function openEditor(artist: AdminArtistRow) {
    setEditing(artist)
    setDraft(toDraft(artist))
  }

  function closeEditor() {
    setEditing(null)
    setDraft(null)
  }

  function saveEditor() {
    if (!editing || !draft) return
    if (!draft.name.trim()) {
      toast.error("Enter the artist's name.")
      return
    }
    const target = editing
    startTransition(async () => {
      const result = normalizeActionResult(await updateArtist({ id: target.id, ...draft }))
      if (result.ok) {
        toast.success("Artist updated.")
        closeEditor()
        router.refresh()
      } else {
        toast.error(result.error ?? "Could not save the artist.")
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-sm">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search artists"
          className="pl-9"
          aria-label="Search artists by name or hometown"
        />
      </div>

      <p className="text-sm text-muted-foreground">
        {query.trim()
          ? `${visible.length} of ${artists.length} artists`
          : `${artists.length} artist${artists.length === 1 ? "" : "s"} on the roster`}
      </p>

      <div className="rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Artist</TableHead>
              <TableHead className="hidden sm:table-cell">Hometown</TableHead>
              <TableHead className="hidden md:table-cell">Events</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="w-[52px]">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  {artists.length === 0
                    ? "No artists yet. Add one while booking a live music event."
                    : "No artists match that search."}
                </TableCell>
              </TableRow>
            ) : (
              visible.map((artist) => (
                <TableRow key={artist.id} className={artist.is_active ? undefined : "bg-muted/30"}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => openEditor(artist)}
                        className="w-fit text-left font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        {artist.name}
                      </button>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {!artist.is_active && <Badge variant="outline">Inactive</Badge>}
                        {artist.website_url && (
                          <a
                            href={artist.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                          >
                            Website
                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          </a>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground sm:hidden">
                        {artist.hometown ?? "No hometown"}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                    {artist.hometown ?? "—"}
                  </TableCell>

                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {artist.bookings}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`active-${artist.id}`}
                        checked={artist.is_active}
                        disabled={isPending}
                        onCheckedChange={(checked) =>
                          run(checked ? "Artist reactivated." : "Artist marked inactive.", () =>
                            setArtistActive(artist.id, checked),
                          )
                        }
                      />
                      <Label htmlFor={`active-${artist.id}`} className="sr-only">
                        {artist.is_active
              ? `Mark ${artist.name} inactive`
              : `Mark ${artist.name} active`}
                      </Label>
                    </div>
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">{`Actions for ${artist.name}`}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditor(artist)}>
                          <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                          Edit details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setPendingDelete(artist)}
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

      <Dialog open={editing !== null} onOpenChange={(open) => !open && closeEditor()}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit artist</DialogTitle>
            <DialogDescription>
              These details show on the public event page when this artist is booked.
            </DialogDescription>
          </DialogHeader>

          {draft && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="artist-name">Name</Label>
                <Input
                  id="artist-name"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="artist-hometown">
                    Hometown <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="artist-hometown"
                    value={draft.hometown}
                    onChange={(e) => setDraft({ ...draft, hometown: e.target.value })}
                    placeholder="West Grove, PA"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="artist-website">
                    Website <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="artist-website"
                    value={draft.website_url}
                    onChange={(e) => setDraft({ ...draft, website_url: e.target.value })}
                    placeholder="https://"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="artist-image">
                  Image URL <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="artist-image"
                  value={draft.image_url}
                  onChange={(e) => setDraft({ ...draft, image_url: e.target.value })}
                  placeholder="https://"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="artist-description">
                  Bio <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="artist-description"
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <Label htmlFor="artist-active">Active</Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Inactive artists stay on past events but drop to the bottom when booking.
                  </p>
                </div>
                <Switch
                  id="artist-active"
                  checked={draft.is_active}
                  onCheckedChange={(checked) => setDraft({ ...draft, is_active: checked })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeEditor} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={saveEditor} disabled={isPending}>
              {isPending ? "Saving..." : "Save artist"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this artist?</DialogTitle>
            <DialogDescription>
              {pendingDelete
                ? pendingDelete.bookings > 0
                  ? `"${pendingDelete.name}" is booked on ${pendingDelete.bookings} event${
                      pendingDelete.bookings === 1 ? "" : "s"
                    }. Mark them inactive instead so those lineups stay intact.`
                  : `"${pendingDelete.name}" will be removed from the roster permanently.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingDelete(null)}
              disabled={isPending}
            >
              Keep artist
            </Button>
            <Button
              variant="destructive"
              disabled={isPending || (pendingDelete?.bookings ?? 0) > 0}
              onClick={() => {
                const target = pendingDelete
                if (!target) return
                setPendingDelete(null)
                run("Artist deleted.", () => deleteArtist(target.id))
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
