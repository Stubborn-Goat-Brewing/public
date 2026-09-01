import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Server-side Supabase client for reading public content (the events calendar).
 *
 * The calendar tables are protected by RLS policies that allow anonymous SELECT
 * on published rows only, so the anon key is all we need here. There is no user
 * session involved, which keeps this independent of cookie handling.
 */
/**
 * @param options.cacheable When true, Supabase reads use Next's default fetch
 *   cache instead of `no-store`. Use this only for reads wrapped in
 *   `unstable_cache` (e.g. the homepage feed), where caching is intentional and
 *   admin edits revalidate via `revalidateTag`. Defaults to fresh (`no-store`)
 *   so the interactive calendar always reflects the latest data.
 */
export function createClient(options?: { cacheable?: boolean }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }

  return createSupabaseClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: options?.cacheable
      ? undefined
      : {
          // Next.js caches `fetch` responses by default, which would make the
          // calendar serve stale data after an event is edited in the database.
          // Opt every Supabase request out of that cache.
          fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
        },
  })
}
