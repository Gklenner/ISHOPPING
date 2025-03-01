"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

interface WishlistItem {
  id: string
  productId: string
  userId: string
  product: {
    id: string
    name: string
    price: number
    description: string
    images: string[]
  }
}

export default function WishlistPage() {
  const { user } = useAuth()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await fetch('/api/wishlist')
        if (!response.ok) throw new Error('Failed to fetch wishlist')
        const data = await response.json()
        setWishlistItems(data)
      } catch (error) {
        console.error('Error fetching wishlist:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchWishlist()
    }
  }, [user])

  const removeFromWishlist = async (productId: string) => {
    try {
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to remove from wishlist')
      
      setWishlistItems(prev => 
        prev.filter(item => item.productId !== productId)
      )
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Heart className="h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Lista de Desejos</h1>
        <p className="text-gray-600 mb-4 text-center">
          Faça login para ver sua lista de desejos
        </p>
        <Button onClick={() => window.location.href = '/login'}>Login</Button>
      </div>
    )
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Heart className="h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Lista de Desejos Vazia</h1>
        <p className="text-gray-600 mb-4 text-center">
          Você ainda não adicionou nenhum produto à sua lista de desejos
        </p>
        <Button onClick={() => window.location.href = '/'}>
          Explorar Produtos
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-semibold mb-6">Minha Lista de Desejos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {wishlistItems.map((item) => (
          <div key={item.id} className="relative">
            <ProductCard
              product={item.product}
              href={`/product/${item.productId}`}
            />
            <button
              onClick={() => removeFromWishlist(item.productId)}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md"
              aria-label="Remove from wishlist"
            >
              <Heart className="h-5 w-5 text-red-500 fill-current" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}