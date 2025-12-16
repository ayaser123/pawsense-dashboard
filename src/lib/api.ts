import axios, { type AxiosInstance } from "axios"
import { supabase } from "./supabase"

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add auth token and user ID to every request
apiClient.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log("[API] Request to:", config.url, "Session user ID:", session?.user?.id);

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }

  // Add user ID from session
  if (session?.user?.id) {
    config.headers["x-user-id"] = session.user.id
    console.log("[API] Added x-user-id header:", session.user.id);
  } else {
    console.warn("[API] No user ID in session!");
  }

  if (config.url?.includes("/videos")) {
    config.timeout = 120000 // 2 minutes for video endpoints
  }
  // Speed up simple form submissions
  if (config.url?.includes("/submit")) {
    config.timeout = 5000 // 5 seconds for contact form
  }

  return config
})

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on unauthorized
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export default apiClient
