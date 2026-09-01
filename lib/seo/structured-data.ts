import type { CalendarEvent } from "@/lib/events/types"
import { OPENING_HOURS } from "@/lib/hours"
import {
  BUSINESS,
  BUSINESS_IMAGE_PATH,
  LOGO_PATH,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SOCIAL_LINKS,
  absoluteUrl,
} from "@/lib/seo/site"

/** Stable @id for the business node so other schemas can reference it. */
const BUSINESS_ID = `${SITE_URL}/#business`

/**
 * LocalBusiness structured data for the taproom. Uses BarOrPub + Restaurant
 * since the venue serves both house-brewed beer and food, and hosts events.
 */
export function getBusinessJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": ["BarOrPub", "Restaurant"],
    "@id": BUSINESS_ID,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    image: absoluteUrl(BUSINESS_IMAGE_PATH),
    logo: absoluteUrl(LOGO_PATH),
    priceRange: "$$",
    servesCuisine: ["American", "Pub Food"],
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.streetAddress,
      addressLocality: BUSINESS.addressLocality,
      addressRegion: BUSINESS.addressRegion,
      postalCode: BUSINESS.postalCode,
      addressCountry: BUSINESS.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS.latitude,
      longitude: BUSINESS.longitude,
    },
    openingHoursSpecification: OPENING_HOURS.map((spec) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: spec.days,
      opens: spec.opens,
      closes: spec.closes,
    })),
    // Links the venue to its menu so Google can associate the two and surface
    // the "View menu" action in the Business Profile / knowledge panel.
    hasMenu: `${SITE_URL}/menu#menu`,
    sameAs: SOCIAL_LINKS,
  }
}

/** WebSite node, enabling site name display in search results. */
export function getWebSiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": BUSINESS_ID },
  }
}

/** Builds an ISO-ish local datetime, e.g. "2026-08-15T18:00". */
function toDateTime(date: string, time: string): string {
  return time ? `${date}T${time}` : date
}

/**
 * Event structured data for a single occurrence. Returns null for occurrences
 * that should not be surfaced (e.g. missing a name).
 *
 * `canonicalUrl` is the event's own detail page; when provided it is used for
 * schema.org `url` (preferred over the CTA link) and the share image.
 */
export function getEventJsonLd(
  event: CalendarEvent,
  canonicalUrl?: string,
): Record<string, unknown> | null {
  if (!event.name) return null

  const startDate = toDateTime(event.date, event.startTime)
  const endDate = event.endTime ? toDateTime(event.date, event.endTime) : undefined

  const performers = event.artists
    .filter((a) => a.name)
    .map((a) => ({ "@type": "PerformingGroup", name: a.name }))

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    startDate,
    ...(endDate ? { endDate } : {}),
    eventStatus: event.isCancelled
      ? "https://schema.org/EventCancelled"
      : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(event.description ? { description: event.description } : {}),
    // Prefer the event's own photo; otherwise fall back to its branded share
    // image so every event has a valid schema image for rich results.
    image: [event.imageUrl ?? (canonicalUrl ? `${canonicalUrl}/opengraph-image` : absoluteUrl(BUSINESS_IMAGE_PATH))],
    location: {
      "@type": "Place",
      // Events are always hosted at the brewery, so anchor the Place to the
      // venue (not the source data's free-text location string like "West Grove").
      name: SITE_NAME,
      address: {
        "@type": "PostalAddress",
        streetAddress: BUSINESS.streetAddress,
        addressLocality: BUSINESS.addressLocality,
        addressRegion: BUSINESS.addressRegion,
        postalCode: BUSINESS.postalCode,
        addressCountry: BUSINESS.addressCountry,
      },
    },
    ...(performers.length ? { performer: performers } : {}),
    organizer: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(canonicalUrl ? { url: canonicalUrl } : event.ctaUrl ? { url: event.ctaUrl } : {}),
    ...(event.ctaUrl ? { offers: { "@type": "Offer", url: event.ctaUrl, availability: "https://schema.org/InStock" } } : {}),
  }
}

