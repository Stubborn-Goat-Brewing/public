"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Beer, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import type L from "leaflet"

interface TapLocation {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  lat: number
  lng: number
}

const tapLocations: TapLocation[] = [
  {
    id: "stubborn-goat",
    name: "Stubborn Goat Brewing",
    address: "122 Rosehill Ave",
    city: "West Grove",
    state: "PA",
    zip: "19390",
    lat: 39.8225,
    lng: -75.8293,
  },
  {
    id: "giordanos",
    name: "Giordano's Bar & Grill",
    address: "633 E Cypress St",
    city: "Kennett Square",
    state: "PA",
    zip: "19348",
    lat: 39.8469,
    lng: -75.7063,
  },
]

export function TapLocationsMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<TapLocation | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || mapInstanceRef.current) return

    const loadLeaflet = async () => {
      // Dynamically import Leaflet
      const L = (await import("leaflet")).default

      // Add Leaflet CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }

      // Wait for CSS to load
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Calculate center point between all locations
      const avgLat = tapLocations.reduce((sum, loc) => sum + loc.lat, 0) / tapLocations.length
      const avgLng = tapLocations.reduce((sum, loc) => sum + loc.lng, 0) / tapLocations.length

      // Initialize map
      const map = L.map(mapRef.current!, {
        center: [avgLat, avgLng],
        zoom: 11,
        scrollWheelZoom: false,
      })

      mapInstanceRef.current = map

      // Add tile layer (OpenStreetMap)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      // Custom marker icon using the primary color
      const createCustomIcon = (isBrewery: boolean) => {
        return L.divIcon({
          className: "custom-marker",
          html: `
            <div style="
              background-color: ${isBrewery ? "#9a5b13" : "#1e40af"};
              width: 36px;
              height: 36px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">
              <svg 
                style="transform: rotate(45deg); width: 18px; height: 18px; color: white;"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                ${
                  isBrewery
                    ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h1a4 4 0 110 8h-1M5 8h12v9a4 4 0 01-4 4H9a4 4 0 01-4-4V8zM5 8a2 2 0 012-2h8a2 2 0 012 2M7 3h8" />'
                    : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />'
                }
              </svg>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36],
        })
      }

      // Add markers for each location
      tapLocations.forEach((location) => {
        const isBrewery = location.id === "stubborn-goat"
        const marker = L.marker([location.lat, location.lng], {
          icon: createCustomIcon(isBrewery),
        }).addTo(map)

        marker.bindPopup(`
          <div style="min-width: 200px; padding: 4px;">
            <h3 style="font-weight: bold; font-size: 14px; margin-bottom: 4px; color: #1f2937;">
              ${location.name}
            </h3>
            <p style="font-size: 12px; color: #6b7280; margin: 0;">
              ${location.address}<br />
              ${location.city}, ${location.state} ${location.zip}
            </p>
            <a 
              href="https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                `${location.address}, ${location.city}, ${location.state} ${location.zip}`
              )}"
              target="_blank"
              rel="noopener noreferrer"
              style="
                display: inline-block;
                margin-top: 8px;
                font-size: 12px;
                color: #9a5b13;
                text-decoration: none;
              "
            >
              Get Directions →
            </a>
          </div>
        `)

        marker.on("click", () => {
          setSelectedLocation(location)
        })
      })

      // Fit bounds to show all markers
      const bounds = L.latLngBounds(tapLocations.map((loc) => [loc.lat, loc.lng]))
      map.fitBounds(bounds, { padding: [50, 50] })

      setIsMapLoaded(true)
    }

    loadLeaflet().catch((error) => {
      console.log("[v0] Leaflet loading error:", error)
      setMapError(true)
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  const handleLocationClick = (location: TapLocation) => {
    setSelectedLocation(location)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([location.lat, location.lng], 14)
    }
  }

  const getDirectionsUrl = (location: TapLocation) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      `${location.address}, ${location.city}, ${location.state} ${location.zip}`
    )}`
  }

  return (
    <section className="py-12 md:py-16 bg-primary/5">
      <div className="container px-4">
        <div className="text-center mb-8 md:mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Beer className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tighter mb-3 md:mb-4">
            Find Our Beer On Tap
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover where you can enjoy Stubborn Goat brews around the area. Click on a location for details and
            directions.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2 bg-background rounded-lg shadow-lg border-2 border-primary/20 overflow-hidden relative">
              <div ref={mapRef} className="h-[400px] md:h-[500px] w-full" />
              {!isMapLoaded && !mapError && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <div className="text-muted-foreground">Loading map...</div>
                </div>
              )}
              {mapError && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <div className="text-center text-muted-foreground p-4">
                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Unable to load map. Please check the locations list.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Location List */}
            <div className="bg-background rounded-lg shadow-lg border-2 border-primary/20 p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Tap Locations
              </h3>
              <div className="space-y-3">
                {tapLocations.map((location) => {
                  const isBrewery = location.id === "stubborn-goat"
                  const isSelected = selectedLocation?.id === location.id

                  return (
                    <div
                      key={location.id}
                      className={`p-3 md:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50 hover:bg-primary/5"
                      }`}
                      onClick={() => handleLocationClick(location)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleLocationClick(location)
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            isBrewery ? "bg-primary text-primary-foreground" : "bg-blue-800 text-white"
                          }`}
                        >
                          {isBrewery ? <Beer className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm md:text-base truncate">{location.name}</h4>
                          <p className="text-xs md:text-sm text-muted-foreground mt-1">
                            {location.address}
                            <br />
                            {location.city}, {location.state} {location.zip}
                          </p>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto mt-2 text-primary"
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a href={getDirectionsUrl(location)} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Get Directions
                            </a>
                          </Button>
                        </div>
                      </div>
                      {isBrewery && (
                        <div className="mt-2 ml-11">
                          <span className="inline-block text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                            Our Brewery
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
