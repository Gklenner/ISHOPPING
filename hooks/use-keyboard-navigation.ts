"use client"

import type React from "react"

import { useEffect } from "react"

export function useKeyboardNavigation(
  containerRef: React.RefObject<HTMLElement>,
  itemSelector: string,
  onSelect?: (element: HTMLElement) => void,
) {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const items = Array.from(container.querySelectorAll(itemSelector)) as HTMLElement[]
      const currentIndex = items.findIndex((item) => item === document.activeElement)

      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          e.preventDefault()
          const nextIndex = (currentIndex + 1) % items.length
          items[nextIndex]?.focus()
          break

        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault()
          const prevIndex = currentIndex === -1 ? items.length - 1 : (currentIndex - 1 + items.length) % items.length
          items[prevIndex]?.focus()
          break

        case "Enter":
        case " ":
          e.preventDefault()
          const current = document.activeElement as HTMLElement
          if (current && items.includes(current)) {
            onSelect?.(current)
          }
          break
      }
    }

    container.addEventListener("keydown", handleKeyDown)
    return () => container.removeEventListener("keydown", handleKeyDown)
  }, [containerRef, itemSelector, onSelect])
}

