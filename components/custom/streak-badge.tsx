import { cn } from "@/lib/utils"
import { Flame } from "lucide-react"

interface StreakBadgeProps {
  days: number
  className?: string
}

export function StreakBadge({ days, className }: StreakBadgeProps) {
  return (
    <div className={cn(
      "inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 px-4 py-2 rounded-full",
      className
    )}>
      <Flame className="w-5 h-5 text-orange-500" />
      <span className="font-semibold text-orange-700">{days} días seguidos</span>
    </div>
  )
}
