"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Mic, MicOff, Volume2, VolumeX, Trash2, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatMessage } from "@/components/custom/chat-message"
import { AvatarPlaceholder } from "@/components/custom/avatar-placeholder"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

type AvatarState = "idle" | "listening" | "speaking"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

// Generar o recuperar session_id del localStorage
function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sessionId = localStorage.getItem('english_tutor_session_id')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem('english_tutor_session_id', sessionId)
  }
  return sessionId
}

export function ConversationContent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [avatarState, setAvatarState] = useState<AvatarState>("idle")
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string>("")
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [micPermissionDenied, setMicPermissionDenied] = useState(false)
  
  // Perfil del usuario
  const userProfile = { name: "Usuario", level: "A2" }
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const recognitionRef = useRef<any>(null)
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastTranscriptRef = useRef<string>("")

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Función para enviar mensaje (declarada antes de useEffect)
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const convId = await ensureConversation()

    const newUserMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: timestamp,
    }

    setMessages(prev => [...prev, newUserMessage])
    setInputValue("")
    setIsLoading(true)
    setAvatarState("speaking")

    if (convId) {
      const savedId = await saveMessage(convId, "user", text)
      if (savedId) newUserMessage.id = savedId
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: text }
          ],
          userName: userProfile.name,
          userLevel: userProfile.level
        }),
      })

      const data = await response.json()
      const botContent = data.content || "Lo siento, hubo un problema. Intenta de nuevo."
      
      const botResponse: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: botContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      if (convId) {
        const savedBotId = await saveMessage(convId, "assistant", botContent)
        if (savedBotId) botResponse.id = savedBotId
      }

      setMessages(prev => [...prev, botResponse])
      
      if (voiceEnabled) {
        speakMessageMixed(botContent)
      }
    } catch (error) {
      const errorResponse: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I'm having trouble connecting. Please try again in a moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
      setAvatarState("idle")
    }
  }, [messages, isLoading, voiceEnabled])

  // Inicializar Web Speech API para reconocimiento de voz
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.webkitSpeechRecognition || (window as any).SpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false  // Solo resultados finales para evitar duplicación
        recognitionRef.current.lang = 'en-US'
        recognitionRef.current.maxAlternatives = 1

        recognitionRef.current.onresult = (event: any) => {
          // Tomar solo el último resultado final
          const lastResult = event.results[event.results.length - 1]
          if (lastResult.isFinal || !recognitionRef.current.interimResults) {
            const transcript = lastResult[0].transcript.trim()
            setInputValue(transcript)
            lastTranscriptRef.current = transcript
          }
        }

        recognitionRef.current.onend = () => {
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current)
          }
          setIsRecording(false)
          setAvatarState("idle")
        }

        recognitionRef.current.onerror = (event: any) => {
          if (event.error === 'not-allowed') {
            setMicPermissionDenied(true)
            setToastMessage('Permiso de micrófono denegado. Haz clic en el icono de candado en la barra de direcciones para habilitarlo.')
            setShowToast(true)
            setTimeout(() => setShowToast(false), 5000)
          } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
            console.error('[v0] Speech recognition error:', event.error)
          }
          setIsRecording(false)
          setAvatarState("idle")
        }
      }
    }

    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }
    }
  }, [])

  // Función para sintetizar voz MIXTA (inglés + español) con voz femenina
  const speakMessageMixed = (text: string) => {
    if (!voiceEnabled || !text.trim()) return

    window.speechSynthesis.cancel()
    
    // Esperar a que las voces estén cargadas
    const loadVoicesAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices()
      
      // Buscar voz femenina en inglés (priorizar Samantha, Google US English Female, etc.)
      const englishFemaleVoice = voices.find(v => 
        v.lang.includes('en-US') && (
          v.name.toLowerCase().includes('samantha') ||
          v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('woman') ||
          v.name.toLowerCase().includes('google us english')
        )
      ) || voices.find(v => 
        v.lang.includes('en-US') && v.name.toLowerCase().includes('google')
      ) || voices.find(v => v.lang.includes('en-US')) 
        || voices.find(v => v.lang.includes('en'))
      
      // Buscar voz femenina en español (priorizar Paulina, Monica, etc.)
      const spanishFemaleVoice = voices.find(v => 
        (v.lang.includes('es-MX') || v.lang.includes('es-ES') || v.lang.includes('es')) && (
          v.name.toLowerCase().includes('paulina') ||
          v.name.toLowerCase().includes('monica') ||
          v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('google español')
        )
      ) || voices.find(v => v.lang.includes('es-MX'))
        || voices.find(v => v.lang.includes('es'))
      
      // Separar texto en partes de inglés y español
      const spanishIndicators = /(Por cierto|Ojo:|Un tip|Estuvo|Quick tip|Nota:|En español|Pequeña nota|Actually,)/i
      const match = text.match(spanishIndicators)
      
      let englishText = text
      let spanishText = ''
      
      if (match && match.index !== undefined) {
        // Si el indicador está al principio (como "Actually,"), todo es inglés
        if (match[0].toLowerCase() === 'actually,') {
          englishText = text
          spanishText = ''
        } else {
          englishText = text.substring(0, match.index).trim()
          spanishText = text.substring(match.index).trim()
        }
      }

      // Hablar la parte en inglés
      if (englishText) {
        const englishUtterance = new SpeechSynthesisUtterance(englishText)
        englishUtterance.lang = 'en-US'
        englishUtterance.rate = 0.85
        englishUtterance.pitch = 1.15
        englishUtterance.volume = 1
        if (englishFemaleVoice) englishUtterance.voice = englishFemaleVoice
        
        englishUtterance.onend = () => {
          // Luego hablar la parte en español si existe
          if (spanishText) {
            setTimeout(() => {
              const spanishUtterance = new SpeechSynthesisUtterance(spanishText)
              spanishUtterance.lang = 'es-MX'
              spanishUtterance.rate = 0.9
              spanishUtterance.pitch = 1.1
              spanishUtterance.volume = 1
              if (spanishFemaleVoice) spanishUtterance.voice = spanishFemaleVoice
              window.speechSynthesis.speak(spanishUtterance)
            }, 300) // Pequeña pausa entre idiomas
          }
        }
        
        window.speechSynthesis.speak(englishUtterance)
      } else if (spanishText) {
        // Si solo hay español
        const spanishUtterance = new SpeechSynthesisUtterance(spanishText)
        spanishUtterance.lang = 'es-MX'
        spanishUtterance.rate = 0.9
        spanishUtterance.pitch = 1.1
        spanishUtterance.volume = 1
        if (spanishFemaleVoice) spanishUtterance.voice = spanishFemaleVoice
        window.speechSynthesis.speak(spanishUtterance)
      }
    }

    // Las voces pueden no estar cargadas inmediatamente
    if (window.speechSynthesis.getVoices().length > 0) {
      loadVoicesAndSpeak()
    } else {
      window.speechSynthesis.onvoiceschanged = loadVoicesAndSpeak
    }
  }

  // Función para repetir el audio de un mensaje
  const handleRepeatAudio = (content: string) => {
    speakMessageMixed(content)
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Inicializar session_id y cargar conversación existente
  useEffect(() => {
    const sid = getSessionId()
    setSessionId(sid)
    
    async function loadConversation() {
      if (!sid) return
      
      try {
        // Buscar conversación existente para esta sesión
        const { data: existingConv, error: convError } = await supabase
          .from('conversations')
          .select('id')
          .eq('session_id', sid)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (existingConv && !convError) {
          setConversationId(existingConv.id)
          
          // Cargar mensajes de la conversación
          const { data: existingMessages } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', existingConv.id)
            .order('created_at', { ascending: true })

          if (existingMessages && existingMessages.length > 0) {
            const formattedMessages: Message[] = existingMessages.map((m) => ({
              id: m.id,
              role: m.role as "user" | "assistant",
              content: m.content,
              timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }))
            setMessages(formattedMessages)
          }
        }
      } catch (error) {
        // Si no hay conversación existente, está bien - se creará una nueva
      }
    }
    
    loadConversation()
  }, [])

  // Crear conversación si no existe
  async function ensureConversation(): Promise<string | null> {
    if (conversationId) return conversationId
    
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          session_id: sessionId,
          title: 'Conversación con Sarah'
        })
        .select('id')
        .single()

      if (error) throw error
      if (data) {
        setConversationId(data.id)
        return data.id
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
    return null
  }

  // Guardar mensaje en Supabase
  async function saveMessage(convId: string, role: "user" | "assistant", content: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: convId,
          role,
          content
        })
        .select('id')
        .single()

      if (error) throw error
      return data?.id || null
    } catch (error) {
      console.error('Error saving message:', error)
      return null
    }
  }

  // Reiniciar conversación
  const handleResetConversation = async () => {
    const confirmed = window.confirm('¿Estás seguro de que quieres borrar el historial de esta clase?')
    if (!confirmed) return

    try {
      // Borrar mensajes de Supabase si hay conversación activa
      if (conversationId) {
        await supabase
          .from('messages')
          .delete()
          .eq('conversation_id', conversationId)
        
        // También borrar la conversación
        await supabase
          .from('conversations')
          .delete()
          .eq('id', conversationId)
      }

      // Limpiar estado local
      setMessages([])
      setConversationId(null)
      
      // Mostrar toast de éxito
      setToastMessage('Conversación reiniciada')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } catch (error) {
      console.error('Error al reiniciar conversación:', error)
      setToastMessage('Error al reiniciar')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return
    await sendMessage(inputValue)
  }

  const handleMicClick = async () => {
    if (isRecording) {
      // Solo pausar la grabación, NO enviar
      recognitionRef.current?.stop()
      setIsRecording(false)
      setAvatarState("idle")
    } else {
      // Verificar si el reconocimiento de voz está disponible
      if (!recognitionRef.current) {
        setToastMessage('Tu navegador no soporta reconocimiento de voz')
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
        return
      }

      // Si el permiso fue denegado antes, mostrar mensaje
      if (micPermissionDenied) {
        setToastMessage('Permiso de micrófono denegado. Habilítalo en la configuración del navegador.')
        setShowToast(true)
        setTimeout(() => setShowToast(false), 4000)
        return
      }

      try {
        // Solicitar permiso de micrófono primero
        await navigator.mediaDevices.getUserMedia({ audio: true })
        
        setInputValue("")
        lastTranscriptRef.current = ""
        recognitionRef.current.start()
        setIsRecording(true)
        setAvatarState("listening")
      } catch (error: any) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setMicPermissionDenied(true)
          setToastMessage('Permiso de micrófono denegado. Habilítalo en la configuración del navegador.')
        } else {
          setToastMessage('Error al acceder al micrófono: ' + error.message)
        }
        setShowToast(true)
        setTimeout(() => setShowToast(false), 4000)
        setIsRecording(false)
        setAvatarState("idle")
      }
    }
  }

  // Función para detener y enviar
  const handleStopAndSend = () => {
    recognitionRef.current?.stop()
    setIsRecording(false)
    setAvatarState("idle")
    
    if (inputValue.trim()) {
      sendMessage(inputValue)
    }
  }

  // Función para solo pausar sin enviar
  const handlePauseRecording = () => {
    recognitionRef.current?.stop()
    setIsRecording(false)
    setAvatarState("idle")
    // No enviar, solo pausar - el texto queda en el input para editar
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Conversación</h1>
          <p className="text-sm text-muted-foreground">Practica con Sarah, tu tutora de nivel {userProfile.level}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetConversation}
            className="rounded-xl text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Reiniciar</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="rounded-xl"
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
        </div>
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
        <div className="flex-1 flex flex-col bg-card rounded-2xl overflow-hidden min-h-0 relative">
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
                  onRepeatAudio={message.role === "assistant" ? handleRepeatAudio : undefined}
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

          {/* Toast */}
          {showToast && (
            <div className="absolute top-4 right-4 bg-foreground text-background px-4 py-2 rounded-xl text-sm animate-fade-in shadow-lg">
              {toastMessage}
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            {/* Indicador de grabación con opciones */}
            {isRecording && (
              <div className="flex items-center justify-between gap-2 mb-3 py-2 px-4 bg-destructive/10 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                  <span className="text-sm text-destructive font-medium">Sarah te está escuchando...</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePauseRecording}
                    className="h-7 px-3 text-xs bg-muted hover:bg-muted/80 text-muted-foreground"
                  >
                    <Square className="w-3 h-3 mr-1" />
                    Pausar
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleStopAndSend}
                    className="h-7 px-3 text-xs"
                    disabled={!inputValue.trim()}
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Enviar
                  </Button>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant={isRecording ? "destructive" : "secondary"}
                size="icon"
                onClick={handleMicClick}
                className={cn("rounded-xl shrink-0 transition-all", isRecording && "animate-pulse-soft")}
                disabled={isLoading}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isLoading ? "Sarah está escribiendo..." : "Escribe tu mensaje en inglés..."}
                className="flex-1 rounded-xl px-4 py-2 border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
