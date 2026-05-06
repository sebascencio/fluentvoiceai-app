"use client"

import { cn } from "@/lib/utils"

interface AvatarPlaceholderProps {
  state?: "idle" | "listening" | "speaking"
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeMap = {
  sm: "w-24 h-24",
  md: "w-40 h-40",
  lg: "w-64 h-64",
}

export function AvatarPlaceholder({ 
  state = "idle", 
  size = "lg",
  className 
}: AvatarPlaceholderProps) {
  return (
    <div className={cn(
      "relative rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden",
      sizeMap[size],
      className
    )}>
      {/* Avatar face placeholder */}
      <div className={cn(
        "relative flex flex-col items-center justify-center",
        state === "speaking" && "animate-pulse-soft"
      )}>
        {/* Head */}
        <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-amber-200 to-amber-300 relative">
          {/* Eyes */}
          <div className="absolute top-1/3 left-1/4 w-3 h-3 md:w-4 md:h-4 rounded-full bg-foreground">
            <div className="absolute top-1 left-1 w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-white" />
          </div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 md:w-4 md:h-4 rounded-full bg-foreground">
            <div className="absolute top-1 left-1 w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-white" />
          </div>
          {/* Mouth */}
          <div className={cn(
            "absolute bottom-1/4 left-1/2 -translate-x-1/2 bg-foreground transition-all duration-300",
            state === "speaking" 
              ? "w-4 h-4 md:w-6 md:h-6 rounded-full" 
              : "w-6 h-2 md:w-8 md:h-3 rounded-full"
          )} />
        </div>
      </div>

      {/* Listening indicator */}
      {state === "listening" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-full h-full rounded-3xl border-4 border-primary animate-ping opacity-30" />
        </div>
      )}

      {/* State label */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <span className={cn(
          "text-xs font-medium px-3 py-1 rounded-full",
          state === "idle" && "bg-muted text-muted-foreground",
          state === "listening" && "bg-green-100 text-green-700",
          state === "speaking" && "bg-primary/10 text-primary"
        )}>
          {state === "idle" && "Listo"}
          {state === "listening" && "Escuchando..."}
          {state === "speaking" && "Hablando..."}
        </span>
      </div>
    </div>
  )
}
