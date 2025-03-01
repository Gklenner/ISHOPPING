"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, Send, ImageIcon, Mic } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useChat } from "@/hooks/use-chat"
import { useAuth } from "@/context/auth-context"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function ChatPage({ params }: { params: { id: string } }) {
  const [message, setMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const { messages, sendMessage, isTyping } = useChat(params.id)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const handleSend = async () => {
    if (!message.trim()) return
    await sendMessage(message)
    setMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Upload file and send message
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/chat/upload", {
        method: "POST",
        body: formData,
      })
      const { url } = await response.json()
      await sendMessage("", { attachment: url })
    } catch (error) {
      console.error("Error uploading file:", error)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks)
        const formData = new FormData()
        formData.append("audio", audioBlob)

        try {
          const response = await fetch("/api/chat/upload", {
            method: "POST",
            body: formData,
          })
          const { url } = await response.json()
          await sendMessage("", { audio: url })
        } catch (error) {
          console.error("Error uploading audio:", error)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Update recording time
      const interval = setInterval(() => {
        setRecordingTime((time) => time + 1)
      }, 1000)

      // Stop recording after 1 minute
      setTimeout(() => {
        mediaRecorder.stop()
        stream.getTracks().forEach((track) => track.stop())
        setIsRecording(false)
        setRecordingTime(0)
        clearInterval(interval)
      }, 60000)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-[390px] mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()}>
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src="/placeholder.svg?height=40&width=40"
                  alt="Support"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <h2 className="font-medium">Suporte Shoppe</h2>
                <p className="text-xs text-muted-foreground">{isTyping ? "Digitando..." : "Online"}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-[390px] mx-auto space-y-4">
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.sender === user?.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3 ${
                  msg.sender === user?.id ? "bg-primary text-white" : "bg-white"
                }`}
              >
                {msg.attachment && (
                  <Image
                    src={msg.attachment || "/placeholder.svg"}
                    alt="Attachment"
                    width={200}
                    height={200}
                    className="rounded-lg mb-2"
                  />
                )}
                {msg.audio && (
                  <audio controls className="w-full">
                    <source src={msg.audio} type="audio/mpeg" />
                  </audio>
                )}
                {msg.text && <p className="text-sm">{msg.text}</p>}
                <p className={`text-xs mt-1 ${msg.sender === user?.id ? "text-white/70" : "text-muted-foreground"}`}>
                  {formatDistanceToNow(new Date(msg.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </p>
              </div>
            </motion.div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </main>

      <footer className="bg-white border-t p-4">
        <div className="max-w-[390px] mx-auto">
          <div className="flex items-center gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="rounded-full"
            />
            <div className="flex gap-2">
              <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleFileUpload} />
              <label htmlFor="file-upload">
                <Button type="button" variant="ghost" size="icon" className="rounded-full">
                  <ImageIcon className="h-5 w-5" />
                </Button>
              </label>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => startRecording()}
                disabled={isRecording}
              >
                <Mic className={`h-5 w-5 ${isRecording ? "text-red-500" : ""}`} />
              </Button>
              <Button
                type="button"
                size="icon"
                className="rounded-full"
                onClick={handleSend}
                disabled={!message.trim() && !isRecording}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
          {isRecording && <div className="text-xs text-red-500 mt-1">Gravando: {recordingTime}s</div>}
        </div>
      </footer>
    </div>
  )
}

