import { NextResponse } from "next/server"
import { fetchShopifyProducts } from "@/lib/shopify"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "8", 10)

    const products = await fetchShopifyProducts(limit)

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error in Shopify products API route:", error)
    // Return an empty array instead of an error to handle gracefully on the client
    return NextResponse.json({ products: [] })
  }
}
