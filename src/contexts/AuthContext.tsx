import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import type { Profile } from '@/types'
import { toProfile } from '@/lib/mappers'

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: Profile | null
  isAdmin: boolean
  isSuperAdmin: boolean
  selectedEstablishmentId: string | null
  setSelectedEstablishmentId: (establishmentId: string | null) => void
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isAdmin: false,
  isSuperAdmin: false,
  selectedEstablishmentId: null,
  setSelectedEstablishmentId: () => {},
  isLoading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [selectedEstablishmentId, setSelectedEstablishmentIdState] = useState<string | null>(() => (
    window.localStorage.getItem('crm:selected-establishment-id') || null
  ))
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!error && data) {
      const nextProfile = toProfile(data as Record<string, unknown>)
      setProfile(nextProfile)
      return nextProfile
    }

    setProfile(null)
    return null
  }, [])

  useEffect(() => {
    let mounted = true

    async function clearInvalidSession(shouldSignOut = false) {
      if (shouldSignOut) {
        await supabase.auth.signOut()
      }
      if (!mounted) return
      setSession(null)
      setUser(null)
      setProfile(null)
      setIsLoading(false)
    }

    async function applySession(nextSession: Session | null) {
      if (!nextSession) {
        await clearInvalidSession()
        return
      }

      const { data: { user: verifiedUser }, error } = await supabase.auth.getUser()
      if (error || !verifiedUser) {
        await clearInvalidSession(true)
        return
      }

      if (!mounted) return
      setSession(nextSession)
      setUser(verifiedUser)
      await fetchProfile(verifiedUser.id)
      if (!mounted) return
      setIsLoading(false)
    }

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      void applySession(initialSession)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setIsLoading(true)
        void applySession(newSession)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return { error: 'Email ou senha incorretos' }
    }
    return { error: null }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
    setProfile(null)
    setSelectedEstablishmentIdState(null)
    window.localStorage.removeItem('crm:selected-establishment-id')
  }, [])

  const role = profile?.role ?? user?.app_metadata?.role
  const isSuperAdmin = role === 'super_admin'
  const isAdmin = role === 'super_admin' || role === 'admin'

  const setSelectedEstablishmentId = useCallback((establishmentId: string | null) => {
    setSelectedEstablishmentIdState(establishmentId)
    if (establishmentId) {
      window.localStorage.setItem('crm:selected-establishment-id', establishmentId)
    } else {
      window.localStorage.removeItem('crm:selected-establishment-id')
    }
  }, [])

  useEffect(() => {
    if (!profile) return
    if (profile.role !== 'super_admin') {
      setSelectedEstablishmentId(profile.establishmentId)
    }
  }, [profile, setSelectedEstablishmentId])

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isAdmin,
        isSuperAdmin,
        selectedEstablishmentId,
        setSelectedEstablishmentId,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
