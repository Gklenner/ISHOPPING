"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"

type CategoryButtonProps = {
  category: {
    id: string
    name: string
    icon: string
  }
  isActive: boolean
  onClick: () => void
}

export function CategoryButton({ category, isActive, onClick }: CategoryButtonProps) {
  return (
    <motion.button whileTap={{ scale: 0.95 }} onClick={onClick} className="flex flex-col items-center">
      <motion.div
        animate={{
          scale: isActive ? 1.1 : 1,
          backgroundColor: isActive ? "var(--primary)" : "var(--secondary)",
        }}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-colors",
          isActive && "text-white",
        )}
      >
        <Image
          src={category.icon || "/placeholder.svg"}
          alt={category.name}
          width={24}
          height={24}
          className={isActive ? "text-white" : ""}
        />
      </motion.div>
      <span className={cn("text-sm", isActive ? "font-medium" : "text-muted-foreground")}>{category.name}</span>
    </motion.button>
  )
}

