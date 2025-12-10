# 📧 Email Confirmation Flow - Complete Guide

## Overview

The PawSense Dashboard now implements a complete email confirmation flow where users:
1. Sign up with email and password
2. Receive a confirmation email (in production)
3. Confirm their email via link
4. Get logged in automatically
5. Can log back in with their saved credentials

---

## Flow Diagrams

### Development Mode
```
User Signs Up
    ↓
Backend creates user account
    ↓
Backend auto-confirms email (dev-only)
    ↓
Frontend auto-logs in user
    ↓
User redirected to Dashboard
    ↓
User can login again with same credentials
```

### Production Mode
```
User Signs Up
    ↓
Backend creates user account
    ↓
Supabase sends confirmation email
    ↓
User clicks link in email
    ↓
Email verified automatically
    ↓
User redirected to Dashboard (logged in)
    ↓
User can login again with same credentials
```

---

## Implementation Details

### 1. Signup Flow (`src/contexts/AuthContext.tsx`)

**New signup function:**
```typescript
const signup = async (email: string, password: string, userData?: UserMetadata) => {
  // 1. Create user via backend
  const createUserRes = await fetch(`${backendUrl}/auth/create-user`, {
    method: "POST",
    body: JSON.stringify({ email, password, metadata: userData })
  })
  
  // 2. In DEV mode: Auto-confirm email
  if (import.meta.env.DEV) {
    await fetch(`${backendUrl}/auth/dev-confirm-email`, {
      method: "POST",
      body: JSON.stringify({ email })
    })
    
    // 3. Auto-login user
    const { data } = await supabase.auth.signInWithPassword({ email, password })
    setSession(data.session)
    setUser(data.user)
  }
  // In PRODUCTION: User receives email and confirms manually
}
```

### 2. Confirm Email Page (`src/pages/ConfirmEmail.tsx`)

- **Shows** when user is redirected after signup
- **Checks** if email is confirmed via Supabase
- **Redirects** to dashboard when confirmed
- **Handles** email confirmation token from email link

### 3. Backend Endpoints

#### `/auth/create-user` (POST)
Creates a new user in Supabase
```json
{
  "email": "user@example.com",
  "password": "password123",
  "metadata": { "full_name": "John Doe" }
}
```

#### `/auth/dev-confirm-email` (POST) - DEV ONLY
Auto-confirms email in development mode
```json
{
  "email": "user@example.com"
}
```

#### `/auth/login` (POST)
Logs in user with saved credentials
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

## User Experience

### Development (localhost:8080)

1. **Sign up**: User fills form → Click "Create Account"
2. **Auto-confirmation**: User automatically confirmed (no email needed)
3. **Auto-login**: User automatically logged in
4. **Dashboard**: User redirected to dashboard
5. **Next visit**: User can login with same email/password

### Production (deployed)

1. **Sign up**: User fills form → Click "Create Account"
2. **Email sent**: "Check your email to confirm your account"
3. **User confirms**: User clicks link in email
4. **Auto-login**: User automatically logged in after confirmation
5. **Dashboard**: User redirected to dashboard
6. **Next visit**: User can login with same email/password

---

## Testing the Flow

### Test in Development

```bash
# 1. Go to signup page
http://localhost:8080/signup

# 2. Fill form with:
Full Name: Test User
Email: test@example.com
Password: Password123!
Confirm Password: Password123!

# 3. Click "Create Account"
# → Should auto-login and redirect to dashboard

# 4. Logout and test login
# → Go to http://localhost:8080/login
# → Enter same email and password
# → Should successfully login
```

### Test Email Confirmation Link (Production)

In production, Supabase sends a confirmation email with a link like:
```
https://yourapp.com/confirm-email#access_token=...&type=email
```

When user clicks this link:
1. Frontend extracts token from URL
2. Verifies token with Supabase
3. Confirms email
4. Logs user in automatically
5. Redirects to dashboard

---

## Database Storage

### User Credentials Saved In

**Supabase Auth table** (`auth.users`):
```sql
- email (unique)
- encrypted_password
- email_confirmed_at (timestamp)
- created_at
- updated_at
```

**PawSense Profiles table** (`public.profiles`):
```sql
- id (user_id)
- email
- full_name
- avatar_url
- created_at
- updated_at
```

User can login anytime with email + password.

---

## Environment Variables Needed

### Frontend (`.env.local`)
```
VITE_SUPABASE_URL=<your_supabase_url>
VITE_SUPABASE_ANON_KEY=<your_anon_key>
VITE_BACKEND_URL=http://localhost:5000
```

### Backend (`server/.env`)
```
SUPABASE_URL=<your_supabase_url>
SUPABASE_SERVICE_KEY=<your_service_key>
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:8080
```

---

## Key Features

✅ **Secure**: Passwords stored encrypted in Supabase  
✅ **Persistent**: Credentials saved so users can login again  
✅ **Email confirmed**: Only confirmed emails can access app  
✅ **Dev-friendly**: Auto-confirmation in development (no email needed)  
✅ **Production-ready**: Real email confirmation in production  
✅ **One-click login**: After confirmation, users can login anytime  

---

## Troubleshooting

### User can't login after signup
- Check if email is confirmed in Supabase dashboard
- Verify email/password are correct
- Clear browser cache and try again

### Confirmation email not received
- Check Supabase email settings
- Verify email address is correct
- Check spam folder
- In development, use dev-confirm-email endpoint

### Still seeing "Invalid credentials"
- Make sure email is confirmed first
- Try logout completely and login again
- Verify credentials are entered correctly

---

## Architecture

```
Frontend (React)
├── Signup Page
│   └── Calls signup() in AuthContext
├── Confirm Email Page
│   └── Verifies token and confirms email
└── Login Page
    └── Uses existing credentials to login

Backend (Node.js)
├── /auth/create-user
│   └── Creates user in Supabase
├── /auth/dev-confirm-email
│   └── Auto-confirms email (dev only)
└── /auth/login
    └── Authenticates with Supabase

Database (Supabase)
├── auth.users (email, password, email_confirmed_at)
└── public.profiles (user profile data)
```

---

**Happy signing up! 🐾**
