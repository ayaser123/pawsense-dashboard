import { useState } from 'react';
import { useAuth } from './useAuth';
import apiClient from '@/lib/api';

interface VideoAnalysis {
  id: string;
  video_id: string;
  behavior_description: string;
  mood: string;
  activity_level: string;
  concerns: string;
  analyzed_at: string;
}

interface VideoUploadResponse {
  success: boolean;
  videoId: string;
  url: string;
  message: string;
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
  message?: string;
}

export function useVideoAnalysis() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadVideo = async (file: File, petId?: string): Promise<VideoUploadResponse | null> => {
    if (!user) {
      setError('Not authenticated');
      return null;
    }

    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('video', file);
      if (petId) {
        formData.append('petId', petId);
      }

      // Upload to backend
      const response = await apiClient.post('/api/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        },
      });

      setIsAnalyzing(true);

      // Poll for analysis results (with timeout)
      let analysisData: VideoAnalysis | null = null;
      let attempts = 0;
      const maxAttempts = 30; // 30 * 2 seconds = 1 minute max wait

      while (attempts < maxAttempts) {
        try {
          const analysisResponse = await apiClient.get(
            `/api/videos/${response.data.videoId}/analysis`
          );
          if (analysisResponse.data) {
            analysisData = analysisResponse.data;
            break;
          }
        } catch (err) {
          // Analysis not ready yet
        }

        // Wait 2 seconds before retrying
        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempts++;
      }

      if (analysisData) {
        setAnalysis(analysisData);
      } else {
        // Analysis still pending, but upload was successful
        console.log('Analysis pending - will be available shortly');
      }

      setIsAnalyzing(false);
      return response.data;
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const errorMessage = apiErr.response?.data?.error || apiErr.message || 'Upload failed';
      setError(errorMessage);
      setIsAnalyzing(false);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const getAnalysis = async (videoId: string): Promise<VideoAnalysis | null> => {
    try {
      setError(null);
      const response = await apiClient.get(`/api/videos/${videoId}/analysis`);
      setAnalysis(response.data);
      return response.data;
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      const errorMessage = apiErr.response?.data?.error || 'Failed to fetch analysis';
      setError(errorMessage);
      return null;
    }
  };

  const clearAnalysis = () => {
    setAnalysis(null);
    setError(null);
    setUploadProgress(0);
  };

  return {
    uploadVideo,
    getAnalysis,
    clearAnalysis,
    analysis,
    error,
    isUploading,
    isAnalyzing,
    uploadProgress,
  };
}
