import "dotenv/config.js"
import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"
import axios from "axios"
import multer from "multer"

console.log("[startup] 1/6 Imports loaded")

// Initialize Supabase Admin Client
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const PORT = process.env.PORT || 5000
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:8081"
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

console.log("[startup] 2/6 Environment variables loaded")
console.log(`[startup] - PORT: ${PORT}`)
console.log(`[startup] - SUPABASE_URL: ${SUPABASE_URL ? "✓" : "✗"}`)
console.log(`[startup] - SUPABASE_SERVICE_KEY: ${SUPABASE_SERVICE_KEY ? "✓ (length: " + SUPABASE_SERVICE_KEY.length + ")" : "✗"}`)
console.log(`[startup] - CORS_ORIGIN: ${CORS_ORIGIN}`)
console.log(`[startup] - GEMINI_API_KEY: ${GEMINI_API_KEY ? "✓" : "✗"}`)

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } })

console.log("[startup] 3/6 Multer configured")

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("[startup] ✗ FATAL: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env")
  process.exit(1)
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
})

console.log("[startup] 4/6 Supabase admin client initialized")

// Helper: safely serialize error to string
function safeStringifyError(err) {
  if (!err) return "Unknown error"
  if (typeof err === "string") return err
  if (err instanceof Error) return err.message || String(err)
  if (err.message) return String(err.message)
  try {
    return JSON.stringify(err, Object.getOwnPropertyNames(err))
  } catch (e) {
    return String(err)
  }
}

// Helper: upsert profile with retries (useful for transient network/auth issues)
async function safeUpsertProfile(profile, maxAttempts = 3, delayMs = 500) {
  let attempt = 0
  while (attempt < maxAttempts) {
    attempt += 1
    try {
      const { data, error } = await supabaseAdmin.from("profiles").upsert(profile, { onConflict: "id" }).select()

      if (error) {
        // If it's the last attempt, throw the error so caller can handle
        if (attempt >= maxAttempts) throw error
        console.warn(`Profile upsert attempt ${attempt} failed, retrying...`, error.message || error)
        await new Promise((r) => setTimeout(r, delayMs * attempt))
        continue
      }

      return { data, error: null }
    } catch (err) {
      if (attempt >= maxAttempts) return { data: null, error: err }
      console.warn(`Profile upsert attempt ${attempt} exception, retrying...`, String(err))
      await new Promise((r) => setTimeout(r, delayMs * attempt))
    }
  }
  return { data: null, error: new Error("Failed to upsert profile") }
}

// Initialize Express
const app = express()

// Middleware
app.use(bodyParser.json())

console.log("[startup] 5/6 Express and middleware configured")

// Support multiple origins (comma-separated) and wildcard in development
let allowedOrigins = []
if (CORS_ORIGIN) {
  allowedOrigins = CORS_ORIGIN.split(",").map((s) => s.trim())
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true)
      // If allowedOrigins empty, allow all in development
      if (allowedOrigins.length === 0) return callback(null, true)
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true)
      }
      // allow localhost variants (useful when port shifts during dev)
      try {
        const url = new URL(origin)
        if (url.hostname === "localhost" && allowedOrigins.some((a) => a.includes("localhost"))) {
          return callback(null, true)
        }
      } catch (e) {
        // ignore
      }
      return callback(new Error("Not allowed by CORS"))
    },
    credentials: true,
  }),
)

// Token verification middleware
async function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "No token provided" })
  }

  try {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" })
    }

    req.user = user
    next()
  } catch (err) {
    console.error("Token verification failed:", err)
    return res.status(401).json({ error: "Token verification failed" })
  }
}

// ============ HEALTH CHECK ============

// GET /health - Health check endpoint
app.get("/health", (req, res) => {
  return res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    backend: "PawSense Node.js Server",
    environment: process.env.NODE_ENV
  })
})

