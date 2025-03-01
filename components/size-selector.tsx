"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const sizes = ["XS", "S", "M", "L", "XL"]

export function SizeSelector() {
  const [selectedSize, setSelectedSize] = useState("M")

  return (
    <div className="flex space-x-3">
      {sizes.map((size) => (
        <button
          key={size}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center border",
            selectedSize === size
              ? "border-primary bg-primary/10 text-primary font-medium"
              : "border-border text-foreground",
          )}
          onClick={() => setSelectedSize(size)}
        >
          {size}
        </button>
      ))}
    </div>
  )
}

