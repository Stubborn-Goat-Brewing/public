"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Menu, X } from "lucide-react"
import { useState } from "react"

interface MenuItem {
  name: string
  description: string
  price: number
}

interface Beer {
  name: string
  style: string
  abv: number
  description: string
}

interface MenuSection {
  title: string
  items: MenuItem[]
}

const foodSections: MenuSection[] = [
  {
    title: "Shareables",
    items: [
      {
        name: "Pretzel Sticks",
        description: "Soft pretzel sticks served with house-made beer cheese.",
        price: 12,
      },
      {
        name: "Cheesesteak Egg Rolls",
        description: "Three cheesesteak egg rolls served with sweet red chili dipping sauce.",
        price: 12,
      },
      {
        name: "Fried Pickles",
        description: "Breaded pickle spears served with ranch dipping sauce.",
        price: 12,
      },
      {
        name: "Mozzarella Sticks",
        description: "Breaded mozzarella sticks served with house-made marinara sauce.",
        price: 12,
      },
      {
        name: "The Herd Nachos",
        description:
          "House-made tortilla chips topped with beer cheese, pico de gallo, jalapeños, and sour cream. Add Chicken +2. Add Shrimp +3.",
        price: 13,
      },
    ],
  },
  {
    title: "Salads",
    items: [
      {
        name: "Cobb Salad",
        description:
          "Romaine, bacon, hard-boiled egg, cucumber, red onion, tomato, avocado, served with blue cheese dressing.",
        price: 16,
      },
      {
        name: "Caesar Salad",
        description: "Romaine, croutons, parmesan cheese, served with a creamy caesar dressing.",
        price: 15,
      },
      {
        name: "Summer Salad",
        description:
          "Mixed greens, strawberries, blueberries, walnuts, goat cheese served with balsamic vinaigrette dressing.",
        price: 13,
      },
      {
        name: "Chickpea Salad",
        description:
          "Mixed greens, chickpeas, cucumber, cherry tomato, bell pepper, red onion, feta cheese, served with an oil and vinegar dressing.",
        price: 14,
      },
    ],
  },
  {
    title: "Wings",
    items: [
      {
        name: "Classic Wings",
        description: "Bone-in wings tossed in your choice of sauce. Choice of sauce. Add a side of fries (+4).",
        price: 13,
      },
      {
        name: "Boneless Wings",
        description: "Boneless wings tossed in your choice of sauce. Choice of sauce. Add a side of fries (+4).",
        price: 13,
      },
    ],
  },
  {
    title: "Handhelds",
    items: [
      {
        name: "Hot Dogs & Fries",
        description: "Two jumbo hot dogs served with a side of fries.",
        price: 12,
      },
      {
        name: "B.A.L.T. Wrap",
        description:
          "Bacon, avocado, romaine lettuce, tomato, roasted garlic aioli served with seasoned house-made tortilla chips.",
        price: 14,
      },
      {
        name: "Smoked Turkey Caesar Wrap",
        description:
          "Smoked turkey breast, romaine, shaved parmesan, sun-dried tomatoes, creamy pesto-caesar dressing, served with seasoned house-made tortilla chips.",
        price: 14,
      },
    ],
  },
  {
    title: "Burgers",
    items: [
      {
        name: "Classic Smash",
        description:
          "Single or double (+2) smash patties, American cheese, lettuce, tomato, pickles, & house-made secret sauce served with a side of fries.",
        price: 14,
      },
      {
        name: "BBQ Bacon Smash",
        description:
          "Single or double (+2) smash patties, cheddar cheese, crispy bacon, caramelized onion, & BBQ sauce served with a side of fries.",
        price: 16,
      },
    ],
  },
]

