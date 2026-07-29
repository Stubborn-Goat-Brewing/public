"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Fingerprint, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { deletePasskey, type PasskeyListItem } from "@/app/admin/settings/actions"
import { normalizeActionResult } from "@/lib/admin/action-result"

interface PasskeySectionProps {
  passkeys: PasskeyListItem[]
  /** False when the Supabase project has the experimental passkey flag off. */
  enabled: boolean
}

function formatDate(value?: string) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function PasskeySection({ passkeys, enabled }: PasskeySectionProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [enrolling, setEnrolling] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<PasskeyListItem | null>(null)

  async function handleEnroll() {
    setEnrolling(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.registerPasskey()

      if (error) {
        // Dismissing the OS prompt is a deliberate choice, not a failure worth
        // showing as an error.
        const name = (error as { name?: string }).name
        if (name === "NotAllowedError" || name === "AbortError") return
        console.log("[v0] passkey enrollment failed:", error.message)
        toast.error(error.message || "Could not add that passkey.")
        return
      }

      toast.success("Passkey added.")
      router.refresh()
    } finally {
      setEnrolling(false)
    }
  }

  function confirmDelete() {
    if (!pendingDelete) return
    const target = pendingDelete

    startTransition(async () => {
      const result = normalizeActionResult(await deletePasskey(target.id))
      if (result.ok) {
        setPendingDelete(null)
        toast.success("Passkey removed.")
        router.refresh()
      } else {
        toast.error(result.error ?? "Something went wrong.")
      }
    })
  }

  if (!enabled) {
    return (
      <div className="flex flex-col gap-3 rounded-md border border-dashed border-border p-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Passkeys are turned off for this Supabase project. Enable them under{" "}
          <span className="font-medium text-foreground">
            Authentication &rarr; Sign In / Providers &rarr; Passkeys
          </span>{" "}
          in the Supabase dashboard, then reload this page to add one.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {passkeys.length === 0 ? (
        <p className="text-sm text-muted-foreground leading-relaxed">
          No passkeys yet. Add one to sign in with Face ID, Touch ID, or your device PIN instead of
          typing a password.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
          {passkeys.map((passkey) => {
            const added = formatDate(passkey.created_at)
            const lastUsed = formatDate(passkey.last_used_at)

            return (
              <li key={passkey.id} className="flex items-center justify-between gap-4 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Fingerprint
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">
                      {passkey.friendly_name?.trim() || "Passkey"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {added ? `Added ${added}` : "Added recently"}
                      {lastUsed ? ` \u00b7 last used ${lastUsed}` : " \u00b7 never used"}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPendingDelete(passkey)}
                  disabled={isPending}
                  aria-label={`Remove ${passkey.friendly_name?.trim() || "passkey"}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </li>
            )
          })}
        </ul>
      )}

      <Button
        type="button"
        variant="outline"
        className="w-fit"
        onClick={handleEnroll}
        disabled={enrolling || isPending}
      >
        {enrolling ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Fingerprint className="mr-2 h-4 w-4" aria-hidden="true" />
        )}
        Add a passkey
      </Button>

      <Dialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove this passkey?</DialogTitle>
            <DialogDescription>
              {passkeys.length === 1
                ? "This is your only passkey, so you will need your email and password to sign in afterwards."
                : "That device will no longer be able to sign in with a passkey. Your password still works."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)} disabled={isPending}>
              Keep it
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              Remove passkey
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
