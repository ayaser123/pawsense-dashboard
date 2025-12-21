import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import axios from "axios";

// ES Module dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// ============================================================================
// VIDEO UPLOAD CONFIGURATION
// ============================================================================

// Ensure upload directories exist
const UPLOAD_RAW_DIR = path.join(__dirname, "..", "uploads", "raw");
const UPLOAD_PROCESSED_DIR = path.join(__dirname, "..", "uploads", "processed");

[UPLOAD_RAW_DIR, UPLOAD_PROCESSED_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Multer configuration for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_RAW_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${randomUUID()}`;
    const ext = path.extname(file.originalname);
    cb(null, `video-${uniqueSuffix}${ext}`);
  },
});

const videoUpload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "video/mp4", 
      "video/quicktime", 
      "video/x-msvideo", 
      "video/webm", 
      "video/mpeg",
      "video/x-m4v",
      "video/3gpp",
      "application/octet-stream" // Some browsers/tools send this
    ];
    // Also check file extension as fallback
    const allowedExts = [".mp4", ".mov", ".avi", ".webm", ".mpeg", ".m4v", ".3gp"];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: ${allowedMimes.join(", ")}`));
    }
  },
});

// Python ML service configuration
const PYTHON_ML_URL = process.env.PYTHON_ML_URL || "http://localhost:8000";
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const ML_TIMEOUT = parseInt(process.env.ML_TIMEOUT || "120000", 10); // 2 minutes

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
app.post("/auth/create-user", async (req, res) => {
  try {
    const { email, password, metadata } = req.body || {};

    // very basic validation
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(422).json({ error: "Invalid email", details: "Email is required and must be valid" });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(422).json({ error: "Invalid password", details: "Password must be at least 6 characters" });
    }

    console.log("[AUTH] Creating user with admin API:", email);

    // Try to create user using admin API with auto-confirmed email
    let data;
    let error;
    
    try {
      const response = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: metadata || {}
      });
      data = response.data;
      error = response.error;
    } catch (err) {
      error = err;
    }

    // If user already exists, update their password and confirm email
    if (error && error.message && error.message.includes("already been registered")) {
      console.log("[AUTH] User already exists, updating password and confirming email:", email);
      
      // Find the user
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        console.error("[AUTH] Failed to list users:", listError);
        return res.status(500).json({ error: "Failed to find user", details: listError.message });
      }

      const existingUser = users.find(u => u.email === email);
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update password and confirm email
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
        password,
        email_confirm: true
      });

      if (updateError) {
        console.error("[AUTH] Failed to update user:", updateError);
        return res.status(500).json({ error: "Failed to update user", details: updateError.message });
      }

      console.log("[AUTH] ✅ User updated:", updateData.user?.id, "| Email confirmed:", !!updateData.user?.email_confirmed_at);
      
      return res.status(201).json({ 
        success: true, 
        userId: updateData.user?.id, 
        email: updateData.user?.email,
        email_confirmed_at: updateData.user?.email_confirmed_at,
        isUpdate: true
      });
    }

    if (error) {
      console.error("[AUTH] Failed to create user:", error);
      return res.status(422).json({ error: "Failed to create user", details: error.message });
    }

    console.log("[AUTH] ✅ User created:", data.user?.id, "| Email confirmed:", !!data.user?.email_confirmed_at);

    return res.status(201).json({ 
      success: true, 
      userId: data.user?.id, 
      email: data.user?.email,
      email_confirmed_at: data.user?.email_confirmed_at
    });
  } catch (err) {
    console.error("[AUTH] create-user error:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
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

// ============================================================================
// VIDEO ANALYSIS ENDPOINT (ML Pipeline + Ollama Fallback)
// ============================================================================

/**
 * Preprocess video using ffmpeg
 * - Max duration: 10 seconds
 * - FPS: ~10
 * - Resolution: ~640x640
 */
async function preprocessVideo(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    console.log("[FFMPEG] 🎬 Preprocessing video...");
    console.log("[FFMPEG] Input:", inputPath);
    console.log("[FFMPEG] Output:", outputPath);

    // Use ffmpeg via spawn for better control
    const ffmpegPath = process.env.FFMPEG_PATH || "ffmpeg";
    
    const args = [
      "-i", inputPath,
      "-t", "10",           // Max 10 seconds
      "-r", "10",           // 10 fps
      "-vf", "scale=640:640:force_original_aspect_ratio=decrease,pad=640:640:(ow-iw)/2:(oh-ih)/2",
      "-c:v", "libx264",
      "-preset", "fast",
      "-crf", "28",
      "-an",                // Remove audio
      "-y",                 // Overwrite output
      outputPath
    ];

    console.log("[FFMPEG] Command: ffmpeg", args.join(" "));

    const ffmpeg = spawn(ffmpegPath, args);

    let stderr = "";
    ffmpeg.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        console.log("[FFMPEG] ✅ Video preprocessed successfully");
        resolve(outputPath);
      } else {
        console.error("[FFMPEG] ❌ Processing failed with code:", code);
        console.error("[FFMPEG] stderr:", stderr);
        reject(new Error(`FFmpeg failed with code ${code}: ${stderr.slice(-500)}`));
      }
    });

    ffmpeg.on("error", (err) => {
      console.error("[FFMPEG] ❌ Spawn error:", err.message);
      reject(new Error(`FFmpeg spawn error: ${err.message}`));
    });
  });
}

