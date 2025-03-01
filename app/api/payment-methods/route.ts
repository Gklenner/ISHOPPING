import { NextResponse } from "next/server"
import { type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth-service"
import prisma from "@/lib/db/prisma"
import { z } from "zod"

const paymentMethodSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, "Invalid card number"),
  cardType: z.string(),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Invalid expiry date"),
  cvv: z.string().regex(/^\d{3,4}$/, "Invalid CVV"),
  isDefault: z.boolean().optional(),
})

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        cardType: true,
        lastFourDigits: true,
        expiryDate: true,
        isDefault: true,
      },
    })

    return NextResponse.json(paymentMethods)
  } catch (error) {
    console.error("Error fetching payment methods:", error)
    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
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

    const body = await request.json()
    const validatedData = paymentMethodSchema.parse(body)

    // Extract last 4 digits from card number
    const lastFourDigits = validatedData.cardNumber.slice(-4)

    // If this is the first card or marked as default, ensure it's set as default
    const existingCards = await prisma.paymentMethod.count({
      where: { userId: user.id },
    })

    const isDefault = validatedData.isDefault || existingCards === 0

    // If this card is being set as default, remove default from other cards
    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      })
    }

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId: user.id,
        cardType: validatedData.cardType,
        lastFourDigits,
        expiryDate: validatedData.expiryDate,
        isDefault,
      },
      select: {
        id: true,
        cardType: true,
        lastFourDigits: true,
        expiryDate: true,
        isDefault: true,
      },
    })

    return NextResponse.json(paymentMethod)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payment method data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error adding payment method:", error)
    return NextResponse.json(
      { error: "Failed to add payment method" },
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

    const methodId = request.nextUrl.pathname.split('/').pop()
    if (!methodId) {
      return NextResponse.json(
        { error: "Payment method ID is required" },
        { status: 400 }
      )
    }

    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        id: methodId,
        userId: user.id,
      },
    })

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method not found" },
        { status: 404 }
      )
    }

    await prisma.paymentMethod.delete({
      where: { id: methodId },
    })

    // If the deleted card was default and other cards exist, make another card default
    if (paymentMethod.isDefault) {
      const remainingCard = await prisma.paymentMethod.findFirst({
        where: { userId: user.id },
      })

      if (remainingCard) {
        await prisma.paymentMethod.update({
          where: { id: remainingCard.id },
          data: { isDefault: true },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing payment method:", error)
    return NextResponse.json(
      { error: "Failed to remove payment method" },
      { status: 500 }
    )
  }
}