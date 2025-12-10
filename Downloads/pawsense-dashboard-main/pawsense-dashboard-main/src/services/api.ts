import apiClient from "@/lib/api";

type AnyObject = Record<string, unknown>;

interface LoginPayload {
  email: string;
  password?: string;
}

interface SignupPayload {
  userId: string;
  email: string;
  metadata?: AnyObject;
}

interface LogoutPayload {
  email: string;
}

interface UpdateProfilePayload {
  userId: string;
  email: string;
  metadata: AnyObject;
}

// Auth Endpoints
export const authApi = {
  // Notify backend of user login
  login: (payload: LoginPayload) =>
    apiClient.post("/auth/login", payload),

  // Notify backend of new user signup
  signup: (payload: SignupPayload) =>
    apiClient.post("/auth/signup", payload),

  // Notify backend of user logout
  logout: (payload: LogoutPayload) =>
    apiClient.post("/auth/logout", payload),

  // Sync user information with backend
  syncUser: (payload: SignupPayload) =>
    apiClient.post("/auth/user-sync", payload),

  // Update user profile on backend
  updateProfile: (payload: UpdateProfilePayload) =>
    apiClient.post("/auth/update-profile", payload),

  // Get current user info from backend
  getCurrentUser: () =>
    apiClient.get("/auth/me"),

  // Refresh auth token
  refreshToken: () =>
    apiClient.post("/auth/refresh-token", {}),
};

// Pet Data Endpoints
export const petApi = {
  // Get all pets for current user
  getPets: () =>
    apiClient.get("/pets"),

  // Get single pet details
  getPet: (petId: string) =>
    apiClient.get(`/pets/${petId}`),

  // Create new pet
  createPet: (data: AnyObject) =>
    apiClient.post("/pets", data),

  // Update pet info
  updatePet: (petId: string, data: AnyObject) =>
    apiClient.put(`/pets/${petId}`, data),

  // Delete pet
  deletePet: (petId: string) =>
    apiClient.delete(`/pets/${petId}`),

  // Get pet health data
  getPetHealth: (petId: string) =>
    apiClient.get(`/pets/${petId}/health`),

  // Log pet activity
  logActivity: (petId: string, data: AnyObject) =>
    apiClient.post(`/pets/${petId}/activity`, data),
};

// Health Monitoring Endpoints
export const healthApi = {
  // Get health metrics
  getMetrics: (petId: string) =>
    apiClient.get(`/health/${petId}/metrics`),

  // Get sleep data
  getSleepData: (petId: string) =>
    apiClient.get(`/health/${petId}/sleep`),

  // Get GPS/location data
  getLocationData: (petId: string) =>
    apiClient.get(`/health/${petId}/location`),

  // Get sound analysis
  getSoundAnalysis: (petId: string) =>
    apiClient.get(`/health/${petId}/sounds`),

  // Get activity data
  getActivityData: (petId: string) =>
    apiClient.get(`/health/${petId}/activity`),

  // Analyze pet health predictions
  getHealthPredictions: (petId: string) =>
    apiClient.get(`/health/${petId}/predictions`),
};

// Alerts Endpoints
export const alertsApi = {
  // Get all alerts
  getAlerts: (petId?: string) =>
    apiClient.get("/alerts", { params: { petId } }),

  // Get emergency alerts
  getEmergencyAlerts: () =>
    apiClient.get("/alerts/emergency"),

  // Create new alert
  createAlert: (data: AnyObject) =>
    apiClient.post("/alerts", data),

  // Acknowledge alert
  acknowledgeAlert: (alertId: string) =>
    apiClient.put(`/alerts/${alertId}/acknowledge`, {}),

  // Delete alert
  deleteAlert: (alertId: string) =>
    apiClient.delete(`/alerts/${alertId}`),
};

// Telehealth Endpoints
export const telehealthApi = {
  // Get available vets
  getVets: (params?: AnyObject) =>
    apiClient.get("/telehealth/vets", { params }),

  // Book consultation
  bookConsultation: (data: AnyObject) =>
    apiClient.post("/telehealth/bookings", data),

  // Get booking details
  getBooking: (bookingId: string) =>
    apiClient.get(`/telehealth/bookings/${bookingId}`),

  // Cancel booking
  cancelBooking: (bookingId: string) =>
    apiClient.put(`/telehealth/bookings/${bookingId}/cancel`, {}),

  // Get consultation history
  getConsultationHistory: () =>
    apiClient.get("/telehealth/history"),

  // Upload prescription
  uploadPrescription: (bookingId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(`/telehealth/bookings/${bookingId}/prescription`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

// Vet Finder Endpoints
export const vetFinderApi = {
  // Search vets by location
  searchVets: (params: AnyObject) =>
    apiClient.get("/vet-finder/search", { params }),

  // Get vet details
  getVetDetails: (vetId: string) =>
    apiClient.get(`/vet-finder/${vetId}`),

  // Get vet reviews
  getVetReviews: (vetId: string) =>
    apiClient.get(`/vet-finder/${vetId}/reviews`),

  // Submit vet review
  submitReview: (vetId: string, data: AnyObject) =>
    apiClient.post(`/vet-finder/${vetId}/reviews`, data),

  // Get emergency vets nearby
  getEmergencyVets: (latitude: number, longitude: number, radius?: number) =>
    apiClient.get("/vet-finder/emergency", {
      params: { latitude, longitude, radius },
    }),
};

// Image Upload Endpoints
export const imageApi = {
  // Upload pet image
  uploadPetImage: (petId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(`/images/pets/${petId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Upload health document
  uploadHealthDocument: (petId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(`/images/health/${petId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Delete image
  deleteImage: (imageId: string) =>
    apiClient.delete(`/images/${imageId}`),
};

export default {
  authApi,
  petApi,
  healthApi,
  alertsApi,
  telehealthApi,
  vetFinderApi,
  imageApi,
};
