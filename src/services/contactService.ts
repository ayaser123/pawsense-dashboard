import { supabase } from "@/lib/supabase"

export interface ContactSubmission {
  name: string
  email: string
  message: string
  created_at?: string
  id?: string
}

/**
 * Submit contact form to Supabase
 */
export async function submitContact(
  name: string,
  email: string,
  message: string
): Promise<ContactSubmission> {
  console.log("[CONTACT] Submitting contact form:", { name, email })

  const { data, error } = await supabase.from("contacts").insert([
    {
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      created_at: new Date().toISOString(),
    },
  ]).select()

  if (error) {
    console.error("[CONTACT] Submission error:", error)
    throw new Error(error.message || "Failed to submit contact form")
  }

  console.log("[CONTACT] ✅ Submission successful:", data)
  return data?.[0] || {}
}

/**
 * Get all contact submissions (admin only)
 */
export async function getContactSubmissions(): Promise<ContactSubmission[]> {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[CONTACT] Failed to fetch submissions:", error)
    throw new Error(error.message)
  }

  return data || []
}
