"use client"

import { useState, useTransition } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { signInWithPassword } from "./actions"

const NOT_AUTHORIZED = "This account does not have admin access."

export function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/admin/events"

  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "not_authorized" ? NOT_AUTHORIZED : null,
  )
  const [isPending, startTransition] = useTransition()

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
              autoComplete="username"
              required
              disabled={isPending}
              placeholder="you@stubborngoatbrewing.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={isPending}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            Sign in
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
