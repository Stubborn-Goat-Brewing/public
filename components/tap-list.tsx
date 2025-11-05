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
    abv: 4.5,
    description:
      "Light, easy-drinking, and refreshing. This light lager delivers delicate malt notes, a subtle touch of Saaz hops, and a clean, crisp finish that keeps you coming back for more.",
  },
  {
    name: "Counting Sheep IPA",
    style: "Hazy IPA",
    abv: 7.2,
    description:
      "Hazy IPA brewed with raw wheat & malted oats. Heavily hopped with citra & mosaic. Dank citrusy aroma.",
  },
  {
    name: "West Coast IPA",
    style: "West Coast IPA",
    abv: 6.5,
    description: "Dry-hopped with simcoe, citra, and chinook. Notes of grapefruit, pine, and honeydew.",
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
    name: "Better Late Than November",
    style: "Pumpkin Spiced Ale",
    abv: 7.0,
    description:
      "Brewed with real roasted pumpkins and a warming blend of cinnamon, nutmeg, ginger, and cloves, this spiced ale captures the cozy flavor of late autumn in every sip. Rich malt sweetness and gentle spice come together for a smooth, balanced finish that's worth the wait — even if it's almost November.",
  },
  {
    name: "Hopfenfest",
    style: "Dry Hopped Festbier",
    abv: 5.8,
    description:
      "Experience the spirit of the German festival season with a modern twist. Hopfenfest takes the rich malt backbone of a classic Festbier with notes of toasted bread and caramel, and elevates it with a generous hop addition.",
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
