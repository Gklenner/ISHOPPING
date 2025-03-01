"use server"

import { loadStripe } from "@stripe/stripe-js"
import { headers } from "next/headers"
import { z } from "zod"
import { Redis } from "@upstash/redis"
import { getCurrentUser } from "./auth-service"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "https://fake-redis-url.upstash.io",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "development"
})

import { db } from "@/lib/db"

const paymentSchema = z.object({
  amount: z.number().positive(),
  items: z.array(
    z.object({
      id: z.string(),
      quantity: z.number().positive(),
    }),
  ),
  address: z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
  }),
})

export async function processPayment(data: z.infer<typeof paymentSchema>) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error("Authentication required")
    }

    const validated = paymentSchema.parse(data)

    // Enhanced rate limiting for payments
    const ip = headers().get("x-forwarded-for") || "127.0.0.1"
    const { success, retryAfter } = await rateLimit(ip, {
      customKey: "payment-processing",
      limit: 5, // Strict limit for payment attempts
      window: 3600000 // 1 hour window
    })

    if (!success) {
      throw new Error(`Too many payment attempts. Please try again in ${retryAfter} seconds.`)
    }

    // Validate products and calculate total
    const products = await Promise.all(
      validated.items.map(async (item) => {
        const product = await db.product.findUnique({
          where: { id: item.id },
          select: { id: true, name: true, price: true, stock: true },
        })

        if (!product) {
          throw new Error(`Product ${item.id} not found`)
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`)
        }

        return { ...product, quantity: item.quantity }
      })
    )

    const total = products.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    if (Math.abs(total - validated.amount) > 0.01) {
      throw new Error("Invalid order amount")
    }

    // Create Stripe session
    const stripe = await loadStripe(process.env.STRIPE_SECRET_KEY!)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: products.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_URL}/orders?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        address: JSON.stringify(validated.address),
      },
    })

    // Create order in database
    await db.order.create({
      data: {
        userId: user.id,
        amount: total,
        items: validated.items,
        status: "pending",
        stripeSessionId: session.id,
        shippingAddress: validated.address,
      },
    })

    // Log successful transaction
    logger.info({
      event: "payment_success",
      transactionId,
      sessionId: session.id,
      userId: user.id
    })

    return { sessionId: session.id, transactionId }
  } catch (error) {
    // Log error with appropriate context
    logger.error({
      event: "payment_error",
      transactionId,
      error: error instanceof PaymentProcessingError ? error.type : PaymentError.SYSTEM_ERROR,
      message: error.message,
      userId: user?.id
    })

    // Ensure active transaction count is decreased on error
    if (user) {
      await redis.decr(`active_transactions:${user.id}`)
    }

    // Rethrow with proper error type
    if (error instanceof PaymentProcessingError) {
      throw error
    }

    throw new PaymentProcessingError(
      PaymentError.SYSTEM_ERROR,
      "An unexpected error occurred while processing your payment"
    )
  }
}

