"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Navigate } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  Heart, 
  Activity, 
  Clock, 
  Zap,
  TrendingUp,
  Settings,
  AlertCircle,
  CheckCircle,
  Video,
  Camera,
  BarChart3,
  Shield,
  Calendar,
  Loader
} from "lucide-react"
import { motion } from "framer-motion"
import { analyzeVideoWithGemini, getMockAnalysis } from "@/services/geminiAPI"
import { searchNearbyVets, getUserLocation } from "@/services/locationAPI"
import { createAlertFromAnalysis, addAlerts } from "@/services/alertsService"
import type { Veterinarian } from "@/services/locationAPI"
import type { AnalysisResult } from "@/services/alertsService"
import type { Pet } from "@/data/petData"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const [uploadedVideos, setUploadedVideos] = useState<AnalysisResult[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [nearbyVets, setNearbyVets] = useState<Veterinarian[]>([])
  const [isLoadingVets, setIsLoadingVets] = useState(false)

  // Load nearby vets on component mount
  useEffect(() => {
    const loadVets = async () => {
      setIsLoadingVets(true)
      try {
        const location = await getUserLocation()
        if (location.latitude && location.longitude) {
          const vets = await searchNearbyVets(location.latitude, location.longitude, 10)
          setNearbyVets(vets)
        } else {
          // No location available, skip loading vets
          setNearbyVets([])
        }
      } catch (error) {
        console.error("Error loading vets:", error)
        setNearbyVets([])
      } finally {
        setIsLoadingVets(false)
      }
    }

    loadVets()
  }, [])

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith("video/")) {
        setVideoFile(file)
        console.log("Video selected:", file.name)
      } else {
        alert("Please upload a valid video file")
      }
    }
  }

  const handleAnalyzeVideo = async () => {
    if (!videoFile) {
      alert("Please select a video first")
      return
    }

    setIsAnalyzing(true)
    
    try {
      // Try to use Gemini API, fallback to mock if not available
      let analysis
      try {
        analysis = await analyzeVideoWithGemini(videoFile)
      } catch (error) {
        console.warn("Gemini API unavailable, using mock analysis:", error)
        // Simulate analysis delay with mock
        await new Promise(resolve => setTimeout(resolve, 2000))
        analysis = getMockAnalysis()
      }
      
      const result: AnalysisResult = {
        ...analysis,
        duration: "2m 34s",
        uploadedAt: new Date().toLocaleString(),
        id: Date.now(),
        fileName: videoFile.name
      }
      
      setAnalysisResult(result)
      setUploadedVideos([...uploadedVideos, result])
      
      // Generate alerts from analysis and save them
      if (user) {
        const petName = user.user_metadata?.petName || "Your Pet"
        const currentPet: Pet = { 
          id: user.id, 
          name: petName, 
          image: "🐾",
          breed: "Pet",
          age: 1,
          type: (user.user_metadata?.petType || "dog") as "dog" | "cat" | "bird" | "rabbit",
          mood: "happy" as const,
          lastActivity: new Date().toISOString()
        }
        
        const generatedAlerts = createAlertFromAnalysis(result, currentPet)
        addAlerts(generatedAlerts)
        
        console.log(`✅ Created ${generatedAlerts.length} alerts from analysis`)
      }
      
      setVideoFile(null)
    } catch (error) {
      console.error("Analysis error:", error)
      alert("Failed to analyze video. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center"
        >
          <div className="mb-4 text-6xl">🐾</div>
          <p className="text-xl text-white">Loading your dashboard...</p>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/signup" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome back, {user?.user_metadata?.full_name || "Friend"}! 👋
              </h1>
              <p className="text-gray-600 mt-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            <div className="text-right">
              <Badge className="bg-green-100 text-green-800 border-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Account Active
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-lg transition-all hover:border-blue-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Pet's Mood</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">Happy</p>
                    <p className="text-xs text-gray-500 mt-1">+12% from yesterday</p>
                  </div>
                  <div className="bg-blue-100 p-4 rounded-lg">
                    <Heart className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-lg transition-all hover:border-green-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Activity Level</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">8.2k</p>
                    <p className="text-xs text-gray-500 mt-1">Steps today</p>
                  </div>
                  <div className="bg-green-100 p-4 rounded-lg">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-lg transition-all hover:border-purple-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Sleep Quality</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">8.5h</p>
                    <p className="text-xs text-gray-500 mt-1">Last night</p>
                  </div>
                  <div className="bg-purple-100 p-4 rounded-lg">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-lg transition-all hover:border-orange-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Health Score</p>
                    <p className="text-3xl font-bold text-orange-600 mt-2">92%</p>
                    <p className="text-xs text-gray-500 mt-1">Excellent</p>
                  </div>
                  <div className="bg-orange-100 p-4 rounded-lg">
                    <Shield className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 rounded-lg p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="video" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <Video className="h-4 w-4 mr-2" />
              Video Analysis
            </TabsTrigger>
            <TabsTrigger value="health" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <Heart className="h-4 w-4 mr-2" />
              Health
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Account Info */}
              <Card className="lg:col-span-2">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Account Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-gray-600">Email Address</span>
                    <span className="font-semibold text-gray-900">{user?.email}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-gray-600">Full Name</span>
                    <span className="font-semibold text-gray-900">{user?.user_metadata?.full_name || "Not set"}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-semibold text-gray-900">Dec 2025</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Account Status</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        alert(`Photo selected: ${file.name}`);
                      }
                    }}
                  />
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>

                  <input
                    type="file"
                    id="video-upload"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setVideoFile(file);
                        setActiveTab('video');
                      }
                    }}
                  />
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => document.getElementById('video-upload')?.click()}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Upload Video
                  </Button>

                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => window.location.href = '/vet-finder'}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Find Vets
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {uploadedVideos.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No activity yet. Upload a video to get started!</p>
                  ) : (
                    uploadedVideos.map((video, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded">
                            <Video className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{video.fileName}</p>
                            <p className="text-sm text-gray-500">{video.uploadedAt}</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">{Math.round(video.confidence * 100)}% Confidence</Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Video Analysis Tab */}
          <TabsContent value="video" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upload Section */}
              <Card className="lg:col-span-2">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-purple-600" />
                    Video Upload & Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <label className="cursor-pointer">
                        <span className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                          Click to upload
                        </span>
                        <span className="text-gray-600"> or drag and drop</span>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-2">MP4, WebM, or Ogg (up to 500MB)</p>
                    </div>

                    {/* Selected Video Info */}
                    {videoFile && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          {videoFile.name}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          Size: {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}

                    {/* Analyze Button */}
                    <Button
                      onClick={handleAnalyzeVideo}
                      disabled={!videoFile || isAnalyzing}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-6 text-lg"
                    >
                      {isAnalyzing ? (
                        <>
                          <Zap className="h-5 w-5 mr-2 animate-spin" />
                          Analyzing Video...
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5 mr-2" />
                          Analyze Video with AI
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Results */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-base">Latest Analysis</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {analysisResult ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xs text-green-700 font-semibold">MOOD</p>
                        <p className="text-2xl font-bold text-green-700 mt-1">{analysisResult.mood}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-700 font-semibold">CONFIDENCE</p>
                        <p className="text-2xl font-bold text-blue-700 mt-1">{Math.round(analysisResult.confidence * 100)}%</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-xs text-purple-700 font-semibold">ENERGY LEVEL</p>
                        <p className="text-lg font-bold text-purple-700 mt-1">{analysisResult.energy}</p>
                      </div>
                      <div className="pt-4 border-t">
                        <p className="text-xs text-gray-600 font-semibold mb-2">RECOMMENDATIONS</p>
                        <ul className="space-y-2">
                          {analysisResult.recommendations.map((rec: string, i: number) => (
                            <li key={i} className="text-sm text-gray-700 flex gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Video className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">Upload and analyze a video to see results</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Health Tab */}
          <TabsContent value="health" className="space-y-6 mt-6">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  Health Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-700 font-semibold">Heart Rate</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">78 BPM</p>
                    <p className="text-xs text-red-600 mt-2">Normal range</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 font-semibold">Temperature</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">38.5°C</p>
                    <p className="text-xs text-blue-600 mt-2">Healthy</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700 font-semibold">Hydration</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">85%</p>
                    <p className="text-xs text-green-600 mt-2">Well hydrated</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-700 font-semibold">Nutrition</p>
                    <p className="text-3xl font-bold text-orange-600 mt-2">92%</p>
                    <p className="text-xs text-orange-600 mt-2">Excellent</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Health Alerts */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-base">Health Alerts</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 font-medium">
                    All vitals are within normal range
                  </AlertDescription>
                </Alert>
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700 font-medium">
                    Next vet checkup scheduled for Jan 15, 2026
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            {/* Nearby Vets */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  Nearby Veterinarians
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoadingVets ? (
                  <div className="text-center py-8">
                    <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-gray-600">Loading nearby vets...</p>
                  </div>
                ) : nearbyVets.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No veterinarians found. Showing mock data.</p>
                ) : null}
                <div className="space-y-3">
                  {nearbyVets.map((vet, i) => (
                    <div key={i} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{vet.name}</p>
                          <p className="text-sm text-gray-600 mt-1">{vet.address}</p>
                          {vet.phone && (
                            <p className="text-sm text-gray-600">{vet.phone}</p>
                          )}
                          {vet.website && (
                            <a 
                              href={vet.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {vet.website}
                            </a>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <Badge className={vet.open ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {vet.open ? "Open" : "Closed"}
                          </Badge>
                          <p className="text-sm font-semibold text-gray-900 mt-2">{vet.distance}</p>
                          {vet.rating && (
                            <p className="text-sm font-semibold text-gray-900">⭐ {vet.rating}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  Settings & Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Health Alerts</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Activity Updates</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Vet Reminders</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-semibold text-gray-900">Privacy</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Share Activity Data</span>
                      <input type="checkbox" className="w-4 h-4 rounded" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Public Profile</span>
                      <input type="checkbox" className="w-4 h-4 rounded" />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <Button variant="destructive" className="w-full">
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}
