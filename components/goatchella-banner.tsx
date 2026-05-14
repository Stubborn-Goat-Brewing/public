"use client"

import { Calendar, MapPin, Clock, Music, Beer, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UpcomingEventsBanner } from "@/components/upcoming-events-banner"

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
        <div className="container px-4 py-0">
          {/* Event details card */}
          <div className="max-w-3xl mx-auto bg-black/40 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-white/10 -mt-16 md:-mt-20 relative z-10">
            {/* Compact Header */}
            <div className="text-center mb-3">
              <p className="text-amber-400 font-semibold text-xs uppercase tracking-wider mb-1">
                First Anniversary Celebration - Free Event
              </p>
            </div>

            {/* Key details - inline on larger screens */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-2 md:gap-5 mb-3 text-white">
              <div className="flex items-center gap-2 justify-center">
                <Calendar className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium">Saturday, June 6, 2026</span>
              </div>
              <div className="hidden md:block w-px h-4 bg-white/30" />
              <div className="flex items-center gap-2 justify-center">
                <Clock className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium">12:00 PM - 9:00 PM</span>
              </div>
              <div className="hidden md:block w-px h-4 bg-white/30" />
              <div className="flex items-center gap-2 justify-center">
                <MapPin className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium">West Grove Memorial Park, PA</span>
              </div>
            </div>

            {/* Features - compact row */}
            <div className="flex flex-wrap justify-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-2.5 py-0.5 text-xs text-white">
                <Music className="h-3 w-3 text-amber-400" />
                Live Music
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-2.5 py-0.5 text-xs text-white">
                <Beer className="h-3 w-3 text-amber-400" />
                Beer Garden
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-2.5 py-0.5 text-xs text-white">
                <Users className="h-3 w-3 text-amber-400" />
                Family Fun
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-2.5 py-0.5 text-xs text-white">
                20+ Local Vendors
              </span>
            </div>

            {/* Compact description */}
            <p className="text-white/80 text-xs text-center mb-3 max-w-2xl mx-auto leading-relaxed">
              Bounce house, dunk tank, lawn games, Alex&apos;s Lemonade Stand, food, drinks &amp; activities all day!
            </p>

            {/* CTA */}
            <div className="text-center">
              <Button 
                asChild 
                size="sm" 
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-5 shadow-lg h-8 text-xs"
              >
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=West+Grove+Memorial+Park+West+Grove+PA" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Get Directions
                </a>
              </Button>
            </div>
          </div>

          {/* Upcoming Events Carousel - integrated into the banner */}
          <div className="max-w-3xl mx-auto pt-4 pb-6">
            <UpcomingEventsBanner />
          </div>
        </div>
      </div>
    </section>
  )
}