// ============ SIMPLE FORM SUBMISSION (Assignment demo) ============
// POST /submit - Persist contact form to Supabase 'contacts' table
app.post("/submit", async (req, res) => {
  try {
    const payload = req.body || {}
    const name = String(payload.name || "").trim()
    const email = String(payload.email || "").trim()
    const message = String(payload.message || "").trim()

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing name, email, or message" })
    }

    const entry = {
      id: uuidv4(),
      name,
      email,
      message,
      created_at: new Date().toISOString(),
    }

    // Insert into Supabase (service role)
    const { error } = await supabaseAdmin.from("contacts").insert(entry)
    if (error) {
      console.error("[submit] Supabase insert error:", error)
      return res.status(500).json({ error: "Failed to save contact", details: error.message || error })
    }
    console.log("[submit] Saved contact:", entry)
    return res.status(201).json({ success: true, entry })
  } catch (err) {
    console.error("[submit] Error:", err)
    return res.status(500).json({ error: "Server error" })
  }
})

// GET /debug/supabase - Check Supabase connection
app.get("/debug/supabase", async (req, res) => {
  try {
    // Try to list users to verify Supabase connection
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()
    
    if (error) {
      return res.status(500).json({
        status: "error",
        message: "Supabase connection failed",
        error: error.message,
        code: error.code
      })
    }
    
    return res.json({
      status: "ok",
      message: "Supabase connected",
      userCount: users?.users?.length || 0,
      supabaseUrl: SUPABASE_URL
    })
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Debug failed",
      error: err?.message || String(err)
    })
  }
})

// ============ AUTH ENDPOINTS ============

// POST /auth/signup - Create user profile
app.post("/auth/signup", async (req, res) => {
  try {
    const { userId, email, metadata } = req.body

    if (!userId || !email) {
      return res.status(400).json({ error: "Missing userId or email" })
    }

    console.log("/auth/signup payload:", { userId, email, metadata })

    const profile = {
      id: userId,
      email,
      full_name: metadata?.full_name || null,
      avatar_url: metadata?.avatar_url || null,
      created_at: new Date(),
      updated_at: new Date(),
    }

    // Use safeUpsertProfile to handle transient failures with retries
    const { data: upsertData, error: upsertErr } = await safeUpsertProfile(profile, 3, 500)
    if (upsertErr) {
      console.error("Profile upsert error after retries:", upsertErr)
      return res.status(500).json({ error: "Failed to create profile", details: upsertErr })
    }

    console.log("Profile upsert succeeded:", upsertData)
    return res.json({ success: true, userId, profile: upsertData })
  } catch (err) {
    console.error("Signup error:", err)
    return res.status(500).json({ error: "Server error" })
  }
})

