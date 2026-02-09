"use client"

import Image from "next/image"
import { Calendar, Clock, Music, UtensilsCrossed, Wine, Heart, Users } from "lucide-react"

export function BigGamePromo() {
  return (
    <section className="relative overflow-hidden bg-[#5a1020]">
      {/* Top border accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#c9a55a] z-20" />

      {/* Bottom border accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#c9a55a] z-20" />

      {/* Decorative hearts background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-4 left-[5%] opacity-10">
          <Heart className="h-16 w-16 text-[#e8b4b8] fill-[#e8b4b8]" />
        </div>
        <div className="absolute top-8 right-[10%] opacity-10">
          <Heart className="h-10 w-10 text-[#e8b4b8] fill-[#e8b4b8]" />
        </div>
        <div className="absolute bottom-6 left-[15%] opacity-10">
          <Heart className="h-12 w-12 text-[#e8b4b8] fill-[#e8b4b8]" />
        </div>
        <div className="absolute bottom-4 right-[20%] opacity-10">
          <Heart className="h-8 w-8 text-[#e8b4b8] fill-[#e8b4b8]" />
        </div>
        <div className="absolute top-1/2 left-[40%] opacity-[0.06]">
          <Heart className="h-24 w-24 text-[#e8b4b8] fill-[#e8b4b8]" />
        </div>
        <div className="absolute top-6 left-[55%] opacity-10">
          <Heart className="h-6 w-6 text-[#e8b4b8] fill-[#e8b4b8]" />
        </div>
        <div className="absolute bottom-10 right-[40%] opacity-[0.07]">
          <Heart className="h-14 w-14 text-[#e8b4b8] fill-[#e8b4b8]" />
        </div>
      </div>

      <div className="container relative z-10 py-8 md:py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center">
            {/* All Ages Badge */}
            <div className="inline-flex items-center gap-2 bg-[#c9a55a] text-[#3a0a15] px-4 py-1.5 rounded-full text-sm font-bold mb-4">
              <Users className="h-4 w-4" />
              Open to All Ages
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#f5e6d0] mb-2 tracking-tight text-balance">
              {"Valentine's Day Brunch"}
            </h2>

            {/* Date & Time */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-[#e8b4b8] mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#c9a55a]" />
                <span className="font-semibold text-base md:text-lg">Saturday, February 14th</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#c9a55a]" />
                <span className="font-semibold text-base md:text-lg">10AM - 2PM</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-[#e8b4b8]/90 text-sm md:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
              Join us for a special Valentine&apos;s Day Brunch featuring a mix of brunch classics and creative new dishes from Chef Parker and crew, plus live music, festive drinks, and a warm, welcoming atmosphere for the whole family.
            </p>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 w-full max-w-3xl mb-6">
              {/* Live Music */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-[#c9a55a]/30 flex flex-col items-center">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#c9a55a]/50 mb-3">
                  <Image
                    src="/images/sam-mousley.png"
                    alt="Sam Mousley playing guitar"
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Music className="h-4 w-4 text-[#c9a55a]" />
                  <span className="text-[#c9a55a] font-bold text-sm uppercase tracking-wide">Live Music</span>
                </div>
                <p className="text-[#f5e6d0] font-semibold text-lg">Sam Mousley</p>
                <p className="text-[#e8b4b8]/80 text-sm">11AM - 2PM</p>
              </div>

              {/* Brunch Menu */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-[#c9a55a]/30">
                <div className="flex items-center gap-2 mb-2">
                  <UtensilsCrossed className="h-5 w-5 text-[#c9a55a]" />
                  <span className="text-[#c9a55a] font-bold text-sm uppercase tracking-wide">Special Menu</span>
                </div>
                <p className="text-[#f5e6d0] font-semibold">Chef-Inspired Brunch</p>
                <p className="text-[#e8b4b8]/80 text-sm">Classic favorites & creative dishes</p>
              </div>

              {/* Specialty Cocktail */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-[#c9a55a]/30 sm:col-span-2 lg:col-span-1 flex flex-col items-center">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#c9a55a]/50 mb-3">
                  <Image
                    src="/images/espresso-martini.jpg"
                    alt="Espresso martini cocktail"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="h-4 w-4 text-[#c9a55a] fill-[#c9a55a]" />
                  <span className="text-[#c9a55a] font-bold text-sm uppercase tracking-wide">Featured</span>
                </div>
                <p className="text-[#f5e6d0] font-semibold">Specialty Cocktail</p>
                <p className="text-[#e8b4b8]/80 text-sm">A Valentine&apos;s Day exclusive</p>
              </div>
            </div>

            {/* Drink Specials Bar */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-5 border border-[#c9a55a]/30 w-full max-w-3xl">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Wine className="h-5 w-5 text-[#c9a55a]" />
                <span className="text-[#c9a55a] font-bold text-sm uppercase tracking-wide">Drink Specials</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white/5 rounded-md p-4 flex flex-col items-center text-center border border-[#c9a55a]/20">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#c9a55a]/50 mb-2">
                    <Image
                      src="/images/mimosa.jpg"
                      alt="Mimosa cocktail"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-[#f5e6d0] font-bold">Mimosa Bar</p>
                </div>
                <div className="bg-white/5 rounded-md p-4 flex flex-col items-center text-center border border-[#c9a55a]/20">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#c9a55a]/50 mb-2">
                    <Image
                      src="/images/bloody-mary.jpg"
                      alt="Bloody mary cocktail"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-[#f5e6d0] font-bold">Bloody Mary Bar</p>
                </div>
                <div className="bg-white/5 rounded-md p-4 flex flex-col items-center text-center border border-[#c9a55a]/20">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#c9a55a]/50 mb-2">
                    <Image
                      src="/images/beermosa.jpg"
                      alt="Beermosa cocktail"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-[#f5e6d0] font-bold">Beermosa Specials</p>
                </div>
              </div>
            </div>

            {/* Footnote */}
            <p className="text-[#e8b4b8]/60 text-xs mt-5 italic">
              Our full menu will also be available during brunch service.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
