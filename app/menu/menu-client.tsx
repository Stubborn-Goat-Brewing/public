"use client"

import { TapList } from "@/components/tap-list"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import menuDataJson from "@/data/menu.json"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UtensilsCrossed, Wine, Baby } from "lucide-react"
import Image from "next/image"

interface MenuItem {
  name: string
  description: string
  price?: number
  varieties?: string[]
  logo?: string
  logoAlt?: string
}

interface MenuCategory {
  category: string
  items: MenuItem[]
}

interface KidsMenu {
  title: string
  description: string
  price: number
  items: { name: string }[]
}

interface MenuData {
  beers: any[]
  food: MenuCategory[]
  kids: KidsMenu
  drinks: MenuCategory[]
  sauces: string[]
}

// The menu is static content that only changes on redeploy, so we read it from
// the bundled JSON instead of fetching it at runtime. This removes the network
// request (and its loading state) that ran on every menu-page view.
const menuData = menuDataJson as MenuData

export function MenuClient() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Beer Section */}
        <section id="beers" className="pt-4 md:pt-6 pb-8 md:pb-12">
          <TapList />
        </section>

        {/* Food Menu Section */}
        <section id="food" className="py-8 md:py-12 bg-primary/5">
          <div className="container">
            <div className="text-center mb-8">
              <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Food Menu</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Delicious food made with fresh ingredients to pair perfectly with our craft beers
              </p>
            </div>

            <div className="space-y-8">
              {menuData.food.map((section, idx) => (
                <div key={idx}>
                  <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">{section.category}</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    {section.items.map((item, itemIdx) => (
                      <Card key={itemIdx} className="bg-card">
                        <CardHeader>
                          <div className="flex items-start justify-between">
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
                    <div className="mt-8 p-6 bg-card rounded-lg border">
                      <h4 className="text-xl font-bold mb-4 text-center">Available Wing Sauces</h4>
                      <div className="flex flex-wrap justify-center gap-3">
                        {menuData.sauces.map((sauce, idx) => (
                          <span key={idx} className="px-4 py-2 bg-primary/10 rounded-full text-sm font-medium">
                            {sauce}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Kids Menu Section */}
        {menuData.kids && (
          <section id="kids" className="py-8 md:py-12">
            <div className="container">
              <div className="text-center mb-8">
                <Baby className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                  {menuData.kids.title} Kids Menu
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {menuData.kids.description} ${menuData.kids.price} per meal.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
                {menuData.kids.items.map((item, itemIdx) => (
                  <Card key={itemIdx} className="bg-card">
                    <CardHeader>
                      <div className="flex items-start justify-between">
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

        {/* Drinks Menu Section */}
        <section id="drinks" className="py-8 md:py-12 bg-primary/5">
          <div className="container">
            <div className="text-center mb-8">
              <Wine className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Drinks Menu</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Cocktails, wine, and more to complement your meal
              </p>
            </div>

            <div className="space-y-8">
              {/* Regular drink sections */}
              {menuData.drinks
                .filter((section) => !["Wine", "Canned Cocktails", "Non-Alcoholic"].includes(section.category))
                .map((section, idx) => (
                  <div key={idx}>
                    <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">{section.category}</h3>
                    <div className="grid gap-6 md:grid-cols-2">
                      {section.items.map((item, itemIdx) => (
                        <Card key={itemIdx} className="bg-card">
                          <CardHeader>
                            <div className="flex items-start justify-between">
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
                  </div>
                ))}

              {/* Partner Brand Sections - Flowing Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Canned Cocktails - Boardroom Spirits */}
                {menuData.drinks
                  .filter((section) => section.category === "Canned Cocktails")
                  .map((section) => (
                    <div key="canned-cocktails" className="flex flex-col">
                      <h3 className="text-xl md:text-2xl font-bold mb-4 text-center">Canned Cocktails</h3>
                      <Card className="bg-card flex-1">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center text-center gap-4">
                            <Image
                              src={section.items[0]?.logo || "/images/boardroom-spirits-logo.png"}
                              alt={section.items[0]?.logoAlt || "Boardroom Spirits"}
                              width={100}
                              height={100}
                              className="rounded-lg"
                            />
                            <div>
                              <p className="text-sm text-muted-foreground mb-3">{section.items[0]?.description}</p>
                              <div className="flex flex-wrap justify-center gap-2">
                                {section.items[0]?.varieties?.map((variety, varietyIdx) => (
                                  <span
                                    key={varietyIdx}
                                    className="px-3 py-1 bg-primary/10 rounded-full text-xs font-medium"
                                  >
                                    {variety}
                                  </span>
                                ))}
                              </div>
                              {section.items[0]?.price && (
                                <p className="mt-3 text-sm font-bold text-primary">${section.items[0].price} each</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}

                {/* Wine - Wayvine Winery */}
                {menuData.drinks
                  .filter((section) => section.category === "Wine")
                  .map((section) => (
                    <div key="wine" className="flex flex-col">
                      <h3 className="text-xl md:text-2xl font-bold mb-4 text-center">Wine</h3>
                      <Card className="bg-card flex-1">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center text-center gap-4">
                            <Image
                              src="/images/wayvine-logo.webp"
                              alt="Wayvine Winery & Vineyard"
                              width={100}
                              height={100}
                              className="rounded-lg"
                            />
                            <div>
                              <p className="text-sm text-muted-foreground mb-3">
                                Local wine from Wayvine Winery. Ask for availability.
                              </p>
                              <div className="flex flex-wrap justify-center gap-2">
                                {section.items
                                  .filter((item) => item.price)
                                  .map((item, itemIdx) => (
                                    <span
                                      key={itemIdx}
                                      className="px-3 py-1 bg-primary/10 rounded-full text-xs font-medium"
                                    >
                                      {item.name}
                                    </span>
                                  ))}
                              </div>
                              <p className="mt-3 text-sm font-bold text-primary">$10 each</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}

                {/* Non-Alcoholic Beer - Athletic Brewing */}
                {menuData.drinks
                  .filter((section) => section.category === "Non-Alcoholic")
                  .flatMap((section) =>
                    section.items
                      .filter((item) => item.name === "Athletic Brewing")
                      .map((item) => (
                        <div key="na-beer" className="flex flex-col">
                          <h3 className="text-xl md:text-2xl font-bold mb-4 text-center">Non-Alcoholic Beer</h3>
                          <Card className="bg-card flex-1">
                            <CardContent className="p-6">
                              <div className="flex flex-col items-center text-center gap-4">
                                <Image
                                  src={item.logo || "/images/athletic-brewing-logo.jpg"}
                                  alt={item.logoAlt || item.name}
                                  width={100}
                                  height={100}
                                  className="rounded-lg"
                                />
                                <div>
                                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                                  <div className="flex flex-wrap justify-center gap-2">
                                    {item.varieties?.map((variety, varietyIdx) => (
                                      <span
                                        key={varietyIdx}
                                        className="px-3 py-1 bg-primary/10 rounded-full text-xs font-medium"
                                      >
                                        {variety}
                                      </span>
                                    ))}
                                  </div>
                                  {item.price && (
                                    <p className="mt-3 text-sm font-bold text-primary">${item.price} each</p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))
                  )}

                {/* Soft Drinks - Coca-Cola */}
                {menuData.drinks
                  .filter((section) => section.category === "Non-Alcoholic")
                  .flatMap((section) =>
                    section.items
                      .filter((item) => item.name === "Soft Drinks")
                      .map((item) => (
                        <div key="soft-drinks" className="flex flex-col">
                          <h3 className="text-xl md:text-2xl font-bold mb-4 text-center">Soft Drinks</h3>
                          <Card className="bg-card flex-1">
                            <CardContent className="p-6">
                              <div className="flex flex-col items-center text-center gap-4">
                                <Image
                                  src={item.logo || "/images/coca-cola-logo.png"}
                                  alt={item.logoAlt || item.name}
                                  width={100}
                                  height={100}
                                  className="rounded-lg"
                                />
                                <div>
                                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                                  <div className="flex flex-wrap justify-center gap-2">
                                    {item.varieties?.map((variety, varietyIdx) => (
                                      <span
                                        key={varietyIdx}
                                        className="px-3 py-1 bg-primary/10 rounded-full text-xs font-medium"
                                      >
                                        {variety}
                                      </span>
                                    ))}
                                  </div>
                                  {item.price && (
                                    <p className="mt-3 text-sm font-bold text-primary">${item.price} each</p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))
                  )}

                {/* Nitro Cold Brew Coffee - Dript Coffee Co. */}
                {menuData.drinks
                  .filter((section) => section.category === "Non-Alcoholic")
                  .flatMap((section) =>
                    section.items
                      .filter((item) => item.name === "Nitro Cold Brew Coffee")
                      .map((item) => (
                        <div key="nitro-cold-brew" className="flex flex-col">
                          <h3 className="text-xl md:text-2xl font-bold mb-4 text-center">Nitro Cold Brew Coffee</h3>
                          <Card className="bg-card flex-1">
                            <CardContent className="p-6">
                              <div className="flex flex-col items-center justify-center text-center gap-4 h-full">
                                <div>
                                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                                  {item.price && (
                                    <p className="mt-3 text-sm font-bold text-primary">${item.price}</p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))
                  )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
