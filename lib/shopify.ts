/**
 * Fetches products from Shopify using the Storefront API
 */
export async function fetchShopifyProducts(limit = 8) {
  try {
    const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
    const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
      console.error("Shopify configuration is missing")
      throw new Error("Shopify configuration is missing")
    }

    // Simplified query with only essential fields
    const query = `
      {
        products(first: ${limit}) {
          edges {
            node {
              id
              title
              handle
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              featuredImage {
                url
                altText
              }
            }
          }
        }
      }
    `

    const url = `https://${SHOPIFY_STORE_DOMAIN}/api/2023-01/graphql.json`
    console.log("Fetching from Shopify URL:", url)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Shopify API error:", response.status, errorText)
      throw new Error(`Shopify API error: ${response.status}`)
    }

    const responseData = await response.json()
    console.log("Shopify response:", JSON.stringify(responseData, null, 2))

    // More robust error checking
    if (!responseData || responseData.errors) {
      console.error("GraphQL errors:", responseData.errors)
      throw new Error(responseData.errors?.[0]?.message || "GraphQL error")
    }

    if (!responseData.data || !responseData.data.products || !responseData.data.products.edges) {
      console.error("Unexpected response structure:", responseData)
      throw new Error("Invalid response structure from Shopify")
    }

    // Transform the data to a simpler format
    return responseData.data.products.edges.map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
      priceRange: edge.node.priceRange,
      image: edge.node.featuredImage,
    }))
  } catch (error) {
    console.error("Error fetching Shopify products:", error)
    throw error
  }
}
