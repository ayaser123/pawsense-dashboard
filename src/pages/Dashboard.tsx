"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { usePets } from "@/hooks/usePets"
import { Navigate } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { AddPetDialog } from "@/components/dashboard/AddPetDialog"
import { PetSelector } from "@/components/dashboard/PetSelector"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert as AlertUI, AlertDescription } from "@/components/ui/alert"
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
  Loader,
  Plus,
  Dog,
  MapPin,
  Sparkles
} from "lucide-react"
import { motion } from "framer-motion"
import { analyzeVideoWithGemini, getMockAnalysis } from "@/services/geminiAPI"
import { searchNearbyVets, getUserLocation } from "@/services/locationAPI"
import { createAlertFromAnalysis, addAlerts, loadAlerts, deleteAlert } from "@/services/alertsService"
import type { Veterinarian } from "@/services/locationAPI"
import type { AnalysisResult, Alert } from "@/services/alertsService"
import type { Pet } from "@/hooks/usePets"

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
  const { pets, loading: petsLoading, addPet: addPetToHook } = usePets()
  const [uploadedVideos, setUploadedVideos] = useState<AnalysisResult[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [nearbyVets, setNearbyVets] = useState<Veterinarian[]>([])
  const [isLoadingVets, setIsLoadingVets] = useState(false)
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])

  // Load nearby vets on component mount
  useEffect(() => {
    if (pets.length > 0 && !selectedPet) {
      setSelectedPet(pets[0])
    }
  }, [pets, selectedPet])

  // Load alerts on component mount
  useEffect(() => {
    const loadedAlerts = loadAlerts()
    setAlerts(loadedAlerts)
  }, [])

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
      if (user && selectedPet) {
        const generatedAlerts = createAlertFromAnalysis(result, selectedPet)
        const savedAlerts = addAlerts(generatedAlerts)
        setAlerts(savedAlerts)
        
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

  if (authLoading || petsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-6xl"
          >
            🐾
          </motion.div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-foreground">PawSense</p>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
          <div className="flex justify-center gap-1">
            <motion.div
              animate={{ height: [4, 16, 4] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="w-1 bg-primary rounded-full"
            />
            <motion.div
              animate={{ height: [4, 16, 4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
              className="w-1 bg-accent rounded-full"
            />
            <motion.div
              animate={{ height: [4, 16, 4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
              className="w-1 bg-primary rounded-full"
            />
          </div>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/signup" />
  }

  // Show empty state if no pets
  if (!petsLoading && pets.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center min-h-[600px]"
          >
            <div className="text-center max-w-md space-y-8">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Dog className="h-24 w-24 text-primary mx-auto" />
              </motion.div>
              
              <div className="space-y-3">
                <h1 className="text-3xl font-bold">Welcome to PawSense!</h1>
                <p className="text-muted-foreground text-base">
                  Get started by adding your first pet. We'll help you understand their behavior, track their health, and find the best vets nearby.
                </p>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="font-semibold text-sm">AI-Powered Analysis</p>
                    <p className="text-xs text-muted-foreground">Understand your pet's mood and behavior</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="font-semibold text-sm">Find Vets Near You</p>
                    <p className="text-xs text-muted-foreground">Discover trusted veterinarians in your area</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BarChart3 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="font-semibold text-sm">Health Tracking</p>
                    <p className="text-xs text-muted-foreground">Monitor activities and health metrics</p>
                  </div>
                </div>
              </div>

              <AddPetDialog onPetAdded={() => window.location.reload()} />
            </div>
          </motion.div>
        </main>
        
        <Footer />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/signup" />
  }

  return (
    <div className="min-h-screen bg-background">
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
              <h1 className="text-3xl font-bold">
                Welcome back, {user?.user_metadata?.full_name || "Friend"}!
              </h1>
              <p className="text-muted-foreground mt-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            <div className="text-right">
              <AddPetDialog onPetAdded={() => window.location.reload()} />
            </div>
          </div>

          {/* Pet Selector */}
          {selectedPet && pets.length > 0 && (
            <div className="mb-6">
              <PetSelector 
                pets={pets} 
                selectedPet={selectedPet} 
                onSelect={setSelectedPet}
              />
            </div>
          )}
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Pet's Mood</p>
                    <p className="text-3xl font-bold mt-2">Happy</p>
                    <p className="text-xs text-muted-foreground mt-1">+12% from yesterday</p>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Activity Level</p>
                    <p className="text-3xl font-bold mt-2">8.2k</p>
                    <p className="text-xs text-muted-foreground mt-1">Steps today</p>
                  </div>
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <Activity className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Sleep Quality</p>
                    <p className="text-3xl font-bold mt-2">8.5h</p>
                    <p className="text-xs text-muted-foreground mt-1">Last night</p>
                  </div>
                  <div className="bg-secondary/10 p-4 rounded-lg">
                    <Clock className="h-6 w-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Health Score</p>
                    <p className="text-3xl font-bold mt-2">92%</p>
                    <p className="text-xs text-muted-foreground mt-1">Excellent</p>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="video">
              <Video className="h-4 w-4 mr-2" />
              Video Analysis
            </TabsTrigger>
            <TabsTrigger value="health">
              <Heart className="h-4 w-4 mr-2" />
              Health
            </TabsTrigger>
            <TabsTrigger value="settings">
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
                    <Shield className="h-5 w-5" />
                    Account Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-muted-foreground">Email Address</span>
                    <span className="font-semibold text-gray-900">{user?.email}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-muted-foreground">Full Name</span>
                    <span className="font-semibold">{user?.user_metadata?.full_name || "Not set"}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-muted-foreground">Member Since</span>
                    <span className="font-semibold">Dec 2025</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Account Status</span>
                    <Badge>Active</Badge>
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
                    className="w-full"
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
                    className="w-full"
                    onClick={() => document.getElementById('video-upload')?.click()}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Upload Video
                  </Button>

                  <Button 
                    className="w-full"
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
                  <TrendingUp className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {uploadedVideos.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No activity yet. Upload a video to get started!</p>
                  ) : (
                    uploadedVideos.map((video, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded">
                            <Video className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{video.fileName}</p>
                            <p className="text-sm text-muted-foreground">{video.uploadedAt}</p>
                          </div>
                        </div>
                        <Badge>{Math.round(video.confidence * 100)}% Confidence</Badge>
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
                    <Video className="h-5 w-5" />
                    Video Upload & Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-input rounded-lg p-8 text-center hover:border-primary transition">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <label className="cursor-pointer">
                        <span className="text-sm font-semibold text-primary hover:text-primary/90">
                          Click to upload
                        </span>
                        <span className="text-muted-foreground"> or drag and drop</span>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-muted-foreground mt-2">MP4, WebM, or Ogg (up to 500MB)</p>
                    </div>

                    {/* Selected Video Info */}
                    {videoFile && (
                      <div className="p-4 bg-muted rounded-lg border border-input">
                        <p className="text-sm font-semibold flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          {videoFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Size: {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}

                    {/* Analyze Button */}
                    <Button
                      onClick={handleAnalyzeVideo}
                      disabled={!videoFile || isAnalyzing}
                      className="w-full font-semibold py-6 text-lg"
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
                      <div className="p-3 bg-muted rounded-lg border border-input">
                        <p className="text-xs font-semibold">MOOD</p>
                        <p className="text-2xl font-bold text-primary mt-1">{analysisResult.mood}</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg border border-input">
                        <p className="text-xs font-semibold">CONFIDENCE</p>
                        <p className="text-2xl font-bold text-primary mt-1">{Math.round(analysisResult.confidence * 100)}%</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg border border-input">
                        <p className="text-xs font-semibold">ENERGY LEVEL</p>
                        <p className="text-lg font-bold text-primary mt-1">{analysisResult.energy}</p>
                      </div>
                      <div className="pt-4 border-t">
                        <p className="text-xs font-semibold mb-2">RECOMMENDATIONS</p>
                        <ul className="space-y-2">
                          {analysisResult.recommendations.map((rec: string, i: number) => (
                            <li key={i} className="text-sm flex gap-2">
                              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Video className="h-12 w-12 text-muted mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">Upload and analyze a video to see results</p>
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
                  <Heart className="h-5 w-5" />
                  Health Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-muted rounded-lg border border-input">
                    <p className="text-sm font-semibold">Heart Rate</p>
                    <p className="text-3xl font-bold text-primary mt-2">78 BPM</p>
                    <p className="text-xs text-muted-foreground mt-2">Normal range</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg border border-input">
                    <p className="text-sm font-semibold">Temperature</p>
                    <p className="text-3xl font-bold text-primary mt-2">38.5°C</p>
                    <p className="text-xs text-muted-foreground mt-2">Healthy</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg border border-input">
                    <p className="text-sm font-semibold">Hydration</p>
                    <p className="text-3xl font-bold text-primary mt-2">85%</p>
                    <p className="text-xs text-muted-foreground mt-2">Well hydrated</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg border border-input">
                    <p className="text-sm font-semibold">Nutrition</p>
                    <p className="text-3xl font-bold text-primary mt-2">92%</p>
                    <p className="text-xs text-muted-foreground mt-2">Excellent</p>
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
                {alerts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No alerts yet. Upload a video for AI analysis to generate health alerts.
                  </p>
                ) : (
                  alerts.map((alert) => {
                    const iconColor =
                      alert.type === "critical" || alert.type === "warning"
                        ? "text-destructive"
                        : alert.type === "success"
                          ? "text-primary"
                          : "text-primary"
                    
                    const alertIcon =
                      alert.type === "critical" || alert.type === "warning" ? (
                        <AlertCircle className={`h-4 w-4 ${iconColor}`} />
                      ) : (
                        <CheckCircle className={`h-4 w-4 ${iconColor}`} />
                      )

                    return (
                      <div key={alert.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg border border-input">
                        {alertIcon}
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{alert.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            deleteAlert(alert.id)
                            setAlerts(alerts.filter(a => a.id !== alert.id))
                          }}
                          className="text-muted-foreground hover:text-foreground transition"
                        >
                          ✕
                        </button>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            {/* Nearby Vets */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Nearby Veterinarians
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoadingVets ? (
                  <div className="text-center py-8">
                    <Loader className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-muted-foreground">Loading nearby vets...</p>
                  </div>
                ) : nearbyVets.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No veterinarians found. Showing mock data.</p>
                ) : null}
                <div className="space-y-3">
                  {nearbyVets.map((vet, i) => (
                    <div key={i} className="p-4 border border-input rounded-lg hover:border-primary transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold">{vet.name}</p>
                          <p className="text-sm text-muted-foreground mt-1">{vet.address}</p>
                          {vet.phone && (
                            <p className="text-sm text-muted-foreground">{vet.phone}</p>
                          )}
                          {vet.website && (
                            <a 
                              href={vet.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              {vet.website}
                            </a>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <Badge variant={vet.open ? "default" : "secondary"}>
                            {vet.open ? "Open" : "Closed"}
                          </Badge>
                          <p className="text-sm font-semibold text-muted-foreground mt-2">{vet.distance}</p>
                          {vet.rating && (
                            <p className="text-sm font-semibold">⭐ {vet.rating}</p>
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
                  <Settings className="h-5 w-5" />
                  Settings & Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span>Health Alerts</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span>Activity Updates</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span>Vet Reminders</span>
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-semibold">Privacy</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span>Share Activity Data</span>
                      <input type="checkbox" className="w-4 h-4 rounded" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span>Public Profile</span>
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