/**
 * Call Python ML service
 */
async function callPythonMLService(videoPath) {
  console.log("[ML] 🧠 Calling Python ML service...");
  console.log("[ML] Video path:", videoPath);
  console.log("[ML] Service URL:", PYTHON_ML_URL);

  const response = await axios.post(
    `${PYTHON_ML_URL}/analyze-behavior`,
    { video_path: videoPath },
    {
      timeout: ML_TIMEOUT,
      headers: { "Content-Type": "application/json" },
    }
  );

  console.log("[ML] ✅ Python ML response received");
  return response.data;
}

/**
 * Call Ollama as fallback
 */
async function callOllamaFallback(videoFileName) {
  console.log("[OLLAMA] 🦙 Using Ollama fallback...");

  const prompt = `Analyze this pet video named "${videoFileName}". 
Provide a JSON response with emotional_states, behavior_patterns, recommendations, and overall_wellbeing_score.
Output ONLY valid JSON, no explanation:
{
  "emotional_states": [{"emotion": "Engaged", "confidence": 0.7}],
  "behavior_patterns": ["Normal activity"],
  "recommendations": ["Continue monitoring"],
  "overall_wellbeing_score": 75
}`;

  const response = await axios.post(
    `${OLLAMA_URL}/api/generate`,
    {
      model: "neural-chat",
      prompt: prompt,
      stream: false,
      temperature: 0.5,
      num_predict: 300,
    },
    { timeout: 90000 }
  );

  // Parse Ollama response
  const responseText = response.data?.response || "";
  console.log("[OLLAMA] Raw response:", responseText.substring(0, 200));

  // Try to extract JSON from response
  let parsed;
  try {
    // Try direct parse
    parsed = JSON.parse(responseText);
  } catch {
    // Try to find JSON in response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        console.warn("[OLLAMA] Could not parse JSON from response");
      }
    }
  }

  // Return parsed or default
  return parsed || {
    emotional_states: [{ emotion: "Calm", confidence: 0.6 }],
    behavior_patterns: ["Normal activity observed"],
    recommendations: ["Continue regular monitoring", "Maintain exercise routine"],
    overall_wellbeing_score: 70,
  };
}

/**
 * Normalize response to consistent schema
 */
