import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validación robusta: si faltan las variables, creamos un cliente nulo seguro
let supabase: SupabaseClient | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.warn(
    '[Supabase] Variables de entorno no configuradas. ' +
    'Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env.local'
  )
}

// Helper para verificar si Supabase está disponible
export function isSupabaseConfigured(): boolean {
  return supabase !== null
}

// Exportamos el cliente (puede ser null si no está configurado)
export { supabase }

// Helper para obtener el cliente de forma segura
export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase no está configurado. Por favor, configura las variables de entorno ' +
      'NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }
  return supabase
}
