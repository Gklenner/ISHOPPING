"use client"

import type React from "react"
import { Loader2 } from "lucide-react"
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh"

type PullToRefreshProps = {
  onRefresh: () => Promise<void>
  children: React.ReactNode
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const { elementRef, isPulling } = usePullToRefresh(onRefresh)

  return (
    <div ref={elementRef} className="min-h-screen">
      {isPulling && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      {children}
    </div>
  )
}

