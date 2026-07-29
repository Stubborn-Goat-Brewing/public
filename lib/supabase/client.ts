"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Browser Supabase client for the admin portal.
 *
 * This is separate from `lib/supabase/server.ts`, which is a session-less anon
 * client used to read the public calendar. This one persists a session in
 * cookies so the admin stays signed in and middleware can refresh the token.
 *
 * Kept as a singleton: constructing multiple browser clients means multiple
 * auth listeners racing to refresh the same token, which intermittently signs
 * the user out.
 */
let cached: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  if (cached) return cached

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }

  cached = createBrowserClient(url, anonKey, {
    auth: {
      // The passkey API ships behind an experimental flag in supabase-js
      // 2.110.x; without this every passkey call throws before doing anything.
      experimental: { passkey: true },
    },
    cookieOptions: {
      // The Supabase session cookie must stay readable by the browser client,
      // so it cannot be HttpOnly. Marking it Secure in production keeps it off
      // plaintext connections at least.
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })

  return cached
}
