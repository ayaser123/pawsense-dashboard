# PawSense - AI-Powered Pet Behavior Dashboard

An intelligent pet monitoring and analysis platform that uses AI to understand pet behavior, track health metrics, and connect pet owners with nearby veterinarians.

## 🎯 Features

- **AI Behavior Analysis**: Upload pet videos for AI-powered behavior and mood analysis using Ollama
- **Vet Finder**: Discover nearby veterinarians using location-based search (Overpass API)
- **Activity Tracking**: Monitor and track your pet's daily activities
- **Pet Management**: Add and manage multiple pets with personalized profiles
- **Alerts System**: Real-time alerts based on behavior analysis with history tracking
- **User Authentication**: Secure signup/login with email verification via Supabase
- **Contact Form**: Built-in contact submission system

## 🛠️ Tech Stack

### Frontend
- React 19 with TypeScript
- Vite - Fast build tool and dev server
- Tailwind CSS - Utility-first CSS framework
- Shadcn/ui - High-quality UI components
- Framer Motion - Smooth animations
- React Router - Client-side routing

### Backend
- Express.js - Node.js web framework
- Supabase - PostgreSQL database + Auth + Storage
- Admin Auth API - User management and email auto-confirmation

### Services
- Ollama - Local LLM for video analysis (neural-chat model)
- Overpass API - OpenStreetMap data for vet location search
- Supabase Auth - Email-based authentication

## 📋 Prerequisites

- Node.js 18+ with npm
- Supabase project (free tier available)
- Ollama installed and running locally
- Git

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <YOUR_GIT_URL>
cd pawsense-dashboard
npm install
```

### 2. Environment Setup

Create a `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_URL=https://your-project.supabase.co
```

### 3. Database Setup

Run this SQL in Supabase:

```sql
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anyone to insert contacts" ON contacts FOR INSERT WITH CHECK (true);
```

### 4. Ollama Setup

```bash
ollama pull neural-chat
ollama serve
```

### 5. Start Servers

```bash
npm run start:all
```

Visit `http://localhost:8080`

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Ollama Documentation](https://github.com/ollama/ollama)
- [React Documentation](https://react.dev)

## 📄 License

MIT

---

**Last Updated**: December 2025
