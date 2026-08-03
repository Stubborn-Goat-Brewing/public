"use client"

import { useMemo, useRef, useState, useTransition } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ExternalLink, ImageIcon, MoreHorizontal, Pencil, Plus, Search, Trash2, Upload, X } from "lucide-react"
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
import { createArtistFull, deleteArtist, setArtistActive, updateArtist, uploadArtistImage } from "./actions"
import { normalizeActionResult } from "@/lib/admin/action-result"

type Draft = {
  name: string
  hometown: string
  website_url: string
  description: string
  image_url: string
  facebook_url: string
  instagram_url: string
  tiktok_url: string
  youtube_url: string
  apple_music_url: string
  spotify_url: string
  soundcloud_url: string
  is_active: boolean
}

function toDraft(artist: AdminArtistRow): Draft {
  return {
    name: artist.name,
    hometown: artist.hometown ?? "",
    website_url: artist.website_url ?? "",
    description: artist.description ?? "",
    image_url: artist.image_url ?? "",
    facebook_url: artist.facebook_url ?? "",
    instagram_url: artist.instagram_url ?? "",
    tiktok_url: artist.tiktok_url ?? "",
    youtube_url: artist.youtube_url ?? "",
    apple_music_url: artist.apple_music_url ?? "",
    spotify_url: artist.spotify_url ?? "",
    soundcloud_url: artist.soundcloud_url ?? "",
    is_active: artist.is_active,
  }
}

function emptyDraft(): Draft {
  return {
    name: "",
    hometown: "",
    website_url: "",
    description: "",
    image_url: "",
    facebook_url: "",
    instagram_url: "",
    tiktok_url: "",
    youtube_url: "",
    apple_music_url: "",
    spotify_url: "",
    soundcloud_url: "",
    is_active: true,
  }
}

export function ArtistsTable({ artists }: { artists: AdminArtistRow[] }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [editing, setEditing] = useState<AdminArtistRow | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [pendingDelete, setPendingDelete] = useState<AdminArtistRow | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleImageUpload(file: File) {
    if (!draft) return
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const result = await uploadArtistImage(formData)
      if (result.ok) {
        setDraft((current) => (current ? { ...current, image_url: result.url } : current))
        toast.success("Image uploaded.")
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Could not upload the image.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

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
    setIsCreating(false)
    setEditing(artist)
    setDraft(toDraft(artist))
  }

  function openCreate() {
    setIsCreating(true)
    setEditing(null)
    setDraft(emptyDraft())
  }

  function closeEditor() {
    setEditing(null)
    setIsCreating(false)
    setDraft(null)
  }

  function saveDraft() {
    if (!draft) return
    if (!draft.name.trim()) {
      toast.error("Enter the artist's name.")
      return
    }
    const target = editing
    startTransition(async () => {
      const result = normalizeActionResult(
        isCreating
          ? await createArtistFull(draft)
          : target
            ? await updateArtist({ id: target.id, ...draft })
            : undefined,
      )
      if (result.ok) {
        toast.success(isCreating ? "Artist added." : "Artist updated.")
        closeEditor()
        router.refresh()
      } else {
        toast.error(result.error ?? "Could not save the artist.")
      }
    })
  }

  const dialogOpen = isCreating || editing !== null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
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
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
          New artist
        </Button>
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
                    ? 'No artists yet. Use "New artist" to add one, or add them while booking a live music event.'
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

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeEditor()}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isCreating ? "New artist" : "Edit artist"}</DialogTitle>
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
                <Label>
                  Photo <span className="text-muted-foreground">(optional)</span>
                </Label>
                <div className="flex items-start gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                    {draft.image_url ? (
                      <Image
                        src={draft.image_url || "/placeholder.svg"}
                        alt="Artist photo preview"
                        fill
                        sizes="80px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) void handleImageUpload(file)
                      }}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                        {isUploading
                          ? "Uploading..."
                          : draft.image_url
                            ? "Replace photo"
                            : "Upload photo"}
                      </Button>
                      {draft.image_url && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isUploading}
                          onClick={() => setDraft({ ...draft, image_url: "" })}
                        >
                          <X className="mr-2 h-4 w-4" aria-hidden="true" />
                          Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">JPG, PNG, WebP, GIF, or AVIF up to 5MB.</p>
                  </div>
                </div>
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

              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium text-foreground">
                  Social media <span className="font-normal text-muted-foreground">(optional)</span>
                </span>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="artist-facebook" className="text-xs text-muted-foreground">
                    Facebook
                  </Label>
                  <Input
                    id="artist-facebook"
                    type="url"
                    inputMode="url"
                    value={draft.facebook_url}
                    onChange={(e) => setDraft({ ...draft, facebook_url: e.target.value })}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="artist-instagram" className="text-xs text-muted-foreground">
                    Instagram
                  </Label>
                  <Input
                    id="artist-instagram"
                    type="url"
                    inputMode="url"
                    value={draft.instagram_url}
                    onChange={(e) => setDraft({ ...draft, instagram_url: e.target.value })}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="artist-tiktok" className="text-xs text-muted-foreground">
                    TikTok
                  </Label>
                  <Input
                    id="artist-tiktok"
                    type="url"
                    inputMode="url"
                    value={draft.tiktok_url}
                    onChange={(e) => setDraft({ ...draft, tiktok_url: e.target.value })}
                    placeholder="https://tiktok.com/@..."
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="artist-youtube" className="text-xs text-muted-foreground">
                    YouTube
                  </Label>
                  <Input
                    id="artist-youtube"
                    type="url"
                    inputMode="url"
                    value={draft.youtube_url}
                    onChange={(e) => setDraft({ ...draft, youtube_url: e.target.value })}
                    placeholder="https://youtube.com/@..."
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="artist-apple-music" className="text-xs text-muted-foreground">
                    Apple Music
                  </Label>
                  <Input
                    id="artist-apple-music"
                    type="url"
                    inputMode="url"
                    value={draft.apple_music_url}
                    onChange={(e) => setDraft({ ...draft, apple_music_url: e.target.value })}
                    placeholder="https://music.apple.com/..."
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="artist-spotify" className="text-xs text-muted-foreground">
                    Spotify
                  </Label>
                  <Input
                    id="artist-spotify"
                    type="url"
                    inputMode="url"
                    value={draft.spotify_url}
                    onChange={(e) => setDraft({ ...draft, spotify_url: e.target.value })}
                    placeholder="https://open.spotify.com/artist/..."
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="artist-soundcloud" className="text-xs text-muted-foreground">
                    SoundCloud
                  </Label>
                  <Input
                    id="artist-soundcloud"
                    type="url"
                    inputMode="url"
                    value={draft.soundcloud_url}
                    onChange={(e) => setDraft({ ...draft, soundcloud_url: e.target.value })}
                    placeholder="https://soundcloud.com/..."
                  />
                </div>
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
            <Button onClick={saveDraft} disabled={isPending}>
              {isPending ? "Saving..." : isCreating ? "Add artist" : "Save artist"}
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