// POST /auth/create-user - Create user via Supabase Admin (service_role)
// Dev-only: creates a user and upserts profile using the service role key
// If user already exists (422), it's OK - we can use that user
app.post("/auth/create-user", async (req, res) => {
  try {
    const { email, password, metadata } = req.body

    if (!email || !password) {
      console.error("[AUTH] Missing email or password")
      return res.status(400).json({ error: "Missing email or password" })
    }

    console.log("[AUTH] Creating/retrieving user with email:", email)

    // Create user via admin API
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: metadata || {},
    })

    let createdUser = null
    let userExistedAlready = false

    if (error) {
      // Serialize error properly using safe stringifier
      const errorMessage = safeStringifyError(error)
      const errorCode = error?.code || error?.status || "UNKNOWN"
      
      console.error("[AUTH] Create user returned:", errorCode, errorMessage)
      
      // If it's a 422, the user already exists - this is OK in dev, we can proceed
      if (error.status === 422 || errorMessage.toLowerCase().includes("already registered")) {
        console.log("[AUTH] ℹ️  User already exists in Supabase Auth, attempting to use existing user...")
        userExistedAlready = true
        
        // Try to get the user by listing users and finding by email
        const { data: allUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        if (listError) {
          console.error("[AUTH] Could not list users:", listError)
          return res.status(500).json({ 
            error: "User exists but cannot retrieve",
            details: "Email already registered - please use the login page instead"
          })
        }
        
        const existingUser = allUsers?.users?.find(u => u.email === email)
        if (existingUser) {
          console.log("[AUTH] ✅ Found existing user:", existingUser.id)
          createdUser = existingUser
          // In development, align the user's password with the one provided on signup
          if (process.env.NODE_ENV === "development") {
            try {
              console.log("[AUTH][DEV] Updating password for existing user to match signup input...")
              const { data: pwUpdate, error: pwErr } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
                password,
              })
              if (pwErr) {
                console.warn("[AUTH][DEV] ⚠️  Failed to update password for existing user:", pwErr)
              } else {
                console.log("[AUTH][DEV] ✅ Password updated for existing user:", existingUser.id)
              }

              // Optionally auto-confirm email in dev to ensure immediate login
              if (!existingUser.email_confirmed_at) {
                const now = new Date().toISOString()
                const { error: confErr } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
                  email_confirmed_at: now,
                })
                if (confErr) {
                  console.warn("[AUTH][DEV] ⚠️  Failed to auto-confirm email for existing user:", confErr)
                } else {
                  console.log("[AUTH][DEV] ✅ Email auto-confirmed for existing user at", now)
                }
              }
            } catch (e) {
              console.warn("[AUTH][DEV] ⚠️  Exception while updating existing user:", e)
            }
          }
        } else {
          console.error("[AUTH] Could not find user after checking list")
          return res.status(500).json({ 
            error: "User creation issue",
            details: "Email registered but user not accessible"
          })
        }
      } else {
        // It's a different error, not "already exists"
        console.error("[AUTH] ❌ Supabase admin create user failed:", errorMessage, "Code:", errorCode)
        
        return res.status(500).json({ 
          error: "Failed to create user", 
          details: errorMessage,
          code: errorCode
        })
      }
    } else {
      createdUser = data?.user || data
    }

    if (!createdUser || !createdUser.id) {
      console.error("[AUTH] ❌ User creation returned no id. Data:", JSON.stringify(data))
      return res.status(500).json({ 
        error: "User creation returned no id", 
        details: "Supabase did not return a user ID"
      })
    }

    if (!userExistedAlready) {
      console.log("[AUTH] ✅ New user created in Supabase:", createdUser.id, "email:", email)
    } else {
      console.log("[AUTH] ✅ Using existing user from Supabase:", createdUser.id, "email:", email)
    }

    // Try to upsert profile - this will create user data in database
    const profile = {
      id: createdUser.id,
      email: createdUser.email || email,
      full_name: metadata?.full_name || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("[AUTH] Attempting to upsert profile with data:", profile)

    const { data: upsertData, error: upsertError } = await supabaseAdmin
      .from("profiles")
      .upsert(profile, { onConflict: "id" })
      .select()

    if (upsertError) {
      const upsertErrorMsg = safeStringifyError(upsertError)
      console.warn("[AUTH] ⚠️  Profile upsert failed:", upsertErrorMsg)
      console.log("[AUTH] ℹ️  This usually means the 'profiles' table doesn't exist or has permission issues")
      console.log("[AUTH] ℹ️  User was created in Auth but no profile data saved to database")
      console.log("[AUTH] ℹ️  To fix: Run schema.sql in Supabase SQL editor to create tables")
      
      // Still return success because user was created in Auth
      return res.status(201).json({ 
        success: true, 
        userId: createdUser.id, 
        email: createdUser.email,
        message: userExistedAlready ? "User account found" : "User created successfully",
        userExisted: userExistedAlready,
        warning: "Profile data could not be saved. Please run schema.sql in Supabase."
      })
    } else {
      console.log("[AUTH] ✅ Profile upserted successfully:", upsertData)
    }

    // Return success 
    console.log("[AUTH] ✅ Auth complete for:", email)
    return res.status(201).json({ 
      success: true, 
      userId: createdUser.id, 
      email: createdUser.email,
      message: userExistedAlready ? "User account found - you can now login" : "User created successfully",
      userExisted: userExistedAlready,
      profileCreated: true
    })
  } catch (err) {
    const errMsg = safeStringifyError(err)
    const errStack = err?.stack || ""
    console.error("[AUTH] ❌ Create-user exception:", errMsg)
    if (errStack) console.error("[AUTH] Stack:", errStack)
    
    return res.status(500).json({ 
      error: "Server error", 
      details: errMsg
    })
  }
})

