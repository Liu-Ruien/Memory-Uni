import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

function createSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

export const supabase = createSupabaseClient()
export const isSupabaseConfigured = Boolean(supabase)

export function getSupabaseClient() {
  if (!supabase) {
    throw new Error('共享图库尚未配置。请在 .env.local 中填写 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。')
  }
  return supabase
}
