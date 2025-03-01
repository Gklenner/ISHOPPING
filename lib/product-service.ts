import { cookies } from "next/headers"

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  status: "active" | "draft"
  image: string
  rating: number
  isNew?: boolean
  discount?: number
}

export interface ProductResponse {
  success: boolean
  product?: Product
  products?: Product[]
  error?: string
}

import prisma from './db/prisma'

export async function getProducts(): Promise<ProductResponse> {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: true,
        reviews: true
      }
    })
    return { success: true, products }
  } catch (error) {
    console.error("Get products error:", error)
    return { success: false, error: "Failed to fetch products" }
  }
}

export async function getProduct(id: string): Promise<ProductResponse> {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        reviews: true
      }
    })
    if (!product) {
      return { success: false, error: "Product not found" }
    }
    return { success: true, product }
  } catch (error) {
    console.error("Get product error:", error)
    return { success: false, error: "Failed to fetch product" }
  }
}

export async function createProduct(productData: Omit<Product, "id">): Promise<ProductResponse> {
  try {
    const newProduct = await prisma.product.create({
      data: productData,
      include: {
        variants: true
      }
    })
    return { success: true, product: newProduct }
  } catch (error) {
    console.error("Create product error:", error)
    return { success: false, error: "Failed to create product" }
  }
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<ProductResponse> {
  try {
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: productData,
      include: {
        variants: true,
        reviews: true
      }
    })
    return { success: true, product: updatedProduct }
  } catch (error) {
    console.error("Update product error:", error)
    return { success: false, error: "Failed to update product" }
  }
}

export async function deleteProduct(id: string): Promise<ProductResponse> {
  try {
    await prisma.product.delete({
      where: { id }
    })
    return { success: true }
  } catch (error) {
    console.error("Delete product error:", error)
    return { success: false, error: "Failed to delete product" }
  }
}