/**
 * Minimal server-side HTML sanitizer for admin-authored rich text.
 *
 * The event description WYSIWYG editor emits a small, fixed set of tags, but
 * this function is the real security boundary: the stored HTML is rendered
 * verbatim on public pages via `dangerouslySetInnerHTML`, so the incoming
 * markup is never trusted (a client could POST arbitrary HTML straight to the
 * server action).
 *
 * Strategy:
 *   1. Delete comments and dangerous element blocks (with their contents).
 *   2. Rebuild every remaining tag from scratch against an allowlist.
 *
 * Because each allowed tag is re-emitted with only the attributes we
 * explicitly permit, the original attribute string is discarded entirely - so
 * event handlers (`onclick=...`), `style`, and any other injection vector
 * cannot survive. Disallowed tags are stripped while their text is kept.
 */

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "a",
  "h3",
  "h4",
  "blockquote",
])

export function sanitizeHtml(input: string | null | undefined): string | null {
  if (!input) return null

  let html = input

  // 1. Strip comments and any element whose *content* must not be interpreted.
  html = html.replace(/<!--[\s\S]*?-->/g, "")
  html = html.replace(
    /<(script|style|iframe|object|embed|noscript|template)[\s\S]*?<\/\1\s*>/gi,
    "",
  )
  // Remove any orphaned open/close tags of those same elements.
  html = html.replace(
    /<\/?(script|style|iframe|object|embed|noscript|template)\b[^>]*>/gi,
    "",
  )

  // 2. Rebuild each tag from the allowlist; unknown tags are dropped but their
  //    inner text is preserved. When an <a> is dropped for an unsafe href, its
  //    matching </a> is dropped too so no orphan closing tag is left behind
  //    (anchors are never nested in this editor, so a simple counter suffices).
  let droppedAnchors = 0
  html = html.replace(
    /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g,
    (_match, slash: string, rawName: string, attrs: string) => {
      const name = rawName.toLowerCase()
      if (!ALLOWED_TAGS.has(name)) return ""
      if (slash) {
        if (name === "a" && droppedAnchors > 0) {
          droppedAnchors--
          return ""
        }
        return `</${name}>`
      }
      if (name === "a") {
        const href = extractHref(attrs)
        if (!href) {
          // A link with no safe href collapses to plain text.
          droppedAnchors++
          return ""
        }
        return `<a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer nofollow">`
      }
      return `<${name}>`
    },
  )

  const cleaned = html.trim()
  return cleaned.length > 0 ? cleaned : null
}

/** Pulls the first href out of a raw attribute string and validates its URL. */
function extractHref(attrs: string): string | null {
  const match = attrs.match(/href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i)
  if (!match) return null
  const raw = (match[2] ?? match[3] ?? match[4] ?? "").trim()
  return safeUrl(raw)
}

/** Allows only well-known safe URL schemes (or site-relative / anchor links). */
function safeUrl(url: string): string | null {
  if (!url) return null
  const decoded = url.replace(/&amp;/gi, "&")
  if (/[\u0000-\u001f]/.test(decoded)) return null
  if (/^\s*(javascript|data|vbscript|file):/i.test(decoded)) return null
  if (/^(https?:|mailto:|tel:)/i.test(decoded)) return decoded
  if (decoded.startsWith("/") || decoded.startsWith("#")) return decoded
  // Bare domain like "example.com/path" -> assume https.
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(decoded)) return `https://${decoded}`
  return null
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}
