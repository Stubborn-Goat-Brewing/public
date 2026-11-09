"use client"

import { useEffect, useState } from "react"
import { Gift } from "lucide-react"

const GIFT_CARD_URL = "https://order.toasttab.com/egiftcards/stubborn-goat-brewing-122-rosehill-ave"

/** Last moment of the offer: end of day Dec 24, 2026, Eastern time. */
const PROMO_END = new Date("2026-12-25T00:00:00-05:00")

/**
 * Holiday gift card promo shown directly beneath the site header. Pages are
 * statically rendered, so the banner is included in the HTML and hides itself
 * on the client once the offer has ended.
 */
export function GiftCardPromoBanner() {
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (Date.now() >= PROMO_END.getTime()) setIsActive(false)
  }, [])

  if (!isActive) return null

  return (
    <aside aria-label="Holiday gift card special" className="w-full bg-promo text-promo-foreground">
      <div className="container flex flex-col items-center gap-3 py-3 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex items-center gap-3">
          <Gift className="hidden h-6 w-6 shrink-0 sm:block" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <p className="text-sm leading-relaxed text-pretty md:text-base">
              <span className="font-bold">Holiday Gift Card Special:</span> Buy $50 or more in gift cards and receive a{" "}
              <span className="font-bold">10% bonus card free</span>. Through Dec 24.
            </p>
            <p className="text-xs leading-relaxed text-promo-foreground/80 text-pretty">
              All sales are final. Gift cards are redeemable at all Stubborn Goat Brewing locations.
            </p>
          </div>
        </div>

        <a
          href={GIFT_CARD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-promo-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-promo"
        >
          Buy Gift Cards
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </aside>
  )
}
