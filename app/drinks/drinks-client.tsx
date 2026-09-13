"use client"

import { TapList } from "@/components/tap-list"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import menuDataJson from "@/data/menu.json"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Beer, Martini, Grape, CupSoda } from "lucide-react"
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

interface MenuData {
  drinks: MenuCategory[]
}

// The menu is static content that only changes on redeploy, so we read it from
// the bundled JSON instead of fetching it at runtime.
const menuData = menuDataJson as MenuData

function sectionByCategory(category: string): MenuCategory | undefined {
  return menuData.drinks.find((section) => section.category === category)
}

/** Standard two-column card grid used by the text-only drink categories. */
function DrinkCardGrid({ items }: { items: MenuItem[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {items.map((item, itemIdx) => (
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
  )
}

/** Anchored section heading with an icon, matching the site's section style. */
function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="text-center mb-8">
      <Icon className="h-12 w-12 mx-auto mb-4 text-primary" />
      <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">{title}</h2>
      <p className="text-muted-foreground max-w-2xl mx-auto">{description}</p>
    </div>
  )
}

export function DrinksClient() {
  const specialty = sectionByCategory("Specialty Cocktails")
  const martinis = sectionByCategory("Martinis")
  const classics = sectionByCategory("The Classics, Pennsylvania Style")
  const canned = sectionByCategory("Canned Cocktails")
  const wine = sectionByCategory("Wine")
  const nonAlcoholic = sectionByCategory("Non-Alcoholic")

  const athletic = nonAlcoholic?.items.find((item) => item.name === "Athletic Brewing")
  const softDrinks = nonAlcoholic?.items.find((item) => item.name === "Soft Drinks")
  const nitroColdBrew = nonAlcoholic?.items.find((item) => item.name === "Nitro Cold Brew Coffee")

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="container pt-8 md:pt-10 pb-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-3">Drinks</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              House-brewed beer on tap, craft cocktails, PA-made wine, and non-alcoholic options.
            </p>
          </div>
        </div>

        {/* Beer */}
        <section id="beer" className="scroll-mt-24 pt-4 md:pt-6 pb-8 md:pb-12">
          <TapList />
        </section>

        {/* Cocktails */}
        <section id="cocktails" className="scroll-mt-24 py-8 md:py-12 bg-primary/5">
          <div className="container">
            <SectionHeading
              icon={Martini}
              title="Cocktails"
              description="Specialty cocktails, martinis, canned cocktails, and the classics done Pennsylvania style"
            />

            <div className="space-y-10">
              {specialty && (
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">{specialty.category}</h3>
                  <DrinkCardGrid items={specialty.items} />
                </div>
              )}

              {martinis && (
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">{martinis.category}</h3>
                  <DrinkCardGrid items={martinis.items} />
                </div>
              )}

              {canned && (
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">Canned Cocktails</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    {canned.items.map((item, itemIdx) => (
                      <Card key={itemIdx} className="bg-card">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center text-center gap-4">
                            {item.logo && (
                              <Image
                                src={item.logo || "/placeholder.svg"}
                                alt={item.logoAlt || item.name}
                                width={100}
                                height={100}
                                className="rounded-lg"
                              />
                            )}
                            <div>
                              {!item.logo && <p className="font-bold mb-1">{item.name}</p>}
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
                              {item.price && <p className="mt-3 text-sm font-bold text-primary">${item.price} each</p>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {classics && (
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">{classics.category}</h3>
                  <DrinkCardGrid items={classics.items} />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Wine */}
        {wine && (
          <section id="wine" className="scroll-mt-24 py-8 md:py-12">
            <div className="container">
              <SectionHeading icon={Grape} title="Wine" description="Local wine from Wayvine Winery & Vineyard" />
              <div className="max-w-md mx-auto">
                <Card className="bg-card">
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
                          {wine.items
                            .filter((item) => item.price)
                            .map((item, itemIdx) => (
                              <span key={itemIdx} className="px-3 py-1 bg-primary/10 rounded-full text-xs font-medium">
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
            </div>
          </section>
        )}

        {/* N/A Beverages */}
        {nonAlcoholic && (
          <section id="na-beverages" className="scroll-mt-24 py-8 md:py-12 bg-primary/5">
            <div className="container">
              <SectionHeading
                icon={CupSoda}
                title="N/A Beverages"
                description="Non-alcoholic beer, soft drinks, and locally roasted nitro cold brew"
              />

              <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
                {athletic && (
                  <div className="flex flex-col">
                    <h3 className="text-xl md:text-2xl font-bold mb-4 text-center">Non-Alcoholic Beer</h3>
                    <Card className="bg-card flex-1">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center gap-4">
                          <Image
                            src={athletic.logo || "/images/athletic-brewing-logo.jpg"}
                            alt={athletic.logoAlt || athletic.name}
                            width={100}
                            height={100}
                            className="rounded-lg"
                          />
                          <div>
                            <p className="text-sm text-muted-foreground mb-3">{athletic.description}</p>
                            <div className="flex flex-wrap justify-center gap-2">
                              {athletic.varieties?.map((variety, varietyIdx) => (
                                <span
                                  key={varietyIdx}
                                  className="px-3 py-1 bg-primary/10 rounded-full text-xs font-medium"
                                >
                                  {variety}
                                </span>
                              ))}
                            </div>
                            {athletic.price && (
                              <p className="mt-3 text-sm font-bold text-primary">${athletic.price} each</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {softDrinks && (
                  <div className="flex flex-col">
                    <h3 className="text-xl md:text-2xl font-bold mb-4 text-center">Soft Drinks</h3>
                    <Card className="bg-card flex-1">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center gap-4">
                          <Image
                            src={softDrinks.logo || "/images/coca-cola-logo.png"}
                            alt={softDrinks.logoAlt || softDrinks.name}
                            width={100}
                            height={100}
                            className="rounded-lg"
                          />
                          <div>
                            <p className="text-sm text-muted-foreground mb-3">{softDrinks.description}</p>
                            <div className="flex flex-wrap justify-center gap-2">
                              {softDrinks.varieties?.map((variety, varietyIdx) => (
                                <span
                                  key={varietyIdx}
                                  className="px-3 py-1 bg-primary/10 rounded-full text-xs font-medium"
                                >
                                  {variety}
                                </span>
                              ))}
                            </div>
                            {softDrinks.price && (
                              <p className="mt-3 text-sm font-bold text-primary">${softDrinks.price}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {nitroColdBrew && (
                  <div className="flex flex-col">
                    <h3 className="text-xl md:text-2xl font-bold mb-4 text-center">Nitro Cold Brew Coffee</h3>
                    <Card className="bg-card flex-1">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center justify-center text-center gap-4 h-full">
                          {nitroColdBrew.logo && (
                            <Image
                              src={nitroColdBrew.logo || "/placeholder.svg"}
                              alt={nitroColdBrew.logoAlt || nitroColdBrew.name}
                              width={100}
                              height={100}
                              className="rounded-lg"
                            />
                          )}
                          <div>
                            <p className="text-sm text-muted-foreground mb-3">{nitroColdBrew.description}</p>
                            {nitroColdBrew.price && (
                              <p className="mt-3 text-sm font-bold text-primary">${nitroColdBrew.price}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
