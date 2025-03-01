"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"

type Notification = {
  id: string
  type: "order" | "promotion" | "wishlist" | "chat"
  title: string
  message: string
  read: boolean
  createdAt: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    // Conectar ao WebSocket
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/notifications?userId=${user.id}`)

    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data)
      setNotifications((prev) => [notification, ...prev])

      // Mostrar notificação nativa se permitido
      if (Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/icon-192x192.png",
        })
      }
    }

    // Carregar notificações existentes
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(data))

    return () => ws.close()
  }, [user])

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" })
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  return {
    notifications,
    markAsRead,
    unreadCount: notifications.filter((n) => !n.read).length,
  }
}