/** ---- Menu structured data --------------------------------------------- */

interface MenuBeer {
  name: string
  style?: string
  abv?: number
  description?: string
  flagship?: boolean
}

interface MenuFoodOrDrinkItem {
  name: string
  description?: string
  price?: number
}

interface MenuSectionData {
  category: string
  items: MenuFoodOrDrinkItem[]
}

interface MenuKids {
  title?: string
  description?: string
  price?: number
  items: { name: string }[]
}

interface MenuData {
  beers?: MenuBeer[]
  food?: MenuSectionData[]
  drinks?: MenuSectionData[]
  kids?: MenuKids
}

/** A single MenuItem node, attaching an Offer only when a numeric price exists. */
function menuItem(
  name: string,
  description?: string,
  price?: number,
  suffix?: string,
): Record<string, unknown> {
  return {
    "@type": "MenuItem",
    name,
    ...(description ? { description: suffix ? `${description} ${suffix}` : description } : suffix ? { description: suffix } : {}),
    ...(typeof price === "number"
      ? { offers: { "@type": "Offer", price, priceCurrency: "USD" } }
      : {}),
  }
}

/**
 * Full restaurant Menu structured data (beers, food, drinks, kids), linked back
 * to the business node. Google uses this to understand offerings and power the
 * menu action; it is not rendered as a standalone "beer" rich result because no
 * such result type exists.
 */
export function getMenuJsonLd(menu: MenuData): Record<string, unknown> {
  const sections: Record<string, unknown>[] = []

  // Beers first, flagships on top, so the "on tap" lineup leads the menu.
  if (menu.beers?.length) {
    const beers = [...menu.beers].sort(
      (a, b) => (b.flagship ? 1 : 0) - (a.flagship ? 1 : 0),
    )
    sections.push({
      "@type": "MenuSection",
      name: "On Tap",
      hasMenuItem: beers.map((beer) => {
        const meta = [beer.style, typeof beer.abv === "number" ? `${beer.abv}% ABV` : null]
          .filter(Boolean)
          .join(" · ")
        return menuItem(beer.name, beer.description, undefined, meta ? `(${meta})` : undefined)
      }),
    })
  }

  for (const section of menu.food ?? []) {
    sections.push({
      "@type": "MenuSection",
      name: section.category,
      hasMenuItem: section.items.map((item) => menuItem(item.name, item.description, item.price)),
    })
  }

  for (const section of menu.drinks ?? []) {
    sections.push({
      "@type": "MenuSection",
      name: section.category,
      hasMenuItem: section.items.map((item) => menuItem(item.name, item.description, item.price)),
    })
  }

  if (menu.kids?.items?.length) {
    sections.push({
      "@type": "MenuSection",
      name: menu.kids.title ?? "Kids Menu",
      hasMenuItem: menu.kids.items.map((item) => menuItem(item.name, menu.kids?.description, menu.kids?.price)),
    })
  }

  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": `${SITE_URL}/menu#menu`,
    name: "Food & Drink Menu",
    url: `${SITE_URL}/menu`,
    inLanguage: "en-US",
    provider: { "@id": BUSINESS_ID },
    hasMenuSection: sections,
  }
}

/**
 * Builds Event structured data for upcoming, non-cancelled occurrences.
 * Deduplicates by occurrence and caps the count to keep the payload lean.
 */
export function getUpcomingEventsJsonLd(
  events: CalendarEvent[],
  limit = 30,
): Record<string, unknown>[] {
  const todayKey = new Date().toISOString().slice(0, 10)

  return events
    .filter((event) => event.date >= todayKey && !event.isCancelled)
    .slice(0, limit)
    .map((event) => getEventJsonLd(event))
    .filter((schema): schema is Record<string, unknown> => schema !== null)
}
