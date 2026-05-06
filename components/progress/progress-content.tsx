"use client"

import { Clock, BookOpen, Target, TrendingUp, Star, Mic, Headphones, PenTool, BookOpenText } from "lucide-react"
import { StatCard } from "@/components/custom/stat-card"
import { 
  userData, 
  progressData, 
  weeklyActivityData, 
  vocabularyList 
} from "@/lib/mockData"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { cn } from "@/lib/utils"

const skillIcons = {
  speaking: Mic,
  listening: Headphones,
  writing: PenTool,
  reading: BookOpenText,
}

const skillColors = {
  speaking: "bg-chart-1",
  listening: "bg-chart-2",
  writing: "bg-chart-3",
  reading: "bg-chart-4",
}

export function ProgressContent() {
  const totalHours = Math.floor(userData.totalMinutes / 60)

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Tu progreso</h1>
        <p className="text-muted-foreground mt-1">
          Revisa tu avance y celebra tus logros
        </p>
      </div>

      {/* Stats Overview */}
      <section className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Clock}
            value={`${totalHours}h`}
            label="Tiempo total"
            trend={{ value: 12, positive: true }}
          />
          <StatCard
            icon={BookOpen}
            value={userData.wordsLearned}
            label="Palabras aprendidas"
            trend={{ value: 8, positive: true }}
          />
          <StatCard
            icon={Target}
            value={userData.exercisesCompleted}
            label="Ejercicios"
          />
          <StatCard
            icon={TrendingUp}
            value={userData.currentLevel}
            label="Nivel actual"
          />
        </div>
      </section>

      {/* Activity Chart */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Actividad mensual</h2>
        <div className="bg-card rounded-2xl p-6">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyActivityData}>
              <defs>
                <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
              <XAxis 
                dataKey="week" 
                tick={{ fontSize: 12, fill: '#6E6E73' }}
                axisLine={{ stroke: '#E8E8E8' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6E6E73' }}
                axisLine={{ stroke: '#E8E8E8' }}
                tickFormatter={(value) => `${value}m`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#F5F5F7',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px'
                }}
                formatter={(value: number) => [`${value} minutos`, 'Práctica']}
              />
              <Area
                type="monotone"
                dataKey="minutes"
                stroke="#007AFF"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorMinutes)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Skills Progress */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Progreso por habilidad</h2>
        <div className="bg-card rounded-2xl p-6">
          <div className="flex flex-col gap-6">
            {Object.entries(progressData).map(([skill, value]) => {
              const Icon = skillIcons[skill as keyof typeof skillIcons]
              const colorClass = skillColors[skill as keyof typeof skillColors]
              
              return (
                <div key={skill} className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    colorClass
                  )}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground capitalize">{skill}</span>
                      <span className="text-sm text-muted-foreground">{value}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-500", colorClass)}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Vocabulary List */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Vocabulario reciente</h2>
        <div className="bg-card rounded-2xl overflow-hidden">
          <div className="divide-y divide-border">
            {vocabularyList.slice(0, 6).map((word, index) => (
              <div 
                key={word.word}
                className={`flex items-center justify-between p-4 animate-slide-up stagger-${index + 1}`}
                style={{ opacity: 0, animationFillMode: 'forwards' }}
              >
                <div>
                  <p className="font-medium text-foreground">{word.word}</p>
                  <p className="text-sm text-muted-foreground">{word.translation}</p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i < word.mastery 
                          ? "text-yellow-400 fill-yellow-400" 
                          : "text-muted"
                      )}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-border text-center">
            <button className="text-sm text-primary font-medium hover:underline">
              Ver todo el vocabulario
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
