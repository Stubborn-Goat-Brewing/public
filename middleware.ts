import type { NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  /**
   * Scoped to /admin only. The public site (calendar, menu, home) is
   * anonymous and static-friendly, so running auth middleware there would add
   * a Supabase round trip to every page view for no benefit.
   */
  matcher: ["/admin", "/admin/:path*"],
}
