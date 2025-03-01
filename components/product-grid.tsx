import Link from "next/link"
import Image from "next/image"
import { Heart } from "lucide-react"

type ProductGridProps = {
  featured?: boolean
}

const products = [
  {
    id: "1",
    name: "Floral Summer Dress",
    price: 59.99,
    image: "/placeholder.svg?height=200&width=150",
    isNew: true,
  },
  {
    id: "2",
    name: "Casual White Blouse",
    price: 39.99,
    image: "/placeholder.svg?height=200&width=150",
    isNew: true,
  },
  {
    id: "3",
    name: "Denim Jacket",
    price: 79.99,
    image: "/placeholder.svg?height=200&width=150",
    isNew: false,
  },
  {
    id: "4",
    name: "Black Mini Skirt",
    price: 49.99,
    image: "/placeholder.svg?height=200&width=150",
    isNew: false,
  },
]

export function ProductGrid({ featured = false }: ProductGridProps) {
  const displayProducts = featured ? products.slice(0, 2) : products

  return (
    <div className="grid grid-cols-2 gap-4">
      {displayProducts.map((product) => (
        <Link href={`/product/${product.id}`} key={product.id} className="group">
          <div className="relative aspect-[3/4] bg-secondary rounded-lg overflow-hidden mb-2">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            <button className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <Heart className="h-4 w-4" />
            </button>
            {product.isNew && (
              <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">New</div>
            )}
          </div>
          <h3 className="font-medium text-sm">{product.name}</h3>
          <p className="text-sm font-bold">${product.price}</p>
        </Link>
      ))}
    </div>
  )
}

