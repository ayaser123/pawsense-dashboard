import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "https://lkkjkomyzsbrxttwsupk.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxra2prb215enNicnh0dHdzdXBrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDk5NTU1MSwiZXhwIjoyMDgwNTcxNTUxfQ.CMbWLvn_gc97b0w3d2vV9aEmMijMRZRlXziG881iDMc";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Basic middleware
app.use(
  cors({
    origin: ["http://localhost:8080", process.env.FRONTEND_URL].filter(Boolean),
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", environment: process.env.NODE_ENV || "development" });
});

// Root route for quick browser checks
app.get("/", (_req, res) => {
  res.status(200).json({ message: "Pawsense backend running", health: "/health", auth: "/auth/create-user" });
});

// --- Auth endpoints (minimal stubs to support frontend/tests) ---
app.post("/auth/create-user", (req, res) => {
  try {
    const { email, password, metadata } = req.body || {};

    // very basic validation
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(422).json({ error: "Invalid email", details: "Email is required and must be valid" });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(422).json({ error: "Invalid password", details: "Password must be at least 6 characters" });
    }

    const userId = randomUUID();
    console.log("[AUTH] Create user:", { email, userId, metadata });

    return res.status(201).json({ success: true, userId, email });
  } catch (err) {
    console.error("[AUTH] create-user error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/auth/login", (req, res) => {
  try {
    const { email, password } = req.body || {};

    // very basic validation
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(422).json({ error: "Invalid email", details: "Email is required and must be valid" });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(422).json({ error: "Invalid password", details: "Password must be at least 6 characters" });
    }

    const userId = randomUUID();
    console.log("[AUTH] Login user:", { email, userId });

    return res.status(200).json({ success: true, userId, email });
  } catch (err) {
    console.error("[AUTH] login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/auth/dev-confirm-email", (req, res) => {
  const { email } = req.body || {};
  console.log("[AUTH] Dev confirm email:", email);
  return res.status(200).json({ success: true, email });
});

app.post("/auth/user-sync", (req, res) => {
  const { userId, email, metadata } = req.body || {};
  console.log("[AUTH] User sync:", { userId, email, metadata });
  return res.status(200).json({ success: true });
});

app.post("/auth/update-profile", (req, res) => {
  const { userId, email, metadata } = req.body || {};
  console.log("[AUTH] Update profile:", { userId, email, metadata });
  return res.status(200).json({ success: true });
});

app.post("/auth/logout", (req, res) => {
  const { email } = req.body || {};
  console.log("[AUTH] Logout:", { email });
  return res.status(200).json({ success: true });
});

// --- Location & Maps endpoints ---
app.post("/api/vets/nearby", (req, res) => {
  try {
    const { lat, lng, radius } = req.body || {};

    if (!lat || !lng) {
      return res.status(422).json({ error: "Invalid coordinates", details: "lat and lng are required" });
    }

    // Mock vets data for development
    const mockVets = [
      {
        id: "vet1",
        name: "Happy Paws Veterinary Clinic",
        address: "123 Pet St, Your City",
        phone: "(555) 123-4567",
        rating: 4.8,
        distance: 0.5,
        lat: lat + 0.005,
        lng: lng + 0.005,
        openNow: true,
        specialties: ["General Care", "Surgery", "Dental"],
      },
      {
        id: "vet2",
        name: "Furry Friends Animal Hospital",
        address: "456 Pet Ave, Your City",
        phone: "(555) 234-5678",
        rating: 4.6,
        distance: 1.2,
        lat: lat - 0.004,
        lng: lng + 0.006,
        openNow: true,
        specialties: ["Emergency Care", "Cardiology"],
      },
      {
        id: "vet3",
        name: "Pet Wellness Center",
        address: "789 Animal Blvd, Your City",
        phone: "(555) 345-6789",
        rating: 4.9,
        distance: 2.1,
        lat: lat + 0.008,
        lng: lng - 0.003,
        openNow: false,
        specialties: ["Preventive Care", "Vaccinations"],
      },
    ];

    console.log("[LOCATION] Nearby vets requested:", { lat, lng, radius });
    return res.status(200).json({ success: true, vets: mockVets });
  } catch (err) {
    console.error("[LOCATION] Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// --- AI Analysis endpoints ---
app.post("/api/ai/analyze-behavior", (req, res) => {
  try {
    const { petType, age, description, context } = req.body || {};

    if (!petType || !description) {
      return res.status(422).json({ error: "Invalid input", details: "petType and description are required" });
    }

    // Mock AI response
    const mockAnalysis = {
      analysis: `Based on the description provided, ${petType.toLowerCase()} exhibits typical behavior patterns for their age.`,
      recommendations: [
        "Maintain regular exercise routine for optimal health",
        "Schedule periodic veterinary check-ups",
        "Provide mental stimulation through interactive play",
        "Monitor dietary habits and adjust portions as needed",
      ],
      confidence: 87,
    };

    console.log("[AI] Behavior analysis requested:", { petType, age });
    return res.status(200).json({ success: true, analysis: mockAnalysis });
  } catch (err) {
    console.error("[AI] Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/ai/generate-health-tips", (req, res) => {
  try {
    const { petType, breed, age } = req.body || {};

    if (!petType) {
      return res.status(422).json({ error: "Invalid input", details: "petType is required" });
    }

    // Mock health tips
    const mockTips = [
      `Keep your ${breed || petType} properly hydrated at all times`,
      "Ensure ${age} year old pets receive age-appropriate nutrition",
      "Regular exercise helps prevent behavioral issues and obesity",
      "Schedule annual dental check-ups for optimal oral health",
      "Keep vaccinations and parasite prevention up to date",
    ];

    console.log("[AI] Health tips generated:", { petType, breed, age });
    return res.status(200).json({ success: true, tips: mockTips });
  } catch (err) {
    console.error("[AI] Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// --- Activity tracking endpoints ---
app.post("/api/activity/record", (req, res) => {
  try {
    const { petId, lat, lng, timestamp, activityType } = req.body || {};

    if (!petId || !lat || !lng) {
      return res.status(422).json({ error: "Invalid input", details: "petId, lat, and lng are required" });
    }

    console.log("[ACTIVITY] Activity recorded:", { petId, lat, lng, activityType });
    return res.status(201).json({ success: true, id: randomUUID() });
  } catch (err) {
    console.error("[ACTIVITY] Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/activity/:petId", (req, res) => {
  try {
    const { petId } = req.params;

    if (!petId) {
      return res.status(422).json({ error: "Invalid pet ID" });
    }

    // Mock activity data
    const mockActivities = [
      { id: "1", timestamp: new Date(Date.now() - 3600000).toISOString(), lat: 40.7128, lng: -74.006, type: "walk" },
      { id: "2", timestamp: new Date(Date.now() - 7200000).toISOString(), lat: 40.7129, lng: -74.005, type: "play" },
    ];

    console.log("[ACTIVITY] Activity history retrieved:", { petId });
    return res.status(200).json({ success: true, activities: mockActivities });
  } catch (err) {
    console.error("[ACTIVITY] Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// --- Pet Management Endpoints ---
// GET all pets for authenticated user
app.get("/api/pets", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    
    if (!userId) {
      console.log("[PETS] No user ID provided");
      return res.status(401).json({ error: "Unauthorized - no user ID" });
    }

    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("[PETS] Supabase error:", error);
      return res.status(500).json({ error: "Failed to fetch pets" });
    }

    console.log("[PETS] Retrieved pets for user:", { userId, count: data?.length || 0 });
    return res.status(200).json(data || []);
  } catch (err) {
    console.error("[PETS] Get pets error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST add new pet
app.post("/api/pets", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const { name, species, breed, age, gender } = req.body;

    console.log("[PETS] Add request - userId:", userId, "name:", name, "species:", species);

    if (!userId) {
      console.log("[PETS] No user ID provided");
      return res.status(401).json({ error: "Unauthorized - no user ID" });
    }

    // Validate required fields
    if (!name || !species) {
      console.log("[PETS] Validation failed - missing name or species");
      return res.status(400).json({ error: "Pet name and species are required" });
    }

    const petId = randomUUID();
    const newPet = {
      id: petId,
      user_id: userId,
      name,
      species,
      breed: breed || null,
      age: age ? parseInt(age) : null,
      gender: gender || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("[PETS] Inserting pet object:", newPet);
    console.log("[PETS] Supabase URL:", supabaseUrl);
    console.log("[PETS] Service key present:", !!supabaseServiceKey);

    const { data, error } = await supabase
      .from('pets')
      .insert([newPet])
      .select();

    if (error) {
      console.error("[PETS] Supabase insert error - code:", error.code);
      console.error("[PETS] Supabase insert error - message:", error.message);
      console.error("[PETS] Supabase insert error - status:", error.status);
      console.error("[PETS] Supabase insert error - details:", error.details);
      console.error("[PETS] Supabase insert error - hint:", error.hint);
      console.error("[PETS] Supabase insert error - full:", JSON.stringify(error, null, 2));
      return res.status(500).json({ error: "Failed to add pet", details: error.message, code: error.code, status: error.status });
    }

    if (!data || data.length === 0) {
      console.error("[PETS] Insert succeeded but no data returned");
      return res.status(500).json({ error: "Pet created but no data returned" });
    }

    console.log("[PETS] New pet added:", { petId, name, species, userId, data: data[0] });
    
    return res.status(201).json(data[0]);
  } catch (err) {
    console.error("[PETS] Add pet error:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

// GET single pet
app.get("/api/pets/:petId", async (req, res) => {
  try {
    const { petId } = req.params;

    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .single();

    if (error || !data) {
      console.log("[PETS] Pet not found:", petId);
      return res.status(404).json({ error: "Pet not found" });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("[PETS] Get pet error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT update pet
app.put("/api/pets/:petId", async (req, res) => {
  try {
    const { petId } = req.params;
    const updates = req.body;

    const { data: existingPet, error: fetchError } = await supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .single();

    if (fetchError || !existingPet) {
      console.log("[PETS] Pet not found:", petId);
      return res.status(404).json({ error: "Pet not found" });
    }

    const updatedPet = {
      ...existingPet,
      ...updates,
      id: existingPet.id,
      user_id: existingPet.user_id,
      created_at: existingPet.created_at,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('pets')
      .update(updatedPet)
      .eq('id', petId)
      .select()
      .single();

    if (error) {
      console.error("[PETS] Supabase update error:", error);
      return res.status(500).json({ error: "Failed to update pet" });
    }

    console.log("[PETS] Pet updated:", { petId, updates });
    
    return res.status(200).json(data);
  } catch (err) {
    console.error("[PETS] Update pet error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE pet
app.delete("/api/pets/:petId", async (req, res) => {
  try {
    const { petId } = req.params;

    const { data: existingPet, error: fetchError } = await supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .single();

    if (fetchError || !existingPet) {
      console.log("[PETS] Pet not found:", petId);
      return res.status(404).json({ error: "Pet not found" });
    }

    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', petId);

    if (error) {
      console.error("[PETS] Supabase delete error:", error);
      return res.status(500).json({ error: "Failed to delete pet" });
    }

    console.log("[PETS] Pet deleted:", { petId });
    
    return res.status(200).json({ success: true, message: "Pet deleted" });
  } catch (err) {
    console.error("[PETS] Delete pet error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Fallback - MUST be at the end
app.use((req, res) => {
  res.status(404).json({ error: "Not found", path: req.path });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend API running on http://localhost:${PORT}`);
});
