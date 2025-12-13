"use client"

import { useState, useMemo, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Navigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { PetSelector } from "@/components/dashboard/PetSelector"
import { ImageUpload } from "@/components/dashboard/ImageUpload"
import { AddPetDialog } from "@/components/dashboard/AddPetDialog"
import { SoundTranslator } from "@/components/dashboard/SoundTranslator"
import { SleepTracker } from "@/components/dashboard/SleepTracker"
import { PredictionsTable } from "@/components/dashboard/PredictionsTable"
import { EmergencyAlert } from "@/components/dashboard/EmergencyAlert"
import { TelehealthConnect } from "@/components/dashboard/TelehealthConnect"
import { GPSActivityMap } from "@/components/dashboard/GPSActivityMap"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { sampleVets } from "@/data/petData"
import { useNearbyVets } from "@/hooks/useNearbyVets"
import { usePets, type Pet } from "@/hooks/usePets"
import { useVideoAnalysis } from "@/hooks/useVideoAnalysis"
import { useLocations } from "@/hooks/useLocation"
import { useSleepData } from "@/hooks/useSleepData"
import { useLocationMaps } from "@/hooks/useLocationMaps"
import { useGeminiAI } from "@/hooks/useGeminiAI"
import {
  MapPin,
  Activity,
  Sparkles,
  Heart,
  AlertCircle,
  Zap,
  TrendingUp,
  Clock,
  Award,
  RefreshCw,
  Navigation,
} from "lucide-react"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const { pets, loading: petsLoading } = usePets()
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [mapMode, setMapMode] = useState<"vet" | "activity">("vet")
  const { analysis } = useVideoAnalysis()
  const { activityPath, recordLocation, startTracking, stopTracking } = useLocations()
  const [isTracking, setIsTracking] = useState(false)
  const { chartData: sleepChartData, sleepQuality, totalSleep } = useSleepData(selectedPet?.id)
  const { vets, userLocation: mapsUserLocation, getUserLocation, findNearbyVets, isLoading: mapsLoading } = useLocationMaps()
  const { analyzePetBehavior, isLoading: aiLoading } = useGeminiAI()
  const [aiInsights, setAiInsights] = useState<any>(null)
  const [healthTips, setHealthTips] = useState<string[]>([])

  useEffect(() => {
    if (pets.length > 0 && !selectedPet) {
      setSelectedPet(pets[0])
    }
  }, [pets, selectedPet])

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude] as [number, number]
        setUserLocation(coords)
        recordLocation(pos.coords.latitude, pos.coords.longitude)
      },
      () => {
        console.log("[Dashboard] Geolocation permission denied or unavailable")
      }
    )
  }, [recordLocation])

  // Auto-fetch vets when location is available
  useEffect(() => {
    if (mapsUserLocation) {
      findNearbyVets(mapsUserLocation.lat, mapsUserLocation.lng)
    }
  }, [mapsUserLocation, findNearbyVets])

  const handleTrackingChange = (tracking: boolean) => {
    setIsTracking(tracking)
    if (tracking) {
      startTracking()
      console.log("[Dashboard] GPS tracking started")
    } else {
      stopTracking()
      console.log("[Dashboard] GPS tracking stopped")
    }
  }

  // Analyze pet behavior with Gemini
  const handleAnalyzeWithAI = async () => {
    if (!selectedPet) return

    const behaviorDescription = analysis?.behavior_description || "Normal activity detected"
    const context = `Recent mood: ${analysis?.mood || "calm"}, Activity level: normal`

    const result = await analyzePetBehavior(behaviorDescription, selectedPet.species || "dog", selectedPet.age || 0, context)

    if (result) {
      setAiInsights(result)
    }
  }

  const { vets: nearbyVets, loading: vetsLoading } = useNearbyVets(userLocation)

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    const petName = selectedPet?.name || "Your Pet"

    const defaultGreeting = `Welcome back! Let's analyze ${petName}'s behavior.`

    if (!analysis) {
      return { time: hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening", mood: defaultGreeting }
    }

    const moodGreetings: Record<string, string> = {
      happy: `${petName} is feeling great today!`,
      calm: `${petName} is relaxed and peaceful.`,
      anxious: `${petName} seems a bit anxious. Consider some playtime!`,
      playful: `${petName} is full of energy!`,
      sick: `${petName} needs care. Consult a vet.`,
    }

    return {
      time: hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening",
      mood: moodGreetings[analysis.mood] || defaultGreeting,
    }
  }, [selectedPet, analysis])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">🐾</div>
          <p className="text-lg text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/signup" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header with Greeting */}
        <section className="mb-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gradient bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  {greeting.time}, {user?.user_metadata?.full_name || "Friend"}!
                </h1>
                <p className="text-lg text-muted-foreground mt-2 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  {greeting.mood}
                </p>
              </div>
              <AddPetDialog />
            </div>
          </motion.div>
        </section>

        {/* Pet Selector and Quick Stats */}
        <section className="mb-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <PetSelector pets={pets} selectedPet={selectedPet} onSelectPet={setSelectedPet} />

            {/* Quick Stats Cards */}
            {selectedPet && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Mood</p>
                        <p className="text-2xl font-bold capitalize">{analysis?.mood || "Calm"}</p>
                      </div>
                      <Heart className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Activity</p>
                        <p className="text-2xl font-bold">Tracking</p>
                      </div>
                      <Activity className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Sleep</p>
                        <p className="text-2xl font-bold">{totalSleep || "N/A"}</p>
                      </div>
                      <Clock className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Health</p>
                        <p className="text-2xl font-bold">Good</p>
                      </div>
                      <Award className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </section>

        {/* Main Content Grid */}
        <section className="mb-8">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Analysis & Tools */}
            <motion.div variants={itemVariants} className="lg:col-span-3 space-y-6">
              <ImageUpload onImageSelect={() => {}} />
              <SoundTranslator />
              <TelehealthConnect />
            </motion.div>

            {/* Center Column - Maps */}
            <motion.div variants={itemVariants} className="lg:col-span-6 space-y-6">
              <div className="sticky top-24">
                <Tabs value={mapMode} onValueChange={(v) => setMapMode(v as "vet" | "activity")} className="space-y-4">
                  <TabsList className="w-full bg-gradient-to-r from-primary/10 to-purple-600/10">
                    <TabsTrigger value="vet" className="flex-1 gap-2">
                      <MapPin className="h-4 w-4" />
                      Vet Finder
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="flex-1 gap-2">
                      <Activity className="h-4 w-4" />
                      Activity Map
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="vet" className="space-y-4">
                    <GPSActivityMap
                      mode="vet"
                      vets={vets.length > 0 ? vets : nearbyVets.length > 0 ? nearbyVets : sampleVets}
                      userLocation={userLocation}
                    />
                    {mapsLoading && <p className="text-center text-sm text-muted-foreground">Loading nearby vets...</p>}
                  </TabsContent>

                  <TabsContent value="activity" className="space-y-4">
                    <GPSActivityMap
                      mode="activity"
                      activityPath={activityPath}
                      userLocation={userLocation}
                      isTracking={isTracking}
                      onTrackingChange={handleTrackingChange}
                    />
                    <Button
                      onClick={() => handleTrackingChange(!isTracking)}
                      className="w-full"
                      variant={isTracking ? "destructive" : "default"}
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      {isTracking ? "Stop Tracking" : "Start Tracking"}
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>

            {/* Right Column - Insights & AI */}
            <motion.div variants={itemVariants} className="lg:col-span-3 space-y-6">
              {selectedPet && (
                <>
                  <EmergencyAlert
                    pet={{
                      id: selectedPet.id,
                      name: selectedPet.name,
                      type: selectedPet.species as "dog" | "cat" | "bird" | "rabbit",
                      breed: selectedPet.breed || "Mixed",
                      age: selectedPet.age || 0,
                      image: selectedPet.image_emoji || "🐾",
                      mood: (() => {
                        if (!analysis) return "calm"
                        const concerns = (analysis.concerns || "").toLowerCase()
                        if (analysis.mood === "sick" || concerns.includes("sick") || concerns.includes("ill")) return "sick"
                        if (analysis.mood === "happy") return "happy"
                        if (analysis.mood === "calm") return "calm"
                        if (analysis.mood === "anxious") return "anxious"
                        return "playful"
                      })(),
                      lastActivity: new Date().toISOString(),
                    }}
                    nearestVet={{
                      name: (vets && vets[0]?.name) || nearbyVets[0]?.name || "Happy Paws",
                      distance: (vets && vets[0]?.distance?.toString()) || nearbyVets[0]?.distance || "0.8 km",
                      phone: (vets && vets[0]?.phone) || nearbyVets[0]?.phone || "+1-555-0123",
                      address: (vets && vets[0]?.address) || nearbyVets[0]?.address || "123 Main St",
                      lat: (vets && vets[0]?.lat) || nearbyVets[0]?.lat || null,
                      lng: (vets && vets[0]?.lng) || nearbyVets[0]?.lng || null,
                    }}
                  />

                  {/* AI Insights Card */}
                  <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                        AI Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {aiInsights ? (
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-semibold text-muted-foreground mb-2">Analysis</p>
                            <p className="text-sm">{aiInsights.analysis}</p>
                          </div>
                          {aiInsights.recommendations && (
                            <div>
                              <p className="text-sm font-semibold text-muted-foreground mb-2">Recommendations</p>
                              <ul className="text-sm space-y-1">
                                {aiInsights.recommendations.map((rec: string, i: number) => (
                                  <li key={i} className="flex gap-2">
                                    <span className="text-primary">✓</span>
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <Badge variant="secondary" className="w-fit">
                            Confidence: {aiInsights.confidence}%
                          </Badge>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Run AI analysis to get personalized insights about {selectedPet.name}.</p>
                      )}
                      <Button onClick={handleAnalyzeWithAI} disabled={aiLoading} className="w-full" size="sm">
                        {aiLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                        {aiLoading ? "Analyzing..." : "Analyze with AI"}
                      </Button>
                    </CardContent>
                  </Card>

                  {analysis && (
                    <>
                      <SleepTracker data={sleepChartData} sleepQuality={sleepQuality} totalSleep={totalSleep} />
                      <PredictionsTable
                        predictions={[
                          {
                            id: "1",
                            behavior: analysis.behavior_description || "Video analysis pending",
                            confidence: 0.95,
                            mood: analysis.mood,
                            timestamp: new Date().toISOString(),
                            recommendation: analysis.concerns || "Monitor behavior regularly",
                          },
                        ]}
                      />
                    </>
                  )}

                  {!analysis && (
                    <Card className="border-dashed">
                      <CardHeader>
                        <CardTitle className="text-base">Quick Start</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Upload a video in the Image Upload section to start analyzing {selectedPet.name}'s behavior!
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  )
}


  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    const petName = selectedPet?.name || "Your Pet"

    const defaultGreeting = `Welcome back! Let's analyze ${petName}'s behavior.`

    if (!analysis) {
      return { time: hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening", mood: defaultGreeting }
    }

    const moodGreetings: Record<string, string> = {
      happy: `${petName} is feeling great today!`,
      calm: `${petName} is relaxed and peaceful.`,
      anxious: `${petName} might need some comfort.`,
      sick: `${petName} needs attention. Let's find help nearby.`,
      playful: `${petName} is ready for some fun!`,
      playful_and_energetic: `${petName} is full of energy!`,
    }

    const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"
    return {
      time: timeGreeting,
      mood: moodGreetings[analysis.mood] || `${petName}: ${analysis.mood}`,
    }
  }, [selectedPet, analysis])

  const handleImageSelect = (file: File) => {
    console.log("Selected file:", file.name)
  }

  if (!user) {
    return <Navigate to="/signup" replace />
  }

  if (petsLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Navbar />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}>
          <Sparkles className="h-12 w-12 text-primary" />
        </motion.div>
      </div>
    )
  }

  if (pets.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                No Pets Yet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                Start by adding your first pet to get insights into their behavior and health.
              </p>
              <AddPetDialog />
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20 pb-8">
        <section className="gradient-hero py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">AI-Powered Pet Care</span>
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
                {greeting.time}, Pet Parent!
              </h1>
              <p className="text-muted-foreground text-lg flex items-center justify-center gap-2">
                <Heart className="h-5 w-5 text-primary fill-primary/30" />
                {greeting.mood}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <div className="grid grid-cols-1 gap-4">
                {selectedPet && <PetSelector pets={pets} selectedPet={selectedPet} onSelect={setSelectedPet} />}
                <AddPetDialog onPetAdded={(pet) => setSelectedPet(pet)} />
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <motion.div variants={itemVariants} className="lg:col-span-3 space-y-6">
              <ImageUpload onImageSelect={handleImageSelect} />
              <SoundTranslator />
              <TelehealthConnect />
            </motion.div>

            <motion.div variants={itemVariants} className="lg:col-span-6">
              <div className="sticky top-24">
                <Tabs value={mapMode} onValueChange={(v) => setMapMode(v as "vet" | "activity")} className="space-y-4">
                  <TabsList className="w-full">
                    <TabsTrigger value="vet" className="flex-1 gap-2">
                      <MapPin className="h-4 w-4" />
                      Vet Finder
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="flex-1 gap-2">
                      <Activity className="h-4 w-4" />
                      Activity
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="vet">
                    <GPSActivityMap mode="vet" vets={vets.length ? vets : sampleVets} userLocation={userLocation} />
                  </TabsContent>
                  <TabsContent value="activity">
                    <GPSActivityMap
                      mode="activity"
                      activityPath={activityPath}
                      userLocation={userLocation}
                      isTracking={isTracking}
                      onTrackingChange={handleTrackingChange}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="lg:col-span-3 space-y-6">
              {selectedPet && (
                <>
                  <EmergencyAlert
                    pet={{
                      id: selectedPet.id,
                      name: selectedPet.name,
                      type: selectedPet.species as "dog" | "cat" | "bird" | "rabbit",
                      breed: selectedPet.breed || "Mixed",
                      age: selectedPet.age || 0,
                      image: selectedPet.image_emoji || "🐾",
                      mood: (() => {
                        if (!analysis) return "calm"
                        const concerns = (analysis.concerns || "").toLowerCase()
                        if (
                          analysis.mood === "sick" ||
                          concerns.includes("sick") ||
                          concerns.includes("ill") ||
                          concerns.includes("injur")
                        ) {
                          return "sick"
                        }
                        if (analysis.mood === "happy") return "happy"
                        if (analysis.mood === "calm") return "calm"
                        if (analysis.mood === "anxious") return "anxious"
                        return "playful"
                      })(),
                      lastActivity: new Date().toISOString(),
                    }}
                    nearestVet={{
                      name: (vets && vets[0]?.name) || sampleVets[0]?.name || "Happy Paws",
                      distance: (vets && vets[0]?.distance?.toString()) || sampleVets[0]?.distance || "0.8 km",
                      phone: (vets && vets[0]?.phone) || sampleVets[0]?.phone || "+1-555-0123",
                      address: (vets && vets[0]?.address) || sampleVets[0]?.address || "123 Main St",
                      lat: (vets && vets[0]?.lat) || sampleVets[0]?.lat || null,
                      lng: (vets && vets[0]?.lng) || sampleVets[0]?.lng || null,
                    }}
                  />

                  {analysis && (
                    <>
                      <SleepTracker data={sleepChartData} sleepQuality={sleepQuality} totalSleep={totalSleep} />
                      <PredictionsTable
                        predictions={[
                          {
                            id: "1",
                            behavior: analysis.behavior_description || "Video analysis pending",
                            confidence: 0.95,
                            mood: analysis.mood,
                            timestamp: new Date().toISOString(),
                            recommendation: analysis.concerns || "Monitor behavior regularly",
                          },
                        ]}
                      />
                    </>
                  )}

                  {!analysis && (
                    <Card variant="elevated">
                      <CardHeader>
                        <CardTitle className="text-base">Analysis Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Upload a video and run AI analysis to see insights about {selectedPet.name}'s behavior here.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
