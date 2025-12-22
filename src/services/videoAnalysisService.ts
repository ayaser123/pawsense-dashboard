/**
 * Video Analysis Service
 * 
 * Handles video upload and analysis through the backend API.
 * The backend handles all AI processing (ML pipeline + Ollama fallback).
 * Frontend receives a consistent response schema regardless of which service was used.
 */

import { supabase } from "@/lib/supabase";

// ============================================================================
// TYPES
// ============================================================================

/** Emotional state detected in the video */
export interface EmotionalState {
  emotion: string;
  confidence: number;
}

/** Complete analysis result from the backend */
export interface VideoAnalysisResult {
  // ML Pipeline format (primary)
  emotional_states: EmotionalState[];
  behavior_patterns: string[];
  recommendations: string[];
  overall_wellbeing_score: number;
  
  // Legacy format (backward compatibility)
  behavior: string;
  mood: string;
  energy: "Low" | "Medium" | "High";
  confidence: number;
  
  // Metadata
  source: "ml-pipeline" | "ollama-fallback" | "mock-fallback";
  analyzedAt: string;
}

/** Response from the video analysis endpoint */
export interface VideoAnalysisResponse {
  success: boolean;
  analysis?: VideoAnalysisResult;
  metadata?: {
    processingTimeMs: number;
    source: string;
    videoFileName: string;
    analyzedAt: string;
  };
  error?: string;
  details?: string;
}

/** Progress callback for upload tracking */
export type ProgressCallback = (progress: number) => void;

// ============================================================================
// CONFIGURATION
// ============================================================================

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";
const UPLOAD_TIMEOUT = 180000; // 3 minutes (upload + processing)

// ============================================================================
// MAIN SERVICE FUNCTION
// ============================================================================

/**
 * Analyze a pet video using the backend ML pipeline.
 * 
 * Flow:
 * 1. Upload video to backend via multipart/form-data
 * 2. Backend preprocesses video (ffmpeg)
 * 3. Backend calls Python ML service
 * 4. If ML fails, backend uses Ollama fallback
 * 5. Returns normalized response
 * 
 * @param videoFile - The video file to analyze
 * @param petId - Optional pet ID to associate with analysis
 * @param onProgress - Optional callback for upload progress
 * @returns Analysis result with emotional states, patterns, recommendations
 */
export async function analyzeVideo(
  videoFile: File,
  petId?: string,
  onProgress?: ProgressCallback
): Promise<VideoAnalysisResult> {
  console.log("[VIDEO-SERVICE] 🎬 Starting video analysis...");
  console.log("[VIDEO-SERVICE] File:", videoFile.name);
  console.log("[VIDEO-SERVICE] Size:", (videoFile.size / 1024 / 1024).toFixed(2), "MB");
  console.log("[VIDEO-SERVICE] Type:", videoFile.type);

  // Validate file
  if (!videoFile.type.startsWith("video/")) {
    throw new Error("Invalid file type. Please upload a video file.");
  }

  if (videoFile.size > 100 * 1024 * 1024) {
    throw new Error("File too large. Maximum size is 100MB.");
  }

  // Get auth session for user ID
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  // Create form data
  const formData = new FormData();
  formData.append("video", videoFile);
  if (petId) {
    formData.append("petId", petId);
  }

  // Create XMLHttpRequest for progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
        console.log(`[VIDEO-SERVICE] Upload progress: ${progress}%`);
      }
    });

    // Handle response
    xhr.addEventListener("load", () => {
      try {
        const response: VideoAnalysisResponse = JSON.parse(xhr.responseText);
        
        if (xhr.status >= 200 && xhr.status < 300 && response.success && response.analysis) {
          console.log("[VIDEO-SERVICE] ✅ Analysis complete");
          console.log("[VIDEO-SERVICE] Source:", response.metadata?.source);
          console.log("[VIDEO-SERVICE] Processing time:", response.metadata?.processingTimeMs, "ms");
          resolve(response.analysis);
        } else {
          console.error("[VIDEO-SERVICE] ❌ Analysis failed:", response.error);
          reject(new Error(response.error || response.details || "Analysis failed"));
        }
      } catch (parseError) {
        console.error("[VIDEO-SERVICE] ❌ Response parse error:", parseError);
        reject(new Error("Failed to parse server response"));
      }
    });

    // Handle errors
    xhr.addEventListener("error", () => {
      console.error("[VIDEO-SERVICE] ❌ Network error");
      reject(new Error("Network error. Please check your connection."));
    });

    xhr.addEventListener("timeout", () => {
      console.error("[VIDEO-SERVICE] ❌ Request timeout");
      reject(new Error("Analysis timed out. Please try with a shorter video."));
    });

    // Configure and send request
    xhr.open("POST", `${BACKEND_URL}/api/ai/analyze-video`);
    xhr.timeout = UPLOAD_TIMEOUT;
    
    // Add auth headers
    if (session?.access_token) {
      xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
    }
    if (userId) {
      xhr.setRequestHeader("x-user-id", userId);
    }

    console.log("[VIDEO-SERVICE] 📤 Uploading to:", `${BACKEND_URL}/api/ai/analyze-video`);
    xhr.send(formData);
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert ML pipeline response to the format expected by existing components
 */
