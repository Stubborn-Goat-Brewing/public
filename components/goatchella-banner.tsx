"use client"

import Image from "next/image"
import { Calendar, MapPin, Clock, Music, Beer, Users, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function GoatchellaBanner() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-amber-950 via-amber-900 to-amber-950">
      {/* Decorative pennant banner at top */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-[repeating-linear-gradient(90deg,#dc2626_0px,#dc2626_40px,#2563eb_40px,#2563eb_80px,#16a34a_80px,#16a34a_120px,#eab308_120px,#eab308_160px,#9333ea_160px,#9333ea_200px,#f97316_200px,#f97316_240px)] opacity-80" />
      
      <div className="container px-4 py-8 md:py-12">
        {/* Main banner image */}
        <div className="relative rounded-xl overflow-hidden shadow-2xl mb-6 md:mb-8 border-4 border-amber-400/30">
          <Image
            src="/images/goatchella-banner.jpg"
            alt="Goatchella Birthday Celebration - Stubborn Goat Brewing's First Anniversary"
            width={1200}
            height={400}
            priority
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Event details card */}
        <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6 md:p-8 border-2 border-amber-400">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
              <Sparkles className="h-4 w-4" />
              First Anniversary Celebration
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight">
              GOATCHELLA
            </h2>
            <p className="text-amber-700 font-semibold text-lg mt-2">Free Community Event</p>
          </div>

          {/* Key details grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 bg-amber-50 rounded-lg p-4">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-amber-700 font-medium uppercase tracking-wide">Date</p>
                <p className="text-zinc-900 font-bold">Saturday, June 6, 2026</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-amber-50 rounded-lg p-4">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-amber-700 font-medium uppercase tracking-wide">Time</p>
                <p className="text-zinc-900 font-bold">12:00 PM - 9:00 PM</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-amber-50 rounded-lg p-4">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-amber-700 font-medium uppercase tracking-wide">Location</p>
                <p className="text-zinc-900 font-bold text-sm">West Grove Memorial Park</p>
                <p className="text-zinc-600 text-xs">West Grove, PA</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="border-t border-amber-200 pt-6 mb-6">
            <h3 className="text-center text-zinc-900 font-bold text-lg mb-4">What to Expect</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="bg-zinc-50 rounded-lg p-3">
                <Music className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                <p className="text-zinc-900 font-semibold text-sm">Live Music</p>
              </div>
              <div className="bg-zinc-50 rounded-lg p-3">
                <Beer className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                <p className="text-zinc-900 font-semibold text-sm">Beer Garden</p>
              </div>
              <div className="bg-zinc-50 rounded-lg p-3">
                <Users className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                <p className="text-zinc-900 font-semibold text-sm">Family Fun</p>
              </div>
              <div className="bg-zinc-50 rounded-lg p-3">
                <svg className="h-6 w-6 text-amber-600 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 11v3a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-3" />
                  <path d="M12 19H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-3.83" />
                  <path d="m3 11 7.77-6.04a2 2 0 0 1 2.46 0L21 11H3Z" />
                  <path d="M12 19v3" />
                </svg>
                <p className="text-zinc-900 font-semibold text-sm">Local Vendors</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="text-center mb-6">
            <p className="text-zinc-700 leading-relaxed">
              Join us for an unforgettable day celebrating our first year! Enjoy <strong>live music all day</strong>, 
              a <strong>beer garden</strong>, and <strong>family-friendly activities</strong> including a bounce house, 
              dunk tank, and lawn games. Browse <strong>20+ local businesses</strong>, support <strong>Alex&apos;s Lemonade Stand</strong>, 
              and enjoy plenty of <strong>food and drinks</strong>. Good people, great beer, unforgettable weekend!
            </p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button 
              asChild 
              size="lg" 
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg px-8 py-6 shadow-lg"
            >
              <a 
                href="https://www.google.com/maps/search/?api=1&query=West+Grove+Memorial+Park+West+Grove+PA" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <MapPin className="h-5 w-5" />
                Get Directions
              </a>
            </Button>
            <p className="text-amber-700 font-medium mt-3 text-sm">
              Free Admission - All Are Welcome!
            </p>
          </div>
        </div>
      </div>

      {/* Decorative pennant banner at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-[repeating-linear-gradient(90deg,#9333ea_0px,#9333ea_40px,#f97316_40px,#f97316_80px,#eab308_80px,#eab308_120px,#16a34a_120px,#16a34a_160px,#2563eb_160px,#2563eb_200px,#dc2626_200px,#dc2626_240px)] opacity-80" />
    </section>
  )
}
