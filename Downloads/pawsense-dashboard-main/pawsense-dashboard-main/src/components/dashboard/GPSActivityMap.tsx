"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type ActivityPoint, type VetLocation, sampleVets, sampleActivityPath } from "@/data/petData"
import { MapPin, Navigation, Phone, Star, Filter, Activity, Stethoscope, Locate, ZoomIn, ZoomOut } from "lucide-react"

interface GPSActivityMapProps {
  mode: "vet" | "activity"
  vets?: VetLocation[]
  activityPath?: ActivityPoint[]
  userLocation?: [number, number] | null
  isTracking?: boolean
  onTrackingChange?: (tracking: boolean) => void
}

export function GPSActivityMap({
  mode,
  vets = sampleVets,
  activityPath = sampleActivityPath,
  userLocation,
  isTracking = false,
  onTrackingChange,
}: GPSActivityMapProps) {
  const [userLocationState, setUserLocationState] = useState<[number, number]>([40.7128, -74.006])
  const [selectedVet, setSelectedVet] = useState<VetLocation | null>(null)
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all")
  const [zoom, setZoom] = useState(14)
  const [isLocating, setIsLocating] = useState(false)

  // If parent provided a userLocation, use it; otherwise keep internal default
  useEffect(() => {
    if (userLocation && userLocation.length === 2) {
      setUserLocationState(userLocation)
      return
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocationState([position.coords.latitude, position.coords.longitude])
        },
        () => {
          // keep default
        },
      )
    }
  }, [userLocation])

  const filteredVets = useMemo(() => {
    if (specialtyFilter === "all") return vets
    return vets.filter((vet) => vet.specialty.toLowerCase().includes(specialtyFilter.toLowerCase()))
  }, [vets, specialtyFilter])

  const specialties = useMemo(() => {
    const unique = [...new Set(vets.map((v) => v.specialty))]
    return unique
  }, [vets])

  // request browser geolocation and update internal state
  const handleLocate = () => {
    setIsLocating(true)
    if (!navigator.geolocation) {
      setIsLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocationState([position.coords.latitude, position.coords.longitude])
        setIsLocating(false)
      },
      () => {
        setIsLocating(false)
      },
    )
  }

  // (static map URLs intentionally omitted — using interactive overlay)

  return (
    <Card variant="elevated" className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="flex items-center gap-2">
            {mode === "vet" ? (
              <>
                <Stethoscope className="h-5 w-5 text-primary" />
                Nearby Veterinarians
              </>
            ) : (
              <>
                <Activity className="h-5 w-5 text-primary" />
                Activity Map
              </>
            )}
          </CardTitle>

          {mode === "vet" && (
            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty.toLowerCase()}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {mode === "activity" && (
            <Button
              variant={isTracking ? "default" : "outline"}
              size="sm"
              onClick={() => onTrackingChange?.(!isTracking)}
              className="gap-2"
            >
              <Navigation className="h-4 w-4" />
              {isTracking ? "Tracking..." : "Start Tracking"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Interactive Map View */}
        <div className="h-[300px] md:h-[400px] relative bg-secondary/30 overflow-hidden">
          {/* Map Background */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary/5 to-info/5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23a785e2' fillOpacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Map Controls */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLocate}
              className="p-2 bg-card rounded-lg shadow-soft border border-border/50 hover:bg-secondary transition-colors"
            >
              <Locate className={`h-4 w-4 ${isLocating ? "animate-spin text-primary" : "text-foreground"}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setZoom(Math.min(zoom + 1, 18))}
              className="p-2 bg-card rounded-lg shadow-soft border border-border/50 hover:bg-secondary transition-colors"
            >
              <ZoomIn className="h-4 w-4 text-foreground" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setZoom(Math.max(zoom - 1, 10))}
              className="p-2 bg-card rounded-lg shadow-soft border border-border/50 hover:bg-secondary transition-colors"
            >
              <ZoomOut className="h-4 w-4 text-foreground" />
            </motion.button>
          </div>

          {/* User Location Marker */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <div className="relative">
              <div className="w-6 h-6 bg-accent rounded-full border-3 border-card shadow-elevated flex items-center justify-center">
                <div className="w-2 h-2 bg-accent-foreground rounded-full" />
              </div>
              <div className="absolute -inset-3 bg-accent/20 rounded-full animate-ping" />
            </div>
          </motion.div>

          {/* Vet Location Markers */}
          {mode === "vet" &&
            filteredVets.map((vet, index) => {
              // Map vet lat/lon to percentage positions using Web Mercator projection
              function lonToX(lon: number) {
                return (lon + 180) / 360
              }
              function latToY(lat: number) {
                const rad = (lat * Math.PI) / 180
                return (1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2
              }

              const centerLon = userLocationState[1]
              const centerLat = userLocationState[0]

              const zoomLevel = zoom // map zoom
              const worldSize = 256 * Math.pow(2, zoomLevel)

              const vetX = lonToX(vet.lng) * worldSize
              const vetY = latToY(vet.lat) * worldSize
              const centerX = lonToX(centerLon) * worldSize
              const centerY = latToY(centerLat) * worldSize

              const offsetX = vetX - centerX // pixels
              const offsetY = vetY - centerY // pixels

              // Map container dimensions used in static URL: 800x400
              const mapWidth = 800
              const mapHeight = 400

              const leftPercent = 50 + (offsetX / mapWidth) * 100
              const topPercent = 50 + (offsetY / mapHeight) * 100

              return (
                <motion.button
                  key={vet.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.06 }}
                  whileHover={{ scale: 1.15, zIndex: 20 }}
                  onClick={() => setSelectedVet(vet)}
                  className={`absolute z-10 cursor-pointer transition-all ${selectedVet?.id === vet.id ? "z-20" : ""}`}
                  style={{ left: `${leftPercent}%`, top: `${topPercent}%`, transform: "translate(-50%, -50%)" }}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-elevated border-2 transition-colors ${
                      selectedVet?.id === vet.id
                        ? "bg-primary border-primary-foreground"
                        : "bg-card border-primary/30 hover:bg-primary/10"
                    }`}
                  >
                    <Stethoscope
                      className={`h-5 w-5 ${selectedVet?.id === vet.id ? "text-primary-foreground" : "text-primary"}`}
                    />
                  </div>
                  {selectedVet?.id === vet.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-card rounded-lg shadow-soft border border-border/50 whitespace-nowrap text-xs font-medium"
                    >
                      {vet.distance ? `${vet.distance} km` : "Nearby"}
                    </motion.div>
                  )}
                </motion.button>
              )
            })}

          {/* Activity Path Markers */}
          {mode === "activity" && (
            <>
              {/* Path Line */}
              <svg className="absolute inset-0 w-full h-full z-5" style={{ pointerEvents: "none" }}>
                <defs>
                  <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(264, 54%, 71%)" />
                    <stop offset="100%" stopColor="hsl(152, 60%, 52%)" />
                  </linearGradient>
                </defs>
                <path
                  d="M 150 200 Q 200 150 300 180 Q 400 210 500 160 Q 600 110 650 180"
                  stroke="url(#pathGradient)"
                  strokeWidth="4"
                  strokeDasharray="10 5"
                  fill="none"
                  opacity="0.8"
                />
              </svg>

              {/* Activity Markers */}
              {activityPath.map((point, index) => {
                const positions = [
                  { left: "20%", top: "50%" },
                  { left: "35%", top: "35%" },
                  { left: "50%", top: "45%" },
                  { left: "65%", top: "30%" },
                  { left: "80%", top: "45%" },
                ]
                const pos = positions[index] || { left: `${20 + index * 15}%`, top: "50%" }

                return (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.15 }}
                    className="absolute z-10"
                    style={{ left: pos.left, top: pos.top, transform: "translate(-50%, -50%)" }}
                  >
                    <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center shadow-elevated border-2 border-card">
                      <span className="text-sm">🐾</span>
                    </div>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-card/90 backdrop-blur-sm rounded text-xs font-medium whitespace-nowrap shadow-soft">
                      {point.activity}
                    </div>
                  </motion.div>
                )
              })}
            </>
          )}

          {/* Map Attribution */}
          <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-card/80 backdrop-blur-sm px-2 py-1 rounded">
            Interactive Map View
          </div>
        </div>

        {/* Selected Vet Card */}
        {selectedVet && mode === "vet" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border-t border-border/50"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-heading font-bold text-foreground">{selectedVet.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedVet.address}</p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedVet.available ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                }`}
              >
                {selectedVet.available ? "Open" : "Closed"}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-3 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-accent fill-accent" />
                <span className="font-medium">{selectedVet.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{selectedVet.distance}</span>
              </div>
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                {selectedVet.specialty}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="default"
                className="flex-1 gap-2"
                onClick={() => {
                    if (selectedVet.lat != null && selectedVet.lng != null) {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedVet.lat},${selectedVet.lng}`
                    window.open(url, "_blank")
                  } else {
                    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedVet.address)}`
                    window.open(url, "_blank")
                  }
                }}
              >
                <Navigation className="h-4 w-4" />
                Directions
              </Button>
              <Button
                variant="outline"
                className="gap-2 bg-transparent"
                onClick={() => {
                  if (selectedVet.phone) window.location.href = `tel:${selectedVet.phone}`
                }}
              >
                <Phone className="h-4 w-4" />
                Call
              </Button>
            </div>
          </motion.div>
        )}

        {/* Activity Summary for Activity Mode */}
        {mode === "activity" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border-t border-border/50"
          >
            <h4 className="font-heading font-bold text-foreground mb-3">Today's Activity</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-secondary/50 rounded-lg">
                <p className="font-heading font-bold text-primary text-xl">2.5 km</p>
                <p className="text-xs text-muted-foreground">Distance</p>
              </div>
              <div className="text-center p-3 bg-secondary/50 rounded-lg">
                <p className="font-heading font-bold text-success text-xl">45 min</p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
              <div className="text-center p-3 bg-secondary/50 rounded-lg">
                <p className="font-heading font-bold text-accent text-xl">320</p>
                <p className="text-xs text-muted-foreground">Calories</p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
