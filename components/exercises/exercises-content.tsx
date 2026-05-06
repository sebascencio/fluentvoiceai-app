"use client"

import { useState } from "react"
import { FileText, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SkillCard } from "@/components/custom/skill-card"
import { exercises, levels, userData } from "@/lib/mockData"

export function ExercisesContent() {
  const [selectedLevel, setSelectedLevel] = useState<string>("all")

  const filteredExercises = selectedLevel === "all" 
    ? exercises 
    : exercises.filter(ex => ex.level === selectedLevel)

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Ejercicios</h1>
          <p className="text-muted-foreground mt-1">
            Practica las 4 habilidades principales del inglés
          </p>
        </div>
        
        {/* Level Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-32 rounded-xl">
              <SelectValue placeholder="Nivel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {levels.map(level => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Current Level Info */}
      <div className="bg-card rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Tu nivel actual</p>
            <p className="text-2xl font-bold text-foreground">{userData.currentLevel} - Elemental</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Objetivo</p>
            <p className="text-2xl font-bold text-primary">{userData.targetLevel}</p>
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Habilidades</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredExercises.map((exercise, index) => (
            <div 
              key={exercise.id} 
              className={`animate-slide-up stagger-${index + 1}`}
              style={{ opacity: 0, animationFillMode: 'forwards' }}
            >
              <SkillCard
                id={exercise.id}
                title={exercise.title}
                description={exercise.description}
                icon={exercise.icon}
                level={exercise.level}
                progress={exercise.progress}
                color={exercise.color}
                onClick={() => {}}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Practice Test Section */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Evalúa tu nivel</h2>
        <div className="bg-gradient-to-r from-chart-4/20 to-chart-5/20 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-chart-4 flex items-center justify-center shrink-0">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Test de nivel
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Realiza un test completo para evaluar tu progreso y obtener recomendaciones personalizadas
              </p>
              <Button className="rounded-xl">
                Hacer test
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
