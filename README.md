# 🐾 PawSense Dashboard

AI-powered pet behavior analysis dashboard that uses computer vision (YOLOv11) and LLM (Groq) to analyze pet videos and provide emotional insights, behavior patterns, and health recommendations.

![PawSense Dashboard](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue) ![Python](https://img.shields.io/badge/Python-3.11-green) ![YOLO](https://img.shields.io/badge/YOLO-v11-orange)

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [API Endpoints](#-api-endpoints)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

- **🎬 Video Upload & Analysis** - Upload pet videos for AI-powered behavior analysis
- **🧠 ML-Powered Insights** - YOLOv11 pose detection + Groq LLM for emotional analysis
- **📊 Wellbeing Score** - Get an overall health/wellbeing score (0-100)
- **🎯 Behavior Detection** - Detects tail wagging, running, jumping, rearing, etc.
- **💡 Smart Recommendations** - AI-generated care recommendations
- **🔔 Alert System** - Automated alerts based on analysis results
- **🗺️ Vet Finder** - Find nearby veterinarians using Google Maps
- **🔐 Authentication** - Secure user auth via Supabase
- **🦙 Fallback System** - Ollama fallback if ML service unavailable

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PawSense Architecture                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Express    │────▶│  Python ML   │────▶│   Groq LLM   │
│   (React)    │     │   Backend    │     │   Service    │     │   (Cloud)    │
│  Port 8080   │     │  Port 5001   │     │  Port 8000   │     │              │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │                    │                    │
       ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Supabase   │     │    FFmpeg    │     │   YOLOv11    │
│  (Auth + DB) │     │ (Preprocess) │     │   (Pose)     │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Video Analysis Flow

```
1. User uploads video via Dashboard
        ↓
2. Express receives video (Multer)
        ↓
3. FFmpeg preprocesses: 10s max, 10fps, 640x640
        ↓
4. Python ML Service:
   - YOLOv11 extracts 24 keypoints per frame
   - Feature extraction (angles, velocities, tail variance)
   - Action classification (sitting, walking, running, jumping)
   - Groq LLM generates emotional insights
        ↓
5. Response normalized and returned to frontend
        ↓
6. Dashboard displays results with recommendations
```

---

## 🛠️ Tech Stack

### Frontend
- **React 19** + TypeScript
- **Vite** - Build tool
- **Tailwind CSS** + shadcn/ui - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation

### Backend
- **Express.js** - API server
- **Multer** - File uploads
- **FFmpeg** - Video preprocessing
- **Supabase** - Auth & Database

### ML Pipeline
- **Python 3.11** + FastAPI
- **YOLOv11** (Ultralytics) - Pose detection
- **Groq API** - LLM analysis
- **OpenCV** - Video processing

### Fallback
- **Ollama** - Local LLM (neural-chat model)

---

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** v18+ 
- **Python** 3.11 (recommended)
- **FFmpeg** installed
- **Groq API Key** (free at https://console.groq.com)
- **Supabase Account** (for auth)

### Install FFmpeg (macOS)
```bash
brew install ffmpeg
```

### Install FFmpeg (Ubuntu/Debian)
```bash
sudo apt update && sudo apt install ffmpeg
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ayaser123/pawsense-dashboard.git
cd pawsense-dashboard

# Use the ML integration branch
git checkout ml-integration
```

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Set Up Python Virtual Environment

```bash
cd src/pawsense_ai
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install ultralytics groq fastapi uvicorn python-dotenv opencv-python-headless numpy
cd ../..
```

### 4. Create Upload Directories

```bash
mkdir -p uploads/raw uploads/processed
```

---

## 🔐 Environment Variables

### Root `.env` (Frontend + Backend)

Create `.env` in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API Configuration
VITE_BACKEND_URL=http://localhost:5001

# Google Maps API (optional - for Vet Finder)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_GOOGLE_PLACES_API_KEY=your_google_places_key
```

### Python ML Service `.env`

Create `.env` in `src/pawsense_ai/`:

```env
# Groq LLM Configuration (REQUIRED)
GROQ_API_KEY=your_groq_api_key_here

# LLM Model
LLM_MODEL=llama-3.1-8b-instant

# API Server Configuration
API_HOST=0.0.0.0
API_PORT=8000
```

> 💡 **Get your Groq API key for free at:** https://console.groq.com

---

## ▶️ Running the Application

You need to run **3 services** in separate terminals:

### Terminal 1: Python ML Service (Port 8000)

```bash
cd src/pawsense_ai
source venv/bin/activate  # On Windows: venv\Scripts\activate
python main.py
```

Expected output:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Terminal 2: Express Backend (Port 5001)

```bash
node server/server.js
```

Expected output:
```
🚀 Backend API running on http://localhost:5001
```

### Terminal 3: Frontend (Port 8080)

```bash
npm run dev
```

Expected output:
```
VITE v5.4.21  ready in 200 ms
➜  Local:   http://localhost:8080/
```

### Verify All Services

```bash
# Check ML Service
curl http://localhost:8000/health
# Expected: {"status":"healthy","service":"PawSense AI API"}

# Check Express Backend  
curl http://localhost:5001/health
# Expected: {"status":"ok","environment":"development"}

# Frontend
# Open http://localhost:8080 in browser
```

---

## 🌐 API Endpoints

### Express Backend (Port 5001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/ai/analyze-video` | Upload and analyze video |
| POST | `/auth/create-user` | Create new user |
| POST | `/auth/login` | User login |

### Python ML Service (Port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/analyze-behavior` | Analyze video (internal) |
| POST | `/example` | Get mock response |

### Video Analysis Request

```bash
curl -X POST http://localhost:5001/api/ai/analyze-video \
  -F "video=@/path/to/video.mp4" \
  -F "petId=optional-pet-id"
```

### Video Analysis Response

```json
{
  "success": true,
  "analysis": {
    "emotional_states": [
      {"emotion": "Playful", "confidence": 0.92},
      {"emotion": "Energetic", "confidence": 0.95}
    ],
    "behavior_patterns": [
      "High tail wagging during running",
      "Alternating between running and walking"
    ],
    "recommendations": [
      "Encourage more calm playtime",
      "Provide more vigorous exercise sessions"
    ],
    "overall_wellbeing_score": 85,
    "behavior": "High tail wagging during running",
    "mood": "Playful",
    "energy": "High",
    "confidence": 0.92,
    "source": "ml-pipeline"
  },
  "metadata": {
    "processingTimeMs": 6426,
    "source": "ml-pipeline",
    "videoFileName": "demo_video.mp4"
  }
}
```

---

## 📁 Project Structure

```
pawsense-dashboard/
├── public/                    # Static assets
├── server/
│   └── server.js             # Express backend (video upload, ML integration)
├── src/
│   ├── components/           # React components
│   │   ├── dashboard/        # Dashboard widgets
│   │   ├── layout/           # Navbar, Footer
│   │   └── ui/               # shadcn/ui components
│   ├── contexts/             # React contexts (Auth)
│   ├── hooks/                # Custom hooks
│   ├── pages/                # Page components
│   │   ├── Dashboard.tsx     # Main dashboard with video upload
│   │   ├── VetFinder.tsx     # Find nearby vets
│   │   └── ...
│   ├── services/
│   │   ├── videoAnalysisService.ts  # Frontend video analysis API
│   │   ├── alertsService.ts         # Alerts management
│   │   ├── ollamaAI.ts              # Ollama fallback
│   │   └── ...
│   ├── pawsense_ai/          # Python ML Pipeline
│   │   ├── main.py           # FastAPI server
│   │   ├── inference.py      # YOLO inference
│   │   ├── feature_extraction.py
│   │   ├── action_classification.py
│   │   ├── llm_analyzer.py   # Groq integration
│   │   ├── end_to_end_pipeline.py
│   │   ├── best.pt           # YOLO model weights
│   │   └── .env              # Groq API key
│   └── ...
├── uploads/                  # Temporary video storage
│   ├── raw/                  # Original uploads
│   └── processed/            # FFmpeg processed
├── .env                      # Environment variables
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🔬 How It Works

### 1. Video Preprocessing (FFmpeg)

Videos are preprocessed before ML analysis:
- **Duration**: Max 10 seconds
- **Frame Rate**: 10 fps
- **Resolution**: 640x640 (padded)
- **Codec**: H.264
- **Audio**: Removed

```bash
ffmpeg -i input.mp4 -t 10 -r 10 -vf "scale=640:640:force_original_aspect_ratio=decrease,pad=640:640:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -an output.mp4
```

### 2. YOLO Pose Detection

YOLOv11 extracts 24 keypoints per frame:
- Head, ears, nose, eyes
- Shoulders, elbows, paws
- Spine, hips, tail
- Knees, ankles

### 3. Feature Extraction

From keypoints, we calculate:
- **Angles**: Spine curvature, leg angles
- **Velocities**: Movement speed
- **Tail Variance**: Wagging detection
- **Posture**: Standing, sitting, lying

### 4. Action Classification

Rule-based classification:
- Sitting, Standing, Lying
- Walking, Running, Jumping
- Tail Wagging, Rearing, Playing

### 5. LLM Analysis (Groq)

Groq's LLM analyzes the extracted features to provide:
- Emotional state assessment
- Behavior pattern interpretation
- Health recommendations
- Overall wellbeing score

---

## 🐛 Troubleshooting

### Port 5000 Already in Use (macOS)

macOS uses port 5000 for AirPlay. The server uses port **5001** instead.

### Python ML Service Not Starting

```bash
# Check if running
curl http://localhost:8000/health

# If not, check logs
cd src/pawsense_ai
./venv/bin/python main.py
```

### "Module not found" in Python

```bash
cd src/pawsense_ai
source venv/bin/activate
pip install ultralytics groq fastapi uvicorn python-dotenv opencv-python-headless numpy
```

### Video Upload Fails

Check that:
1. FFmpeg is installed: `which ffmpeg`
2. Upload directories exist: `mkdir -p uploads/raw uploads/processed`
3. File is a valid video format (mp4, mov, avi, webm)

### ML Service Returns Mock Data

If `source: "mock-fallback"` appears:
1. Check Python ML service is running on port 8000
2. Check Groq API key is set in `src/pawsense_ai/.env`
3. Check video path is accessible

### CORS Errors

Ensure Express CORS is configured for your frontend URL:
```javascript
cors({
  origin: ["http://localhost:8080", process.env.FRONTEND_URL],
  credentials: true,
})
```

---

## 🔄 Switching Between Versions

```bash
# ML Integration (with YOLO + Groq)
git checkout ml-integration

# Original Version (fallback)
git checkout main
```

---

## 🧪 Testing the ML Pipeline

### Test with Demo Video

```bash
# Test ML service directly
curl -X POST http://localhost:8000/analyze-behavior \
  -H "Content-Type: application/json" \
  -d '{"video_path": "/full/path/to/src/pawsense_ai/demo_video.mp4"}'

# Test full pipeline through Express
curl -X POST http://localhost:5001/api/ai/analyze-video \
  -F "video=@src/pawsense_ai/demo_video.mp4;type=video/mp4"
```

### Expected Response Source Values

| Source | Meaning |
|--------|---------|
| `ml-pipeline` | ✅ Real ML analysis (YOLO + Groq) |
| `ollama-fallback` | ⚠️ Ollama was used (ML service unavailable) |
| `mock-fallback` | ❌ Both services failed, mock data returned |

---

## 📄 License

MIT License - feel free to use this project for learning and development.

---

## 👥 Contributors

- Frontend Dashboard: [@ayaser123](https://github.com/ayaser123)
- ML Pipeline (YOLO + Groq): Sabih
- Integration: Rohaan

---

## 🙏 Acknowledgments

- [Ultralytics](https://ultralytics.com/) for YOLOv11
- [Groq](https://groq.com/) for fast LLM inference
- [Supabase](https://supabase.com/) for auth & database
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
