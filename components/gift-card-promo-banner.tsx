"use client"

import { useEffect, useId, useState } from "react"
import { ChevronDown, Gift } from "lucide-react"

const GIFT_CARD_URL = "https://order.toasttab.com/egiftcards/stubborn-goat-brewing-122-rosehill-ave"

/** Last moment of the offer: end of day Dec 24, 2026, Eastern time. */
const PROMO_END = new Date("2026-12-25T00:00:00-05:00")

const FINE_PRINT = [
  "Bonus gift cards are good for 90 days following the end of the offer period.",
  "All sales are final.",
  "Gift cards are redeemable at all Stubborn Goat Brewing locations.",
]

/**
 * Holiday gift card promo shown directly beneath the site header. Pages are
 * statically rendered, so the banner is included in the HTML and hides itself
 * on the client once the offer has ended.
 */
export function GiftCardPromoBanner() {
  const [isActive, setIsActive] = useState(true)
  const [showDetails, setShowDetails] = useState(false)
  const detailsId = useId()

  useEffect(() => {
    if (Date.now() >= PROMO_END.getTime()) setIsActive(false)
  }, [])

  if (!isActive) return null

  return (
    <aside aria-label="Holiday gift card special" className="w-full bg-primary text-primary-foreground">
      <div className="container flex flex-col items-center gap-3 py-3 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex items-center gap-3">
          <Gift className="hidden h-6 w-6 shrink-0 sm:block" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-pretty md:text-base">
            <span className="font-bold">Holiday Gift Card Special:</span>{" "}
            Buy a $50, $100, $150, $200, $250, or $300 gift card and get a{" "}
            <span className="font-bold">10% bonus card free</span>. Through Dec 24.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <button
            type="button"
            onClick={() => setShowDetails((prev) => !prev)}
            aria-expanded={showDetails}
            aria-controls={detailsId}
            className="flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
          >
            Details
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showDetails ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
          <a
            href={GIFT_CARD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-primary-foreground px-4 py-2 text-sm font-semibold text-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            Buy Gift Cards
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>

      {showDetails && (
        <div id={detailsId} className="border-t border-primary-foreground/20">
          <ul className="container flex flex-col gap-1 py-3 text-sm leading-relaxed text-primary-foreground/90 md:flex-row md:gap-6">
            {FINE_PRINT.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
