"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ShoppingBag, AlertCircle } from "lucide-react"

// Simplified product type based on the updated API response
type ShopifyProduct = {
  id: string
  title: string
  handle: string
  priceRange: {
    minVariantPrice: {
      amount: string
      currencyCode: string
    }
  }
  image?: {
    url: string
    altText: string | null
  }
}

// Mock products to use as fallback
const mockProducts = [
  {
    id: "1",
    title: "Stubborn Goat T-Shirt",
    handle: "stubborn-goat-tshirt",
    priceRange: {
      minVariantPrice: {
        amount: "24.99",
        currencyCode: "USD",
      },
    },
    image: {
      url: "/images/tshirt.jpg",
      altText: "Stubborn Goat T-Shirt",
    },
  },
  {
    id: "2",
    title: "Pint Glass Set",
    handle: "pint-glass-set",
    priceRange: {
      minVariantPrice: {
        amount: "18.99",
        currencyCode: "USD",
      },
    },
    image: {
      url: "/images/glasses.jpg",
      altText: "Pint Glass Set",
    },
  },
  {
    id: "3",
    title: "Brewery Hat",
    handle: "brewery-hat",
    priceRange: {
      minVariantPrice: {
        amount: "21.99",
        currencyCode: "USD",
      },
    },
    image: {
      url: "/images/hat.jpg",
      altText: "Brewery Hat",
    },
  },
  {
    id: "4",
    title: "Growler",
    handle: "growler",
    priceRange: {
      minVariantPrice: {
        amount: "29.99",
        currencyCode: "USD",
      },
    },
    image: {
      url: "/images/growler.jpg",
      altText: "Growler",
    },
  },
]

export function ShopifyProducts() {
  const [products, setProducts] = useState<ShopifyProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true)

        // Try to fetch from Shopify
        const response = await fetch("/api/shopify/products")

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()

        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products)
        } else {
          console.warn("No products returned from API, using mock data")
          setProducts(mockProducts)
        }

        setError(null)
      } catch (err) {
        console.error("Error fetching products:", err)
        console.warn("Using mock products as fallback")
        setProducts(mockProducts)
        setError("Using demo products. Connect your Shopify store for real products.")
      } finally {
        setLoading(false)
      }
    }

    getProducts()
  }, [])

  const formatPrice = (amount: string, currencyCode: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(Number.parseFloat(amount))
  }

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <Skeleton className="aspect-square" />
            <CardContent className="p-4">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="mt-2 h-4 w-1/3" />
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => {
          const price = product.priceRange.minVariantPrice
          const formattedPrice = formatPrice(price.amount, price.currencyCode)
          const shopifyStoreUrl = process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL || "https://shop.stubborngoatbrewing.com"
          const productUrl = `${shopifyStoreUrl}/products/${product.handle}`

          return (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square overflow-hidden">
                {product.image ? (
                  <Image
                    src={product.image.url || "/placeholder.svg"}
                    alt={product.image.altText || product.title}
                    width={300}
                    height={300}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-muted flex items-center justify-center">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium line-clamp-1">{product.title}</h3>
                <p className="mt-1 font-bold">{formattedPrice}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button asChild variant="outline" className="w-full">
                  <Link
                    href={productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    View Product
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
