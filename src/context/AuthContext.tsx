import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isSupabaseConfigured } from '@/lib/supabase'
import {
  fetchProfile,
  getSession,
  isAuthConfigured,
  onAuthStateChange,
  signOut as authSignOut,
  type Profile,
} from '@/services/authService'

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  loading: boolean
  isLoggedIn: boolean
  authAvailable: boolean
  refreshProfile: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function loadProfile(userId: string) {
      try {
        const p = await fetchProfile(userId)
        if (!cancelled) setProfile(p)
      } catch {
        if (!cancelled) setProfile(null)
      }
    }

    getSession()
      .then(async (s) => {
        if (cancelled) return
        setSession(s)
        if (s?.user) await loadProfile(s.user.id)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    const unsubscribe = onAuthStateChange((s) => {
      if (cancelled) return
      setSession(s)
      if (s?.user) {
        void loadProfile(s.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  async function refreshProfile() {
    if (!session?.user) return
    try {
      const p = await fetchProfile(session.user.id)
      setProfile(p)
    } catch {
      // keep the previously loaded profile on a transient failure
    }
  }

  async function logout() {
    await authSignOut()
    setSession(null)
    setProfile(null)
  }

  const value: AuthContextValue = {
    user: session?.user ?? null,
    profile,
    loading,
    isLoggedIn: Boolean(session?.user),
    authAvailable: isAuthConfigured(),
    refreshProfile,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>')
  return ctx
}
