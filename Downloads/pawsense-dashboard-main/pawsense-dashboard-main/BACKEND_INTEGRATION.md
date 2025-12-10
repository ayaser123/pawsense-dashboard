# Backend Integration Guide

This document explains how to set up the backend integration for the PawSense Dashboard authentication and API endpoints.

## Environment Setup

1. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_BACKEND_URL=http://localhost:5000
```

## Supabase Setup

1. Create a Supabase project at https://supabase.com
2. In the Supabase dashboard:
   - Enable Email/Password authentication
   - Enable Email confirmations (if desired)
   - Copy your project URL and Anon Key from Settings > API

## Backend Requirements

Your backend should implement the following endpoints:

### Authentication Endpoints

```
POST /auth/login
POST /auth/signup
POST /auth/logout
POST /auth/user-sync
POST /auth/update-profile
POST /auth/refresh-token
GET /auth/me
```

#### Example Request/Response

**POST /auth/login**
```json
{
  "email": "user@example.com"
}
```

**POST /auth/signup**
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "metadata": {
    "full_name": "John Doe"
  }
}
```

**POST /auth/logout**
```json
{
  "email": "user@example.com"
}
```

### Pet Data Endpoints

```
GET /pets
GET /pets/{petId}
POST /pets
PUT /pets/{petId}
DELETE /pets/{petId}
GET /pets/{petId}/health
POST /pets/{petId}/activity
```

### Health Monitoring Endpoints

```
GET /health/{petId}/metrics
GET /health/{petId}/sleep
GET /health/{petId}/location
GET /health/{petId}/sounds
GET /health/{petId}/activity
GET /health/{petId}/predictions
```

### Alerts Endpoints

```
GET /alerts?petId={petId}
GET /alerts/emergency
POST /alerts
PUT /alerts/{alertId}/acknowledge
DELETE /alerts/{alertId}
```

### Telehealth Endpoints

```
GET /telehealth/vets
POST /telehealth/bookings
GET /telehealth/bookings/{bookingId}
PUT /telehealth/bookings/{bookingId}/cancel
GET /telehealth/history
POST /telehealth/bookings/{bookingId}/prescription
```

### Vet Finder Endpoints

```
GET /vet-finder/search
GET /vet-finder/{vetId}
GET /vet-finder/{vetId}/reviews
POST /vet-finder/{vetId}/reviews
GET /vet-finder/emergency?latitude={lat}&longitude={lon}&radius={radius}
```

### Image Upload Endpoints

```
POST /images/pets/{petId}
POST /images/health/{petId}
DELETE /images/{imageId}
```

## API Authentication

All requests (except login/signup) include a Bearer token in the Authorization header:

```
Authorization: Bearer {supabase_access_token}
```

The frontend automatically adds this to all requests via the API interceptor in `src/lib/api.ts`.

## Frontend Usage

### Using Auth Context

```tsx
import { useAuth } from "@/contexts/AuthContext";

export function MyComponent() {
  const { user, login, logout, isAuthenticated, isLoading } = useAuth();

  const handleLogin = async () => {
    try {
      await login("user@example.com", "password");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Using API Services

```tsx
import { petApi, healthApi, alertsApi } from "@/services/api";

// Get pets
const pets = await petApi.getPets();

// Create pet
const newPet = await petApi.createPet({
  name: "Buddy",
  species: "dog",
  breed: "Golden Retriever",
  age: 3
});

// Get health metrics
const metrics = await healthApi.getMetrics(petId);

// Get alerts
const alerts = await alertsApi.getAlerts(petId);
```

## Protected Routes

Routes that require authentication are wrapped with the `ProtectedRoute` component:

```tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

If a user is not authenticated, they will be redirected to `/login`.

## Error Handling

The API client automatically handles:
- 401 Unauthorized responses (redirects to login)
- CORS issues
- Network timeouts
- Request/response serialization

## Backend Example (Node.js/Express)

```javascript
const express = require("express");
const app = express();

// Middleware to verify Supabase token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  
  // Verify token with Supabase
  next();
};

// Auth endpoints
app.post("/auth/login", (req, res) => {
  const { email } = req.body;
  // Log login in your database
  res.json({ success: true });
});

app.post("/auth/signup", (req, res) => {
  const { userId, email, metadata } = req.body;
  // Create user record in your database
  res.json({ success: true });
});

// Pet endpoints
app.get("/pets", verifyToken, (req, res) => {
  // Return pets for authenticated user
  res.json([]);
});

app.post("/pets", verifyToken, (req, res) => {
  // Create pet for authenticated user
  res.json({ id: "pet-id" });
});
```

## Testing

1. Navigate to `http://localhost:8080/login`
2. Sign up with email and password
3. Check email for confirmation link (if email verification is enabled)
4. Log in with credentials
5. You should be redirected to the dashboard
6. Logout button should appear in the navbar
7. Try accessing protected routes - you should be redirected if not logged in

## Troubleshooting

### "Missing Supabase configuration"
- Check `.env.local` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server after updating `.env.local`

### Login fails with 401
- Verify email/password are correct in Supabase
- Check Supabase email confirmation is enabled if required
- Check browser console for detailed error

### Protected routes redirect to login
- Check token is being sent (F12 > Network > check Authorization header)
- Verify backend is returning 200 for authenticated requests
- Check `VITE_BACKEND_URL` matches your backend server

### CORS errors
- Add your frontend URL to Supabase CORS whitelist
- Ensure backend has proper CORS headers

## Next Steps

1. Set up your backend server with the required endpoints
2. Fill in `.env.local` with your Supabase credentials
3. Test the auth flow
4. Implement pet data endpoints
5. Integrate health monitoring features
