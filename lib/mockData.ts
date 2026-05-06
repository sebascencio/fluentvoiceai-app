// Mock data for English Tutor AI PWA

export const userData = {
  name: "María",
  email: "maria@ejemplo.com",
  currentLevel: "A2",
  targetLevel: "B1",
  dailyGoal: 30, // minutes
  streak: 7,
  totalMinutes: 1250,
  wordsLearned: 342,
  exercisesCompleted: 89,
  joinedDate: "2024-01-15",
}

export const progressData = {
  speaking: 45,
  listening: 62,
  writing: 38,
  reading: 55,
}

export const activityData = [
  { day: "Lun", minutes: 25 },
  { day: "Mar", minutes: 32 },
  { day: "Mié", minutes: 18 },
  { day: "Jue", minutes: 45 },
  { day: "Vie", minutes: 30 },
  { day: "Sáb", minutes: 15 },
  { day: "Dom", minutes: 28 },
]

export const weeklyActivityData = [
  { week: "Sem 1", minutes: 180 },
  { week: "Sem 2", minutes: 210 },
  { week: "Sem 3", minutes: 165 },
  { week: "Sem 4", minutes: 240 },
]

export const vocabularyList = [
  { word: "accomplish", translation: "lograr", mastery: 4 },
  { word: "beneficial", translation: "beneficioso", mastery: 5 },
  { word: "comprehensive", translation: "exhaustivo", mastery: 3 },
  { word: "demonstrate", translation: "demostrar", mastery: 4 },
  { word: "efficient", translation: "eficiente", mastery: 5 },
  { word: "fundamental", translation: "fundamental", mastery: 4 },
  { word: "gradually", translation: "gradualmente", mastery: 3 },
  { word: "however", translation: "sin embargo", mastery: 5 },
  { word: "implement", translation: "implementar", mastery: 2 },
  { word: "justify", translation: "justificar", mastery: 3 },
]

export const chatMessages = [
  {
    id: 1,
    role: "assistant" as const,
    content: "Hello! How are you doing today? I'd love to practice some English with you.",
    timestamp: "10:30",
  },
  {
    id: 2,
    role: "user" as const,
    content: "Hi! I'm doing well, thank you. I want to practice my speaking skills.",
    timestamp: "10:31",
  },
  {
    id: 3,
    role: "assistant" as const,
    content: "That's great! Let's start with a simple topic. Can you tell me about your favorite hobby?",
    timestamp: "10:31",
  },
  {
    id: 4,
    role: "user" as const,
    content: "My favorite hobby is reading books. I like to read mystery novels.",
    timestamp: "10:32",
  },
  {
    id: 5,
    role: "assistant" as const,
    content: "Excellent! You're doing very well. I noticed you used 'like to read' correctly. Can you name a mystery author you enjoy?",
    timestamp: "10:33",
  },
]

export const exercises = [
  {
    id: "speaking",
    title: "Speaking",
    description: "Practica tu pronunciación y fluidez",
    icon: "mic",
    level: "A2",
    progress: 45,
    color: "bg-chart-1",
  },
  {
    id: "listening",
    title: "Listening",
    description: "Mejora tu comprensión auditiva",
    icon: "headphones",
    level: "A2",
    progress: 62,
    color: "bg-chart-2",
  },
  {
    id: "writing",
    title: "Writing",
    description: "Desarrolla tus habilidades de escritura",
    icon: "pen-tool",
    level: "A2",
    progress: 38,
    color: "bg-chart-3",
  },
  {
    id: "reading",
    title: "Reading",
    description: "Comprende textos en inglés",
    icon: "book-open",
    level: "A2",
    progress: 55,
    color: "bg-chart-4",
  },
]

export const levels = ["A1", "A2", "B1", "B2", "C1", "C2"] as const

export const avatarOptions = [
  { id: "emma", name: "Emma", style: "Profesora amigable" },
  { id: "james", name: "James", style: "Tutor británico" },
  { id: "sophia", name: "Sophia", style: "Coach motivacional" },
  { id: "alex", name: "Alex", style: "Compañero de práctica" },
]

export const speedOptions = [
  { value: "slow", label: "Lento" },
  { value: "normal", label: "Normal" },
  { value: "fast", label: "Rápido" },
]
