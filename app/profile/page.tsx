"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { User, Settings, ShoppingBag, Heart, CreditCard, MapPin, Bell, HelpCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { logout } from "@/lib/auth"

const menuItems = [
  {
    icon: ShoppingBag,
    label: "Meus Pedidos",
    href: "/orders",
  },
  {
    icon: Heart,
    label: "Lista de Desejos",
    href: "/wishlist",
  },
  {
    icon: CreditCard,
    label: "Métodos de Pagamento",
    href: "/payment-methods",
  },
  {
    icon: MapPin,
    label: "Endereços",
    href: "/addresses",
  },
  {
    icon: Bell,
    label: "Notificações",
    href: "/notifications",
  },
  {
    icon: HelpCircle,
    label: "Ajuda & Suporte",
    href: "/support",
  },
  {
    icon: Settings,
    label: "Configurações",
    href: "/settings",
  },
]

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    try {
      setLoading(true)
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white">
        <div className="max-w-[390px] mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Image
                src="/placeholder.svg?height=80&width=80"
                alt={user?.name || "User"}
                width={80}
                height={80}
                className="rounded-full border-4 border-white"
              />
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-1">
                <User className="h-4 w-4 text-primary" />
              </button>
            </div>
            <div>
              <h1 className="text-xl font-semibold">{user?.name}</h1>
              <p className="text-sm opacity-90">{user?.email}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[390px] mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm divide-y">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.button
                key={item.label}
                onClick={() => router.push(item.href)}
                className="flex items-center gap-4 w-full p-4 text-left"
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span>{item.label}</span>
              </motion.button>
            )
          })}
        </div>

        <Button variant="destructive" className="w-full mt-6" onClick={handleLogout} disabled={loading}>
          <LogOut className="h-5 w-5 mr-2" />
          {loading ? "Saindo..." : "Sair"}
        </Button>
      </main>
    </div>
  )
}