const drinkSections: MenuSection[] = [
  {
    title: "Cocktails",
    items: [
      {
        name: "Old Fashioned",
        description: "A timeless blend of whiskey, bitters, sugar, and citrus—smooth, balanced, and perfectly simple.",
        price: 14,
      },
      {
        name: "Margarita",
        description:
          "Tequila, triple sec, and fresh lime juice, shaken and served over ice. Crisp, tangy, and refreshingly simple.",
        price: 13,
      },
      {
        name: "Stubborn Knees",
        description: "Gin, honey simple syrup, lavender bitters, topped with lemonade served on the rocks.",
        price: 14,
      },
      {
        name: "Transfusion",
        description: "Grape vodka, simple syrup, fresh squeezed lime juice, cranberry juice, topped with ginger ale.",
        price: 12,
      },
    ],
  },
  {
    title: "Canned Cocktails",
    items: [
      {
        name: "Vodka Soda (4.5%)",
        description:
          "Light, crisp, and refreshing. These ready-to-drink cocktails blend premium vodka with sparkling soda and natural flavors. Available in: Grapefruit Citrus, Pineapple Mango, Cherry Berry, Orange Citrus, Cranberry Lime.",
        price: 9,
      },
      {
        name: "Iced Tea & Vodka (4.5%)",
        description: "Rosenberger's iced tea mixed with high quality vodka from Boardroom Spirits.",
        price: 9,
      },
      {
        name: "Lemon Iced Tea & Vodka (5.5%)",
        description: "The perfect, refreshing blend of Boardroom Vodka, real brewed tea, lemon, and sugar.",
        price: 9,
      },
      {
        name: "Crimson Crush Lemonade (5%)",
        description: "A refreshingly juicy vodka lemonade that is crimson red from a real hibiscus flower infusion.",
        price: 9,
      },
    ],
  },
  {
    title: "Wine",
    items: [
      {
        name: "Penns Woods Winery",
        description:
          "Multiple varieties available by the glass. We offer Rose, Chardonnay, Willow White, Sauvignon Blanc, Cabernet Sauvignon.",
        price: 10,
      },
    ],
  },
  {
    title: "Non-Alcoholic",
    items: [
      {
        name: "Hop Water",
        description:
          "A crisp, bubbly, non-alcoholic refresher infused with aromatic hops. Lightly flavored with citrusy and floral notes, it's clean, hydrating, and perfect anytime. Available in rotating flavors.",
        price: 4,
      },
      {
        name: "Athletic Brewing Cans",
        description:
          "Award-winning, craft non-alcoholic beers for those who want the full flavor of a craft brew without the alcohol. Ask your server for current availability.",
        price: 6,
      },
      {
        name: "Fountain Soda",
        description:
          "Coke, Diet Coke, Sprite, Root Beer, Ginger Ale, Minute-Made Lemonade, Cranberry Juice, Tonic Water, and Club Soda.",
        price: 3,
      },
      {
        name: "Iced Tea",
        description: "Fresh-brewed, served unsweetened with a lemon slice.",
        price: 4,
      },
    ],
  },
]

const currentBeers: Beer[] = [
  {
    name: "Counting Sheep IPA",
    style: "Hazy IPA",
    abv: 6.5,
    description:
      "Hazy IPA brewed with raw wheat & malted oats. Heavily hopped with citra & mosaic. Dank citrusy aroma.",
  },
  {
    name: "Minotaur Red IPA",
    style: "Red IPA",
    abv: 7.0,
    description: "Bold red ipa with bright citrus and pine hop character layered over rich caramel & toasted malt.",
  },
  {
    name: "Italian Pils",
    style: "Pilsner",
    abv: 4.8,
    description: "Dry-hopped pilsner with el dorado, citra, and simcoe.",
  },
  {
    name: "Hazy IPA",
    style: "New England IPA",
    abv: 6.5,
    description: "New England IPA infused with tangerine peel, citra, and simcoe hops.",
  },
  {
    name: "Tropical IPA",
    style: "Hazy IPA",
    abv: 6.4,
    description: "Hazy IPA with citra, iodaho7, and mandarina bavaria. Full of citrus and tropical fruit.",
  },
  {
    name: "West Coast IPA",
    style: "West Coast IPA",
    abv: 6.5,
    description: "Dry-hopped with simcoe, citra, and chinook. Notes of grapefruit, pine, and honeydew.",
  },
  {
    name: "Kolsch",
    style: "Kölsch",
    abv: 4.9,
    description: "Traditional style kolsch made with pils, wheat, vienna, and munich malts.",
  },
  {
    name: "Cold IPA",
    style: "Cold IPA",
    abv: 4.5,
    description: "Clean and dry IPA, double dry-hopped with Nectaron.",
  },
  {
    name: "Grove Refresher Watermelon Sour",
    style: "Sour Ale",
    abv: 5.5,
    description: 'The first in our new "refresher" sour series. Light sour, slightly fruity, great flavor.',
  },
  {
    name: "Oktoberfest",
    style: "Festbier",
    abv: 5.5,
    description: "Traditional Festbier.",
  },
  {
    name: "Iron Hoof",
    style: "Brown Ale",
    abv: 4.8,
    description:
      "An ale as dark and bold as the name implies. Iron Hoof is a rich brown ale with an uncompromising spirit. Its deep, robust character is forged from a blend of dark roasted malts, which lend a smooth, full-bodied taste. Served on Nitro.",
  },
  {
    name: "Lemon Poppy Crumble",
    style: "Pale Ale",
    abv: 5.4,
    description:
      "A truly unique collaboration with our friends at Drip Cafe, this Pale Ale captures the essence of a fresh-baked lemon poppy muffin. Brewed with actual Drip Cafe muffins, it pours with a hazy, golden hue. The aroma is a delightful mix of zesty lemon and sweet, bready notes.",
  },
]

