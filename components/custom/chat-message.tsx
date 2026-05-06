import { cn } from "@/lib/utils"

interface ChatMessageProps {
  content: string
  role: "user" | "assistant"
  timestamp?: string
}

export function ChatMessage({ content, role, timestamp }: ChatMessageProps) {
  const isUser = role === "user"

  return (
    <div className={cn(
      "flex w-full animate-fade-in",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-3",
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
    </div>
  )
}
