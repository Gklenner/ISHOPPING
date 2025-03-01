"use client"

import { useEffect, useRef, useState } from "react"

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isPulling, setIsPulling] = useState(false)
  const startY = useRef(0)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY
      }
    }

    const handleTouchMove = async (e: TouchEvent) => {
      if (window.scrollY > 0) return

      const pull = e.touches[0].clientY - startY.current
      if (pull > 50) {
        setIsPulling(true)
        // Trigger haptic feedback
        if ("vibrate" in navigator) {
          navigator.vibrate(10)
        }
      }
    }

    const handleTouchEnd = async () => {
      if (isPulling) {
        await onRefresh()
        setIsPulling(false)
      }
    }

    element.addEventListener("touchstart", handleTouchStart)
    element.addEventListener("touchmove", handleTouchMove)
    element.addEventListener("touchend", handleTouchEnd)

    return () => {
      element.removeEventListener("touchstart", handleTouchStart)
      element.removeEventListener("touchmove", handleTouchMove)
      element.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isPulling, onRefresh])

  return { elementRef, isPulling }
}

