"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Heart, ShoppingBag, Share2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SizeSelector } from "@/components/size-selector"
import { ColorSelector } from "@/components/color-selector"

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

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`)
        if (!response.ok) throw new Error('Product not found')
        const data = await response.json()
        setProduct(data)
      } catch (error) {
        setError('Failed to load product')
        console.error('Error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  const handleAddToCart = async () => {
    if (!product) return
    if (!selectedSize) {
      setError('Please select a size')
      return
    }
    if (!selectedColor) {
      setError('Please select a color')
      return
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          size: selectedSize,
          color: selectedColor,
          quantity: 1
        }),
      })

      if (!response.ok) throw new Error('Failed to add to cart')
      
      // Update product stock
      const updatedProduct = { ...product, stock: product.stock - 1 }
      setProduct(updatedProduct)
    } catch (error) {
      setError('Failed to add item to cart')
      console.error('Error adding to cart:', error)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>
  if (!product) return <div>Product not found</div>

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <header className="p-4 flex items-center justify-between">
        <Link href="/home">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-semibold">Product Details</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsFavorite(!isFavorite)}>
            <Heart className={`h-6 w-6 ${isFavorite ? "fill-destructive text-destructive" : ""}`} />
          </button>
          <button>
            <Share2 className="h-6 w-6" />
          </button>
        </div>
      </header>

      <div className="relative w-full h-[450px] bg-secondary">
        <Image src={product.image} alt={product.name} fill className="object-cover" />
      </div>

      <div className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <div className="flex items-center mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground ml-2">(120 Reviews)</span>
            </div>
          </div>
          <div className="text-xl font-bold">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(product.price)}
          </div>
        </div>

        <Tabs defaultValue="description">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="similar">Similar</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="text-sm text-muted-foreground">
            <p>{product.description}</p>
            {product.stock < 10 && (
              <p className="mt-2 text-red-600">Only {product.stock} items left in stock!</p>
            )}
          </TabsContent>
          <TabsContent value="reviews">
            <div className="space-y-4">
              {/* Reviews content */}
            </div>
          </TabsContent>
          <TabsContent value="similar">
            <div className="grid grid-cols-2 gap-4">
              {/* Similar products content */}
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-4 pt-2">
          <div>
            <h3 className="font-medium mb-2">Select Size</h3>
            <SizeSelector
              sizes={product.sizes || []}
              selectedSize={selectedSize}
              onSelect={setSelectedSize}
            />
          </div>

          <div>
            <h3 className="font-medium mb-2">Select Color</h3>
            <ColorSelector
              colors={product.colors || []}
              selectedColor={selectedColor}
              onSelect={setSelectedColor}
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t max-w-[390px] mx-auto">
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          <ShoppingBag className="h-5 w-5 mr-2" />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
    </div>
  )
}

