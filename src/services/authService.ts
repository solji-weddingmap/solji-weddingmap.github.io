import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { AppError, toAppError } from '@/utils/errors'
import type { Session } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Email/password auth on top of Supabase Auth, plus a `profiles` table for
// nickname + profile photo (see supabase/auth_schema.sql). When Supabase
// isn't configured, every function throws/no-ops so the rest of the app can
// keep working in mock mode - it just won't offer login (checked via
// `isAuthConfigured()` before showing the login entry point).
// ---------------------------------------------------------------------------

export const AVATAR_BUCKET = 'avatars'

export interface Profile {
  id: string
  nickname: string
  avatarUrl: string | null
}

interface ProfileRow {
  id: string
  nickname: string
  avatar_url: string | null
}

function rowToProfile(row: ProfileRow): Profile {
  return { id: row.id, nickname: row.nickname, avatarUrl: row.avatar_url }
}

export function isAuthConfigured(): boolean {
  return isSupabaseConfigured
}

export async function getSession(): Promise<Session | null> {
  if (!supabase) return null
  const { data, error } = await supabase.auth.getSession()
  if (error) throw toAppError('세션 정보를 불러오지 못했습니다.', 'getSession failed', error)
  return data.session
}

export function onAuthStateChange(callback: (session: Session | null) => void): () => void {
  if (!supabase) return () => {}
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => callback(session))
  return () => subscription.unsubscribe()
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw toAppError('프로필 정보를 불러오지 못했습니다.', 'fetchProfile failed', error)
  return data ? rowToProfile(data as ProfileRow) : null
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  if (!supabase) {
    throw new AppError('로그인 기능을 사용할 수 없습니다.', 'uploadAvatar: supabase not configured')
  }
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${userId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, { upsert: true })
  if (error) throw toAppError('프로필 사진 업로드에 실패했습니다.', 'uploadAvatar failed', error)
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function signUp(params: {
  email: string
  password: string
  nickname: string
  avatarFile?: File | null
}): Promise<void> {
  if (!supabase) {
    throw new AppError('로그인 기능을 사용할 수 없습니다. 잠시 후 다시 시도해주세요.', 'signUp: supabase not configured')
  }
  const { email, password, nickname, avatarFile } = params

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nickname } },
  })
  if (error) throw toAppError(translateAuthError(error.message), 'signUp failed', error)

  const user = data.user
  if (user && avatarFile) {
    try {
      const avatarUrl = await uploadAvatar(user.id, avatarFile)
      // the `profiles` row is created by a DB trigger a moment after signUp
      // resolves, so this update may race it - `upsert` makes it safe either way.
      await supabase.from('profiles').upsert({ id: user.id, nickname, avatar_url: avatarUrl })
    } catch (err) {
      // signup itself already succeeded; a failed avatar upload shouldn't
      // block the user from continuing.
      // eslint-disable-next-line no-console
      console.error('[WEDDING MAP] avatar upload after signup failed', err)
    }
  }
}

export async function signIn(params: { email: string; password: string }): Promise<void> {
  if (!supabase) {
    throw new AppError('로그인 기능을 사용할 수 없습니다.', 'signIn: supabase not configured')
  }
  const { error } = await supabase.auth.signInWithPassword(params)
  if (error) throw toAppError(translateAuthError(error.message), 'signIn failed', error)
}

export async function signOut(): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw toAppError('로그아웃에 실패했습니다.', 'signOut failed', error)
}

export async function updateProfile(
  userId: string,
  updates: { nickname?: string; avatarUrl?: string },
): Promise<void> {
  if (!supabase) {
    throw new AppError('로그인 기능을 사용할 수 없습니다.', 'updateProfile: supabase not configured')
  }
  const row: Record<string, string> = {}
  if (updates.nickname !== undefined) row.nickname = updates.nickname
  if (updates.avatarUrl !== undefined) row.avatar_url = updates.avatarUrl
  const { error } = await supabase.from('profiles').update(row).eq('id', userId)
  if (error) throw toAppError('프로필 수정에 실패했습니다.', 'updateProfile failed', error)
}

function translateAuthError(message: string): string {
  if (/already registered/i.test(message)) return '이미 가입된 이메일입니다.'
  if (/invalid login credentials/i.test(message)) return '이메일 또는 비밀번호가 올바르지 않습니다.'
  if (/password should be at least/i.test(message)) return '비밀번호는 6자 이상이어야 합니다.'
  if (/unable to validate email/i.test(message) || /invalid email/i.test(message)) return '올바른 이메일 형식이 아닙니다.'
  if (/rate limit/i.test(message)) return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
  return '요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.'
}
