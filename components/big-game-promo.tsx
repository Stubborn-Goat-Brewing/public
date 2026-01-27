"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Ticket, Clock, Gift } from "lucide-react"

export function BigGamePromo() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#1a472a] via-[#2d5a3d] to-[#1a472a]">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/big-game-promo-bg.jpg"
          alt=""
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a472a]/80 via-[#2d5a3d]/70 to-[#1a472a]/80" />
      </div>
      
      <div className="container relative z-10 py-8 md:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
            {/* Left side - Event Info */}
            <div className="flex-1 text-center lg:text-left">
              {/* Early Bird Badge */}
              <div className="inline-flex items-center gap-2 bg-amber-500 text-amber-950 px-4 py-1.5 rounded-full text-sm font-bold mb-4 animate-pulse">
                <Clock className="h-4 w-4" />
                Early Bird Pricing Through Feb 3rd!
              </div>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
                Big Game Watch Party
              </h2>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-white/90 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-amber-400" />
                  <span className="font-semibold">Sunday, February 8th, 2026</span>
                </div>
              </div>
              
              <p className="text-white/80 text-sm md:text-base max-w-xl mx-auto lg:mx-0 mb-6 leading-relaxed">
                Join us for the biggest game of the year at Stubborn Goat Brewing! Your ticket includes a generous buffet with a wing bar, build-your-own cheesesteaks, nacho bar, and more (vegetarian options available). Plus unlimited soft drinks, entry to three Big Game Squares pools, chances to win great prizes, and your first beer, glass of wine, or ready-to-drink cocktail is on us (21+)!
              </p>
              
              {/* Highlights */}
              <div className="grid grid-cols-2 gap-3 mb-6 max-w-md mx-auto lg:mx-0">
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <Gift className="h-4 w-4 text-amber-400 flex-shrink-0" />
                  <span>Win Great Prizes</span>
                </div>
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <span className="text-amber-400 font-bold text-lg">21+</span>
                  <span>First Drink Included</span>
                </div>
              </div>
            </div>
            
            {/* Right side - CTA */}
            <div className="flex flex-col items-center lg:items-end gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 md:p-8 text-center border border-white/20">
                <p className="text-white/70 text-sm mb-2">Limited Tickets Available</p>
                <p className="text-amber-400 font-bold text-lg mb-4">Don&apos;t Miss Out!</p>
                <Button
                  asChild
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-base md:text-lg px-8 py-6 w-full shadow-lg hover:shadow-xl transition-all"
                >
                  <Link
                    href="https://www.eventbrite.com/e/big-game-watch-party-stubborn-goat-tickets-1981753798960"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <Ticket className="h-5 w-5" />
                    Get Your Tickets Now
                  </Link>
                </Button>
                <p className="text-white/60 text-xs mt-3">
                  Secure your spot today!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
