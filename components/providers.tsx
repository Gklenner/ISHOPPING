"use client"

import type React from "react"

import { useEffect } from "react"
import { ErrorBoundary } from "@/components/error-boundary"
import { AuthProvider } from "@/context/auth-context"
import { ThemeProvider } from "@/context/theme-context"
import { initErrorTracking } from "@/lib/error-tracking"
import { Toaster } from "@/components/ui/toaster"
import { LoadingScreen } from "@/components/loading-screen"

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initErrorTracking()
  }, [])

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          {children}
          <Toaster />
          <LoadingScreen />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