function normalizeAnalysisResponse(response, source) {
  console.log(`[NORMALIZE] Normalizing response from ${source}`);

  // Standard schema that frontend expects
  const normalized = {
    // ML Pipeline format fields
    emotional_states: response.emotional_states || [
      { emotion: "Unknown", confidence: 0.5 }
    ],
    behavior_patterns: response.behavior_patterns || ["Analysis pending"],
    recommendations: response.recommendations || ["Continue monitoring your pet"],
    overall_wellbeing_score: response.overall_wellbeing_score ?? 70,
    
    // Legacy format fields (for backward compatibility with existing frontend)
    behavior: response.behavior || response.behavior_patterns?.[0] || "Normal activity",
    mood: response.emotional_states?.[0]?.emotion || response.mood || "Calm",
    energy: mapWellbeingToEnergy(response.overall_wellbeing_score),
    confidence: response.emotional_states?.[0]?.confidence || response.confidence || 0.7,
    
    // Metadata
    source: source,
    analyzedAt: new Date().toISOString(),
  };

  return normalized;
}

/**
 * Map wellbeing score to energy level
 */
function mapWellbeingToEnergy(score) {
  if (score >= 80) return "High";
  if (score >= 50) return "Medium";
  return "Low";
}

/**
 * Store analysis result in Supabase
 */
async function storeAnalysisResult(userId, petId, analysis, videoFileName) {
  try {
    console.log("[SUPABASE] 💾 Storing analysis result...");
    
    const { data, error } = await supabase
      .from("video_analyses")
      .insert([
        {
          id: randomUUID(),
          user_id: userId,
          pet_id: petId,
          video_filename: videoFileName,
          analysis_result: analysis,
          source: analysis.source,
          wellbeing_score: analysis.overall_wellbeing_score,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.warn("[SUPABASE] ⚠️ Could not store analysis (table may not exist):", error.message);
      return null;
    }

    console.log("[SUPABASE] ✅ Analysis stored with ID:", data?.[0]?.id);
    return data?.[0];
  } catch (err) {
    console.warn("[SUPABASE] ⚠️ Storage error:", err.message);
    return null;
  }
}

/**
 * Cleanup temporary files
 */
function cleanupFiles(...filePaths) {
  for (const filePath of filePaths) {
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log("[CLEANUP] 🗑️ Deleted:", filePath);
      } catch (err) {
        console.warn("[CLEANUP] Could not delete:", filePath, err.message);
      }
    }
  }
}

/**
 * POST /api/ai/analyze-video
 * 
 * Main video analysis endpoint that:
 * 1. Receives video upload via multipart/form-data
 * 2. Validates and preprocesses video
 * 3. Calls Python ML service (primary)
 * 4. Falls back to Ollama if ML fails
 * 5. Normalizes response and stores in Supabase
 * 6. Returns consistent JSON to frontend
 */
