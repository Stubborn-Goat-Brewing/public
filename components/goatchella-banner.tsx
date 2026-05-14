"use client"

import { Calendar, MapPin, Clock, Music, Beer, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export function GoatchellaBanner() {
  return (
    <section 
      className="relative w-full overflow-hidden"
      style={{
        backgroundImage: "url('/images/goatchella-banner.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
      }}
    >
      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      
      <div className="relative container px-4 pt-48 md:pt-56 lg:pt-64 pb-8 md:pb-10">
        {/* Event details card - positioned at bottom to show logo above */}
        <div className="max-w-3xl mx-auto bg-black/50 backdrop-blur-md rounded-xl p-5 md:p-6 border border-white/10">
          {/* Compact Header */}
          <div className="text-center mb-4">
            <p className="text-amber-400 font-semibold text-sm uppercase tracking-wider mb-1">
              First Anniversary Celebration - Free Event
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              GOATCHELLA
            </h2>
          </div>

          {/* Key details - inline on larger screens */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-3 md:gap-6 mb-4 text-white">
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
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 text-xs text-white">
              <Music className="h-3 w-3 text-amber-400" />
              Live Music
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 text-xs text-white">
              <Beer className="h-3 w-3 text-amber-400" />
              Beer Garden
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 text-xs text-white">
              <Users className="h-3 w-3 text-amber-400" />
              Family Fun
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 text-xs text-white">
              20+ Local Vendors
            </span>
          </div>

          {/* Compact description */}
          <p className="text-white/80 text-sm text-center mb-4 max-w-2xl mx-auto leading-relaxed">
            Bounce house, dunk tank, lawn games, Alex&apos;s Lemonade Stand, food, drinks, and activities all day!
          </p>

          {/* CTA */}
          <div className="text-center">
            <Button 
              asChild 
              size="sm" 
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 shadow-lg"
            >
              <a 
                href="https://www.google.com/maps/search/?api=1&query=West+Grove+Memorial+Park+West+Grove+PA" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                Get Directions
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