// DEV ONLY: POST /auth/dev-confirm-email - Auto-confirm email in development
app.post("/auth/dev-confirm-email", async (req, res) => {
  // Check if development mode
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ error: "This endpoint is only available in development mode" })
  }

  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: "Missing email" })
    }

    console.log("[DEV] Auto-confirming email for:", email)

    // Get user by email using admin API
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error("[DEV] List users error:", listError)
      return res.status(500).json({ error: "Failed to list users", details: listError })
    }

    const user = users?.users?.find(u => u.email === email)

    if (!user) {
      console.log("[DEV] User not found:", email)
      return res.status(404).json({ error: "User not found" })
    }

    console.log("[DEV] Found user:", user.id, email)

    // Update user to confirm email - set email_confirmed_at to now
    const now = new Date().toISOString()
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      email_confirmed_at: now,
    })

    if (updateError) {
      console.error("[DEV] Email confirmation error:", updateError)
      return res.status(500).json({ error: "Failed to confirm email", details: updateError })
    }

    console.log("[DEV] ✅ Email confirmed for:", email, "at", now)
    return res.json({ success: true, message: "Email confirmed", userId: user.id, confirmationTime: now })
  } catch (err) {
    console.error("[DEV] Dev-confirm-email error:", err)
    return res.status(500).json({ error: "Server error", details: String(err) })
  }
})

// POST /auth/login - Log login event
app.post("/auth/login", async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: "Missing email" })
    }

    // Optional: Update last_login timestamp
    // await supabaseAdmin
    //   .from('profiles')
    //   .update({ last_login: new Date() })
    //   .eq('email', email);

    return res.json({ success: true, message: "Login recorded" })
  } catch (err) {
    console.error("Login error:", err)
    return res.status(500).json({ error: "Server error" })
  }
})

// POST /auth/logout - Log logout event
app.post("/auth/logout", async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: "Missing email" })
    }

    return res.json({ success: true, message: "Logout recorded" })
  } catch (err) {
    console.error("Logout error:", err)
    return res.status(500).json({ error: "Server error" })
  }
})

// POST /auth/user-sync - Sync user data
app.post("/auth/user-sync", async (req, res) => {
  try {
    const { userId, email, metadata } = req.body

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" })
    }

    const profile = {
      id: userId,
      email: email || null,
      full_name: metadata?.full_name || null,
      avatar_url: metadata?.avatar_url || null,
      updated_at: new Date(),
    }

    const { error } = await supabaseAdmin.from("profiles").upsert(profile, { onConflict: "id" })

    if (error) {
      console.error("Profile sync error:", error)
      return res.status(500).json({ error: "Failed to sync profile" })
    }

    return res.json({ success: true })
  } catch (err) {
    console.error("Sync error:", err)
    return res.status(500).json({ error: "Server error" })
  }
})

// POST /auth/update-profile - Update user profile
app.post("/auth/update-profile", verifyToken, async (req, res) => {
  try {
    const { userId, email, metadata } = req.body

    const profile = {
      id: userId,
      email: email || null,
      full_name: metadata?.full_name || null,
      avatar_url: metadata?.avatar_url || null,
      updated_at: new Date(),
    }

    const { error } = await supabaseAdmin.from("profiles").update(profile).eq("id", userId)

    if (error) {
      console.error("Profile update error:", error)
      return res.status(500).json({ error: "Failed to update profile" })
    }

    return res.json({ success: true })
  } catch (err) {
    console.error("Update error:", err)
    return res.status(500).json({ error: "Server error" })
  }
})

