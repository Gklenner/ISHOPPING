"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface UseInfiniteScrollOptions<T> {
  initialData?: T[]
  fetchData: (page: number) => Promise<T[]>
  pageSize?: number
}

export function useInfiniteScroll<T>({ initialData = [], fetchData, pageSize = 10 }: UseInfiniteScrollOptions<T>) {
  const [data, setData] = useState<T[]>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const loadingRef = useRef(false)

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return
    loadingRef.current = true
    setLoading(true)
    setError(null)

    try {
      const newData = await fetchData(page)
      if (newData.length < pageSize) {
        setHasMore(false)
      }
      setData((prev) => [...prev, ...newData])
      setPage((prev) => prev + 1)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch data"))
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [fetchData, page, pageSize, hasMore])

  const refresh = useCallback(async () => {
    setPage(1)
    setData([])
    setHasMore(true)
    await loadMore()
  }, [loadMore])

  useEffect(() => {
    if (initialData.length === 0) {
      loadMore()
    }
  }, [initialData.length, loadMore])

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  }
}

