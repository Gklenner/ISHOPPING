"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

const categories = [
  { id: "all", name: "All", icon: "/placeholder.svg?height=40&width=40" },
  { id: "women", name: "Women", icon: "/placeholder.svg?height=40&width=40" },
  { id: "men", name: "Men", icon: "/placeholder.svg?height=40&width=40" },
  { id: "kids", name: "Kids", icon: "/placeholder.svg?height=40&width=40" },
  { id: "accessories", name: "Accessories", icon: "/placeholder.svg?height=40&width=40" },
]

export function CategoryList() {
  const [activeCategory, setActiveCategory] = useState("all")

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Categories</h2>
        <Link href="/categories" className="text-primary text-sm">
          See All
        </Link>
      </div>
      <div className="flex space-x-4 overflow-x-auto pb-2 -mx-1 px-1">
        {categories.map((category) => (
          <button
            key={category.id}
            className="flex flex-col items-center min-w-[70px]"
            onClick={() => setActiveCategory(category.id)}
          >
            <div
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center mb-2",
                activeCategory === category.id ? "bg-primary" : "bg-secondary",
              )}
            >
              <Image
                src={category.icon || "/placeholder.svg"}
                alt={category.name}
                width={24}
                height={24}
                className={activeCategory === category.id ? "text-white" : ""}
              />
            </div>
            <span className={cn("text-xs", activeCategory === category.id ? "font-medium" : "text-muted-foreground")}>
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

