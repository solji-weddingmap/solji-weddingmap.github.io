import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  url && anonKey && url !== 'YOUR_SUPABASE_URL' && anonKey !== 'YOUR_SUPABASE_ANON_KEY',
)

// `supabase` is null when env vars are missing/placeholder so the rest of the
// app can fall back to mock data instead of crashing on startup.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null

export const WEDDING_HALL_TABLE = 'wedding_halls'
export const WEDDING_HALL_BUCKET = 'wedding-halls'
