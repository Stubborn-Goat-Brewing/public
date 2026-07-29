import { redirect } from "next/navigation"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createSessionClient } from "@/lib/supabase/session"

export interface AdminSession {
  userId: string
  email: string
  supabase: SupabaseClient
}

/**
 * Authorization boundary for the admin area.
 *
 * Every admin page and server action must call this. Middleware only checks
 * that *a* session exists; this verifies the user is actually in
 * `admin_users`.
 *
 * Membership is read from the `admin_users` table rather than from
 * `user.user_metadata`, because user metadata is writable by the user
 * themselves via `supabase.auth.updateUser()` - a metadata `is_admin` flag
 * would be self-grantable by any signed-up user.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const supabase = createSessionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/admin/login")

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id, email")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!adminRow) {
    // Authenticated but not an admin. Sign them out so they are not stuck in a
    // redirect loop with a valid-but-useless session.
    await supabase.auth.signOut()
    redirect("/admin/login?error=not_authorized")
  }

  return {
    userId: user.id,
    email: user.email ?? adminRow.email,
    supabase,
  }
}

/**
 * Non-redirecting variant for server actions, which should return a typed error
 * instead of throwing a redirect mid-mutation.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = createSessionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id, email")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!adminRow) return null

  return { userId: user.id, email: user.email ?? adminRow.email, supabase }
}
