import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo/site"
import { JsonLd } from "@/components/seo/json-ld"
import { getMenuJsonLd } from "@/lib/seo/structured-data"
import menuData from "@/data/menu.json"
import { MenuClient } from "./menu-client"

export const metadata: Metadata = pageMetadata({
  title: "Food & Drink Menu",
  description:
    "See what's on tap at Stubborn Goat Brewing: house-brewed craft beer, PA-made wine and spirits, food, and a kids menu — served in West Grove, PA.",
  path: "/menu",
})

export default function Page() {
  const menuJsonLd = getMenuJsonLd(menuData)

  return (
    <>
      <JsonLd data={menuJsonLd} />
      <MenuClient />
    </>
  )
}
