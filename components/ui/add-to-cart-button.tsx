"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, Check } from "lucide-react"
import { Button } from "./button"

type AddToCartButtonProps = {
  onAdd: () => Promise<void>
}

export function AddToCartButton({ onAdd }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleClick = async () => {
    try {
      setLoading(true)
      await onAdd()
      setSuccess(true)
      // Trigger haptic feedback
      if ("vibrate" in navigator) {
        navigator.vibrate([10, 50, 10])
      }
      setTimeout(() => setSuccess(false), 2000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6"
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
            </motion.div>
            Adicionando...
          </motion.div>
        ) : success ? (
          <motion.div
            key="success"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="flex items-center"
          >
            <Check className="h-5 w-5 mr-2" />
            Adicionado!
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center"
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            Adicionar ao Carrinho
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  )
}