// ============ PROFILE ENDPOINTS ============

// GET /api/profile - Get user profile
app.get("/api/profile", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from("profiles").select("*").eq("id", req.user.id).single()

    if (error) {
      console.error("Profile fetch error:", error)
      return res.status(404).json({ error: "Profile not found" })
    }

    return res.json(data)
  } catch (err) {
    console.error("Profile error:", err)
    return res.status(500).json({ error: "Server error" })
  }
})

// PUT /api/profile - Update user profile
app.put("/api/profile", verifyToken, async (req, res) => {
  try {
    const { full_name, avatar_url } = req.body

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({ full_name, avatar_url, updated_at: new Date() })
      .eq("id", req.user.id)
      .select()
      .single()

    if (error) {
      console.error("Profile update error:", error)
      return res.status(500).json({ error: "Failed to update profile" })
    }

    return res.json(data)
  } catch (err) {
    console.error("Update error:", err)
    return res.status(500).json({ error: "Server error" })
  }
})

// ============ PET ENDPOINTS ============

// GET /api/pets - Get all user pets
app.get("/api/pets", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("pets")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Pets fetch error:", error)
      return res.status(500).json({ error: "Failed to fetch pets" })
    }

    return res.json(data || [])
  } catch (err) {
    console.error("Pets error:", err)
    return res.status(500).json({ error: "Server error" })
  }
})

// POST /api/pets - Create a new pet
app.post("/api/pets", verifyToken, async (req, res) => {
  try {
    const { name, species, breed, age, weight, color, medical_info } = req.body

    if (!name || !species) {
      return res.status(400).json({ error: "Missing name or species" })
    }

    const pet = {
      id: uuidv4(),
      user_id: req.user.id,
      name,
      species,
      breed: breed || null,
      age: age || null,
      weight: weight || null,
      color: color || null,
      medical_info: medical_info || null,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const { data, error } = await supabaseAdmin.from("pets").insert(pet).select().single()

    if (error) {
      console.error("Pet creation error:", error)
      return res.status(500).json({ error: "Failed to create pet" })
    }

    return res.status(201).json(data)
  } catch (err) {
    console.error("Create pet error:", err)
    return res.status(500).json({ error: "Server error" })
  }
})

// PUT /api/pets/:petId - Update pet
app.put("/api/pets/:petId", verifyToken, async (req, res) => {
  try {
    const { petId } = req.params
    const { name, species, breed, age, weight, color, medical_info } = req.body

    // Verify ownership
    const { data: pet, error: fetchError } = await supabaseAdmin.from("pets").select("user_id").eq("id", petId).single()

    if (fetchError || pet.user_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const { data, error } = await supabaseAdmin
      .from("pets")
      .update({
        name,
        species,
        breed,
        age,
        weight,
        color,
        medical_info,
        updated_at: new Date(),
      })
      .eq("id", petId)
      .select()
      .single()

    if (error) {
      console.error("Pet update error:", error)
      return res.status(500).json({ error: "Failed to update pet" })
    }

    return res.json(data)
  } catch (err) {
    console.error("Update pet error:", err)
    return res.status(500).json({ error: "Server error" })
  }
})

// DELETE /api/pets/:petId - Delete pet
app.delete("/api/pets/:petId", verifyToken, async (req, res) => {
  try {
    const { petId } = req.params

    // Verify ownership
    const { data: pet, error: fetchError } = await supabaseAdmin.from("pets").select("user_id").eq("id", petId).single()

    if (fetchError || pet.user_id !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const { error } = await supabaseAdmin.from("pets").delete().eq("id", petId)

    if (error) {
      console.error("Pet delete error:", error)
      return res.status(500).json({ error: "Failed to delete pet" })
    }

    return res.json({ success: true, message: "Pet deleted" })
  } catch (err) {
    console.error("Delete pet error:", err)
    return res.status(500).json({ error: "Server error" })
  }
})

// ============ LOCATION ENDPOINTS ============

// POST /api/locations - Save user location
app.post("/api/locations", verifyToken, async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: "Missing latitude or longitude" })
    }

    const location = {
      id: uuidv4(),
      user_id: req.user.id,
      latitude,
      longitude,
      address: address || null,
      created_at: new Date(),
    }

    const { data, error } = await supabaseAdmin.from("locations").insert(location).select().single()

    if (error) {
      console.error("Location creation error:", error)
      return res.status(500).json({ error: "Failed to save location" })
    }

    return res.status(201).json(data)
  } catch (err) {
    console.error("Location error:", err)
    return res.status(500).json({ error: "Server error" })
  }
})

