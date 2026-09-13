import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo/site"
import { FoodClient } from "./food-client"

export const metadata: Metadata = pageMetadata({
  title: "Food Menu",
  description:
    "Fresh, made-to-order food at Stubborn Goat Brewing: shareables, wings, smash burgers, cheesesteaks, tacos, flatbreads, salads, and a kids menu — served in West Grove, PA.",
  path: "/food",
})

export default function Page() {
  return <FoodClient />
}