export function convertToLegacyFormat(analysis: VideoAnalysisResult) {
  return {
    behavior: analysis.behavior || analysis.behavior_patterns?.[0] || "Normal activity",
    confidence: analysis.confidence || analysis.emotional_states?.[0]?.confidence || 0.7,
    mood: analysis.mood || analysis.emotional_states?.[0]?.emotion || "Calm",
    energy: analysis.energy || mapScoreToEnergy(analysis.overall_wellbeing_score),
    recommendations: analysis.recommendations || [],
    duration: "analyzed",
    uploadedAt: analysis.analyzedAt || new Date().toISOString(),
    
    // Extended data
    emotional_states: analysis.emotional_states,
    behavior_patterns: analysis.behavior_patterns,
    overall_wellbeing_score: analysis.overall_wellbeing_score,
    source: analysis.source,
  };
}

/**
 * Map wellbeing score (0-100) to energy level
 */
function mapScoreToEnergy(score: number): "Low" | "Medium" | "High" {
  if (score >= 80) return "High";
  if (score >= 50) return "Medium";
  return "Low";
}

/**
 * Get a human-readable summary of the analysis
 */
export function getAnalysisSummary(analysis: VideoAnalysisResult): string {
  const primaryEmotion = analysis.emotional_states?.[0];
  const score = analysis.overall_wellbeing_score;
  
  let summary = `Your pet appears to be ${primaryEmotion?.emotion || "doing well"}`;
  
  if (score >= 80) {
    summary += " and is in great health!";
  } else if (score >= 60) {
    summary += " with good overall wellbeing.";
  } else if (score >= 40) {
    summary += ". Consider monitoring their behavior.";
  } else {
    summary += ". You may want to consult a veterinarian.";
  }
  
  return summary;
}

/**
 * Get the primary mood from emotional states
 */
export function getPrimaryMood(analysis: VideoAnalysisResult): string {
  return analysis.emotional_states?.[0]?.emotion || analysis.mood || "Unknown";
}

/**
 * Check if analysis indicates any concerns
 */
export function hasConcerns(analysis: VideoAnalysisResult): boolean {
  const lowScore = analysis.overall_wellbeing_score < 50;
  const anxiousStates = analysis.emotional_states?.some(
    s => ["Anxious", "Stressed", "Fearful", "Aggressive"].includes(s.emotion)
  );
  return lowScore || !!anxiousStates;
}

export default {
  analyzeVideo,
  convertToLegacyFormat,
  getAnalysisSummary,
  getPrimaryMood,
  hasConcerns,
};
