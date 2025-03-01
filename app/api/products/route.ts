import { NextResponse } from "next/server"
import { getProducts } from "@/lib/api"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const search = searchParams.get("search")

  let products = await getProducts()

  if (category && category !== "all") {
    products = products.filter((p) => p.category === category)
  }

  if (search) {
    products = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
  }

  return NextResponse.json(products)
}

