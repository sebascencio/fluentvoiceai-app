"use client"

import { cn } from "@/lib/utils"
import { Mic, Headphones, PenTool, BookOpen, FileText, LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

const iconMap: Record<string, LucideIcon> = {
  "mic": Mic,
  "headphones": Headphones,
  "pen-tool": PenTool,
  "book-open": BookOpen,
  "file-text": FileText,
}

interface SkillCardProps {
  id: string
  title: string
  description: string
  icon: string
  level: string
  progress: number
  color: string
  onClick?: () => void
}

export function SkillCard({
  title,
  description,
  icon,
  level,
  progress,
  color,
  onClick,
}: SkillCardProps) {
  const Icon = iconMap[icon] || BookOpen

  return (
    <div className="bg-card rounded-2xl p-6 card-hover flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          color
        )}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {level}
        </span>
      </div>
      
      <h3 className="font-semibold text-foreground text-lg mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 flex-1">{description}</p>
      
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progreso</span>
          <span className="font-medium text-foreground">{progress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn("h-full rounded-full transition-all duration-500", color)}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Button 
        onClick={onClick}
        className="w-full rounded-xl"
      >
        Comenzar
      </Button>
    </div>
  )
}