// GET /api/locations - Get user's recent locations
app.get("/api/locations", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("locations")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Locations fetch error:", error)
      return res.status(500).json({ error: "Failed to fetch locations" })
    }

    return res.json(data || [])
  } catch (err) {
    console.error("Locations error:", err)
    return res.status(500).json({ error: "Server error" })
  }
})

// GET /api/locations/nearby-vets - Find nearby veterinary services
// In a real app, integrate with Google Maps, MapBox, or similar
app.get("/api/locations/nearby-vets", verifyToken, async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Missing latitude or longitude" })
    }

    // Mock nearby vets - in production, use a real geo-distance service
    const mockVets = [
      {
        id: "1",
        name: "Happy Paws Veterinary Clinic",
        address: "123 Main St, Your City",
        phone: "+1-555-0123",
        lat: Number.parseFloat(latitude) + 0.01,
        lng: Number.parseFloat(longitude) + 0.01,
        distance: "0.8 km",
        rating: 4.8,
        specialty: "General Practice",
        available: true,
      },
      {
        id: "2",
        name: "Pet Care Emergency Hospital",
        address: "456 Oak Ave, Your City",
        phone: "+1-555-0456",
        lat: Number.parseFloat(latitude) - 0.02,
        lng: Number.parseFloat(longitude) - 0.01,
        distance: "1.5 km",
        rating: 4.6,
        specialty: "Emergency Care",
        available: true,
      },
      {
        id: "3",
        name: "Dr. Smith Animal Clinic",
        address: "789 Pine Rd, Your City",
        phone: "+1-555-0789",
        lat: Number.parseFloat(latitude) + 0.015,
        lng: Number.parseFloat(longitude) - 0.015,
        distance: "1.2 km",
        rating: 4.9,
        specialty: "Dermatology",
        available: false,
      },
    ]

    return res.json(mockVets)
  } catch (err) {
    console.error("Nearby vets error:", err)
    return res.status(500).json({ error: "Server error" })
  }
})

// GET /api/locations/current - Get current user location (from latest)
app.get("/api/locations/current", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("locations")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      return res.status(404).json({ error: "No location found" })
    }

    return res.json(data)
  } catch (err) {
    console.error("Current location error:", err)
    return res.status(500).json({ error: "Server error" })
  }
})

// ============ SLEEP ENDPOINTS ============

// GET /api/sleep - Get sleep records for a pet
app.get("/api/sleep", verifyToken, async (req, res) => {
  try {
    const { pet_id } = req.query

    if (!pet_id) {
      return res.status(400).json({ error: "Missing pet_id" })
    }

    const { data, error } = await supabaseAdmin
      .from("sleep_records")
      .select("*")
      .eq("pet_id", pet_id)
      .order("created_at", { ascending: false })
      .limit(30)

    if (error) {
      console.error("Sleep fetch error:", error)
      return res.status(500).json({ error: "Failed to fetch sleep data" })
    }

    return res.json(data || [])
  } catch (err) {
    console.error("Sleep error:", err)
    return res.status(500).json({ error: "Server error" })
  }
})

