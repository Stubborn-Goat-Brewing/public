"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { AnnouncementBanner } from "@/components/announcement-banner"

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
        name: "Basket of Seasoned Fries or Tots",
        description: "Cajun or Old Bay (+1), Truffle (+2).",
        price: 6,
      },
      {
        name: "Soft Pretzel Sticks",
        description: "Warm baked pretzel sticks brushed with butter and salt, served with our house beer-cheese.",
        price: 12,
      },
      {
        name: "Fried Pickles",
        description: "Breaded pickle spears served with ranch dipping sauce.",
        price: 12,
      },
      {
        name: "Mozzarella Sticks",
        description: "Crispy fried mozzarella served with warm marinara.",
        price: 12,
      },
      {
        name: "Cheesesteak Egg Rolls",
        description:
          "Crispy egg rolls stuffed with shaved steak, onions, and cheese. Served with sweet red chili sauce.",
        price: 13,
      },
      {
        name: "The Herd Nachos",
        description:
          "House-made tortilla chips topped with beer cheese, pico de gallo, jalapeños, and sour cream. Add Chicken (+3). Add Shrimp (+4).",
        price: 13,
      },
      {
        name: "Maple Roasted Brussels",
        description: "Brussels sprouts tossed with bacon, maple glaze, and parmesan.",
        price: 13,
      },
      {
        name: "BBQ Short Rib Loaded Fries or Tots",
        description:
          "Fresh-cut fries or tots loaded with shredded cheese, caramelized onions, scallions, and our short rib braised in-house with our Iron Hoof Ale.",
        price: 15,
      },
    ],
  },
  {
    title: "Wings",
    items: [
      {
        name: "Classic Wings",
        description: "Bone-in wings tossed in your choice of sauce. Add a side of fries (+3) or tots (+4).",
        price: 13,
      },
      {
        name: "Boneless Wings",
        description: "Boneless wings tossed in your choice of sauce. Add a side of fries (+3) or tots (+4).",
        price: 13,
      },
    ],
  },
  {
    title: "Smash Burgers",
    items: [
      {
        name: "Classic Smash",
        description:
          "Single or double (+2) smash patties with melted American cheese, lettuce, tomato, pickles, & our house secret sauce. Served with a side of fresh-cut fries. Sub tots (+1).",
        price: 14,
      },
      {
        name: "BBQ Bacon Smash",
        description:
          "Single or double (+2) smash patties layered with sharp cheddar, crispy bacon, caramelized onion, and a smoky-sweet BBQ sauce. Served with a side of fresh-cut fries. Sub tots (+1).",
        price: 16,
      },
      {
        name: "The Goat Smash",
        description:
          "Single or double (+2) smash patties topped with creamy goat cheese, crispy bacon, peppery arugula, and balsamic glaze on a toasted brioche bun. Served with a side of fresh-cut fries. Sub tots (+1).",
        price: 16,
      },
      {
        name: "Mushroom & Swiss Smash",
        description:
          "Single or double (+2) smash patties stacked with melty Swiss cheese, sweet caramelized onions, sautéed mushrooms, and a rich roasted-garlic aioli. Served with a side of fresh-cut fries. Sub tots (+1).",
        price: 16,
      },
    ],
  },
  {
    title: "Handhelds",
    items: [
      {
        name: "Hot Dogs & Fries",
        description: "Two 1/4 pound hot dogs served with a side of fries. Sub tots (+1).",
        price: 13,
      },
      {
        name: "B.A.L.T. Wrap",
        description:
          "Bacon, avocado, romaine lettuce, tomato, roasted garlic aioli served with house-made tortilla chips.",
        price: 14,
      },
      {
        name: "Smoked Turkey Caesar Wrap",
        description:
          "Smoked turkey breast, romaine, shaved parmesan, sun-dried tomatoes, creamy pesto-caesar dressing, served with house-made tortilla chips.",
        price: 14,
      },
    ],
  },
  {
    title: "Flatbreads",
    items: [
      {
        name: "Butternut Squash & Goat Cheese",
        description:
          "Roasted butternut squash, caramelized onions, goat cheese, and arugula finished with our maple glaze on a crisp flatbread. Served with house tortilla chips. Sub fries (+3) or tots (+4).",
        price: 16,
      },
      {
        name: "BBQ Short Rib",
        description:
          "Short rib braised in-house with our Iron Hoof Ale, smoked gouda, and caramelized onions over BBQ sauce, finished with scallions and a drizzle of our maple glaze on a crisp flatbread. Served with house tortilla chips. Sub fries (+3) or tots (+4).",
        price: 17,
      },
    ],
  },
  {
    title: "Salads",
    items: [
      {
        name: "Caesar Salad",
        description:
          "Crisp romaine lettuce, shaved Parmesan, garlic croutons, and creamy Caesar dressing. Add grilled chicken (+3) or grilled shrimp (+4).",
        price: 13,
      },
      {
        name: "Autumn Brussels & Apple Salad",
        description:
          "Shaved Brussels sprouts, arugula, sliced green apples, bacon crumbles, and shredded white cheddar tossed in a light maple-Dijon vinaigrette.",
        price: 16,
      },
    ],
  },
]

