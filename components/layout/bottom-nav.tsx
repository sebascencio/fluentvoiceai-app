"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageCircle, BookOpen, BarChart3, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/conversation", label: "Chat", icon: MessageCircle },
  { href: "/exercises", label: "Ejercicios", icon: BookOpen },
  { href: "/progress", label: "Progreso", icon: BarChart3 },
  { href: "/settings", label: "Ajustes", icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <ul className="flex items-center justify-around py-2 px-2 safe-area-inset-bottom">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-smooth min-w-[64px]",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
