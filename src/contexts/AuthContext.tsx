import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

interface UserMetadata {
  full_name?: string
  [key: string]: string | undefined
}

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, userData?: UserMetadata) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (userData: UserMetadata) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Add timeout to prevent hanging indefinitely
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Auth initialization timeout")), 5000)
        )
        
        const sessionPromise = supabase.auth.getSession()
        const result = (await Promise.race([sessionPromise, timeoutPromise])) as { data: { session: Session | null } }
        const { data: { session } } = result
        setSession(session)
        setUser(session?.user || null)
      } catch (error) {
        console.error("Error initializing auth:", error)
        // Fail gracefully - treat as logged out
        setSession(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user || null)
      setIsLoading(false)
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (data.session && data.user) {
      setSession(data.session)
      setUser(data.user)
    }
  }

  const signup = async (email: string, password: string, userData?: UserMetadata) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: { data: userData },
    })
    if (error) throw error
    if (data.user) {
      console.log("✅ Signup successful - check email for confirmation")
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }

  const updateProfile = async (userData: UserMetadata) => {
    const { error } = await supabase.auth.updateUser({ data: userData })
    if (error) throw error
    if (user) {
      setUser({ ...user, user_metadata: { ...user.user_metadata, ...userData } })
    }
  }

  const isAuthenticated = !!user && !!session

  return (
    <AuthContext.Provider value={{ user, session, isLoading, isAuthenticated, login, signup, logout, resetPassword, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

// Export AuthContext for use in other hooks
export { AuthContext }

// Note: useAuthContext hook is exported from useAuth hook to avoid fast refresh issues
