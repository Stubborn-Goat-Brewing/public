"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideBeer } from "lucide-react"

interface Beer {
  name: string
  style: string
  abv: number
  description: string
}

export function TapList() {
  const [beers, setBeers] = useState<Beer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/menu")
      .then((res) => res.json())
      .then((data) => {
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

  return (
    <div className="container">
      <div className="text-center mb-12">
        <LucideBeer className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Current Beers on Tap</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Craft beers brewed with passion and quality ingredients
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {beers.map((beer, index) => (
          <Card
            key={index}
            className="transition-all duration-300 hover:scale-105 hover:shadow-lg bg-card border-border"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold text-card-foreground">{beer.name}</CardTitle>
              <div className="flex items-center justify-between">
                <p className="text-sm italic text-muted-foreground">{beer.style}</p>
                <span className="text-sm font-medium text-accent">{beer.abv}% ABV</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-card-foreground leading-relaxed">{beer.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center"></div>
    </div>
  )
}
