/**
 * Slug and name-matching helpers for the admin roster.
 *
 * These live outside the server-action file on purpose: every export from a
 * `"use server"` module must be an async function, so plain synchronous
 * helpers have to be defined elsewhere.
 */

/**
 * Turns a display name into a URL-safe slug.
 *
 * `artists.slug` is NOT NULL with no default, so every insert must supply one.
 */
export function slugify(name: string): string {
  const base = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "")

  // A name made entirely of symbols would slugify to "", which would collide
  // with any other such name on the unique index.
  return base || `artist-${Date.now().toString(36)}`
}

/**
 * Normalized form used for duplicate detection.
 *
 * Drops a leading article, punctuation, spacing and case, so "The Bad Hats"
 * and "bad-hats" compare equal.
 */
export function normalizeForCompare(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/^(the|a|an)\s+/, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "")
}
