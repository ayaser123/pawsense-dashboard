// Gemini AI API Service for pet behavior analysis

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export interface AnalysisResponse {
  behavior: string;
  confidence: number;
  mood: string;
  energy: "Low" | "Medium" | "High";
  recommendations: string[];
  duration?: string;
}

/**
 * Analyze pet video using Google's Gemini AI API
 * @param videoFile - The video file to analyze
 * @returns Analysis results with behavior, mood, energy, and recommendations
 */
export async function analyzeVideoWithGemini(videoFile: File): Promise<AnalysisResponse> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_key") {
    throw new Error("Gemini API key not configured. Using mock analysis instead.");
  }

  try {
    // Convert video file to base64
    const base64Data = await fileToBase64(videoFile);
    const base64WithoutPrefix = base64Data.split(",")[1];

    const requestBody = {
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: videoFile.type,
                data: base64WithoutPrefix,
              },
            },
            {
              text: `Analyze this pet video and provide:
1. Pet behavior (what the pet is doing)
2. Mood assessment (happy, calm, anxious, playful, etc.)
3. Energy level (high, medium, low)
4. Confidence score (0-1 of your analysis accuracy)
5. 3-4 specific recommendations for the pet's wellbeing

Format your response as JSON with keys: behavior, mood, energy, confidence, recommendations (array)`,
            },
          ],
        },
      ],
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error("No response from Gemini API");
    }

    // Parse the JSON response from Gemini
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse Gemini response");
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return {
      behavior: analysis.behavior || "Pet activity detected",
      confidence: Math.min(Math.max(analysis.confidence || 0.85, 0), 1),
      mood: analysis.mood || "Neutral",
      energy: analysis.energy || "Medium",
      recommendations: Array.isArray(analysis.recommendations)
        ? analysis.recommendations
        : ["Monitor pet's wellbeing", "Provide adequate rest", "Ensure proper nutrition"],
      duration: `${Math.floor(videoFile.size / (1024 * 1024))}MB video analyzed`,
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

/**
 * Fallback mock analysis when API is not available
 */
export function getMockAnalysis(): AnalysisResponse {
  const moods = ["Happy", "Playful", "Calm", "Alert", "Curious"];
  const energies: ("Low" | "Medium" | "High")[] = ["Low", "Medium", "High"];
  const behaviors = [
    "Playful and energetic",
    "Calm and relaxed",
    "Alert and attentive",
    "Curious and exploring",
    "Social and interactive",
  ];
  const recommendations = [
    ["Pet is in excellent mood", "Consider more outdoor activities", "Hydration level looks good"],
    ["Good energy level detected", "Regular exercise routine working well", "Mental stimulation recommended"],
    ["Calm demeanor observed", "Rest period appears adequate", "Social interaction would benefit pet"],
    ["Alert and responsive behavior", "Training sessions going well", "Reward positive behaviors"],
  ];

  const randomIndex = Math.floor(Math.random() * behaviors.length);

  return {
    behavior: behaviors[randomIndex],
    confidence: 0.85 + Math.random() * 0.15,
    mood: moods[Math.floor(Math.random() * moods.length)],
    energy: energies[Math.floor(Math.random() * energies.length)],
    recommendations: recommendations[randomIndex],
    duration: "2m 34s",
  };
}

/**
 * Convert File to Base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
