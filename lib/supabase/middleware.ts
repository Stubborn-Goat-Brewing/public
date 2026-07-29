import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

/** Paths under /admin that an unauthenticated visitor may reach. */
const PUBLIC_ADMIN_PATHS = ["/admin/login"]

/**
 * Refreshes the Supabase session cookie and gates the /admin area.
 *
 * This is a first line of defence for UX (redirecting to login), NOT the
 * security boundary: middleware only checks that a session exists, because
 * querying admin membership on every request would add a round trip to each
 * navigation. Actual authorization is enforced by `requireAdmin()` in every
 * admin page/action and by the `is_admin()` RLS policies in Postgres.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return response

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  // getUser() (not getSession()) so the token is verified with the auth server
  // rather than trusted from the cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname, search } = request.nextUrl
  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/")
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )

  if (isAdminArea && !isPublicAdminPath && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/admin/login"
    redirectUrl.search = ""
    // Preserve where they were heading so login can send them back.
    redirectUrl.searchParams.set("next", `${pathname}${search}`)
    return NextResponse.redirect(redirectUrl)
  }

  // Already signed in and sitting on the login page - send them inside.
  if (user && pathname === "/admin/login") {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/admin/events"
    redirectUrl.search = ""
    return NextResponse.redirect(redirectUrl)
  }

  return response
}
