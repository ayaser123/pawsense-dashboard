"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { usePets } from "@/hooks/usePets"
import { Navigate } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { AddPetDialog } from "@/components/dashboard/AddPetDialog"
import { PetSelector } from "@/components/dashboard/PetSelector"
import { AlertsWindow, type AlertItem } from "@/components/dashboard/AlertsWindow"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert as AlertUI, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  Heart, 
  Activity, 
  Zap,
  AlertCircle,
  CheckCircle,
  Video,
  BarChart3,
  Calendar,
  Loader,
  Dog,
  MapPin,
  Sparkles
} from "lucide-react"
import { motion } from "framer-motion"
import { analyzeVideoWithGemini } from "@/services/geminiAPI"
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
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [alertsFromAnalysis, setAlertsFromAnalysis] = useState<AlertItem[]>([])

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
      console.log("[DASHBOARD] Starting video analysis...")
      const analysis = await analyzeVideoWithGemini(videoFile)
      
      const result: AnalysisResult = {
        ...analysis,
        duration: "2m 34s",
        uploadedAt: new Date().toLocaleString(),
        id: Date.now(),
        fileName: videoFile.name
      }
      
      setAnalysisResult(result)
      setUploadedVideos([...uploadedVideos, result])
      
      // Extract alerts from analysis response
      if (analysis.alerts && analysis.alerts.length > 0) {
        setAlertsFromAnalysis(analysis.alerts)
        console.log(`✅ Generated ${analysis.alerts.length} alerts from analysis`)
      }
      
      // Generate alerts from analysis and save them
      if (user && selectedPet) {
        const generatedAlerts = createAlertFromAnalysis(result, selectedPet)
        const savedAlerts = addAlerts(generatedAlerts)
        setAlerts(savedAlerts)
        
        console.log(`✅ Created ${generatedAlerts.length} alerts from analysis`)
      }
      
      // Keep video visible after analysis (commented out below)
      // setVideoFile(null)
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

        {/* Stats Grid - Only show after analysis */}
        {analysisResult && (
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
                    <p className="text-3xl font-bold mt-2 capitalize">{analysisResult.mood}</p>
                    <p className="text-xs text-muted-foreground mt-1">From latest analysis</p>
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
                    <p className="text-sm text-muted-foreground font-medium">Behavior</p>
                    <p className="text-3xl font-bold mt-2 capitalize">{analysisResult.behavior}</p>
                    <p className="text-xs text-muted-foreground mt-1">Detected</p>
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
                    <p className="text-sm text-muted-foreground font-medium">Energy Level</p>
                    <p className="text-3xl font-bold mt-2">{analysisResult.energy}</p>
                    <p className="text-xs text-muted-foreground mt-1">Current</p>
                  </div>
                  <div className="bg-secondary/10 p-4 rounded-lg">
                    <Zap className="h-6 w-6 text-secondary" />
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
                    <p className="text-sm text-muted-foreground font-medium">Confidence</p>
                    <p className="text-3xl font-bold mt-2">{(analysisResult.confidence * 100).toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground mt-1">Analysis accuracy</p>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
        )}

        {/* Alerts Window - Only show when alerts exist */}
        {alertsFromAnalysis.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold">Analysis Alerts</h3>
              </div>
              <AlertsWindow
                alerts={alertsFromAnalysis}
                onDismiss={(id) => {
                  setAlertsFromAnalysis(prev => prev.filter(a => a.id !== id))
                }}
              />
            </div>
          </motion.div>
        )}



        {/* Video Analysis Section */}
        <div className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Upload Component */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Pet Video
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">Select a video to analyze your pet's behavior</p>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 hover:border-primary/60 transition-colors">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                        id="video-upload"
                      />
                      <label htmlFor="video-upload" className="cursor-pointer block">
                        <div className="text-center">
                          <Video className="h-12 w-12 text-muted mx-auto mb-3" />
                          <p className="font-semibold">Click to select or drag and drop</p>
                          <p className="text-sm text-muted-foreground mt-1">MP4, WebM, or any video format</p>
                        </div>
                      </label>
                    </div>
                    
                    {videoFile && (
                      <div className="space-y-3">
                        {/* Video Preview */}
                        <div className="relative bg-black rounded-lg overflow-hidden">
                          <video
                            src={URL.createObjectURL(videoFile)}
                            controls
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-primary/90 text-white px-2 py-1 rounded text-xs font-semibold">
                            {(videoFile.size / 1024 / 1024).toFixed(1)}MB
                          </div>
                        </div>
                        
                        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                          <p className="text-sm font-medium">📹 {videoFile.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Ready to analyze
                          </p>
                        </div>
                        <Button
                          onClick={handleAnalyzeVideo}
                          disabled={isAnalyzing}
                          className="w-full"
                          size="lg"
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader className="h-4 w-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Analyze Video
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

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
        </div>
      </main>

      <Footer />
    </div>
  )
}
