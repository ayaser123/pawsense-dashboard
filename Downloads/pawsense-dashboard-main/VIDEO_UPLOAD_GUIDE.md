# PawSense - Video Upload & AI Analysis Setup Guide

## Overview
PawSense now includes AI-powered pet behavior analysis. Users can upload pet videos, which are processed and stored in Supabase, then analyzed using Google's Gemini API for behavior insights.

## Architecture

### Frontend
- **Video Upload Component** (`src/components/dashboard/ImageUpload.tsx`)
  - Accepts `.mp4` and `.mov` files (up to 50MB)
  - Drag-and-drop support
  - Real-time preview with video player

- **useVideoAnalysis Hook** (`src/hooks/useVideoAnalysis.ts`)
  - Handles video upload to backend
  - Polls for AI analysis results
  - Displays mood, activity level, and behavior insights

### Backend
- **Video Upload Endpoint** (`server/server.js` - POST `/api/videos/upload`)
  - Accepts multipart form data
  - Stores files in Supabase Storage bucket `videos/`
  - Creates video metadata records in database
  - Triggers async AI analysis

- **AI Analysis Function** (`analyzeVideoWithAI`)
  - Uses Google Gemini Vision API
  - Analyzes video for pet behavior, mood, activity level
  - Stores results in `video_analyses` table
  - Non-blocking (analysis happens in background)

- **Endpoints**:
  - `POST /api/videos/upload` - Upload and analyze video
  - `GET /api/videos` - List user's videos with analyses
  - `GET /api/videos/:videoId/analysis` - Get analysis for specific video

### Database
New tables added (run `server/schema.sql` in Supabase SQL editor):

```sql
-- Videos table
CREATE TABLE videos (
  id UUID PRIMARY KEY,
  user_id UUID (foreign key),
  pet_id UUID (optional),
  url TEXT,
  file_path TEXT,
  uploaded_at TIMESTAMPTZ
);

-- Video analyses table
CREATE TABLE video_analyses (
  id UUID PRIMARY KEY,
  video_id UUID (foreign key),
  user_id UUID (foreign key),
  behavior_description TEXT,
  mood TEXT,
  activity_level TEXT,
  concerns TEXT,
  analyzed_at TIMESTAMPTZ
);
```

## Setup Instructions

### 1. Backend Setup

#### Install Dependencies
```bash
cd server
npm install
```

#### Configure Environment
Create or update `server/.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
PORT=5000
CORS_ORIGIN=http://localhost:8081
GEMINI_API_KEY=your-google-api-key
```

**Get your keys:**
- **SUPABASE_URL & SERVICE_KEY**: Supabase Dashboard → Settings → API
- **GEMINI_API_KEY**: [Google AI Studio](https://aistudio.google.com/app/apikey)

#### Create Storage Bucket
1. Go to Supabase Dashboard
2. Storage → Create new bucket
3. Name it: `videos`
4. Make it public (or use signed URLs)

#### Run Database Migration
1. Go to Supabase Dashboard
2. SQL Editor → New Query
3. Copy contents of `server/schema.sql`
4. Run the query

#### Start Server
```bash
npm run dev
```
Should show: `🐾 PawSense backend running on http://localhost:5000`

### 2. Frontend Setup

#### Environment Variables
Already configured in `.env.local`:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_BACKEND_URL=http://localhost:5000
```

#### Start Dev Server
```bash
cd ..
bun run dev
```

### 3. Test the Flow

1. **Navigate to Dashboard** → http://localhost:8081/dashboard
2. **Sign in** with your Supabase credentials
3. **Scroll to "Analyze Pet Behavior"** section
4. **Upload a video** (drag & drop or click)
5. **Click "Analyze with AI"** button
6. **Wait for analysis** (~5-30 seconds depending on video length)
7. **View results** - Mood, Activity Level, and Behavior Description

## API Response Example

### Upload Response
```json
{
  "success": true,
  "videoId": "uuid-here",
  "url": "https://storage-url/videos/user-id/video-id.mp4",
  "message": "Video uploaded. Analysis in progress..."
}
```

### Analysis Response
```json
{
  "id": "uuid",
  "video_id": "uuid",
  "behavior_description": "Dog is playful and energetic, running around the yard...",
  "mood": "happy",
  "activity_level": "high",
  "concerns": "None observed",
  "analyzed_at": "2025-12-06T..."
}
```

## Troubleshooting

### Issue: "Analysis not found" (404)
**Solution**: Analysis takes time. Frontend polls for up to 1 minute. If still not found, check backend logs.

### Issue: "No SUPABASE_SERVICE_KEY"
**Solution**: Set the service role key in `server/.env` (not anon key)

### Issue: Video upload fails
**Solution**: 
- Check file size < 50MB
- Ensure `videos` bucket exists in Supabase Storage
- Check CORS settings in backend

### Issue: AI analysis returns "unknown"
**Solution**:
- Verify `GEMINI_API_KEY` is set and valid
- Check Google API quota limits
- Backend logs show actual error

## Features Implemented

✅ Video upload with drag-and-drop
✅ Real-time file preview with video player
✅ AI-powered behavior analysis
✅ Results stored in database
✅ Upload progress indicator
✅ Error handling and user feedback
✅ Async processing (non-blocking)
✅ Poll-based result retrieval

## Future Enhancements

- [ ] Batch video upload
- [ ] Video gallery with filter by mood/activity
- [ ] Historical trend analysis
- [ ] Vet alerts based on concerning behaviors
- [ ] Video sharing with vets
- [ ] Multiple AI provider support (OpenAI, Claude, etc.)

## Security Notes

- **Service Key**: Keep `SUPABASE_SERVICE_KEY` private (never commit to git)
- **Storage**: Videos are stored per-user in Supabase Storage
- **RLS**: Row-level security enforces user-only access
- **File Validation**: Backend should validate file type and size
- **Rate Limiting**: Consider adding rate limits to prevent abuse

## Performance Tips

- Videos are stored in optimized Supabase Storage (CDN-backed)
- Analysis happens asynchronously (non-blocking uploads)
- Frontend caches analysis results
- Consider video compression before upload

## Support

For issues, check:
1. Browser console for frontend errors
2. `server/server.js` logs for backend errors
3. Supabase Dashboard → Logs for database issues
4. Google Cloud Console for Gemini API status
