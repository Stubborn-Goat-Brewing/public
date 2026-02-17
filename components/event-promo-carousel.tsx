"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PromoSlide {
  src: string
  alt: string
  /** ISO date string (YYYY-MM-DD) for the day AFTER the event.
   *  The slide is hidden once the current date >= expiresOn. */
  expiresOn: string
}

const ALL_SLIDES: PromoSlide[] = [
  {
    src: "/images/promo-wing-tuesday.png",
    alt: "Happy Hour & Wing Tuesday - Feb 17 - $1 Wings, Happy Hour 4-6 PM",
    expiresOn: "2026-02-18",
  },
  {
    src: "/images/promo-burger-bingo.png",
    alt: "Burger Night + Bingo - Feb 18 - $5 Off Burgers, Happy Hour 4-6 PM, Bingo at 6:30 PM",
    expiresOn: "2026-02-19",
  },
  {
    src: "/images/promo-trivia-thursday.png",
    alt: "Happy Hour & Trivia Thursday - Feb 19 - Happy Hour 4-6 PM, Trivia at 7 PM",
    expiresOn: "2026-02-20",
  },
  {
    src: "/images/promo-live-music-adam.png",
    alt: "Live Music Night - Adam McCue - Friday Feb 20 at 6 PM",
    expiresOn: "2026-02-21",
  },
  {
    src: "/images/promo-groove-ksq.png",
    alt: "Groove KSQ All Star Band Live - Saturday Feb 21, 1 PM - 3 PM",
    expiresOn: "2026-02-22",
  },
  {
    src: "/images/promo-bonfire-acoustic.png",
    alt: "Live Music - Bonfire Acoustic - Saturday Feb 21 at 6:30 PM",
    expiresOn: "2026-02-22",
  },
  {
    src: "/images/promo-sinatra-brunch.png",
    alt: "Brunch with Sounds of Sinatra - Sunday Feb 22, 10:30 AM - 2:30 PM",
    expiresOn: "2026-02-23",
  },
]

const INTERVAL_MS = 10_000

export function EventPromoCarousel() {
  const [activeSlides, setActiveSlides] = useState<PromoSlide[]>([])
  const [current, setCurrent] = useState(0)

  // Filter out expired slides on mount (and every minute to stay fresh)
  useEffect(() => {
    function filterSlides() {
      const today = new Date().toISOString().slice(0, 10)
      setActiveSlides(ALL_SLIDES.filter((s) => today < s.expiresOn))
    }
    filterSlides()
    const id = setInterval(filterSlides, 60_000)
    return () => clearInterval(id)
  }, [])

  const count = activeSlides.length

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % count)
  }, [count])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + count) % count)
  }, [count])

  // Auto-advance every 10 seconds
  useEffect(() => {
    if (count <= 1) return
    const id = setInterval(next, INTERVAL_MS)
    return () => clearInterval(id)
  }, [next, count])

  // Reset index if it exceeds active slide count (e.g. a slide expired)
  useEffect(() => {
    if (count > 0 && current >= count) {
      setCurrent(0)
    }
  }, [count, current])

  if (count === 0) return null

  return (
    <div className="w-full bg-zinc-900/80 backdrop-blur-sm border-t border-white/10 py-4 md:py-6">
      <div className="container px-4">
        {/* Carousel viewport */}
        <div className="relative overflow-hidden rounded-lg">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {activeSlides.map((slide, i) => (
              <div key={slide.src} className="relative w-full flex-shrink-0">
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  width={960}
                  height={540}
                  priority={i === 0}
                  className="w-full h-auto rounded-lg"
                  sizes="(max-width: 640px) 95vw, (max-width: 1024px) 80vw, 960px"
                />
              </div>
            ))}
          </div>

          {/* Navigation arrows */}
          {count > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-4 w-4 md:h-6 md:w-6" />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Next slide"
              >
                <ChevronRight className="h-4 w-4 md:h-6 md:w-6" />
              </button>
            </>
          )}

          {/* Dot indicators */}
          {count > 1 && (
            <div className="absolute bottom-2 md:bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 md:gap-2">
              {activeSlides.map((slide, i) => (
                <button
                  key={slide.src}
                  onClick={() => setCurrent(i)}
                  className={`h-2 w-2 md:h-2.5 md:w-2.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    i === current ? "bg-white" : "bg-white/40 hover:bg-white/60"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
