"use client"

import { useMemo, useState, useTransition } from "react"
import { Check, GripVertical, Loader2, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { normalizeForCompare } from "@/lib/admin/slug"
import { createArtist } from "@/app/admin/artists/actions"

export type ArtistOption = {
  id: string
  name: string
  hometown: string | null
  is_active: boolean
}

/**
 * Search-and-add control for an event's lineup.
 *
 * Order matters: `event_artists.sort_order` drives the display order on the
 * public page, so the selected list is an ordered array rather than a set.
 */
export function ArtistPicker({
  artists,
  value,
  onChange,
}: {
  artists: ArtistOption[]
  value: string[]
  onChange: (ids: string[]) => void
}) {
  const [query, setQuery] = useState("")
  const [roster, setRoster] = useState(artists)
  const [isPending, startTransition] = useTransition()

  const byId = useMemo(() => new Map(roster.map((a) => [a.id, a])), [roster])
  const selected = value.map((id) => byId.get(id)).filter((a): a is ArtistOption => Boolean(a))

  const needle = query.trim()
  const matches = useMemo(() => {
    if (!needle) return []
    const n = normalizeForCompare(needle)
    return roster
      .filter((a) => !value.includes(a.id) && normalizeForCompare(a.name).includes(n))
      .slice(0, 6)
  }, [needle, roster, value])

  // Only offer "create" when nothing on the roster already matches by the same
  // normalization the server uses, so the button can't create a duplicate.
  const exactExists = useMemo(() => {
    if (!needle) return false
    const n = normalizeForCompare(needle)
    return roster.some((a) => normalizeForCompare(a.name) === n)
  }, [needle, roster])

  function add(id: string) {
    if (value.includes(id)) return
    onChange([...value, id])
    setQuery("")
  }

  function remove(id: string) {
    onChange(value.filter((v) => v !== id))
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= value.length) return
    const next = [...value]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  function handleCreate() {
    const name = needle
    if (!name) return

    startTransition(async () => {
      const result = await createArtist({ name })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      const artist = result.artist
      // The action returns an existing row when the name already matched, so
      // guard against inserting a duplicate into the local roster.
      setRoster((prev) =>
        prev.some((a) => a.id === artist.id)
          ? prev
          : [...prev, { id: artist.id, name: artist.name, hometown: null, is_active: true }],
      )
      if (!value.includes(artist.id)) onChange([...value, artist.id])
      setQuery("")
      toast.success(`${artist.name} added to the lineup.`)
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search or add an artist"
          aria-label="Search or add an artist"
          onKeyDown={(e) => {
            // Don't submit the parent form, and skip while a CJK IME is
            // still composing the text.
            if (e.key !== "Enter") return
            if (e.nativeEvent.isComposing || e.keyCode === 229) return
            e.preventDefault()
            if (matches.length > 0) add(matches[0].id)
            else if (needle && !exactExists) handleCreate()
          }}
        />
        {needle && !exactExists && (
          <Button type="button" variant="outline" onClick={handleCreate} disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
            )}
            Add new
          </Button>
        )}
      </div>

      {matches.length > 0 && (
        <ul className="flex flex-col overflow-hidden rounded-md border border-border">
          {matches.map((artist) => (
            <li key={artist.id}>
              <button
                type="button"
                onClick={() => add(artist.id)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <span className="font-medium text-foreground">{artist.name}</span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  {artist.hometown}
                  {!artist.is_active && <Badge variant="outline">Inactive</Badge>}
                  <Check className="h-4 w-4" aria-hidden="true" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {needle && matches.length === 0 && exactExists && (
        <p className="text-sm text-muted-foreground">Already on this lineup.</p>
      )}

      {selected.length === 0 ? (
        <p className="text-sm text-muted-foreground">No artists on this event yet.</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {selected.map((artist, index) => (
            <li
              key={artist.id}
              className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2"
            >
              <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="flex-1 text-sm font-medium text-foreground">
                {artist.name}
                {index === 0 && selected.length > 1 && (
                  <Badge variant="secondary" className="ml-2 font-normal">
                    Headliner
                  </Badge>
                )}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <span aria-hidden="true">↑</span>
                  <span className="sr-only">{`Move ${artist.name} up`}</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={index === selected.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <span aria-hidden="true">↓</span>
                  <span className="sr-only">{`Move ${artist.name} down`}</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => remove(artist.id)}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">{`Remove ${artist.name}`}</span>
                </Button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
