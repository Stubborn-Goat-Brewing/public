"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideBeer, Apple } from "lucide-react"

interface Beer {
  name: string
  style: string
  abv: number
  description: string
  category?: string
  pricing?: string
  flagship?: boolean
  fourPackAvailable?: boolean
}

interface MenuData {
  beers: Beer[]
}

const categoryLabels: Record<string, string> = {
  "easy-drinking": "Easy-Drinking",
  "seasonal-spiced": "Seasonal and Spiced",
  "fruity-tart": "Fruity, Tart & Refreshing",
  "hoppy-juicy": "Hoppy & Juicy",
  "malty-dark": "Malty, Toasty & Dark",
  "cider": "Cider",
  "guest-tap": "Guest Tap"
}

const categoryOrder = ["easy-drinking", "seasonal-spiced", "fruity-tart", "hoppy-juicy", "malty-dark", "cider", "guest-tap"]

export function TapList() {
  const [beers, setBeers] = useState<Beer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/menu")
      .then((res) => res.json())
      .then((data: MenuData) => {
        setBeers(data.beers)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching menu data:", error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="container text-center py-12">
        <p className="text-muted-foreground">Loading beers...</p>
      </div>
    )
  }

  // Group beers by category
  const groupedBeers = categoryOrder.reduce((acc, category) => {
    const categoryBeers = beers.filter(beer => beer.category === category)
    if (categoryBeers.length > 0) {
      acc[category] = categoryBeers
    }
    return acc
  }, {} as Record<string, Beer[]>)

  return (
    <div className="container">
      <div className="text-center mb-12">
        <LucideBeer className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Tap Menu</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Craft beers brewed with passion and quality ingredients
        </p>
      </div>

      <div className="space-y-12">
        {Object.entries(groupedBeers).map(([category, categoryBeers]) => (
          <div key={category}>
            <div className="flex items-center gap-3 mb-6">
              {category === "cider" ? (
                <Apple className="h-6 w-6 text-primary" />
              ) : (
                <LucideBeer className="h-6 w-6 text-primary" />
              )}
              <h3 className="text-2xl font-bold">{categoryLabels[category] || category}</h3>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categoryBeers.map((beer, index) => (
                <Card
                  key={index}
                  className={`transition-all duration-300 hover:scale-105 hover:shadow-lg bg-card border-border ${
                    beer.flagship ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-xl font-bold text-card-foreground">{beer.name}</CardTitle>
                      {beer.flagship && (
                        <span className="shrink-0 px-2 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded">
                          Flagship
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm italic text-muted-foreground">{beer.style}</p>
                      <span className="text-sm font-medium text-accent">{beer.abv}% ABV</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-card-foreground leading-relaxed">{beer.description}</p>
                    {beer.pricing && (
                      <p className="mt-3 text-sm font-medium text-primary">{beer.pricing}</p>
                    )}
                    {beer.fourPackAvailable && (
                      <p className="mt-2 text-sm font-medium text-primary">
                        Now available in 4-packs to-go!
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center"></div>
    </div>
  )
}
