"use client"

import { Calendar, Clock, MapPin, Music, Beer, Users, UtensilsCrossed, Star } from "lucide-react"

const artistLineup = [
  { time: "12:15 - 12:45 PM", name: "Ripe Enough" },
  { time: "1:15 - 2:00 PM", name: "Small Talk" },
  { time: "2:30 - 3:30 PM", name: "Restless Diesel" },
  { time: "4:00 - 5:30 PM", name: "Dancing Goats" },
  { time: "6:00 - 9:00 PM", name: "Love Seed Mama Jump Trio", headliner: true },
]

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
                <UtensilsCrossed className="h-4 w-4 text-amber-400" />
                Food
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 text-sm text-white">
                20+ Local Vendors
              </span>
            </div>

            {/* Description */}
            <p className="text-white/80 text-sm md:text-base text-center max-w-2xl mx-auto leading-relaxed mb-6 md:mb-8">
              Join us for a day of fun featuring a bounce house, dunk tank, lawn games, Alex&apos;s Lemonade Stand, 
              plus plenty of food, drinks &amp; activities for the whole family!
            </p>

            {/* Artist Lineup */}
            <div className="border-t border-white/10 pt-6 md:pt-8">
              <div className="text-center mb-6 md:mb-8">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-1">2026 Artist Lineup</h3>
                <p className="text-amber-400 text-sm">Live Music All Day</p>
              </div>
              
              {/* 2x2 Grid for first 4 bands */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                {artistLineup.filter(a => !a.headliner).map((artist, index) => (
                  <div 
                    key={index}
                    className="group relative bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-5 border border-white/10 hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full" />
                    <Music className="h-5 w-5 text-amber-400 mb-3" />
                    <h4 className="text-white font-bold text-lg mb-2 group-hover:text-amber-400 transition-colors">
                      {artist.name}
                    </h4>
                    <div className="flex items-center gap-2 text-white/60">
                      <Clock className="h-4 w-4 text-amber-400/70" />
                      <span className="text-sm">{artist.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Headliner Card */}
              {artistLineup.filter(a => a.headliner).map((artist, index) => (
                <div 
                  key={index}
                  className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-amber-700/20 border-2 border-amber-500/50 p-6 md:p-8"
                >
                  {/* Decorative elements */}
                  <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/20 rounded-br-full" />
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-amber-500/10 rounded-tl-full" />
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1.5 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      <Star className="h-3 w-3 fill-current" />
                      Headliner
                    </span>
                  </div>
                  
                  <div className="relative text-center pt-4">
                    <Music className="h-8 w-8 text-amber-400 mx-auto mb-4" />
                    <h4 className="text-2xl md:text-3xl font-bold text-white mb-3">
                      {artist.name}
                    </h4>
                    <div className="flex items-center justify-center gap-2 text-amber-400">
                      <Clock className="h-5 w-5" />
                      <span className="text-lg font-medium">{artist.time}</span>
                    </div>
                    <p className="text-white/60 text-sm mt-4 max-w-md mx-auto">
                      {"Don't miss the biggest act of the day closing out Goatchella 2026!"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
