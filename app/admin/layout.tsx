"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  BarChart,
  Tag,
  Bell,
} from "lucide-react"

const menuItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/admin",
  },
  {
    icon: Package,
    label: "Products",
    href: "/admin/products",
  },
  {
    icon: ShoppingCart,
    label: "Orders",
    href: "/admin/orders",
  },
  {
    icon: Users,
    label: "Customers",
    href: "/admin/customers",
  },
  {
    icon: Tag,
    label: "Discounts",
    href: "/admin/discounts",
  },
  {
    icon: Bell,
    label: "Notifications",
    href: "/admin/notifications",
  },
  {
    icon: BarChart,
    label: "Analytics",
    href: "/admin/analytics",
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/admin/settings",
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        className="bg-white border-r h-screen sticky top-0"
      >
        <div className="p-4 border-b">
          <h1 className="font-semibold text-xl">Admin</h1>
        </div>

        <nav className="p-2 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <motion.button
                key={item.label}
                onClick={() => router.push(item.href)}
                className="flex items-center gap-4 w-full p-3 text-left hover:bg-gray-100 rounded-lg"
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="h-5 w-5 text-muted-foreground" />
                {!collapsed && <span>{item.label}</span>}
              </motion.button>
            )
          })}
        </nav>
      </motion.aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}