// POST /api/sleep - Record sleep data
app.post("/api/sleep", verifyToken, async (req, res) => {
  try {
    const { pet_id, start_time, end_time, quality, notes } = req.body

    if (!pet_id || !start_time) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    // Calculate duration if end_time provided
    let durationMinutes = null
    if (end_time) {
      const start = new Date(start_time)
      const end = new Date(end_time)
      durationMinutes = Math.floor((end.getTime() - start.getTime()) / 60000)
    }

    const sleepRecord = {
      id: uuidv4(),
      pet_id,
      start_time,
      end_time: end_time || null,
      duration_minutes: durationMinutes,
      quality: quality || "good",
      notes: notes || null,
      created_at: new Date(),
    }

    const { data, error } = await supabaseAdmin.from("sleep_records").insert(sleepRecord).select().single()

    if (error) {
      console.error("Sleep record error:", error)
      return res.status(500).json({ error: "Failed to record sleep" })
    }

    return res.status(201).json(data)
  } catch (err) {
    console.error("Create sleep error:", err)
    return res.status(500).json({ error: "Server error" })
  }
})

// ============ VIDEO & AI ANALYSIS ============

// POST /api/videos/upload - Upload video to Supabase Storage and analyze
app.post("/api/videos/upload", verifyToken, upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No video file provided" })
    }

    const { petId } = req.body
    const videoId = uuidv4()
    const fileName = `${req.user.id}/${videoId}-${Date.now()}.mp4`

    // Upload video to Supabase Storage
    const { data, error: uploadError } = await supabaseAdmin.storage.from("videos").upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    })

    if (uploadError) {
      console.error("Video upload error:", uploadError)
      return res.status(500).json({ error: "Failed to upload video" })
    }

    // Get public URL
    const { data: publicData } = supabaseAdmin.storage.from("videos").getPublicUrl(fileName)

    const videoUrl = publicData?.publicUrl || ""

    // Store video metadata in database
    const { data: videoRecord, error: dbError } = await supabaseAdmin
      .from("videos")
      .insert({
        id: videoId,
        user_id: req.user.id,
        pet_id: petId || null,
        url: videoUrl,
        file_path: fileName,
        uploaded_at: new Date(),
      })
      .select()
      .single()

    if (dbError) {
      console.error("Video record error:", dbError)
      return res.status(500).json({ error: "Failed to save video metadata" })
    }

    // Trigger AI analysis asynchronously (non-blocking)
    if (GEMINI_API_KEY) {
      analyzeVideoWithAI(videoUrl, videoId, req.user.id).catch((err) => {
        console.error("AI analysis error:", err)
      })
    }

    return res.status(201).json({
      success: true,
      videoId,
      url: videoUrl,
      message: "Video uploaded. Analysis in progress...",
    })
  } catch (err) {
    console.error("Video upload error:", err)
    return res.status(500).json({ error: "Server error" })
  }
})

