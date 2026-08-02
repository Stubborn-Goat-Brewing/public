"use client"

import { useState, useTransition } from "react"
import { useSearchParams } from "next/navigation"
import { Fingerprint, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { signInWithPassword } from "./actions"

const NOT_AUTHORIZED = "This account does not have admin access."

export function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/admin/events"

  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "not_authorized" ? NOT_AUTHORIZED : null,
  )
  const [isPending, startTransition] = useTransition()
  const [passkeyBusy, setPasskeyBusy] = useState(false)

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await signInWithPassword(formData)
      if (result?.error) {
        setError(result.error)
        return
      }
      // Session cookie is now set server-side. Use a full page navigation so
      // the middleware runs with the new cookie and the RSC cache is fully
      // cleared — router.replace() + router.refresh() can race and silently
      // cancel each other in Next.js 16.
      if (result?.redirect) {
        window.location.href = result.redirect
      }
    })
  }

  async function handlePasskey() {
    setError(null)
    setPasskeyBusy(true)
    try {
      const supabase = createClient()
      const { error: passkeyError } = await supabase.auth.signInWithPasskey()

      if (passkeyError) {
        // A cancelled WebAuthn prompt is a normal user action, not an error.
        const name = (passkeyError as { name?: string }).name
        if (name === "NotAllowedError" || name === "AbortError") return
        console.log("[v0] passkey sign-in failed:", passkeyError.message)
        setError("Passkey sign-in failed. Use your email and password instead.")
        return
      }

      // Confirm admin membership before navigating; a valid Supabase session is
      // not by itself authorization.
      const { data: adminRow } = await supabase.from("admin_users").select("user_id").maybeSingle()
      if (!adminRow) {
        await supabase.auth.signOut()
        setError(NOT_AUTHORIZED)
        return
      }

      // Full navigation so the freshly-set session cookie is sent with the
      // next request and the middleware can route the admin onward.
      window.location.href = next
    } finally {
      setPasskeyBusy(false)
    }
  }

  const busy = isPending || passkeyBusy

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="next" value={next} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username webauthn"
              required
              disabled={busy}
              placeholder="you@stubborngoatbrewing.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password webauthn"
              required
              disabled={busy}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={busy}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            Sign in
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs uppercase tracking-wide text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handlePasskey}
          disabled={busy}
        >
          {passkeyBusy ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Fingerprint className="mr-2 h-4 w-4" aria-hidden="true" />
          )}
          Sign in with a passkey
        </Button>

        <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
          Passkeys must be added from Settings after signing in with your password.
        </p>
      </CardContent>
    </Card>
  )
}
