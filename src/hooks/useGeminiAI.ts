import { useState, useCallback } from "react"

interface GeminiResponse {
  analysis: string
  recommendations: string[]
  confidence: number
}

export function useGeminiAI() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzePetBehavior = useCallback(
    async (
      description: string,
      petType: string,
      age: number,
      additionalContext?: string
    ): Promise<GeminiResponse | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY
        if (!apiKey || apiKey.includes("YOUR_")) {
          console.warn("Gemini API key not configured")
          return null
        }

        const prompt = `
You are an expert veterinary behaviorist. Analyze the following pet behavior description and provide insights:

Pet Type: ${petType}
Age: ${age} years
Behavior Description: ${description}
${additionalContext ? `Additional Context: ${additionalContext}` : ""}

Provide your response in JSON format with:
1. "analysis": A detailed behavioral analysis (2-3 sentences)
2. "recommendations": Array of 3-4 actionable recommendations
3. "confidence": A confidence score from 0-100

Important: Return ONLY valid JSON, no markdown formatting.
`

        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
            },
          }),
        })

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.statusText}`)
        }

        const data = await response.json()
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text

        if (!textContent) {
          throw new Error("No response from Gemini API")
        }

        // Clean up the response (remove markdown code blocks if present)
        let cleanedText = textContent.trim()
        if (cleanedText.startsWith("```json")) {
          cleanedText = cleanedText.replace(/^```json\n?/, "").replace(/\n?```$/, "")
        } else if (cleanedText.startsWith("```")) {
          cleanedText = cleanedText.replace(/^```\n?/, "").replace(/\n?```$/, "")
        }

        const parsedResponse = JSON.parse(cleanedText) as GeminiResponse
        return parsedResponse
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to analyze with Gemini"
        setError(errorMessage)
        console.error("Gemini AI error:", err)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const generatePetHealthTips = useCallback(
    async (petType: string, breed: string, age: number): Promise<string[] | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY
        if (!apiKey || apiKey.includes("YOUR_")) {
          console.warn("Gemini API key not configured")
          return null
        }

        const prompt = `
Generate 5 specific health and wellness tips for a ${breed} ${petType} that is ${age} years old.
Format your response as a JSON array of strings.
Example: ["tip1", "tip2", "tip3", "tip4", "tip5"]
Return ONLY the JSON array, no additional text.
`

        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 300,
            },
          }),
        })

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.statusText}`)
        }

        const data = await response.json()
        const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text

        if (!textContent) {
          throw new Error("No response from Gemini API")
        }

        let cleanedText = textContent.trim()
        if (cleanedText.startsWith("```json")) {
          cleanedText = cleanedText.replace(/^```json\n?/, "").replace(/\n?```$/, "")
        }

        const parsedResponse = JSON.parse(cleanedText) as string[]
        return parsedResponse
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to generate tips"
        setError(errorMessage)
        console.error("Gemini health tips error:", err)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return {
    analyzePetBehavior,
    generatePetHealthTips,
    isLoading,
    error,
  }
}
