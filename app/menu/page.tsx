"use client"

import { useEffect, useState } from "react"
import { TapList } from "@/components/tap-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UtensilsCrossed, Wine, MenuIcon, X } from "lucide-react"
import Link from "next/link"
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
  beers: any[]
  food: MenuCategory[]
  drinks: MenuCategory[]
  sauces: string[]
}

export default function MenuPage() {
  const [menuData, setMenuData] = useState<MenuData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetch("/api/menu")
      .then((res) => res.json())
      .then((data) => {
        setMenuData(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching menu data:", error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading menu...</p>
      </div>
    )
  }

  if (!menuData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Error loading menu</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/goat-head-new.png"
              alt="Stubborn Goat Brewing Logo"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <span className="hidden font-bold sm:inline-block">Stubborn Goat Brewing</span>
          </Link>

          <nav className="hidden md:flex items-center gap-4 sm:gap-6">
            <Link href="/menu" className="text-sm font-medium hover:underline underline-offset-4">
              Menu
            </Link>
            <Link href="/events" className="text-sm font-medium hover:underline underline-offset-4">
              Events
            </Link>
            <Link href="/#visit" className="text-sm font-medium hover:underline underline-offset-4">
              Visit Us
            </Link>
            <Link href="/#hours" className="text-sm font-medium hover:underline underline-offset-4">
              Hours
            </Link>
            <Link href="/#contact" className="text-sm font-medium hover:underline underline-offset-4">
              Contact
            </Link>
            <Link
              href="https://www.toasttab.com/stubborn-goat-brewing-122-rosehill-ave/giftcards"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Gift Cards
            </Link>
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </Button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <nav className="container py-4 flex flex-col space-y-4">
              <Link
                href="/menu"
                className="text-sm font-medium hover:underline underline-offset-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Menu
              </Link>
              <Link
                href="/events"
                className="text-sm font-medium hover:underline underline-offset-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Events
              </Link>
              <Link
                href="/#visit"
                className="text-sm font-medium hover:underline underline-offset-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Visit Us
              </Link>
              <Link
                href="/#hours"
                className="text-sm font-medium hover:underline underline-offset-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Hours
              </Link>
              <Link
                href="/#contact"
                className="text-sm font-medium hover:underline underline-offset-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                href="https://www.toasttab.com/stubborn-goat-brewing-122-rosehill-ave/giftcards"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:underline underline-offset-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Gift Cards
              </Link>
            </nav>
          </div>
        )}
      </header>

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

        {/* Drinks Menu Section */}
        <section id="drinks" className="py-8 md:py-12">
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
                              <h4 className="text-lg font-bold mb-2">{section.items[0]?.name}</h4>
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
                              <h4 className="text-lg font-bold mb-2">Wayvine Winery & Vineyard</h4>
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
                                      {item.name} - ${item.price}
                                    </span>
                                  ))}
                              </div>
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
                                  <h4 className="text-lg font-bold mb-2">{item.name}</h4>
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
                                  <h4 className="text-lg font-bold mb-2">{item.logoAlt || item.name}</h4>
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
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background">
        <div className="container py-8 md:py-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <Image
                src="/images/goat-head-new.png"
                alt="Stubborn Goat Brewing Logo"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="font-bold">Stubborn Goat Brewing</span>
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://instagram.com/StubbornGoatBrewing" target="_blank" rel="noopener noreferrer">
                  <Image src="/images/icon_instagram.png" alt="Instagram" width={24} height={24} className="h-6 w-6" />
                  <span className="sr-only">Instagram</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://www.facebook.com/profile.php?id=61575081059536" target="_blank" rel="noopener noreferrer">
                  <Image src="/images/icon_facebook.png" alt="Facebook" width={24} height={24} className="h-6 w-6" />
                  <span className="sr-only">Facebook</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://untappd.com/StubbornGoatBrewing" target="_blank" rel="noopener noreferrer">
                  <Image src="/images/icon_untappd.png" alt="Untappd" width={24} height={24} className="h-6 w-6" />
                  <span className="sr-only">Untappd</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="mailto:tribe@stubborngoatbrewing.com">
                  <Image src="/images/icon_email.png" alt="Email" width={24} height={24} className="h-6 w-6" />
                  <span className="sr-only">Email</span>
                </Link>
              </Button>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Stubborn Goat Brewing. All rights reserved.</p>
            <p className="mt-1">
              <Link href="/privacy" className="hover:underline">
                Privacy Policy
              </Link>{" "}
              |
              <Link href="/terms" className="hover:underline">
                {" "}
                Terms of Service
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
