/**
 * Google's crawlers should not be served the 21+ age-verification interstitial.
 * Injecting the client-side modal for them shifts layout after hydration, which
 * Search Console flags as poor CLS and hurts indexing. Per Google's guidance we
 * detect their user agents server-side and skip the script entirely for them.
 *
 * We intentionally match only Google's indexing/inspection agents (not every
 * bot) so that regular visitors still get the legally-required age gate.
 */
const GOOGLE_CRAWLER_PATTERN = /(Googlebot|Google-InspectionTool)/i

export function isGoogleCrawler(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false
  return GOOGLE_CRAWLER_PATTERN.test(userAgent)
}