app.post("/api/ai/analyze-video", videoUpload.single("video"), async (req, res) => {
  const startTime = Date.now();
  let rawVideoPath = null;
  let processedVideoPath = null;

  try {
    console.log("\n" + "=".repeat(60));
    console.log("[VIDEO-ANALYSIS] 🎬 New video analysis request");
    console.log("=".repeat(60));

    // 1. Validate upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No video file provided",
        details: "Please upload a video file using 'video' field",
      });
    }

    rawVideoPath = req.file.path;
    const userId = req.headers["x-user-id"];
    const petId = req.body?.petId;

    console.log("[VIDEO-ANALYSIS] 📁 File received:");
    console.log("  - Original name:", req.file.originalname);
    console.log("  - Size:", (req.file.size / 1024 / 1024).toFixed(2), "MB");
    console.log("  - Mimetype:", req.file.mimetype);
    console.log("  - Saved to:", rawVideoPath);
    console.log("  - User ID:", userId || "anonymous");
    console.log("  - Pet ID:", petId || "none");

    // 2. Preprocess video with ffmpeg
    const processedFileName = `processed-${Date.now()}-${randomUUID()}.mp4`;
    processedVideoPath = path.join(UPLOAD_PROCESSED_DIR, processedFileName);

    try {
      await preprocessVideo(rawVideoPath, processedVideoPath);
    } catch (ffmpegError) {
      console.error("[VIDEO-ANALYSIS] ❌ Preprocessing failed:", ffmpegError.message);
      // Continue with raw video if preprocessing fails
      processedVideoPath = rawVideoPath;
      console.log("[VIDEO-ANALYSIS] ⚠️ Using raw video as fallback");
    }

    // 3. Try Python ML service first
    let analysisResult = null;
    let analysisSource = "unknown";

    try {
      console.log("[VIDEO-ANALYSIS] 🧠 Attempting Python ML service...");
      const mlResponse = await callPythonMLService(processedVideoPath);
      analysisResult = normalizeAnalysisResponse(mlResponse, "ml-pipeline");
      analysisSource = "ml-pipeline";
      console.log("[VIDEO-ANALYSIS] ✅ ML pipeline succeeded");
    } catch (mlError) {
      console.warn("[VIDEO-ANALYSIS] ⚠️ ML service failed:", mlError.message);
      console.log("[VIDEO-ANALYSIS] 🦙 Falling back to Ollama...");

      // 4. Fallback to Ollama
      try {
        const ollamaResponse = await callOllamaFallback(req.file.originalname);
        analysisResult = normalizeAnalysisResponse(ollamaResponse, "ollama-fallback");
        analysisSource = "ollama-fallback";
        console.log("[VIDEO-ANALYSIS] ✅ Ollama fallback succeeded");
      } catch (ollamaError) {
        console.error("[VIDEO-ANALYSIS] ❌ Ollama also failed:", ollamaError.message);
        
        // 5. Ultimate fallback - return mock data
        console.log("[VIDEO-ANALYSIS] 🎭 Using mock fallback...");
        analysisResult = normalizeAnalysisResponse({
          emotional_states: [
            { emotion: "Calm", confidence: 0.7 },
            { emotion: "Relaxed", confidence: 0.6 }
          ],
          behavior_patterns: ["Normal activity", "Resting behavior"],
          recommendations: [
            "Continue regular exercise routine",
            "Monitor eating habits",
            "Ensure adequate hydration"
          ],
          overall_wellbeing_score: 72,
        }, "mock-fallback");
        analysisSource = "mock-fallback";
      }
    }

    // 6. Store in Supabase (non-blocking)
    if (userId) {
      storeAnalysisResult(userId, petId, analysisResult, req.file.originalname)
        .catch(err => console.warn("[VIDEO-ANALYSIS] Storage error (non-fatal):", err.message));
    }

    // 7. Calculate processing time
    const processingTime = Date.now() - startTime;
    console.log(`[VIDEO-ANALYSIS] ⏱️ Total processing time: ${processingTime}ms`);
    console.log(`[VIDEO-ANALYSIS] 📊 Analysis source: ${analysisSource}`);
    console.log("=".repeat(60) + "\n");

    // 8. Cleanup processed video (keep raw for debugging if needed)
    if (processedVideoPath !== rawVideoPath) {
      cleanupFiles(processedVideoPath);
    }
    cleanupFiles(rawVideoPath);

    // 9. Return response
    return res.status(200).json({
      success: true,
      analysis: analysisResult,
      metadata: {
        processingTimeMs: processingTime,
        source: analysisSource,
        videoFileName: req.file.originalname,
        analyzedAt: new Date().toISOString(),
      },
    });

  } catch (err) {
    console.error("[VIDEO-ANALYSIS] ❌ Unexpected error:", err);
    
    // Cleanup on error
    cleanupFiles(rawVideoPath, processedVideoPath);

    return res.status(500).json({
      success: false,
      error: "Video analysis failed",
      details: err.message,
    });
  }
});

// Multer error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        error: "File too large",
        details: "Maximum file size is 100MB",
      });
    }
    return res.status(400).json({
      success: false,
      error: "Upload error",
      details: err.message,
    });
  }
  next(err);
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
