"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface UseIntersectionObserverProps {
  threshold?: number
  root?: Element | null
  rootMargin?: string
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = "0px",
  freezeOnceVisible = false,
}: UseIntersectionObserverProps = {}) {
  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const [node, setNode] = useState<Element | null>(null)
  const observer = useRef<IntersectionObserver | null>(null)

  const frozen = entry?.isIntersecting && freezeOnceVisible

  const updateEntry = useCallback(([entry]: IntersectionObserverEntry[]) => {
    setEntry(entry)
  }, [])

  useEffect(() => {
    const hasIOSupport = !!window.IntersectionObserver

    if (!hasIOSupport || frozen || !node) return

    const observerParams = { threshold, root, rootMargin }
    observer.current = new IntersectionObserver(updateEntry, observerParams)
    observer.current.observe(node)

    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
    }
  }, [node, threshold, root, rootMargin, frozen, updateEntry])

  return [setNode, entry?.isIntersecting ?? false] as const
}

