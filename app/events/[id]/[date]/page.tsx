import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Ban,
  Calendar,
  Clock,
  Facebook,
  Globe,
  Instagram,
  Link2,
  MapPin,
  Music2,
  Repeat,
  Youtube,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { JsonLd } from "@/components/seo/json-ld"
import { fetchEventOccurrence } from "@/lib/events/fetch"
import {
  eventPath,
  formatDateLong,
  formatTimeRange,
  getEventIcon,
  typeColorStyles,
} from "@/lib/events/format"
import { getEventJsonLd } from "@/lib/seo/structured-data"
import { SITE_NAME, SOCIAL_LINKS, absoluteUrl } from "@/lib/seo/site"

// Events are edited in the admin, so revalidate periodically rather than caching forever.
export const revalidate = 600

interface EventPageProps {
  params: { id: string; date: string }
}

/** Strips HTML tags and collapses whitespace for use in meta descriptions. */
function toPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
}

function truncate(text: string, max = 160): string {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1).trimEnd()}…`
}

/** Picks a lucide icon for a social platform label; falls back to a link icon. */
function SocialIcon({ label }: { label: string }) {
  const key = label.toLowerCase()
  const Icon = key.includes("instagram")
    ? Instagram
    : key.includes("facebook")
      ? Facebook
      : key.includes("youtube")
        ? Youtube
        : key.includes("website")
          ? Globe
          : key.includes("spotify") ||
              key.includes("apple music") ||
              key.includes("soundcloud") ||
              key.includes("tiktok")
            ? Music2
            : Link2
  return <Icon className="h-3.5 w-3.5" />
}

/** Derives a friendly platform label from a raw social profile URL. */
function labelFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "")
    if (host.includes("instagram")) return "Instagram"
    if (host.includes("facebook")) return "Facebook"
    if (host.includes("untappd")) return "Untappd"
    if (host.includes("google")) return "Google"
    if (host.includes("youtube")) return "YouTube"
    if (host.includes("tiktok")) return "TikTok"
    return host
  } catch {
    return url
  }
}

/** Renders a wrapping row of social links as labeled pill buttons. */
function SocialLinkList({ links }: { links: Array<{ label: string; url: string }> }) {
  if (links.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2">
      {links.map(({ label, url }) => (
        <a
          key={`${label}-${url}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <SocialIcon label={label} />
          {label}
        </a>
      ))}
    </div>
  )
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const event = await fetchEventOccurrence(params.id, params.date)

  if (!event) {
    return {
      title: "Event not found",
      robots: { index: false, follow: true },
    }
  }

  const path = eventPath(event.id, event.date)
  const dateLabel = formatDateLong(event.date)
  const description = event.description
    ? truncate(toPlainText(event.description))
    : `Join us for ${event.name} at ${SITE_NAME} on ${dateLabel}. ${formatTimeRange(event.startTime, event.endTime)}.`
  const socialTitle = `${event.name} | ${SITE_NAME}`

  return {
    title: event.name,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      locale: "en_US",
      siteName: SITE_NAME,
      url: path,
      title: socialTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
    },
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const event = await fetchEventOccurrence(params.id, params.date)

  if (!event) notFound()

  const Icon = getEventIcon(event.icon)
  const canonicalUrl = absoluteUrl(eventPath(event.id, event.date))
  const schema = getEventJsonLd(event, canonicalUrl)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {schema && <JsonLd data={schema} />}

      <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/goat-head-new.png"
              alt="Stubborn Goat Brewing Logo"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <span className="hidden font-bold sm:inline-block">Stubborn Goat Brewing</span>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link href="/menu" className="text-sm font-medium hover:underline underline-offset-4">
              Menu
            </Link>
            <Link href="/events" className="text-sm font-medium hover:underline underline-offset-4">
              Events
            </Link>
          </nav>
        </div>
      </header>

      <main className="container flex-1 py-8 md:py-12">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/events"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all events
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <div
              className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium"
              style={typeColorStyles(event.color)}
            >
              <Icon className="h-4 w-4" style={{ color: event.color }} />
              {event.type}
            </div>
            {event.isCancelled && (
              <div className="flex items-center gap-1 rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">
                <Ban className="h-3.5 w-3.5" />
                Cancelled
              </div>
            )}
            {event.isRecurring && (
              <div className="flex items-center gap-1 rounded-full border bg-muted px-3 py-1 text-sm text-muted-foreground">
                <Repeat className="h-3.5 w-3.5" />
                Recurring
              </div>
            )}
          </div>

          <h1 className="mt-4 text-pretty text-3xl font-bold leading-tight md:text-4xl">
            {event.name}
          </h1>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-5 w-5 flex-shrink-0" />
              {formatDateLong(event.date)}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-5 w-5 flex-shrink-0" />
              {formatTimeRange(event.startTime, event.endTime)}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5 flex-shrink-0" />
              {event.location || SITE_NAME}
            </div>
          </div>

          {event.description && (
            <div
              className="prose prose-neutral dark:prose-invert mt-8 max-w-none leading-relaxed [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-primary/80"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          )}

          {event.artists.length > 0 && (
            <section className="mt-8 space-y-4 border-t pt-6">
              <h2 className="text-lg font-semibold">
                {event.artists.length > 1 ? "Performing Artists" : "About the Artist"}
              </h2>
              {event.artists.map((artist) => (
                <div key={artist.id} className="flex gap-4">
                  {artist.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={artist.imageUrl || "/placeholder.svg"}
                      alt={artist.name}
                      className="h-20 w-20 flex-shrink-0 rounded-md object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{artist.name}</p>
                    {artist.hometown && (
                      <p className="text-sm text-muted-foreground">{artist.hometown}</p>
                    )}
                    {artist.genres.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {artist.genres.map((genre) => (
                          <span
                            key={genre}
                            className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}
                    {artist.description && (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {artist.description}
                      </p>
                    )}
                    {(() => {
                      const links = [
                        ...(artist.websiteUrl ? [{ label: "Website", url: artist.websiteUrl }] : []),
                        ...Object.entries(artist.socialLinks).map(([label, url]) => ({ label, url })),
                      ]
                      return links.length > 0 ? (
                        <div className="mt-3">
                          <SocialLinkList links={links} />
                        </div>
                      ) : null
                    })()}
                  </div>
                </div>
              ))}
            </section>
          )}

          {event.ctaUrl && (
            <Button asChild className="mt-8 w-full sm:w-auto">
              <a href={event.ctaUrl} target="_blank" rel="noopener noreferrer">
                {event.ctaLabel || "Learn More"}
              </a>
            </Button>
          )}

          <section className="mt-10 border-t pt-6">
            <h2 className="text-lg font-semibold">Follow {SITE_NAME}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Stay in the loop on upcoming events and what&apos;s on tap.
            </p>
            <div className="mt-3">
              <SocialLinkList links={SOCIAL_LINKS.map((url) => ({ label: labelFromUrl(url), url }))} />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
