"use client"

import Link from "next/link"
import { Clock, BookOpen, Target, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CircularProgress } from "@/components/custom/circular-progress"
import { StatCard } from "@/components/custom/stat-card"
import { StreakBadge } from "@/components/custom/streak-badge"
import { userData, progressData, activityData } from "@/lib/mockData"

export function DashboardContent() {
  const todayMinutes = activityData[activityData.length - 1].minutes

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground text-balance">
              Hola, {userData.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Sigue practicando para alcanzar tu objetivo
            </p>
          </div>
          <StreakBadge days={userData.streak} />
        </div>

        {/* Level Progress Card */}
        <div className="bg-card rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <CircularProgress 
              value={60} 
              size={140}
              strokeWidth={10}
            >
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{userData.currentLevel}</p>
                <p className="text-xs text-muted-foreground">Nivel actual</p>
              </div>
            </CircularProgress>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Progreso hacia {userData.targetLevel}
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                Estás avanzando muy bien. Mantén tu racha de práctica diaria para acelerar tu progreso.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div>
                  <p className="text-2xl font-bold text-primary">{progressData.speaking}%</p>
                  <p className="text-xs text-muted-foreground">Speaking</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-chart-2">{progressData.listening}%</p>
                  <p className="text-xs text-muted-foreground">Listening</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-chart-3">{progressData.writing}%</p>
                  <p className="text-xs text-muted-foreground">Writing</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-chart-4">{progressData.reading}%</p>
                  <p className="text-xs text-muted-foreground">Reading</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Tu actividad</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            icon={Clock}
            value={`${todayMinutes} min`}
            label="Hoy"
            trend={{ value: 15, positive: true }}
          />
          <StatCard
            icon={BookOpen}
            value={userData.wordsLearned}
            label="Palabras aprendidas"
          />
          <StatCard
            icon={Target}
            value={`${userData.exercisesCompleted}`}
            label="Ejercicios completados"
            className="col-span-2 md:col-span-1"
          />
        </div>
      </section>

      {/* Weekly Activity */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Esta semana</h2>
        <div className="bg-card rounded-2xl p-6">
          <div className="flex items-end justify-between gap-2 h-32">
            {activityData.map((day, index) => {
              const maxMinutes = Math.max(...activityData.map(d => d.minutes))
              const height = (day.minutes / maxMinutes) * 100
              const isToday = index === activityData.length - 1
              
              return (
                <div 
                  key={day.day}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div 
                    className={`w-full rounded-lg transition-all duration-300 ${
                      isToday ? 'bg-primary' : 'bg-muted'
                    }`}
                    style={{ height: `${height}%`, minHeight: '8px' }}
                  />
                  <span className={`text-xs ${
                    isToday ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}>
                    {day.day}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Total: <span className="font-semibold text-foreground">
                {activityData.reduce((acc, day) => acc + day.minutes, 0)} minutos
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              Meta: <span className="font-semibold text-foreground">
                {userData.dailyGoal * 7} min/semana
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section>
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 md:p-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-primary-foreground mb-2">
                Sigue practicando
              </h2>
              <p className="text-primary-foreground/80 text-sm">
                Continúa tu conversación con el tutor para mejorar tu fluidez
              </p>
            </div>
            <Button 
              asChild
              size="lg"
              variant="secondary"
              className="rounded-xl gap-2"
            >
              <Link href="/conversation">
                Practicar ahora
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
