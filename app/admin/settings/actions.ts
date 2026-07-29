"use server"

import { revalidatePath } from "next/cache"
import { getAdminSession } from "@/lib/admin/guard"

const UNAUTHORIZED = "Your session expired. Sign in again."
const MIN_PASSWORD_LENGTH = 10

export interface PasskeyListItem {
  id: string
  friendly_name?: string
  created_at: string
  last_used_at?: string
}

/**
 * Passkey list/delete are not on the public supabase-js surface in 2.110.x -
 * they exist only as private `_listPasskeys` / `_deletePasskey` methods. Calling
 * a private method would break silently on any patch release, so we talk to the
 * documented REST endpoints directly with the caller's own access token.
 *
 * The token is the *user's* session token, never the service role key, so
 * GoTrue still scopes every response to that user.
 */
async function passkeyFetch(
  accessToken: string,
  path: string,
  init?: RequestInit,
): Promise<{ ok: boolean; status: number; body: unknown }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) throw new Error("Missing Supabase environment variables")

  const response = await fetch(`${url}/auth/v1${path}`, {
    ...init,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  })

  const text = await response.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
  }

  return { ok: response.ok, status: response.status, body }
}

export async function listPasskeys(): Promise<{
  ok: boolean
  passkeys: PasskeyListItem[]
  enabled: boolean
  error?: string
}> {
  const session = await getAdminSession()
  if (!session) return { ok: false, passkeys: [], enabled: false, error: UNAUTHORIZED }

  const {
    data: { session: authSession },
  } = await session.supabase.auth.getSession()
  if (!authSession) return { ok: false, passkeys: [], enabled: false, error: UNAUTHORIZED }

  const { ok, body } = await passkeyFetch(authSession.access_token, "/passkeys")

  if (!ok) {
    const code = (body as { error_code?: string } | null)?.error_code
    if (code === "passkey_disabled") {
      return { ok: true, passkeys: [], enabled: false }
    }
    const message = (body as { msg?: string } | null)?.msg
    return { ok: false, passkeys: [], enabled: true, error: message ?? "Could not load passkeys." }
  }

  // The endpoint has returned both a bare array and a wrapped object across
  // releases; accept either rather than crashing on the shape.
  const raw = Array.isArray(body) ? body : ((body as { passkeys?: unknown })?.passkeys ?? [])
  const passkeys = Array.isArray(raw) ? (raw as PasskeyListItem[]) : []

  return { ok: true, passkeys, enabled: true }
}

export async function deletePasskey(id: string): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession()
  if (!session) return { ok: false, error: UNAUTHORIZED }

  const {
    data: { session: authSession },
  } = await session.supabase.auth.getSession()
  if (!authSession) return { ok: false, error: UNAUTHORIZED }

  const { ok, body } = await passkeyFetch(
    authSession.access_token,
    `/passkeys/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  )

  if (!ok) {
    const message = (body as { msg?: string } | null)?.msg
    return { ok: false, error: message ?? "Could not remove that passkey." }
  }

  revalidatePath("/admin/settings")
  return { ok: true }
}

export async function changePassword(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const session = await getAdminSession()
  if (!session) return { ok: false, error: UNAUTHORIZED }

  const current = String(formData.get("current_password") ?? "")
  const next = String(formData.get("new_password") ?? "")
  const confirm = String(formData.get("confirm_password") ?? "")

  if (!current || !next) return { ok: false, error: "Fill in both password fields." }
  if (next.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, error: `Use at least ${MIN_PASSWORD_LENGTH} characters.` }
  }
  if (next !== confirm) return { ok: false, error: "The new passwords do not match." }
  if (next === current) return { ok: false, error: "That is already your current password." }

  // `updateUser` does not check the existing password, so anyone who reached a
  // logged-in tab could silently take over the account. Re-authenticating first
  // makes the current password genuinely required.
  const { error: reauthError } = await session.supabase.auth.signInWithPassword({
    email: session.email,
    password: current,
  })
  if (reauthError) return { ok: false, error: "That current password is not right." }

  const { error } = await session.supabase.auth.updateUser({ password: next })
  if (error) return { ok: false, error: error.message }

  return { ok: true }
}
