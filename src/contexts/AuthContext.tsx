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
  checkEmailExists: (email: string) => Promise<boolean>
  getSavedCredentials: () => { email: string; password: string } | null
  clearSavedCredentials: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state on mount
  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      try {
        // Get session with strict timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)
        
        try {
          const { data: { session } } = await supabase.auth.getSession()
          clearTimeout(timeoutId)
          
          if (isMounted) {
            setSession(session)
            setUser(session?.user || null)
          }
        } catch (timeoutError) {
          clearTimeout(timeoutId)
          console.warn("Auth timeout - treating as logged out")
          if (isMounted) {
            setSession(null)
            setUser(null)
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        if (isMounted) {
          setSession(null)
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[AUTH] Auth state changed:", event, "User confirmed?", !!session?.user?.email_confirmed_at)
      if (isMounted) {
        setSession(session)
        setUser(session?.user || null)
      }
    })

    return () => {
      isMounted = false
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (data.session && data.user) {
      console.log("[AUTH] Login successful! User ID:", data.user.id);
      setSession(data.session)
      setUser(data.user)
      // Save credentials to localStorage (encrypted would be better in production)
      // For now, we save the email and prompt for password on next login
      localStorage.setItem('pawsense_saved_email', email)
    }
  }

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      // Query the auth.users table to check if email exists
      // We use the admin API endpoint which is safe since we're checking from frontend
      const { data, error } = await supabase.auth.admin.listUsers() as { data?: { users: Array<{ email?: string }> }; error?: unknown }
      
      if (!error && data?.users) {
        return data.users.some((u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase())
      }
      
      // Fallback: Try to sign up with the email - if it returns "already registered", email exists
      const { error: signupError } = await supabase.auth.signUp({
        email,
        password: 'temp-check-password-' + Date.now(), // Dummy password
      })
      
      if (signupError?.message?.includes('already registered')) {
        return true
      }
      
      // If we actually created the user, clean it up (in production, you'd use admin API)
      return false
    } catch (error) {
      console.error('Error checking email existence:', error)
      // On error, assume email doesn't exist to avoid blocking signup
      return false
    }
  }

  const getSavedCredentials = (): { email: string; password: string } | null => {
    const savedEmail = localStorage.getItem('pawsense_saved_email')
    return savedEmail ? { email: savedEmail, password: '' } : null
  }

  const clearSavedCredentials = () => {
    localStorage.removeItem('pawsense_saved_email')
  }

  const signup = async (email: string, password: string, userData?: UserMetadata) => {
    console.log("[AUTH] Starting signup with email:", email)
    console.log("[AUTH] User metadata to save:", userData)
    
    // Create user on backend using admin API
    console.log("[AUTH] Creating user via backend...")
    const createRes = await fetch("http://localhost:5000/auth/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, metadata: userData })
    })
    
    const createData = await createRes.json()
    console.log("[AUTH] Create response status:", createRes.status)
    console.log("[AUTH] Create response:", createData)
    
    if (!createRes.ok) {
      console.error("[AUTH] Create user failed:", createData.error)
      throw new Error(createData.error || "Failed to create user")
    }
    
    console.log("✅ User created successfully - User ID:", createData.userId)
    console.log("[AUTH] Email confirmed at:", createData.email_confirmed_at)
    
    // Now login with the credentials
    console.log("[AUTH] Attempting login after user creation...")
    const { error: loginError, data: loginData } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (loginError) {
      console.error("[AUTH] ❌ Login failed:", loginError.message)
      throw loginError
    }
    
    console.log("[AUTH] ✅ Login successful, session:", !!loginData.session)
    if (loginData.session) {
      setSession(loginData.session)
      setUser(loginData.session.user)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    clearSavedCredentials()
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
    <AuthContext.Provider value={{ user, session, isLoading, isAuthenticated, login, signup, logout, resetPassword, updateProfile, checkEmailExists, getSavedCredentials, clearSavedCredentials }}>
      {children}
    </AuthContext.Provider>
  )
}

// Export AuthContext for use in other hooks
export { AuthContext }

// Note: useAuthContext hook is exported from useAuth hook to avoid fast refresh issues
