"use client"

import type { MouseEvent } from "react"
import { Facebook, Globe, Instagram, Link2, Music2, Youtube } from "lucide-react"
import { cn } from "@/lib/utils"

export type SocialLink = { label: string; url: string }

/** Picks a lucide icon for a social platform label; falls back to a link icon. */
function iconFor(label: string) {
  const key = label.toLowerCase()
  if (key.includes("instagram")) return Instagram
  if (key.includes("facebook")) return Facebook
  if (key.includes("youtube")) return Youtube
  if (key.includes("website")) return Globe
  if (
    key.includes("spotify") ||
    key.includes("apple music") ||
    key.includes("soundcloud") ||
    key.includes("tiktok") ||
    key.includes("bandcamp")
  ) {
    return Music2
  }
  return Link2
}

/**
 * Opens external links reliably even inside the sandboxed v0 preview iframe.
 *
 * A plain `target="_blank"` anchor inside a sandboxed iframe can be blocked by
 * the browser and render an error page in the new tab. When we detect that the
 * app is running inside an iframe, we intercept the click and open the URL via
 * `window.open` from script instead, which avoids that failure. On the deployed
 * (top-level) site the anchor's native `target="_blank"` handles it.
 */
function handleExternalClick(event: MouseEvent<HTMLAnchorElement>, url: string) {
  if (typeof window === "undefined") return
  const inIframe = window.self !== window.top
  if (inIframe) {
    event.preventDefault()
    window.open(url, "_blank", "noopener,noreferrer")
  }
}

/**
 * Renders a list of external social links with matching icons.
 *
 * - `variant="pill"` renders rounded, bordered buttons (used on the event page).
 * - `variant="inline"` renders compact text links (used in the event dialog).
 */
export function SocialLinks({
  links,
  variant = "pill",
  className,
}: {
  links: SocialLink[]
  variant?: "pill" | "inline"
  className?: string
}) {
  if (links.length === 0) return null

  return (
    <div className={cn("flex flex-wrap", variant === "pill" ? "gap-2" : "gap-3", className)}>
      {links.map(({ label, url }) => {
        const Icon = iconFor(label)
        return (
          <a
            key={`${label}-${url}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => handleExternalClick(event, url)}
            className={cn(
              "inline-flex items-center transition-colors",
              variant === "pill"
                ? "gap-1.5 rounded-full border px-3 py-1 text-sm text-muted-foreground hover:border-primary hover:text-primary"
                : "gap-1 text-xs text-primary hover:underline capitalize",
            )}
          >
            <Icon className={variant === "pill" ? "h-3.5 w-3.5" : "h-3 w-3"} />
            {label}
          </a>
        )
      })}
    </div>
  )
}
