# 🐾 PawSense Dashboard - Quick Start Guide

## Starting the Application

You have two easy ways to start both the backend and frontend servers together:

### **Option 1: Using the Updated `start-all.ps1` Script (Recommended)**

This is the easiest way - it launches both servers in separate windows automatically:

```powershell
# Navigate to project folder and run:
cd c:\Users\mg\Downloads\pawsense-dashboard-main\pawsense-dashboard-main
.\start-all.ps1
```

**What it does:**
- ✅ Launches Backend Server (port 5000) in a new window
- ✅ Launches Frontend Dev Server (port 8080) in a new window  
- ✅ Waits for both to start
- ✅ Shows you all the important URLs

### **Option 2: Manual - Start in Separate Terminal Windows**

If you prefer more control:

**Terminal 1 - Backend:**
```powershell
cd c:\Users\mg\Downloads\pawsense-dashboard-main\pawsense-dashboard-main\server
node server.js
```

**Terminal 2 - Frontend:**
```powershell
cd c:\Users\mg\Downloads\pawsense-dashboard-main\pawsense-dashboard-main
npm run dev
```

---

## 🌐 Access the Application

Once both servers are running:

| Component | URL | Purpose |
|-----------|-----|---------|
| **Homepage** | http://localhost:8080 | Landing page with features |
| **Signup** | http://localhost:8080/signup | Create new account |
| **Login** | http://localhost:8080/login | Sign in to account |
| **Dashboard** | http://localhost:8080/dashboard | Main app (requires login) |
| **Backend API** | http://localhost:5000 | API endpoints |
| **Health Check** | http://localhost:5000/health | Backend status |
| **Supabase Status** | http://localhost:5000/debug/supabase | Database connection |

---

## 🔧 Server Information

### Backend Server (Node.js)
- **Port:** 5000
- **Type:** Express.js API
- **Location:** `./server/server.js`
- **Features:** Authentication, Pet Management, Location Tracking, Sleep Analytics, AI Integration

### Frontend Server (React + Vite)
- **Port:** 8080
- **Type:** React + TypeScript + Vite
- **Location:** `./src/main.tsx`
- **Features:** Dashboard UI, Forms, Maps, Real-time Updates

---

## ✨ Key Features

### Authentication
- ✅ Signup with email/password
- ✅ Login
- ✅ Email confirmation
- ✅ Password reset
- ✅ Auto-redirects unauthenticated users to signup

### Pet Management
- ✅ Add pets
- ✅ Edit pet profiles
- ✅ Delete pets
- ✅ Track pet data

### Dashboard Features
- ✅ AI Behavior Analysis
- ✅ Sound Translator
- ✅ Activity Tracking (GPS)
- ✅ Sleep Analytics
- ✅ Telehealth Consultations
- ✅ Emergency Alerts

### Database
- ✅ Supabase (PostgreSQL)
- ✅ User profiles
- ✅ Pet data
- ✅ Location history
- ✅ Sleep tracking

---

## 🐛 Troubleshooting

### Backend won't start
```powershell
# Check if port 5000 is in use
netstat -ano | findstr :5000

# If in use, kill the process:
taskkill /PID <PID> /F
```

### Frontend won't start
```powershell
# Clear cache and reinstall
rm -r node_modules package-lock.json
npm install
npm run dev
```

### Port already in use
```powershell
# Check what's using the ports:
netstat -ano | findstr :8080
netstat -ano | findstr :5000

# Kill the process (replace <PID> with actual ID):
taskkill /PID <PID> /F
```

### Supabase connection fails
- Check `.env.local` and `server/.env` have correct credentials
- Verify internet connection
- Check Supabase project status

---

## 📝 Environment Variables

### Frontend (`.env.local`)
```
VITE_SUPABASE_URL=https://lkkjkomyzsbrxttwsupk.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_yAKW4V6h1VyBRm90k_kW_w_8F0lgswB
VITE_BACKEND_URL=http://localhost:5000
```

### Backend (`server/.env`)
```
SUPABASE_URL=https://lkkjkomyzsbrxttwsupk.supabase.co
SUPABASE_SERVICE_KEY=sb_secret_hYurwlRpFb_Rzkjsmu1YGQ_VbC7cgK8
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:8080
GEMINI_API_KEY=AIzaSyCe4UuzbWHAEMhdhQ098RW2k_chmAfH2Po
```

---

## 🚀 Building for Production

```powershell
npm run build
```

This creates an optimized build in the `dist/` folder.

---

## 📖 Additional Commands

```powershell
# Lint the code
npm run lint

# Preview production build
npm run preview

# Run tests (if configured)
npm test
```

---

**Happy coding! 🐾**
