# Quick Reference - Authentication & API

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_BACKEND_URL=http://localhost:5000
```

## Auth Hook Usage

```tsx
import { useAuth } from "@/contexts/AuthContext";

const { 
  user,                    // Current user object
  session,                 // Supabase session
  isLoading,              // Loading state
  isAuthenticated,        // Boolean
  login,                  // (email, password) => Promise
  signup,                 // (email, password, userData?) => Promise
  logout,                 // () => Promise
  resetPassword,          // (email) => Promise
  updateProfile           // (userData) => Promise
} = useAuth();
```

## API Services Quick Access

### Pets
```tsx
import { petApi } from "@/services/api";

petApi.getPets()
petApi.getPet(petId)
petApi.createPet(data)
petApi.updatePet(petId, data)
petApi.deletePet(petId)
petApi.getPetHealth(petId)
petApi.logActivity(petId, data)
```

### Health Data
```tsx
import { healthApi } from "@/services/api";

healthApi.getMetrics(petId)
healthApi.getSleepData(petId)
healthApi.getLocationData(petId)
healthApi.getSoundAnalysis(petId)
healthApi.getActivityData(petId)
healthApi.getHealthPredictions(petId)
```

### Alerts
```tsx
import { alertsApi } from "@/services/api";

alertsApi.getAlerts(petId?)
alertsApi.getEmergencyAlerts()
alertsApi.createAlert(data)
alertsApi.acknowledgeAlert(alertId)
alertsApi.deleteAlert(alertId)
```

### Telehealth
```tsx
import { telehealthApi } from "@/services/api";

telehealthApi.getVets(params?)
telehealthApi.bookConsultation(data)
telehealthApi.getBooking(bookingId)
telehealthApi.cancelBooking(bookingId)
telehealthApi.getConsultationHistory()
telehealthApi.uploadPrescription(bookingId, file)
```

### Vet Finder
```tsx
import { vetFinderApi } from "@/services/api";

vetFinderApi.searchVets(params)
vetFinderApi.getVetDetails(vetId)
vetFinderApi.getVetReviews(vetId)
vetFinderApi.submitReview(vetId, data)
vetFinderApi.getEmergencyVets(latitude, longitude, radius?)
```

### Images
```tsx
import { imageApi } from "@/services/api";

imageApi.uploadPetImage(petId, file)
imageApi.uploadHealthDocument(petId, file)
imageApi.deleteImage(imageId)
```

## Protected Routes

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

## Common Patterns

### Login Component
```tsx
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function LoginButton() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await login("user@example.com", "password");
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

### Fetch Pet Data
```tsx
import { useEffect, useState } from "react";
import { petApi } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

export function PetsList() {
  const { isAuthenticated } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchPets = async () => {
      try {
        const data = await petApi.getPets();
        setPets(data);
      } catch (error) {
        console.error("Failed to fetch pets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [isAuthenticated]);

  if (loading) return <div>Loading...</div>;
  return <div>{pets.map(pet => <div key={pet.id}>{pet.name}</div>)}</div>;
}
```

### Handle Logout
```tsx
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

### Conditional Rendering by Auth
```tsx
import { useAuth } from "@/contexts/AuthContext";

export function AuthStatus() {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <p>Logged in as: {user?.email}</p>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
  );
}
```

## File Locations

| Purpose | Location |
|---------|----------|
| Auth Context | `src/contexts/AuthContext.tsx` |
| API Services | `src/services/api.ts` |
| Supabase Config | `src/lib/supabase.ts` |
| API Client | `src/lib/api.ts` |
| Login Page | `src/pages/Login.tsx` |
| Signup Page | `src/pages/Signup.tsx` |
| Protected Route | `src/components/ProtectedRoute.tsx` |
| Updated Navbar | `src/components/layout/Navbar.tsx` |
| Main App | `src/App.tsx` |
| Backend Guide | `BACKEND_INTEGRATION.md` |
| Auth Setup | `AUTH_SETUP.md` |

## Routes

| Path | Auth Required | Component |
|------|---------------|-----------|
| `/` | ❌ | Index (Home) |
| `/login` | ❌ | Login |
| `/signup` | ❌ | Signup |
| `/dashboard` | ✅ | Dashboard |
| `/vet-finder` | ✅ | Vet Finder |
| `/telehealth` | ✅ | Telehealth |
| `/alerts` | ✅ | Alerts |

## Error Handling

API client automatically:
- Injects Bearer token to all requests
- Redirects to `/login` on 401 responses
- Preserves Supabase session across page reloads
- Handles network timeouts (10s)

## Debugging

```tsx
// In any component with useAuth:
const auth = useAuth();
console.log("Auth State:", {
  user: auth.user,
  session: auth.session,
  isAuthenticated: auth.isAuthenticated,
  isLoading: auth.isLoading
});
```

Check Network tab for:
- Authorization headers: `Authorization: Bearer {token}`
- Response status codes
- API response payloads

## Starting Development

```bash
cd C:\Users\mg\Downloads\pawsense-dashboard-main\pawsense-dashboard-main

# Install dependencies (if needed)
bun install

# Start dev server
bun run dev

# Dev server runs at http://localhost:8080
```

## Related Files

- **Backend Integration**: See `BACKEND_INTEGRATION.md`
- **Full Auth Setup**: See `AUTH_SETUP.md`
- **Tailwind CSS**: `tailwind.config.ts`
- **Vite Config**: `vite.config.ts`
- **TypeScript Config**: `tsconfig.json`
