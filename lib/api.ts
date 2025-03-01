"use server"

import { cache } from "react"
import { cookies } from "next/headers"

// Cache de dados para melhor performance
export const getProducts = cache(async () => {
  // Simula delay de API
  await new Promise((resolve) => setTimeout(resolve, 500))

  return [
    {
      id: "1",
      name: "Vestido Floral Verão",
      price: 159.9,
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.5,
      isNew: true,
      discount: 20,
    },
    // ... mais produtos
  ]
})

export const getCategories = cache(async () => {
  return [
    {
      id: "all",
      name: "Todos",
      icon: "/icons/all.svg",
    },
    {
      id: "women",
      name: "Feminino",
      icon: "/icons/women.svg",
    },
    // ... mais categorias
  ]
})

export const addToCart = async (productId: string, quantity = 1) => {
  const cartCookie = cookies().get("cart")
  const cart = cartCookie ? JSON.parse(cartCookie.value) : []

  const existingItem = cart.find((item: any) => item.productId === productId)

  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.push({ productId, quantity })
  }

  cookies().set("cart", JSON.stringify(cart))
  return { success: true }
}

export const getCart = async () => {
  const cartCookie = cookies().get("cart")
  if (!cartCookie) return []

  const cart = JSON.parse(cartCookie.value)
  const products = await getProducts()

  return cart.map((item: any) => ({
    ...item,
    product: products.find((p) => p.id === item.productId),
  }))
}

