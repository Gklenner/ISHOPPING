"use client"

import { ShoppingCart } from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface OrderSummaryProps {
  cart: CartItem[]
  total: number
}

export function OrderSummary({ cart, total }: OrderSummaryProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-5 w-5" />
        <h2 className="font-semibold">Order Summary</h2>
      </div>

      <div className="divide-y">
        {cart.map((item) => (
          <div key={item.id} className="py-3 flex justify-between">
            <div className="space-y-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
            </div>
            <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
          </div>
        ))}
      </div>

      <div className="pt-4 flex justify-between items-center font-semibold">
        <p>Total</p>
        <p>{formatPrice(total)}</p>
      </div>
    </div>
  )
}