import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo/site"
import { JsonLd } from "@/components/seo/json-ld"
import { getMenuJsonLd } from "@/lib/seo/structured-data"
import menuData from "@/data/menu.json"
import { DrinksClient } from "./drinks-client"

export const metadata: Metadata = pageMetadata({
  title: "Drinks Menu",
  description:
    "See what's on tap at Stubborn Goat Brewing: house-brewed craft beer, craft cocktails, PA-made wine, and non-alcoholic options — served in West Grove, PA.",
  path: "/drinks",
})

export default function Page() {
  // The full menu JSON-LD (beer, food, drinks, kids) lives on the drinks page,
  // which is the canonical menu URL after the /menu split.
  const menuJsonLd = getMenuJsonLd(menuData)

  return (
    <>
      <JsonLd data={menuJsonLd} />
      <DrinksClient />
    </>
  )
}
