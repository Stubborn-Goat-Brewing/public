"use server"

import { getAdminSession } from "@/lib/admin/guard"

const UNAUTHORIZED = "Your session expired. Sign in again."
const MIN_PASSWORD_LENGTH = 10

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
