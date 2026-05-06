"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageCircle, BookOpen, BarChart3, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/conversation", label: "Conversación", icon: MessageCircle },
  { href: "/exercises", label: "Ejercicios", icon: BookOpen },
  { href: "/progress", label: "Progreso", icon: BarChart3 },
  { href: "/settings", label: "Configuración", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-sidebar border-r border-sidebar-border fixed left-0 top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-lg">E</span>
        </div>
        <div>
          <h1 className="font-semibold text-sidebar-foreground">English Tutor</h1>
          <p className="text-xs text-muted-foreground">Tu tutor personal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-smooth",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Level Badge */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="bg-card rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Nivel actual</p>
          <p className="font-semibold text-foreground">A2 - Elemental</p>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-3/5 bg-primary rounded-full" />
          </div>
        </div>
      </div>
    </aside>
  )
}