const sauces = [
  "Mango Habanero",
  "Kickin' Bourbon",
  "Sweet Red Chili",
  "Classic BBQ",
  "Classic Buffalo",
  "Nashville Hot",
  "Jerk",
]

const friesWithPrices = [
  { name: "Salt & Pepper", price: 6 },
  { name: "Cajun", price: 7 },
  { name: "Old Bay", price: 7 },
  { name: "Truffle", price: 8 },
]

export default function MenuPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
            <Link href="/#get-connected" className="text-sm font-medium hover:underline underline-offset-4">
              Get Connected
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
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
                href="/#get-connected"
                className="text-sm font-medium hover:underline underline-offset-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get Connected
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

      <main className="container py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-4">Our Menu</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From craft beer and creative cocktails to delicious food made with care, we've got something for everyone at
            The Goat. Enjoy PA-made wines and spirits, fresh mocktails, and hearty dishes that bring people together.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Food Menu */}
          <div>
            <h2 className="text-3xl font-bold mb-8 text-center">Food Menu</h2>

            {foodSections.map((section, sectionIndex) => (
              <Card key={sectionIndex} className="mb-8">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-6 text-primary border-b pb-2">{section.title}</h3>
                  <div className="space-y-4">
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{item.name}</h4>
                          <p className="text-muted-foreground text-sm mt-1">{item.description}</p>
                        </div>
                        <span className="text-lg font-bold text-primary">${item.price}</span>
                      </div>
                    ))}
                  </div>

                  {section.title === "Wings" && (
                    <div className="mt-6 pt-4 border-t">
                      <h4 className="font-semibold text-lg mb-3">Available Sauces</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {sauces.map((sauce, index) => (
                          <div key={index} className="text-muted-foreground">
                            {sauce}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {section.title === "Salads" && (
                    <div className="mt-6 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Add grilled chicken (+5) or grilled shrimp (+6) to any salad.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Fries */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-4 text-primary border-b pb-2">Basket of Seasoned Fries</h3>
                <div className="space-y-2">
                  {friesWithPrices.map((fry, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="font-medium">{fry.name}</span>
                      <span className="text-lg font-bold text-primary">${fry.price}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Drink Menu */}
          <div>
            <h2 className="text-3xl font-bold mb-8 text-center">Drink Menu</h2>

            <Card className="mb-8" id="draft-beer">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-6 text-primary border-b pb-2">Draft Beer</h3>
                <div className="grid gap-4 md:grid-cols-1">
                  {currentBeers.map((beer, index) => (
                    <div key={index} className="border-b border-border/50 pb-4 last:border-b-0">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h4 className="font-semibold text-lg">{beer.name}</h4>
                        <span className="text-sm font-medium text-accent bg-accent/10 px-2 py-1 rounded">
                          {beer.abv}% ABV
                        </span>
                      </div>
                      <p className="text-sm italic text-muted-foreground mb-2">{beer.style}</p>
                      <p className="text-muted-foreground text-sm">{beer.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {drinkSections.map((section, sectionIndex) => (
              <Card key={sectionIndex} className="mb-8">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-6 text-primary border-b pb-2">{section.title}</h3>
                  <div className="space-y-4">
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{item.name}</h4>
                          <p className="text-muted-foreground text-sm mt-1">{item.description}</p>
                        </div>
                        <span className="text-lg font-bold text-primary">${item.price}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground mb-4">Gift Cards Available in-store and online!</p>
          <Button size="lg" asChild>
            <Link
              href="https://www.toasttab.com/stubborn-goat-brewing-122-rosehill-ave/giftcards"
              target="_blank"
              rel="noopener noreferrer"
            >
              Purchase Gift Cards
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
