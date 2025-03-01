"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Heart, Star } from "lucide-react"

type ProductCardProps = {
  product: {
    id: string
    name: string
    price: number
    image: string
    rating: number
    isNew?: boolean
    discount?: number
  }
  index: number
}

export function ProductCard({ product, index }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Link href={`/product/${product.id}`} className="group block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <button
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm 
                     shadow-sm transition-transform duration-200 hover:scale-110 active:scale-95"
          >
            <Heart className="h-5 w-5" />
          </button>

          {product.isNew && (
            <div
              className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium
                          bg-primary text-white shadow-sm"
            >
              Novo
            </div>
          )}

          {product.discount && (
            <div
              className="absolute bottom-3 left-3 px-2 py-1 rounded-full text-xs font-medium
                          bg-destructive text-white shadow-sm"
            >
              -{product.discount}%
            </div>
          )}
        </div>

        <div className="mt-3 space-y-1">
          <h3 className="font-medium line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center text-yellow-400">
              <Star className="h-4 w-4 fill-current" />
              <span className="ml-1 text-sm font-medium text-foreground">{product.rating}</span>
            </div>
            {product.discount ? (
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-muted-foreground line-through">
                  R${product.price.toFixed(2)}
                </span>
                <span className="text-sm font-bold text-destructive">
                  R${(product.price * (1 - product.discount / 100)).toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-sm font-bold">R${product.price.toFixed(2)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

