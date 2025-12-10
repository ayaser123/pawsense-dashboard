import { createContext, useEffect, useState, type ReactNode } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import apiClient from "@/lib/api"

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

type BackendCreateResp = { data?: { success?: boolean; userId?: string } } | null
type SignUpData = { user?: { id?: string } } | null

/**
 * Safely extract error message from any error type
 * Handles: Error objects, Supabase errors, strings, objects, and unknown types
 */
function extractErrorMessage(err: unknown): string {
  console.log("[extractErrorMessage] Input:", err)
  console.log("[extractErrorMessage] Type:", typeof err)
  
  if (!err) return String(err)
  
  // Handle Error instances
  if (err instanceof Error) {
    console.log("[extractErrorMessage] Extracted from Error.message:", err.message)
    return err.message
  }
  
  // Handle strings
  if (typeof err === "string") {
    console.log("[extractErrorMessage] Extracted from string")
    return err
  }
  
  // Handle objects with various possible error properties
  if (typeof err === "object") {
    const obj = err as Record<string, unknown>
    
    // Try common error property names in order of likelihood
    if (obj.message && typeof obj.message === "string") {
      console.log("[extractErrorMessage] Extracted from message property:", obj.message)
      return obj.message
    }
    if (obj.error && typeof obj.error === "string") {
      console.log("[extractErrorMessage] Extracted from error property:", obj.error)
      return obj.error as string
    }
    if (obj.details && typeof obj.details === "string") {
      console.log("[extractErrorMessage] Extracted from details property:", obj.details)
      return obj.details as string
    }
    if (obj.msg && typeof obj.msg === "string") {
      console.log("[extractErrorMessage] Extracted from msg property:", obj.msg)
      return obj.msg as string
    }
    if (obj.reason && typeof obj.reason === "string") {
      console.log("[extractErrorMessage] Extracted from reason property:", obj.reason)
      return obj.reason as string
    }
    
    // Try to call toString if available
    if (typeof (obj as { toString?: unknown }).toString === "function") {
      const str = (obj as { toString: () => string }).toString()
      if (str && str !== "[object Object]") {
        console.log("[extractErrorMessage] Extracted from toString():", str)
        return str
      }
    }
    
    // Last resort: JSON stringify
    try {
      const json = JSON.stringify(obj)
      console.log("[extractErrorMessage] Extracted from JSON.stringify:", json)
      return json
    } catch (e) {
      console.log("[extractErrorMessage] JSON.stringify failed, returning [object Object]")
      return "[object Object]"
    }
  }
  
  // Fallback
  return String(err)
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
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user || null)
      } catch (error) {
        console.error("Error initializing auth:", error)
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

      // Notify backend of auth state change
      if (session?.user) {
        try {
          await apiClient.post("/auth/user-sync", {
            userId: session.user.id,
            email: session.user.email,
            metadata: session.user.user_metadata,
          })
        } catch (error) {
          console.error("Error syncing user with backend:", error)
        }
      }
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // In dev mode, provide more context
        if (import.meta.env.DEV && error.message.toLowerCase().includes("email not confirmed")) {
          console.log("⚠️ Dev mode: Email confirmation required but trying to bypass...")
        }
        throw error
      }

      // Verify login succeeded
      if (!data.session || !data.user) {
        throw new Error("Login succeeded but no session was returned")
      }

      console.log("✅ Login successful:", data.user.email)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const signup = async (email: string, password: string, userData?: UserMetadata) => {
    try {
      // Use production-style signup with email confirmation (works in both dev and production)
      console.log("📧 Signup: Using email confirmation flow...")
      
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"
        console.log("🔄 Backend URL:", backendUrl)
        
        // First check if backend is running
        try {
          const healthRes = await fetch(`${backendUrl}/health`)
          if (!healthRes.ok) {
            throw new Error("Backend health check failed")
          }
          console.log("✅ Backend is running")
        } catch (healthErr) {
          console.error("❌ Backend not reachable:", healthErr)
          throw new Error(`Backend is not running at ${backendUrl}. Please start the backend server: node server/server.js`)
        }
        
        console.log("🔄 Calling /auth/create-user endpoint...")
        console.log("[DEBUG] Payload:", { email, password: "***", metadata: userData })
        
        const createUserRes = await fetch(`${backendUrl}/auth/create-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, metadata: userData }),
        })

        console.log("[DEBUG] Response status:", createUserRes.status, createUserRes.statusText)
        
        let errorData: Record<string, unknown> = {}
        let responseText = ""
        try {
          responseText = await createUserRes.clone().text()
          console.log("[DEBUG] Response text:", responseText.substring(0, 200))
          errorData = JSON.parse(responseText)
          console.log("[DEBUG] Parsed response:", errorData)
        } catch (parseErr) {
          console.error("[ERROR] Failed to parse response:", parseErr)
          console.error("[ERROR] Raw response:", responseText)
          errorData = { error: "Failed to parse server response", raw: responseText }
        }
        
        if (!createUserRes.ok) {
          // Extract the actual error message
          let errorMsg = "Backend signup failed"
          
          if (errorData.details) {
            errorMsg = String(errorData.details)
          } else if (errorData.message) {
            errorMsg = String(errorData.message)
          } else if (errorData.error) {
            errorMsg = String(errorData.error)
          } else if (errorData.supabaseError) {
            errorMsg = String(errorData.supabaseError)
          }
          
          console.error("❌ Backend error response:", {
            status: createUserRes.status,
            data: errorData,
            extracted: errorMsg
          })
          throw new Error(`Backend error: ${errorMsg}`)
        }

        const createUserData = errorData as { userId?: string; email?: string; success?: boolean }
        console.log("✅ User account created:", createUserData.userId, createUserData.email)

        if (!createUserData.userId) {
          console.error("❌ Backend response missing userId:", createUserData)
          throw new Error("Backend signup returned no user ID")
        }

        // Ensure profile row exists even before login (production-friendly)
        try {
          await apiClient.post("/auth/user-sync", {
            userId: createUserData.userId,
            email,
            metadata: userData || {},
          })
          console.log("✅ Profile synced/upserted after signup")
        } catch (syncErr) {
          console.warn("⚠️ Profile sync after signup failed (will retry on auth change):", syncErr)
        }

        // In development: Auto-confirm email and login
        // In production: User will receive confirmation email
        if (import.meta.env.DEV) {
          console.log("🔄 Dev mode: Auto-confirming email...")
          let confirmSuccess = false
          try {
            const confirmRes = await fetch(`${backendUrl}/auth/dev-confirm-email`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            })
            if (confirmRes.ok) {
              const confirmData = await confirmRes.json()
              console.log("✅ Email auto-confirmed in dev mode:", confirmData)
              confirmSuccess = true
            } else {
              const confirmErr = await confirmRes.json()
              console.error("❌ Email confirmation failed:", confirmErr)
              // Continue anyway - try to login and see if it works
            }
          } catch (confirmErr) {
            console.error("❌ Email confirmation error:", confirmErr)
            // Continue anyway - try to login and see if it works
          }

          // Wait longer for email confirmation to process in Supabase
          console.log("⏳ Waiting 2 seconds for confirmation to process...")
          await new Promise(resolve => setTimeout(resolve, 2000))

          // Auto-login in dev mode
          console.log("🔄 Dev mode: Logging in with Supabase...")
          console.log("🔄 Attempting login with email:", email)
          
          // Retry login up to 3 times with delay
          let loginError = null
          let loginData = null
          for (let attempt = 1; attempt <= 3; attempt++) {
            console.log(`🔄 Login attempt ${attempt}/3...`)
            const result = await supabase.auth.signInWithPassword({
              email,
              password,
            })
            
            if (!result.error) {
              loginError = null
              loginData = result.data
              console.log(`✅ Login succeeded on attempt ${attempt}`)
              break
            }
            
            loginError = result.error
            console.warn(`⚠️  Login attempt ${attempt} failed:`, result.error?.message)
            
            if (attempt < 3) {
              console.log("⏳ Waiting 1 second before retry...")
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          }

          if (loginError) {
            console.error("❌ Login failed after 3 attempts:", loginError)
            console.error("❌ Login error message:", loginError.message)
            const errorMsg = loginError.message || loginError.code || "Login failed"
            throw new Error(`Login failed: ${errorMsg}`)
          }

          if (!loginData?.session || !loginData?.user) {
            console.error("❌ Login succeeded but no session/user data returned")
            throw new Error("Login succeeded but no session returned")
          }

          console.log("✅ Dev mode: Auto-logged in as", loginData.user.email)
          setSession(loginData.session)
          setUser(loginData.user)
        } else {
          // Production mode: User needs to confirm email
          console.log("📧 Production mode: User will receive confirmation email at", email)
          // The user will need to click the link in their email to confirm
          // After confirming, they can login
        }
      } catch (err) {
        console.error("❌ Signup error:", err)
        throw err
      }
    } catch (error) {
      const errorMsg = extractErrorMessage(error)
      console.error("[AUTH] Signup error:", errorMsg)
      throw new Error(errorMsg)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      // Optimistically clear local state so UI updates immediately
      setUser(null)
      setSession(null)

      // Notify backend (best-effort)
      if (user?.email) {
        await apiClient.post("/auth/logout", { email: user.email }).catch(() => {
          // Continue logout even if backend call fails
        })
      }

      // Supabase sign out (revokes refresh token and clears storage)
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Hardening: clear any lingering Supabase auth tokens from localStorage
      try {
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i)
          if (k && k.startsWith("sb-") && k.endsWith("-auth-token")) {
            keysToRemove.push(k)
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k))
      } catch (_e) {
        // ignore storage cleanup errors
      }
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error
    } catch (error) {
      console.error("Password reset error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (userData: UserMetadata) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: userData,
      })

      if (error) throw error

      // Notify backend of profile update
      if (user?.email) {
        await apiClient.post("/auth/update-profile", {
          userId: user.id,
          email: user.email,
          metadata: userData,
        })
      }
    } catch (error) {
      console.error("Profile update error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
