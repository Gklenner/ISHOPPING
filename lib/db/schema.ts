import { z } from "zod"

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  role: z.enum(["user", "admin"]),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  category: z.string(),
  stock: z.number().int().min(0),
  status: z.enum(["active", "draft"]),
  image: z.string().url(),
  rating: z.number().min(0).max(5),
  isNew: z.boolean().optional(),
  discount: z.number().min(0).max(100).optional(),
  sku: z.string(),
  variants: z.array(z.object({
    id: z.string(),
    size: z.string(),
    color: z.string(),
    stock: z.number().int().min(0)
  })).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const orderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().int().positive(),
    price: z.number().positive()
  })),
  status: z.enum(["pending", "processing", "completed", "cancelled"]),
  total: z.number().positive(),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    country: z.string()
  }),
  paymentInfo: z.object({
    provider: z.string(),
    transactionId: z.string(),
    status: z.enum(["pending", "success", "failed"])
  }),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const reviewSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const wishlistSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string(),
  createdAt: z.date()
})

export type User = z.infer<typeof userSchema>
export type Product = z.infer<typeof productSchema>
export type Order = z.infer<typeof orderSchema>
export type Review = z.infer<typeof reviewSchema>
export type Wishlist = z.infer<typeof wishlistSchema>