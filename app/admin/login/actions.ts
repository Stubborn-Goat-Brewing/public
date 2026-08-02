"use server"

import { redirect } from "next/navigation"
import { createSessionClient } from "@/lib/supabase/session"

export interface LoginResult {
  error: string
}

/** Only allow relative in-app paths, so `?next=` cannot be used as an open redirect. */
function safeNext(next: string | null): string {
  if (!next) return "/admin/events"
  if (!next.startsWith("/") || next.startsWith("//")) return "/admin/events"
  return next
}

/**
 * Signs an admin in with email + password.
 *
 * Runs as a server action rather than calling Supabase from the browser so the
 * raw auth error never reaches the client (generic copy alone is not enough -
 * a browser-side call leaves the real reason in the network response, which
 * enables account enumeration). Detail is logged server-side instead.
 */
export async function signInWithPassword(formData: FormData): Promise<LoginResult> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const next = safeNext(formData.get("next") as string | null)

  if (!email || !password) {
    return { error: "Enter your email and password." }
  }

  const supabase = await createSessionClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.log("[v0] admin sign-in failed:", error.code ?? error.name, error.message)

    // Genericize the credential/existence signal, but pass through states the
    // user must actually act on - collapsing everything into "invalid
    // credentials" makes an unconfirmed email look like a wrong password.
    if (error.code === "email_not_confirmed") {
      return { error: "This account's email is not confirmed yet." }
    }
    if (error.code === "over_request_rate_limit" || error.status === 429) {
      return { error: "Too many attempts. Wait a minute and try again." }
    }
    if (error.code === "invalid_credentials" || error.status === 400) {
      return { error: "Invalid email or password." }
    }
    return { error: "Something went wrong signing in. Please try again." }
  }

  // Authenticated - but is this user actually an admin?
  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle()

  if (!adminRow) {
    await supabase.auth.signOut()
    return { error: "This account does not have admin access." }
  }

  redirect(next)
}

export async function signOut(): Promise<void> {
  const supabase = await createSessionClient()
  await supabase.auth.signOut()
  redirect("/admin/login")
}
