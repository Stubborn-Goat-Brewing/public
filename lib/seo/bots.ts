/**
 * Search-engine crawlers and social link-preview bots should not be served the
 * 21+ age-verification interstitial. Injecting the client-side modal for them
 * shifts layout after hydration, which Search Console flags as poor CLS and
 * hurts indexing, and it also breaks social link previews. Per Google's
 * guidance we detect these user agents server-side and skip the script entirely
 * for them.
 *
 * We intentionally match only known indexing / preview agents (not every bot)
 * so that regular visitors still get the legally-required age gate.
 */
const INDEXING_BOT_PATTERN =
  /(Googlebot|Google-InspectionTool|Google-Read-Aloud|AdsBot-Google|bingbot|DuckDuckBot|facebookexternalhit|Twitterbot|LinkedInBot)/i

export function isIndexingBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false
  return INDEXING_BOT_PATTERN.test(userAgent)
}
