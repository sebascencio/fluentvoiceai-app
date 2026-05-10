"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Mic, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatMessage } from "@/components/custom/chat-message"
import { AvatarPlaceholder } from "@/components/custom/avatar-placeholder"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase" // Tu conexión a Supabase

type AvatarState = "idle" | "listening" | "speaking"

export function ConversationContent() {
  // 1. Iniciamos con mensajes vacíos (luego los traeremos de la DB)
  const [messages, setMessages] = useState<any[]>([])
  const [inputValue, setInputValue] = useState("")
  const [avatarState, setAvatarState] = useState<AvatarState>("idle")
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Perfil dinámico
  const [userProfile, setProfile] = useState({ name: "Sebastian", level: "A2" })
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 2. Cargar perfil desde Supabase al entrar
  useEffect(() => {
    async function loadData() {
      const { data: profile } = await supabase.from('profiles').select('*').single()
      if (profile) {
        setProfile({ 
          name: profile.full_name || "Sebastian", 
          level: profile.english_level || "A2" 
        })
      }
    }
    loadData()
  }, [])

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const userContent = inputValue
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const newUserMessage = {
      id: Date.now(),
      role: "user" as const,
      content: userContent,
      timestamp: timestamp,
    }

    setMessages(prev => [...prev, newUserMessage])
    setInputValue("")
    setIsLoading(true)
    setAvatarState("speaking") // El avatar reacciona mientras Sarah "piensa"

    try {
      // 3. Llamada REAL a nuestra API de Sarah
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, newUserMessage],
          userName: userProfile.name,
          userLevel: userProfile.level
        }),
      })

      const data = await response.json()
      
      const botResponse = {
        id: Date.now() + 1,
        role: "assistant" as const,
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      console.error("Error con Sarah:", error)
    } finally {
      setIsLoading(false)
      setAvatarState("idle")
    }
  }

  const handleMicClick = () => {
    if (isRecording) {
      setIsRecording(false)
      setAvatarState("idle")
    } else {
      setIsRecording(true)
      setAvatarState("listening")
      setTimeout(() => {
        setIsRecording(false)
        setAvatarState("idle")
      }, 3000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="animate-fade-in h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Conversación</h1>
          <p className="text-sm text-muted-foreground">Practica con Sarah, tu tutora de nivel {userProfile.level}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className="rounded-xl"
        >
          {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        <div className="hidden lg:flex lg:w-1/3 flex-col items-center justify-center bg-card rounded-2xl p-6">
          <AvatarPlaceholder state={avatarState} size="lg" />
          <div className="mt-6 text-center">
            <h3 className="font-semibold text-foreground">Sarah</h3>
            <p className="text-sm text-muted-foreground">Tu tutora de inglés</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-card rounded-2xl overflow-hidden min-h-0">
          <div className="lg:hidden flex items-center gap-3 p-4 border-b border-border">
            <AvatarPlaceholder state={avatarState} size="sm" />
            <div>
              <h3 className="font-semibold text-foreground text-sm">Sarah</h3>
              <p className="text-xs text-muted-foreground">Tu tutora de inglés</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
            <div className="flex flex-col gap-4">
              {messages.length === 0 && (
                <p className="text-center text-muted-foreground text-sm mt-4">
                  Saluda a Sarah para comenzar la clase...
                </p>
              )}
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  content={message.content}
                  role={message.role}
                  timestamp={message.timestamp}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Button
                variant={isRecording ? "destructive" : "secondary"}
                size="icon"
                onClick={handleMicClick}
                className={cn("rounded-xl shrink-0 transition-all", isRecording && "animate-pulse-soft")}
                disabled={isLoading}
              >
                <Mic className="w-5 h-5" />
              </Button>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isLoading ? "Sarah está escribiendo..." : "Escribe tu mensaje en inglés..."}
                className="flex-1 rounded-xl"
                disabled={isRecording || isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isRecording || isLoading}
                className="rounded-xl shrink-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
