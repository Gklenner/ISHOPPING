import { NextResponse } from "next/server"

type Product = {
  id: string
  name: string
  price: number
  category: string
  stock: number
  status: "active" | "draft"
  image: string
  sku: string
  description?: string
  sizes?: string[]
  colors?: string[]
  createdAt: Date
  updatedAt: Date
}

// Mock database
let products: Product[] = [
  {
    id: "1",
    name: "Nike Air Max 270",
    price: 599.99,
    category: "Sneakers",
    stock: 45,
    status: "active",
    image: "/placeholder.svg",
    sku: "NK-AM270-001",
    description: "The Nike Air Max 270 delivers a sleek look and all-day comfort.",
    sizes: ["38", "39", "40", "41", "42"],
    colors: ["Black", "White", "Red"],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

export async function GET() {
  try {
    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const product = await request.json()
    
    // Validate required fields
    if (!product.name || !product.price || !product.category || !product.sku) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if SKU already exists
    if (products.some(p => p.sku === product.sku)) {
      return NextResponse.json(
        { error: "SKU already exists" },
        { status: 400 }
      )
    }

    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      status: product.status || "draft",
      stock: product.stock || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    products.push(newProduct)

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updates } = await request.json()

    const productIndex = products.findIndex(p => p.id === id)
    if (productIndex === -1) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Update product
    products[productIndex] = {
      ...products[productIndex],
      ...updates,
      updatedAt: new Date()
    }

    return NextResponse.json(products[productIndex])
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json()

    const productIndex = products.findIndex(p => p.id === id)
    if (productIndex === -1) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Remove product
    products = products.filter(p => p.id !== id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
}