// Analyze video using Google Gemini or similar AI
async function analyzeVideoWithAI(videoUrl, videoId, userId) {
  try {
    if (!GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not set, skipping AI analysis")
      return
    }

    console.log(`[v0] Starting AI analysis for video ${videoId}`)

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
      {
        contents: [
          {
            parts: [
              {
                text: "Analyze this pet video and provide JSON with: behavior_description (string), mood (string: happy/calm/anxious/playful/sick), activity_level (string: low/medium/high), concerns (string or empty). Return ONLY valid JSON.",
              },
              {
                fileData: {
                  mimeType: "video/mp4",
                  fileUri: videoUrl,
                },
              },
            ],
          },
        ],
      },
      {
        params: { key: GEMINI_API_KEY },
        timeout: 60000, // 60 second timeout for video analysis
      },
    )

    console.log(`[v0] Gemini API response received for video ${videoId}`)

    const analysisText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || ""
    console.log(`[v0] Analysis text: ${analysisText.substring(0, 200)}...`)

    let analysis = {
      behavior_description: "",
      mood: "unknown",
      activity_level: "medium",
      concerns: "",
    }

    try {
      // Try to extract and parse JSON
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        analysis = {
          behavior_description: parsed.behavior_description || analysisText,
          mood: parsed.mood || "unknown",
          activity_level: parsed.activity_level || "medium",
          concerns: parsed.concerns || "",
        }
        console.log(`[v0] Successfully parsed JSON analysis:`, analysis)
      } else {
        // If no JSON found, use the text as description
        analysis.behavior_description = analysisText
        console.warn(`[v0] No JSON found in response, using text as description`)
      }
    } catch (parseErr) {
      console.warn(`[v0] Failed to parse JSON, using text as fallback:`, parseErr.message)
      analysis.behavior_description = analysisText
    }

    const { error: insertErr } = await supabaseAdmin.from("video_analyses").insert({
      video_id: videoId,
      user_id: userId,
      behavior_description: analysis.behavior_description || "Analysis complete",
      mood: analysis.mood,
      activity_level: analysis.activity_level,
      concerns: analysis.concerns,
      analyzed_at: new Date(),
    })

    if (insertErr) {
      console.error(`[v0] Failed to store analysis: ${insertErr.message}`)
      throw insertErr
    }

    console.log(`✅ Analysis complete for video ${videoId}`)
  } catch (err) {
    console.error(`[v0] AI analysis error: ${err.message}`)

    try {
      await supabaseAdmin.from("video_analyses").insert({
        video_id: videoId,
        user_id: userId,
        behavior_description: "Analysis is being processed. Please check back in a moment.",
        mood: "unknown",
        activity_level: "medium",
        concerns: "",
        analyzed_at: new Date(),
      })
      console.log(`[v0] Stored fallback analysis for video ${videoId}`)
    } catch (dbErr) {
      console.error(`[v0] Failed to store fallback analysis: ${dbErr.message}`)
    }
  }
}

// GET /api/videos - Get user's uploaded videos
app.get("/api/videos", verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("videos")
      .select("*, video_analyses(*)")
      .eq("user_id", req.user.id)
      .order("uploaded_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error("Videos fetch error:", error)
      return res.status(500).json({ error: "Failed to fetch videos" })
    }

    return res.json(data || [])
  } catch (err) {
    console.error("Videos error:", err)
    return res.status(500).json({ error: "Server error" })
  }
})

// GET /api/videos/:videoId/analysis - Get analysis for a video
app.get("/api/videos/:videoId/analysis", verifyToken, async (req, res) => {
  try {
    const { videoId } = req.params

    const { data, error } = await supabaseAdmin.from("video_analyses").select("*").eq("video_id", videoId).single()

    if (error || !data) {
      return res.status(404).json({ error: "Analysis not found" })
    }

    return res.json(data)
  } catch (err) {
    console.error("Video analysis error:", err)
    return res.status(500).json({ error: "Server error" })
  }
})

// ============ HEALTH CHECK ============

app.get("/health", (req, res) => {
  return res.json({ status: "ok", timestamp: new Date() })
})

// ============ ADMIN DB CHECK (dev only) ============
// Quick endpoint to validate Supabase admin connectivity and table existence
app.get("/admin/db-check", async (req, res) => {
  try {
    // Attempt a simple select on `profiles` table
    const { data, error } = await supabaseAdmin.from("profiles").select("id,email").limit(5)

    if (error) {
      console.error("DB check error:", error)
      return res.status(500).json({ ok: false, error: error.message || error })
    }

    return res.json({ ok: true, sample: data || [], count: (data || []).length })
  } catch (err) {
    console.error("DB check exception:", err)
    return res.status(500).json({ ok: false, error: String(err) })
  }
})

// ============ START SERVER ============

app.listen(PORT, () => {
  console.log("[startup] 6/6 Server initialized")
  console.log(`✅ PawSense backend running on http://localhost:${PORT}`)
  console.log(`✅ CORS enabled for: ${CORS_ORIGIN}`)
  console.log(`\n🐾 Ready to serve requests!\n`)
})
