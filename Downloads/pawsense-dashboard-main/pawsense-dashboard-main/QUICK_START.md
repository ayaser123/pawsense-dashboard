# Quick Reference: Login/Logout Implementation

## What Was Fixed

| Issue | Solution |
|-------|----------|
| TypeScript `any` errors | Created `UserMetadata` interface |
| Fast-refresh warning | Moved hook to separate file |
| Import conflicts | Updated all hook imports |
| Missing auth context | Created AuthProvider wrapper |
| No logout button | Added logout to Navbar |
| Unprotected routes | Created ProtectedRoute component |

## Files to Update With Your Config

### `.env.local` (Create this file)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
VITE_BACKEND_URL=http://localhost:5000
```

**How to get values:**
1. Go to supabase.com
2. Create/select project
3. Settings → API
4. Copy Project URL and Anon Key

## Testing Auth Flow

### Step 1: Signup
```
→ http://localhost:8080/signup
→ Fill email/password
→ Click Sign Up
→ Check email confirmation (if enabled)
```

### Step 2: Login
```
→ http://localhost:8080/login
→ Enter credentials
→ Redirected to /dashboard
→ Navbar shows logout button
```

### Step 3: Access Protected Page
```
→ Try /dashboard without logging in
→ Auto-redirect to /login
→ Login and try again
→ Page loads successfully
```

### Step 4: Logout
```
→ Click Logout in navbar
→ Redirected to /login
→ Session cleared
```

## Component Usage

### Using Auth Hook
```tsx
import { useAuth } from "@/hooks/useAuth";

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) return <p>Not logged in</p>;
  return <p>Welcome {user?.email}</p>;
}
```

### Protecting Routes
```tsx
// Already done in App.tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### Making API Calls
```tsx
import apiClient from "@/lib/api";

// Token automatically included!
const data = await apiClient.get("/api/pets");
```

## Backend Endpoints Needed

```typescript
// All receive JWT token in Authorization header
POST /auth/login
POST /auth/signup
POST /auth/logout
POST /auth/user-sync
POST /auth/update-profile
```

## Current Status

✅ All TypeScript errors fixed
✅ Auth system fully implemented
✅ Dev server running
✅ Ready for backend integration

## Next Steps

1. **Set up Supabase project** (5 min)
2. **Fill `.env.local`** (1 min)
3. **Implement backend endpoints** (your timeline)
4. **Test full flow** (5 min)

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "useAuth must be used within AuthProvider" | Wrap app in `<AuthProvider>` (done in App.tsx) |
| 401 errors from backend | Check token being sent in Authorization header |
| Stuck on login | Check browser console + Supabase dashboard |
| Supabase errors | Verify credentials in .env.local |

