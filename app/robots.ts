import type { MetadataRoute } from "next"
import { SITE_URL, absoluteUrl } from "@/lib/seo/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep private/admin and API surfaces out of search results.
      disallow: ["/admin", "/admin/", "/api/", "/auth/"],
    },
    host: SITE_URL,
    sitemap: absoluteUrl("/sitemap.xml"),
  }
}
