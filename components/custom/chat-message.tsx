import { cn } from "@/lib/utils"
import { Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface ChatMessageProps {
  content: string
  role: "user" | "assistant"
  timestamp?: string
  onRepeatAudio?: (content: string) => void
}

export function ChatMessage({ content, role, timestamp, onRepeatAudio }: ChatMessageProps) {
  const isUser = role === "user"
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlayAudio = () => {
    if (onRepeatAudio) {
      setIsPlaying(true)
      onRepeatAudio(content)
      setTimeout(() => setIsPlaying(false), 2000)
    }
  }

  return (
    <div className={cn(
      "flex w-full animate-fade-in gap-2",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-3 relative",
        isUser 
          ? "bg-primary text-primary-foreground rounded-br-md" 
          : "bg-card text-card-foreground rounded-bl-md"
      )}>
        <p className="text-sm leading-relaxed">{content}</p>
        {timestamp && (
          <p className={cn(
            "text-[10px] mt-1",
            isUser ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            {timestamp}
          </p>
        )}
      </div>
      {!isUser && onRepeatAudio && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePlayAudio}
          className={cn(
            "rounded-full h-8 w-8 p-0 flex items-center justify-center",
            isPlaying && "bg-primary/10 text-primary"
          )}
          title="Reproducir audio"
        >
          <Volume2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
