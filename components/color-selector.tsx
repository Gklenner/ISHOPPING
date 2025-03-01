"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

const colors = [
  { id: "black", value: "#000000" },
  { id: "white", value: "#ffffff" },
  { id: "red", value: "#f63c3c" },
  { id: "blue", value: "#004cff" },
  { id: "yellow", value: "#f3bc15" },
]

export function ColorSelector() {
  const [selectedColor, setSelectedColor] = useState("black")

  return (
    <div className="flex space-x-3">
      {colors.map((color) => (
        <button
          key={color.id}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            selectedColor === color.id ? "ring-2 ring-primary ring-offset-2" : "",
          )}
          style={{ backgroundColor: color.value }}
          onClick={() => setSelectedColor(color.id)}
          aria-label={`Select ${color.id} color`}
        >
          {selectedColor === color.id && (
            <span className={`text-${color.id === "white" || color.id === "yellow" ? "black" : "white"}`}>✓</span>
          )}
        </button>
      ))}
    </div>
  )
}

