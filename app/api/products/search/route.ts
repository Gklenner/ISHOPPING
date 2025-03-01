import { NextResponse } from "next/server"
import { type NextRequest } from "next/server"
import { searchProducts, getProductRecommendations } from "@/lib/search-service"
import { rateLimit } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  try {
    // Rate limiting with custom configuration for search
    const ip = request.ip ?? "127.0.0.1"
    const { success } = await rateLimit(ip, {
      customKey: "product-search",
      limit: 200, // Higher limit for search API
      window: 60000 // 1 minute window
    })
    
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    // Enhanced search parameters
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("query")?.trim() || undefined
    const category = searchParams.get("category")?.toLowerCase() || undefined
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined
    const sortBy = searchParams.get("sortBy")?.toLowerCase() || undefined
    const page = Math.max(1, Number(searchParams.get("page")) || 1)
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20))
    const brand = searchParams.get("brand")?.toLowerCase() || undefined
    const inStock = searchParams.get("inStock") === "true"
    const rating = searchParams.get("rating") ? Number(searchParams.get("rating")) : undefined

    const result = await searchProducts({
      query,
      category,
      minPrice,
      maxPrice,
      sortBy: sortBy as any,
      page,
      limit
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json(
      { error: "An error occurred while searching products" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip ?? "127.0.0.1"
    const { success } = await rateLimit(ip)
    
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      )
    }

    const { productId, limit } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    const recommendations = await getProductRecommendations(productId, limit)
    return NextResponse.json(recommendations)
  } catch (error) {
    console.error("Recommendations API error:", error)
    return NextResponse.json(
      { error: "An error occurred while getting recommendations" },
      { status: 500 }
    )
  }
}