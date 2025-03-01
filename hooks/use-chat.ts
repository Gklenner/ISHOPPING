"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"

type Message = {
  id: string
  text?: string
  attachment?: string
  audio?: string
  sender: string
  createdAt: string
}

export function useChat(chatId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    // Conectar ao WebSocket
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/chat/${chatId}?userId=${user.id}`)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === "typing") {
        setIsTyping(data.typing)
      } else {
        setMessages((prev) => [...prev, data])
      }
    }

    // Carregar mensagens anteriores
    fetch(`/api/chat/${chatId}/messages`)
      .then((res) => res.json())
      .then((data) => setMessages(data))

    return () => ws.close()
  }, [chatId, user])

  const sendMessage = async (text: string, attachments?: { attachment?: string; audio?: string }) => {
    const message = {
      id: Date.now().toString(),
      text,
      ...attachments,
      sender: user?.id,
      createdAt: new Date().toISOString(),
    }

    // Otimistic update
    setMessages((prev) => [...prev, message])

    // Enviar para o servidor
    await fetch(`/api/chat/${chatId}/messages`, {
      method: "POST",
      body: JSON.stringify(message),
    })
  }

  return {
    messages,
    sendMessage,
    isTyping,
  }
}