const drinkSections: MenuSection[] = [
  {
    title: "Specialty Cocktails",
    items: [
      {
        name: "Apple Pie Spritz",
        description:
          "Crisp apple pie cider with smooth vanilla vodka and topped with bubbly prosecco. Light, sparkling, and dessert-inspired, but not too sweet—just right.",
        price: 12,
      },
      {
        name: "Margarita",
        description:
          "Tequila, triple sec, and fresh lime juice, shaken and served over ice. Crisp, tangy, and refreshingly simple.",
        price: 13,
      },
      {
        name: "Transfusion",
        description:
          "A bright, refreshing blend of vodka, grape juice, a squeeze of fresh lime, cranberry, and a touch of simple syrup, topped with bubbly ginger ale for a crisp, golf-course-classic sipper.",
        price: 13,
      },
      {
        name: "Old Fashioned",
        description: "A timeless blend of whiskey, bitters, sugar, and citrus—smooth, balanced, and perfectly simple.",
        price: 14,
      },
      {
        name: "Winter Margarita",
        description:
          "A festive fusion, bringing a chilly twist to a sun-drenched classic. We blend crisp silver tequila with the tart embrace of real cranberry puree, and a sparkling splash of lemon-lime soda.",
        price: 14,
      },
      {
        name: "Smoked Old Fashioned",
        description:
          "An elevated twist on our classic Old Fashioned, infused with real smoke from apple, cherry, or pecan wood.",
        price: 15,
      },
      {
        name: "Coffee Old Fashioned",
        description:
          "A bold Old Fashioned with bourbon, coffee liqueur, and bitters, gently sweetened and finished with a citrus peel for a velvety, sippable classic.",
        price: 15,
      },
    ],
  },
  {
    title: "Classic Cocktails",
    items: [
      {
        name: "The Classics, Pennsylvania Style",
        description:
          "If you have a timeless favorite in mind, our bartenders are ready to craft it to perfection. We honor cocktail traditions using a full range of exceptional, Pennsylvania-made spirits—from crisp vodkas and botanical gins to aged bourbons and smooth rums. Simply request your classic cocktail, and we will mix a masterpiece for you.",
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
        name: "White Wines",
        description: "Sauvignon Blanc, Willow White. Penns Woods Winery - Chadds Ford, PA.",
        price: 10,
      },
      {
        name: "Red Wines",
        description: "Cabernet Sauvignon. Penns Woods Winery - Chadds Ford, PA.",
        price: 10,
      },
      {
        name: "Rose",
        description: "Pinot Rose. Penns Woods Winery - Chadds Ford, PA.",
        price: 10,
      },
      {
        name: "Bubbly",
        description: "Brut Rose, Blanc de Blanc. Penns Woods Winery - Chadds Ford, PA.",
        price: 12,
      },
    ],
  },
  {
    title: "Non-Alcoholic",
    items: [
      {
        name: "Athletic Brewing Cans",
        description:
          "Award-winning, craft non-alcoholic beers for those who want the full flavor of a craft brew without the alcohol. Run Wild (IPA), Free Wave (Hazy IPA), Upside Dawn (Golden Ale).",
        price: 6,
      },
    ],
  },
]

