import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Beer {
  name: string
  style: string
  abv: number
  description: string
}

const currentBeers: Beer[] = [
  {
    name: "Goat Light",
    style: "Light Lager",
    abv: 4.7,
    description:
      "Light lager delivers delicate malt notes, a subtle touch of saaz hops, and a clean, crisp finish that keeps you coming back for more.",
  },
  {
    name: "Counting Sheep IPA",
    style: "Hazy IPA",
    abv: 6.9,
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
]

export function TapList() {
  return (
    <div className="container">
      <h2 className="text-center text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
        Current Beers on Tap
      </h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {currentBeers.map((beer, index) => (
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
