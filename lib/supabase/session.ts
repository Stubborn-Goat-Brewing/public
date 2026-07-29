import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Cookie-aware server Supabase client, for code that needs the signed-in admin's
 * identity (server components, server actions, route handlers).
 *
 * `lib/supabase/server.ts` stays the client for anonymous public-calendar reads;
 * this one carries the user session so RLS `auth.uid()` resolves and the
 * `is_admin()` policies apply.
 */
export function createSessionClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }

  const cookieStore = cookies()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        // Server components cannot mutate cookies. Middleware handles refresh,
        // so swallowing the failure here is safe rather than fatal.
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // called from a server component render - ignore
        }
      },
    },
  })
}

/**
 * Service-role client. Bypasses RLS entirely, so it must only ever be used from
 * server-side code paths that have already authorized the caller.
 *
 * Used for the two things the anon key genuinely cannot do: creating the first
 * admin account pre-confirmed, and reading admin membership during bootstrap.
 */
export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
