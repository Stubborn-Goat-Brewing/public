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
 */
function getEventJsonLd(event: CalendarEvent): Record<string, unknown> | null {
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
    ...(event.imageUrl ? { image: [event.imageUrl] } : {}),
    location: {
      "@type": "Place",
      name: event.location || SITE_NAME,
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
    ...(event.ctaUrl ? { url: event.ctaUrl } : {}),
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
    .map(getEventJsonLd)
    .filter((schema): schema is Record<string, unknown> => schema !== null)
}
