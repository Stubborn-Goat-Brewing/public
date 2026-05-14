"use client"

import { Calendar, Clock, MapPin, Music, Beer, Users, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"

export function GoatchellaBanner() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Banner image section */}
      <div 
        className="relative w-full"
        style={{
          backgroundImage: "url('/images/goatchella-banner.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          aspectRatio: "3 / 1",
        }}
      >
        {/* Subtle overlay for better text readability at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>
      
      {/* Extended section with black background for info container */}
      <div className="relative bg-black">
        <div className="container px-4 py-6 md:py-8">
          {/* Event details card */}
          <div className="max-w-3xl mx-auto bg-black/40 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-white/10 -mt-12 md:-mt-16 relative z-10">
            {/* Header */}
            <div className="text-center mb-4 md:mb-6">
              <p className="text-amber-400 font-semibold text-sm md:text-base uppercase tracking-wider mb-2">
                First Anniversary Celebration
              </p>
            </div>

            {/* Free admission highlight */}
            <div className="flex justify-center mb-5 md:mb-6">
              <div className="bg-gradient-to-r from-amber-500 to-amber-400 text-black font-bold text-base md:text-lg px-6 py-2 rounded-full shadow-lg">
                FREE ADMISSION - ALL AGES WELCOME
              </div>
            </div>

            {/* Key details */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-3 md:gap-6 mb-5 md:mb-6 text-white">
              <div className="flex items-center gap-2 justify-center">
                <Calendar className="h-5 w-5 text-amber-400 flex-shrink-0" />
                <span className="text-base md:text-lg font-medium whitespace-nowrap">Saturday, June 6, 2026</span>
              </div>
              <div className="hidden md:block w-px h-5 bg-white/30" />
              <div className="flex items-center gap-2 justify-center">
                <Clock className="h-5 w-5 text-amber-400 flex-shrink-0" />
                <span className="text-base md:text-lg font-medium whitespace-nowrap">12:00 PM - 9:00 PM</span>
              </div>
              <div className="hidden md:block w-px h-5 bg-white/30" />
              <div className="flex items-center gap-2 justify-center">
                <MapPin className="h-5 w-5 text-amber-400 flex-shrink-0" />
                <span className="text-base md:text-lg font-medium whitespace-nowrap">West Grove Memorial Park</span>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-5 md:mb-6">
              <span className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 text-sm text-white">
                <Music className="h-4 w-4 text-amber-400" />
                Live Music
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 text-sm text-white">
                <Beer className="h-4 w-4 text-amber-400" />
                Beer Garden
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 text-sm text-white">
                <Users className="h-4 w-4 text-amber-400" />
                Family Fun
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 text-sm text-white">
                20+ Local Vendors
              </span>
            </div>

            {/* Description */}
            <p className="text-white/80 text-sm md:text-base text-center mb-5 md:mb-6 max-w-2xl mx-auto leading-relaxed">
              Join us for a day of fun featuring a bounce house, dunk tank, lawn games, Alex&apos;s Lemonade Stand, 
              plus plenty of food, drinks &amp; activities for the whole family!
            </p>

            {/* CTA */}
            <div className="flex justify-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 shadow-lg"
              >
                <a 
                  href="#" 
                  className="flex items-center gap-2"
                >
                  <Ticket className="h-5 w-5" />
                  Reserve Your Free Tickets
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
