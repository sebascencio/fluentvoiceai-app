"use client"

import { useState } from "react"
import { User, Target, Bell, LogOut, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { userData, levels, avatarOptions, speedOptions } from "@/lib/mockData"
import { cn } from "@/lib/utils"

export function SettingsContent() {
  const [name, setName] = useState(userData.name)
  const [currentLevel, setCurrentLevel] = useState(userData.currentLevel)
  const [targetLevel, setTargetLevel] = useState(userData.targetLevel)
  const [dailyGoal, setDailyGoal] = useState([userData.dailyGoal])
  const [selectedAvatar, setSelectedAvatar] = useState("emma")
  const [speed, setSpeed] = useState("normal")
  const [notifications, setNotifications] = useState(true)
  const [dailyReminder, setDailyReminder] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground mt-1">
          Personaliza tu experiencia de aprendizaje
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Profile Section */}
        <section className="bg-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Perfil</h2>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={userData.email}
                disabled
                className="rounded-xl bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                El email no se puede cambiar
              </p>
            </div>
          </div>
        </section>

        {/* Goals Section */}
        <section className="bg-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-chart-2/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-chart-2" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Objetivos</h2>
          </div>

          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Nivel actual</Label>
                <Select value={currentLevel} onValueChange={setCurrentLevel}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Nivel objetivo</Label>
                <Select value={targetLevel} onValueChange={setTargetLevel}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Label>Meta diaria de práctica</Label>
                <span className="font-semibold text-primary">{dailyGoal[0]} min</span>
              </div>
              <Slider
                value={dailyGoal}
                onValueChange={setDailyGoal}
                min={10}
                max={120}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10 min</span>
                <span>120 min</span>
              </div>
            </div>
          </div>
        </section>

        {/* Avatar Selection */}
        <section className="bg-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Elige tu tutor</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {avatarOptions.map(avatar => (
              <button
                key={avatar.id}
                onClick={() => setSelectedAvatar(avatar.id)}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all text-left",
                  selectedAvatar === avatar.id
                    ? "border-primary bg-primary/5"
                    : "border-transparent bg-muted/50 hover:bg-muted"
                )}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-200 to-amber-300 mx-auto mb-3" />
                <p className="font-medium text-foreground text-center text-sm">{avatar.name}</p>
                <p className="text-xs text-muted-foreground text-center">{avatar.style}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Voice Speed */}
        <section className="bg-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Velocidad de voz</h2>
          <RadioGroup value={speed} onValueChange={setSpeed} className="flex flex-wrap gap-4">
            {speedOptions.map(option => (
              <div key={option.value} className="flex items-center gap-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </section>

        {/* Notifications */}
        <section className="bg-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-chart-3/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-chart-3" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Notificaciones</h2>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Notificaciones push</p>
                <p className="text-sm text-muted-foreground">Recibe alertas de progreso</p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Recordatorio diario</p>
                <p className="text-sm text-muted-foreground">Te recordamos practicar cada día</p>
              </div>
              <Switch
                checked={dailyReminder}
                onCheckedChange={setDailyReminder}
              />
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={handleSave}
            className="flex-1 rounded-xl gap-2"
            size="lg"
          >
            {saved ? (
              <>
                <Check className="w-5 h-5" />
                Guardado
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
          <Button
            variant="destructive"
            className="rounded-xl gap-2"
            size="lg"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  )
}
