"use client"

import Script from "next/script"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

// Pixel IDs are public (they ship in the client bundle either way), so a
// hardcoded default is safe. The env var lets you rotate it without a deploy.
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "987195044390816"

export function MetaPixel() {
  const pathname = usePathname()
  const initialized = useRef(false)

  useEffect(() => {
    // The inline snippet already fires the first PageView on load, so skip the
    // initial render here to avoid double-counting, then track every
    // subsequent client-side navigation (App Router doesn't reload the page).
    if (!initialized.current) {
      initialized.current = true
      return
    }
    window.fbq?.("track", "PageView")
  }, [pathname])

  if (!PIXEL_ID) return null

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}
