// "최근 본 웨딩홀" tracker for the 마이(My) page.
//
// - Logged out (or Supabase not configured): stored per-browser in
//   localStorage - most-recently-viewed id first, capped at MAX_ITEMS. Not
//   visible on other devices.
// - Logged in: persisted server-side in the `view_history` table (see
//   supabase/auth_schema.sql), keyed by the user's account - visible on any
//   device once logged in.

import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const STORAGE_KEY = 'wedding-map:recently-viewed'
const MAX_ITEMS = 10

function readIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : []
  } catch {
    return []
  }
}

function writeIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // localStorage unavailable (private mode / disabled) - fail silently,
    // the "최근 본 웨딩홀" section simply stays empty.
  }
}

export async function recordView(hallId: string, userId?: string | null): Promise<void> {
  if (!hallId) return

  if (userId && isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('view_history')
        .upsert({ user_id: userId, hall_id: hallId, viewed_at: new Date().toISOString() })
      if (error) throw error
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[WEDDING MAP] recordView (server) failed', err)
    }
    return
  }

  const ids = readIds().filter((id) => id !== hallId)
  ids.unshift(hallId)
  writeIds(ids.slice(0, MAX_ITEMS))
}

export async function getRecentlyViewedIds(userId?: string | null): Promise<string[]> {
  if (userId && isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('view_history')
        .select('hall_id')
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(MAX_ITEMS)
      if (error) throw error
      return (data ?? []).map((row) => (row as { hall_id: string }).hall_id)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[WEDDING MAP] getRecentlyViewedIds (server) failed', err)
      return []
    }
  }

  return readIds()
}
