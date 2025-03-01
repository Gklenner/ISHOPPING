"use client"

import type React from "react"
import { useEffect, useState, createContext, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const toastVariants = cva("pointer-events-auto relative w-full max-w-md overflow-hidden rounded-lg p-4 shadow-lg", {
  variants: {
    variant: {
      default: "bg-background text-foreground",
      destructive: "bg-destructive text-destructive-foreground",
      success: "bg-green-500 text-white",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const ToastContext = createContext<{ toasts: any[] }>({ toasts: [] })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <ToastContext.Provider value={{ toasts: [] }}>{children}</ToastContext.Provider>
}

export function ToastViewport() {
  return (
    <div className="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      <slot />
    </div>
  )
}

export function ToastTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-semibold">{children}</div>
}

export function ToastDescription({ children }: { children: React.ReactNode }) {
  return <div className="mt-1 text-sm opacity-90">{children}</div>
}

export function ToastClose() {
  return (
    <button className="shrink-0 rounded-md p-1 opacity-60 transition-opacity hover:opacity-100">
      <X className="h-4 w-4" />
      <span className="sr-only">Fechar</span>
    </button>
  )
}

export interface ToastProps extends VariantProps<typeof toastVariants> {
  title?: string
  description?: string
  action?: React.ReactNode
  onClose?: () => void
  duration?: number
}

export function Toast({ title, description, action, variant, onClose, duration = 5000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={cn(toastVariants({ variant }))}
          role="alert"
          aria-live="polite"
        >
          <div className="flex w-full items-start gap-4">
            <div className="flex-1">
              {title && <div className="text-sm font-semibold">{title}</div>}
              {description && <div className="mt-1 text-sm opacity-90">{description}</div>}
            </div>
            <button
              onClick={() => {
                setIsVisible(false)
                onClose?.()
              }}
              className="shrink-0 rounded-md p-1 opacity-60 transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </button>
          </div>
          {action && <div className="mt-2 flex items-center gap-2">{action}</div>}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

