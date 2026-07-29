import { redirect } from "next/navigation"

/**
 * `/admin` has no dashboard of its own - it is just the entry point admins
 * actually type or bookmark, so it forwards to the events list.
 *
 * This route must exist. Middleware bounces unauthenticated visitors to
 * `/admin/login?next=/admin`, and a successful sign-in sends them back to
 * whatever `next` held. Without a page here that round trip ended on a 404
 * immediately after a *successful* login, which looked like broken credentials.
 *
 * Authorization is left to `/admin/events` (and `requireAdmin()` there), so
 * this redirect costs no extra Supabase round trip.
 */
export default function AdminIndexPage() {
  redirect("/admin/events")
}
