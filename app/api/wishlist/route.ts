import { NextResponse } from "next/server"
import { type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth-service"
import prisma from "@/lib/db/prisma"

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            description: true,
            images: true
          }
        }
      }
    })

    return NextResponse.json(wishlistItems)
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId } = await request.json()
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Check if item is already in wishlist
    const existingItem = await prisma.wishlist.findFirst({
      where: {
        userId: user.id,
        productId
      }
    })

    if (existingItem) {
      return NextResponse.json(
        { error: "Item already in wishlist" },
        { status: 400 }
      )
    }

    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: user.id,
        productId
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            description: true,
            images: true
          }
        }
      }
    })

    return NextResponse.json(wishlistItem)
  } catch (error) {
    console.error("Error adding to wishlist:", error)
    return NextResponse.json(
      { error: "Failed to add item to wishlist" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const productId = request.nextUrl.pathname.split('/').pop()
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    const wishlistItem = await prisma.wishlist.findFirst({
      where: {
        userId: user.id,
        productId
      }
    })

    if (!wishlistItem) {
      return NextResponse.json(
        { error: "Item not found in wishlist" },
        { status: 404 }
      )
    }

    await prisma.wishlist.delete({
      where: { id: wishlistItem.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing from wishlist:", error)
    return NextResponse.json(
      { error: "Failed to remove item from wishlist" },
      { status: 500 }
    )
  }
}