"use client"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import menuDataJson from "@/data/menu.json"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Baby } from "lucide-react"
import { slugify } from "@/lib/admin/slug"

interface MenuItem {
  name: string
  description: string
  price?: number
}

interface MenuCategory {
  category: string
  description?: string
  items: MenuItem[]
}

interface KidsMenu {
  title: string
  description: string
  price: number
  items: { name: string }[]
}

interface MenuData {
  food: MenuCategory[]
  kids: KidsMenu
  sauces: string[]
}

// Static content read from the bundled JSON; no runtime fetch.
const menuData = menuDataJson as MenuData

export function FoodClient() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="container pt-8 md:pt-10 pb-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-3">Food</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Fresh, made-to-order shareables, smash burgers, cheesesteaks, and more to pair with our craft beer.
            </p>
          </div>
        </div>

        <div className="pb-8 md:pb-12">
          {menuData.food.map((section, idx) => (
            <section
              key={idx}
              id={slugify(section.category)}
              className={`scroll-mt-24 py-8 md:py-12 ${idx % 2 === 1 ? "bg-primary/5" : ""}`}
            >
              <div className="container">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-3 text-center text-balance">
                  {section.category}
                </h2>
                {section.description && (
                  <p className="text-muted-foreground max-w-2xl mx-auto text-center mb-8">{section.description}</p>
                )}
                {!section.description && <div className="mb-8" />}

                <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
                  {section.items.map((item, itemIdx) => (
                    <Card key={itemIdx} className="bg-card">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          {item.price && <span className="text-lg font-bold text-primary">${item.price}</span>}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base">{item.description}</CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {section.category === "Wings" && (
                  <div className="mt-8 p-6 bg-card rounded-lg border max-w-5xl mx-auto">
                    <h3 className="text-xl font-bold mb-4 text-center">Available Wing Sauces</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                      {menuData.sauces.map((sauce, sauceIdx) => (
                        <span key={sauceIdx} className="px-4 py-2 bg-primary/10 rounded-full text-sm font-medium">
                          {sauce}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          ))}

          {/* Little Goats (Kids) */}
          {menuData.kids && (
            <section id="little-goats" className="scroll-mt-24 py-8 md:py-12 bg-primary/5">
              <div className="container">
                <div className="text-center mb-8">
                  <Baby className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                    {menuData.kids.title}
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    {menuData.kids.description} ${menuData.kids.price} per meal.
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
                  {menuData.kids.items.map((item, itemIdx) => (
                    <Card key={itemIdx} className="bg-card">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <span className="text-lg font-bold text-primary">${menuData.kids.price}</span>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
