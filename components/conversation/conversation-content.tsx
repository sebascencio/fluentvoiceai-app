"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Mic, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatMessage } from "@/components/custom/chat-message"
import { AvatarPlaceholder } from "@/components/custom/avatar-placeholder"
import { cn } from "@/lib/utils"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

type AvatarState = "idle" | "listening" | "speaking"

interface Message {
  id: number
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export function ConversationContent() {
  // Estado de montaje para evitar hydration mismatch
  const [isMounted, setIsMounted] = useState(false)
  
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [avatarState, setAvatarState] = useState<AvatarState>("idle")
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Perfil dinámico
  const [userProfile, setProfile] = useState({ name: "Usuario", level: "A2" })
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Marcar como montado en el cliente
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Cargar perfil desde Supabase al entrar (solo si está configurado)
  useEffect(() => {
    async function loadData() {
      if (!isSupabaseConfigured() || !supabase) return
      
      try {
        const { data: profile } = await supabase.from('profiles').select('*').single()
        if (profile) {
          setProfile({ 
            name: profile.full_name || "Usuario", 
            level: profile.english_level || "A2" 
          })
        }
      } catch (error) {
        // Silenciar error si la tabla no existe aún
        console.warn('[Supabase] No se pudo cargar el perfil:', error)
      }
    }
    loadData()
  }, [])

  // Función para formatear timestamp de forma segura (solo en cliente)
  const getTimestamp = (): string => {
    if (!isMounted) return ""
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const userContent = inputValue
    const timestamp = getTimestamp()

    const newUserMessage: Message = {
      id: Date.now(),
      role: "user",
      content: userContent,
      timestamp: timestamp,
    }

    setMessages(prev => [...prev, newUserMessage])
    setInputValue("")
    setIsLoading(true)
    setAvatarState("speaking")

    try {
      // Llamada REAL a nuestra API de Sarah
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
      
      const botResponse: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.content || "Lo siento, hubo un problema. Intenta de nuevo.",
        timestamp: getTimestamp(),
      }

      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      console.error("Error con Sarah:", error)
      
      // Mensaje de error amigable
      const errorResponse: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Sorry, I'm having trouble connecting. Please try again in a moment.",
        timestamp: getTimestamp(),
      }
      setMessages(prev => [...prev, errorResponse])
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

  // Skeleton mientras se monta para evitar hydration mismatch
  if (!isMounted) {
    return (
      <div className="animate-fade-in h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-7 w-40 bg-muted rounded animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="flex-1 bg-card rounded-2xl animate-pulse" />
      </div>
    )
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
        {/* Avatar Panel - Desktop */}
        <div className="hidden lg:flex lg:w-1/3 flex-col items-center justify-center bg-card rounded-2xl p-6">
          <AvatarPlaceholder state={avatarState} size="lg" />
          <div className="mt-6 text-center">
            <h3 className="font-semibold text-foreground">Sarah</h3>
            <p className="text-sm text-muted-foreground">Tu tutora de inglés</p>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="flex-1 flex flex-col bg-card rounded-2xl overflow-hidden min-h-0">
          {/* Mobile Avatar Header */}
          <div className="lg:hidden flex items-center gap-3 p-4 border-b border-border">
            <AvatarPlaceholder state={avatarState} size="sm" />
            <div>
              <h3 className="font-semibold text-foreground text-sm">Sarah</h3>
              <p className="text-xs text-muted-foreground">Tu tutora de inglés</p>
            </div>
          </div>

          {/* Messages */}
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
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <span className="animate-pulse">Sarah está escribiendo</span>
                  <span className="animate-bounce">...</span>
                </div>
              )}
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
