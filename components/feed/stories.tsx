"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"

type Story = {
  id: string
  user: {
    id: string
    name: string
    image: string
  }
  image: string
  seen: boolean
}

export function Stories() {
  const [activeStory, setActiveStory] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  // Simulated stories data
  const stories: Story[] = [
    {
      id: "1",
      user: {
        id: "1",
        name: "Seu Story",
        image: "/placeholder.svg?height=60&width=60",
      },
      image: "/placeholder.svg?height=200&width=120",
      seen: false,
    },
    // ... more stories
  ]

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="bg-white p-4">
      <div className="relative">
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {/* Add Story Button */}
          <div className="flex-shrink-0">
            <div className="relative w-20">
              <div className="relative w-15 h-15 mb-1">
                <div className="w-15 h-15 rounded-full bg-gray-100 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
              </div>
              <span className="text-xs text-center block mt-1">Criar story</span>
            </div>
          </div>

          {/* Stories List */}
          {stories.map((story) => (
            <button key={story.id} className="flex-shrink-0" onClick={() => setActiveStory(story.id)}>
              <div className="relative w-20">
                <div
                  className={cn(
                    "relative w-15 h-15 rounded-full p-0.5",
                    story.seen ? "bg-gray-200" : "bg-gradient-to-tr from-primary to-pink-500",
                  )}
                >
                  <Image
                    src={story.user.image || "/placeholder.svg"}
                    alt={story.user.name}
                    width={60}
                    height={60}
                    className="rounded-full border-2 border-white"
                  />
                </div>
                <span className="text-xs text-center block mt-1 truncate">{story.user.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {activeStory && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black"
          onClick={() => setActiveStory(null)}
        >
          <div className="h-full flex items-center justify-center">
            <Image
              src={stories.find((s) => s.id === activeStory)?.image || ""}
              alt="Story"
              width={390}
              height={844}
              className="object-contain"
            />
          </div>
        </motion.div>
      )}
    </div>
  )
}

