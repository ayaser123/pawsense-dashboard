# Authentication & Login/Logout Setup Guide

This guide walks you through setting up and using the new authentication system in PawSense Dashboard.

## What's New

✅ **Supabase Authentication** - Email/password authentication with Supabase
✅ **Login/Signup Pages** - Professional login and signup pages
✅ **Protected Routes** - Dashboard and other pages now require authentication
✅ **Logout Functionality** - Logout button in navbar
✅ **Backend Integration** - Full backend API integration with automatic token injection
✅ **Session Persistence** - User sessions persist across page refreshes

## Quick Start

### 1. Get Supabase Credentials

1. Go to https://supabase.com and create a new project
2. In the project dashboard, go to **Settings → API**
3. Copy your **Project URL** and **Anon Key**

### 2. Configure Environment

1. Update `.env.local` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_BACKEND_URL=http://localhost:5000
```

### 3. Start the Dev Server

```bash
cd C:\Users\mg\Downloads\pawsense-dashboard-main\pawsense-dashboard-main
bun run dev
```

The app will be available at `http://localhost:8080`

### 4. Test the Auth Flow

1. Click "Sign Up" or go to `/signup`
2. Create a new account with email and password
3. Check your email for confirmation (if enabled in Supabase)
4. Log in with your credentials
5. You should now see the dashboard
6. Click "Logout" in the navbar to logout

## File Structure

```
src/
├── contexts/
│   └── AuthContext.tsx           # Main auth context & hooks
├── components/
│   ├── ProtectedRoute.tsx        # Route protection component
│   └── layout/
│       └── Navbar.tsx            # Updated with logout
├── pages/
│   ├── Login.tsx                 # Login page
│   └── Signup.tsx                # Signup page
├── services/
│   └── api.ts                    # All API endpoints
├── lib/
│   ├── supabase.ts              # Supabase client config
│   ├── api.ts                   # Axios API client with interceptors
│   └── utils.ts                 # Utility functions
└── App.tsx                       # Updated with AuthProvider & routes
```

## Using Authentication in Components

### Access Auth State

```tsx
import { useAuth } from "@/contexts/AuthContext";

export function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated && <p>Welcome, {user?.email}</p>}
    </div>
  );
}
```

### Login

```tsx
const { login } = useAuth();

const handleLogin = async () => {
  try {
    await login("user@example.com", "password");
    // User is now logged in
  } catch (error) {
    console.error("Login failed:", error);
  }
};
```

### Signup

```tsx
const { signup } = useAuth();

const handleSignup = async () => {
  try {
    await signup("user@example.com", "password", {
      full_name: "John Doe"
    });
    // User account created
  } catch (error) {
    console.error("Signup failed:", error);
  }
};
```

### Logout

```tsx
const { logout } = useAuth();

const handleLogout = async () => {
  try {
    await logout();
    // User is logged out
  } catch (error) {
    console.error("Logout failed:", error);
  }
};
```

### Update Profile

```tsx
const { updateProfile } = useAuth();

const handleUpdateProfile = async () => {
  try {
    await updateProfile({
      full_name: "Jane Doe",
      avatar_url: "https://example.com/avatar.jpg"
    });
  } catch (error) {
    console.error("Update failed:", error);
  }
};
```

## Using API Endpoints

All API calls automatically include the Supabase auth token:

```tsx
import { petApi, healthApi, alertsApi } from "@/services/api";

// Get all pets
const pets = await petApi.getPets();

// Get specific pet
const pet = await petApi.getPet("pet-id");

// Create new pet
const newPet = await petApi.createPet({
  name: "Buddy",
  species: "dog",
  breed: "Golden Retriever",
  age: 3
});

// Get health metrics
const metrics = await healthApi.getMetrics("pet-id");

// Get alerts
const alerts = await alertsApi.getAlerts("pet-id");
```

## Protected Routes

Any route that should require authentication can be wrapped with `ProtectedRoute`:

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

Already protected routes:
- `/dashboard`
- `/vet-finder`
- `/telehealth`
- `/alerts`

Public routes:
- `/` (home)
- `/login`
- `/signup`

## Navbar Integration

The navbar now shows:
- **Logout button** for authenticated users
- **No logout button** for unauthenticated users

The logout button is automatically hidden/shown based on auth state.

## Backend Integration

Your backend should:

1. Accept Bearer tokens in the Authorization header
2. Verify tokens with Supabase
3. Implement the required endpoints (see BACKEND_INTEGRATION.md)

Example token verification in Node.js:

```javascript
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

app.use(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const { data, error } = await supabase.auth.getUser(token);
  if (error) return res.status(401).json({ error: "Invalid token" });

  req.user = data.user;
  next();
});
```

## Supabase Configuration

### Enable Email Confirmations (Optional)

1. Go to **Authentication → Email Templates**
2. Configure confirmation email template
3. Users will need to confirm email before logging in

### Set Email Templates

1. **Confirmation Email** - Customize the confirmation email
2. **Password Reset** - Customize password reset email
3. **Magic Link** - For passwordless login (if enabled)

### Session Configuration

1. Go to **Authentication → Providers → Email**
2. Set session duration under "JWT Expiry"
3. Configure auto-refresh token settings

## Troubleshooting

### "Missing Supabase configuration"

**Problem:** Error on app startup saying Supabase config is missing

**Solution:**
1. Check `.env.local` has both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. Restart dev server: `bun run dev`
3. Verify values are copied correctly from Supabase dashboard

### Login shows "Invalid credentials"

**Problem:** Email/password doesn't work

**Solutions:**
1. Ensure email is confirmed (check Supabase Email Templates)
2. Verify password is correct
3. Check email exists in Supabase Auth users
4. Look at browser console for specific error message

### Logout button doesn't appear

**Problem:** Even when logged in, logout button is hidden

**Solutions:**
1. Check browser console for JavaScript errors
2. Verify AuthProvider wraps the app in App.tsx
3. Check `useAuth()` is being called correctly in Navbar
4. Refresh page to ensure auth state loads

### Protected routes redirect to login when logged in

**Problem:** Can't access protected pages even after login

**Solutions:**
1. Check Supabase session is valid: `console.log(auth.session)`
2. Look for 401 errors in Network tab - backend may not be verifying tokens
3. Ensure ProtectedRoute is working: add `console.log(isAuthenticated)` in ProtectedRoute
4. Check token is in Authorization header in Network requests

### Backend receives 401 on protected endpoints

**Problem:** Backend API returns 401 even with valid token

**Solutions:**
1. Verify backend is checking Authorization header
2. Verify backend verifies token with Supabase correctly
3. Check token format: should be `Bearer {token}`
4. Look at backend logs for token validation errors

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Add Supabase credentials to `.env.local`
3. ✅ Test login/signup flow
4. 🔜 Set up your backend server
5. 🔜 Implement backend endpoints (see BACKEND_INTEGRATION.md)
6. 🔜 Integrate pet data features
7. 🔜 Set up health monitoring endpoints

## Security Notes

- Keep `VITE_SUPABASE_ANON_KEY` safe - it's exposed in the browser
- Use Row Level Security (RLS) in Supabase for database tables
- Never expose service keys in frontend code
- Store sensitive data on backend, not in Supabase metadata
- Always verify tokens on the backend
- Use HTTPS in production

## Support

For issues or questions:
1. Check BACKEND_INTEGRATION.md for backend setup
2. Review Supabase documentation: https://supabase.com/docs
3. Check browser console for detailed error messages
4. Look at Network tab to see API requests/responses
