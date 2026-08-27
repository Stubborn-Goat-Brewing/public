import type React from "react"
import type { Metadata, Viewport } from "next"
import { headers } from "next/headers"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { GoogleAnalytics } from "@/components/google-analytics"
import { AgeVerification } from "@/components/age-verification"
import { JsonLd } from "@/components/seo/json-ld"
import { getBusinessJsonLd, getWebSiteJsonLd } from "@/lib/seo/structured-data"
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/seo/site"
import { isIndexingBot } from "@/lib/seo/bots"

const inter = Inter({ subsets: ["latin"] })

const TITLE = `${SITE_NAME} | ${SITE_TAGLINE}`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Stubborn Goat Brewing",
    "brewery West Grove PA",
    "craft beer West Grove",
    "taproom Chester County",
    "live music West Grove PA",
    "brewery near me",
    "PA craft beer",
    "family friendly brewery",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        type: "image/png",
        sizes: "32x32",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        type: "image/png",
        sizes: "32x32",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: [{ url: "/apple-icon.png" }],
  },
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#18181b",
  width: "device-width",
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Read the User-Agent server-side so search-engine crawlers and social
  // link-preview bots never receive the age-verification modal. This prevents
  // the layout shift (CLS) that Search Console flagged and keeps social
  // previews clean, while real visitors still see the age gate.
  const userAgent = (await headers()).get("user-agent")
  const skipAgeGate = isIndexingBot(userAgent)

  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth bg-background">
      <body className={inter.className}>
        <JsonLd data={[getBusinessJsonLd(), getWebSiteJsonLd()]} />
        <GoogleAnalytics />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {!skipAgeGate && <AgeVerification />}
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