const currentBeers: Beer[] = [
  {
    name: "La Cabra Loca",
    style: "Mexican Lager",
    abv: 4.5,
    description:
      "A bright, easy-drinking Mexican lager brewed for sunshine and good company. Crisp malt character, a touch of corn sweetness, and a refreshingly dry finish make this beer endlessly crushable. Best enjoyed ice-cold with a lime wedge.",
  },
  {
    name: "Light Lager",
    style: "American Light Lager",
    abv: 4.5,
    description: "American Light Lager brewed with pilsner malt.",
  },
  {
    name: "Goat Lager",
    style: "American Lager",
    abv: 4.5,
    description: "COMING BACK SOON!!",
  },
  {
    name: "Grove Refresher Watermelon Sour",
    style: "Fruited Sour",
    abv: 5.5,
    description:
      "A bright, tart watermelon sour with a clean, juicy finish. Fresh fruit character and lively acidity make it a crisp, easy-drinking choice year-round.",
  },
  {
    name: "Hazy IPA",
    style: "New England / Hazy IPA",
    abv: 6.5,
    description: "New recipe. Not ready for a name yet. Hoppy, fruity hazy.",
  },
  {
    name: "West Coast IPA",
    style: "West Coast Style IPA",
    abv: 6.5,
    description: "New recipe! West coast style IPA. Hop-forward, crisp, clean.",
  },
  {
    name: "Counting Sheep",
    style: "Hazy IPA",
    abv: 7.2,
    description:
      "Our flagship Hazy IPA brewed with raw wheat and malted oats giving it a pillowy soft mouthfeel. Heavily hopped with Citra and Mosaic giving this beer a dank, citrusy aroma and flavor.",
  },
  {
    name: "Headbutt",
    style: "Double American IPA",
    abv: 8.4,
    description:
      "Headbutt is an 8.4% Double American IPA built on a strong base of pale malt and loaded with a heavy dose of American hops. Expect bright grapefruit, pine, and grassy aromatics balanced by a sturdy malt body and a crisp, assertive finish. A powerful yet refined IPA for serious hop fans.",
  },
  {
    name: "Iron Hoof",
    style: "Brown Ale",
    abv: 4.8,
    description:
      "An ale as dark and bold as the name implies. Iron Hoof is a rich brown ale with an uncompromising spirit. Its deep, robust character is forged from a blend of dark roasted malts, which lend a smooth, full-bodied taste.",
  },
  {
    name: "Dark Cerveza",
    style: "Dark Mexican Lager",
    abv: 4.7,
    description: "A traditional Mexican-style dark lager.",
  },
  {
    name: "Irish Stout",
    style: "Irish Stout",
    abv: 5.0,
    description: "Limited tap. A classic Irish Stout brewed with Flaked, Roasted and Malted Barley.",
  },
  {
    name: "Chocolate Vanilla Stout",
    style: "Stout",
    abv: 6.5,
    description: "Limited tap. Dark, rich, flavorful.",
  },
  {
    name: "Better Late Than November",
    style: "Pumpkin Spiced Ale",
    abv: 7.0,
    description:
      "Brewed with real roasted pumpkins and a warming blend of cinnamon, nutmeg, ginger, and cloves, this spiced ale captures the cozy flavor of late autumn in every sip. Rich malt sweetness and gentle spice come together for a smooth, balanced finish that's worth the wait.",
  },
  {
    name: "Tundra Buck",
    style: "Winter Spiced Stout",
    abv: 7.9,
    description:
      "This deep-ruby stout pours with a creamy head and delivers an intoxicating aroma of the season. We've infused the rich, malty base—featuring notes of roasted coffee and dark chocolate—with a thoughtful blend of winter spices: cinnamon, nutmeg, and a hint of bright ginger.",
  },
  {
    name: "King David",
    style: "Cider",
    abv: 6.8,
    description: "Sweet and light, notes of honeysuckle, apple, and pear from Old Stone Cider in Lewisville, PA.",
  },
]

const sauces = [
  "Mango Habanero",
  "Kickin' Bourbon",
  "Sweet Red Chili",
  "Classic BBQ",
  "Classic Buffalo",
  "Nashville Hot",
  "Lemon Pepper",
]

export default function MenuPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Sticky Container */}
      <div className="sticky top-0 z-40">
        {/* Announcement Banner */}
        <AnnouncementBanner
          message="Buy $50.00 or more in gift cards and get a bonus card for $5.00 off your next visit."
          linkText="Show me more"
          linkHref="https://order.toasttab.com/egiftcards/stubborn-goat-brewing-122-rosehill-ave"
          disclaimer="Offer available in-store or online through 12/23/25. Bonus cards are redeemable 12/26/25 through 3/31/26 and must be used in full on one check."
        />

        {/* Header */}
        <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
      </div>

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
                        {item.price !== 0 && <span className="text-lg font-bold text-primary">${item.price}</span>}
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
                </CardContent>
              </Card>
            ))}
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
                        {item.price !== 0 && <span className="text-lg font-bold text-primary">${item.price}</span>}
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
