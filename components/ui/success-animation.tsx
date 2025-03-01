"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

export function SuccessAnimation() {
  return (
    <div className="flex items-center justify-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="rounded-full bg-green-100 p-2">
        <motion.div
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Check className="h-6 w-6 text-green-600" />
        </motion.div>
      </motion.div>
    </div>
  )
}

