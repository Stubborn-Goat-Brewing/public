import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Beer {
  name: string
  style: string
  abv: number
  description: string
}

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
