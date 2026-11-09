"use client"

import { useEffect, useState } from "react"
import { ChevronDown, Gift } from "lucide-react"

const GIFT_CARD_URL = "https://order.toasttab.com/egiftcards/stubborn-goat-brewing-122-rosehill-ave"

/** Last moment of the offer: end of day Dec 24, 2026, Eastern time. */
const PROMO_END = new Date("2026-12-25T00:00:00-05:00")
const MAX_TIMEOUT_MS = 2_147_483_647

/**
 * Holiday gift card promo shown directly beneath the site header. Pages are
 * statically rendered, so the banner is included in the HTML and hides itself
 * on the client once the offer has ended.
 */
export function GiftCardPromoBanner() {
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    const msRemaining = PROMO_END.getTime() - Date.now()
    if (msRemaining <= 0) {
      setIsActive(false)
      return
    }
    // setTimeout overflows past ~24.8 days, so only schedule once the deadline is within range.
    if (msRemaining > MAX_TIMEOUT_MS) return
    const timer = setTimeout(() => setIsActive(false), msRemaining)
    return () => clearTimeout(timer)
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
              <span className="font-bold">10% bonus voucher free</span>. Through Dec 24.
            </p>
            <details className="group text-xs">
              <summary className="mx-auto inline-flex w-fit cursor-pointer list-none items-center gap-1 rounded-sm font-semibold underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-promo-foreground md:mx-0 [&::-webkit-details-marker]:hidden">
                Details
                <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="mt-1 leading-relaxed text-promo-foreground/80 text-pretty">
                Bonus is a discount voucher, not a gift card, and is redeemable 12/25/26 through 3/30/27. All sales are
                final. Gift cards and bonus vouchers are redeemable at all Stubborn Goat Brewing locations.
              </p>
            </details>
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
