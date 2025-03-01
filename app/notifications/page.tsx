"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Package, Tag, Heart, MessageCircle } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function NotificationsPage() {
  const { notifications, markAsRead } = useNotifications()
  const [filter, setFilter] = useState("all")

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true
    return notification.type === filter
  })

  useEffect(() => {
    // Registrar service worker para push notifications
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then(async (registration) => {
        const permission = await Notification.requestPermission()
        if (permission === "granted") {
          // Enviar subscription para o backend
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
          })
          await fetch("/api/notifications/subscribe", {
            method: "POST",
            body: JSON.stringify(subscription),
          })
        }
      })
    }
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className="h-5 w-5" />
      case "promotion":
        return <Tag className="h-5 w-5" />
      case "wishlist":
        return <Heart className="h-5 w-5" />
      case "chat":
        return <MessageCircle className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-[390px] mx-auto px-4 py-4">
          <h1 className="text-lg font-semibold">Notificações</h1>
        </div>
      </header>

      <main className="max-w-[390px] mx-auto">
        <div className="flex gap-2 p-4 overflow-x-auto">
          {["all", "order", "promotion", "wishlist", "chat"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                filter === type ? "bg-primary text-white" : "bg-white text-muted-foreground"
              }`}
            >
              {type === "all" ? "Todas" : type}
            </button>
          ))}
        </div>

        <div className="divide-y">
          <AnimatePresence initial={false}>
            {filteredNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className={`p-4 bg-white ${!notification.read ? "bg-blue-50" : ""}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex gap-4">
                  <div className={`${!notification.read ? "text-primary" : "text-muted-foreground"}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

