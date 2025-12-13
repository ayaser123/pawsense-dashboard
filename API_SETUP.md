# 🐾 PawSense Dashboard - API Setup Guide

Your dashboard is now enhanced with **Google Maps**, **Location Services**, and **Gemini AI** integration!

## 🚀 Quick Start

Both servers are running:
- **Frontend**: http://localhost:8080
- **Backend**: http://localhost:5000

## 🔑 Required API Keys

To activate all features, add these API keys to `.env.local`:

### 1. **Google Maps API**
Used for the "Vets Near You" feature to find veterinary clinics in your area.

```bash
# Get your key:
# 1. Go to Google Cloud Console: https://console.cloud.google.com
# 2. Create a new project
# 3. Enable these APIs:
#    - Maps JavaScript API
#    - Places API
#    - Geolocation API
# 4. Create an API key (Credentials > Create Credentials > API Key)
# 5. Add to .env.local:

VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
VITE_GOOGLE_PLACES_API_KEY=your_api_key_here
```

### 2. **Gemini AI API**
Used for intelligent pet behavior analysis and health recommendations.

```bash
# Get your key:
# 1. Go to Google AI Studio: https://aistudio.google.com/apikey
# 2. Click "Create API Key"
# 3. Copy the key and add to .env.local:

VITE_GEMINI_API_KEY=your_api_key_here
```

## 🗺️ Features Now Available

### 1. **Smart Vet Finder**
- Automatically finds veterinary clinics near your location
- Displays distance, rating, hours, and specialties
- Interactive map view with real-time GPS tracking

### 2. **AI Pet Analysis**
- Get personalized behavior insights powered by Gemini AI
- Receive actionable recommendations for your pet
- Understand mood patterns and health indicators

### 3. **Activity Tracking**
- Track your pet's movement with GPS
- View activity history on an interactive map
- Monitor exercise patterns and routines

### 4. **Health Recommendations**
- AI-generated wellness tips specific to your pet's breed and age
- Preventive care suggestions
- Personalized health tracking

## 📝 .env.local Configuration

```dotenv
# Supabase (Already configured)
VITE_SUPABASE_URL=https://lkkjkomyzsbrxttwsupk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend
VITE_BACKEND_URL=http://localhost:5000

# Google APIs (TODO: Add your keys)
VITE_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE
VITE_GOOGLE_PLACES_API_KEY=YOUR_KEY_HERE

# Gemini AI (TODO: Add your key)
VITE_GEMINI_API_KEY=YOUR_KEY_HERE
```

## 🎯 Development Mode

**Without API keys**, the app uses mock data:
- Sample vets nearby (Happy Paws, Furry Friends, Pet Wellness)
- Sample pet health tips
- Sample behavior analysis

This allows you to **test all features immediately** without API keys!

## 🔧 Backend Endpoints

### Location & Maps
```bash
POST /api/vets/nearby
Body: { lat: number, lng: number, radius?: number }
Response: { success: true, vets: Vet[] }
```

### AI Analysis
```bash
POST /api/ai/analyze-behavior
Body: { petType: string, age: number, description: string, context?: string }
Response: { success: true, analysis: { analysis: string, recommendations: string[], confidence: number } }

POST /api/ai/generate-health-tips
Body: { petType: string, breed?: string, age: number }
Response: { success: true, tips: string[] }
```

### Activity Tracking
```bash
POST /api/activity/record
Body: { petId: string, lat: number, lng: number, timestamp?: string, activityType?: string }
Response: { success: true, id: string }

GET /api/activity/:petId
Response: { success: true, activities: Activity[] }
```

## 🎮 Dashboard Features

### Quick Stats Cards
- **Mood**: Current pet emotional state (Calm, Happy, Anxious, etc.)
- **Activity**: GPS tracking status
- **Sleep**: Sleep duration and quality
- **Health**: Overall health status

### Tabs

**🗺️ Vet Finder Tab**
- Find nearby veterinary clinics
- View ratings, distance, and contact info
- Click markers for details

**📍 Activity Map Tab**
- Toggle GPS tracking on/off
- View real-time location history
- Monitor exercise patterns

### AI Insights Panel
- Click "Analyze with AI" to generate behavior insights
- Get personalized recommendations
- Confidence score for accuracy

## 📱 How It Works

### 1. **User Logs In**
   - Supabase authentication validates user
   - AuthContext initializes with 5s timeout

### 2. **Select a Pet**
   - Choose from your registered pets
   - Dashboard loads pet-specific data

### 3. **Location Services**
   - Browser requests geolocation permission
   - Latitude/longitude automatically captured
   - Nearby vets are fetched

### 4. **AI Analysis**
   - Upload a video of your pet
   - Gemini AI analyzes behavior
   - Get detailed insights and recommendations

### 5. **Activity Tracking**
   - Enable GPS tracking
   - Real-time location updates recorded
   - Historical activity displayed on map

## 🐛 Troubleshooting

### "Nothing showing up"
- Check browser console (F12)
- Ensure both servers running: `npm run start:all`
- Refresh page (Ctrl+Shift+R hard refresh)

### API Keys not working
- Verify keys are correct in `.env.local`
- Save file and refresh browser
- Check browser console for error messages

### Geolocation denied
- Click the permission prompt in address bar
- Allow location access
- Try refreshing the page

### Vets not showing
- Grant location permission
- Check backend logs (port 5000)
- Mock data will display if API key missing

## 💡 Tips

- **First time?** Leave API keys blank to see mock data
- **Want real data?** Add API keys from Google and Gemini
- **Testing?** Create a test pet in the dashboard
- **Debug?** Open DevTools (F12) to see console logs

## 🎨 UI Improvements

- **Gradient backgrounds** for modern aesthetic
- **Quick stat cards** showing pet mood, activity, sleep, health
- **Enhanced tabs** with icons and smooth transitions
- **AI insights panel** with confidence scores
- **Responsive design** works on mobile and desktop

---

**Ready to use?** Open http://localhost:8080 and start managing your pet's health! 🐾
