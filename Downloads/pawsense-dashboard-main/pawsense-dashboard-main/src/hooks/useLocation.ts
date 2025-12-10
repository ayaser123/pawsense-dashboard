"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "./useAuth"
import apiClient from "@/lib/api"

export interface Location {
  id: string
  user_id: string
  latitude: number
  longitude: number
  address?: string
  created_at: string
}

export interface ActivityPoint {
  id: string
  lat: number
  lng: number
  activity: string
  timestamp: string
}

interface UseLocationsResult {
  locations: Location[]
  currentLocation: Location | null
  activityPath: ActivityPoint[]
  loading: boolean
  error: string | null
  recordLocation: (latitude: number, longitude: number, address?: string) => Promise<Location | null>
  startTracking: () => void
  stopTracking: () => void
}

export function useLocations(): UseLocationsResult {
  const { user } = useAuth()
  const [locations, setLocations] = useState<Location[]>([])
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tracking, setTracking] = useState(false)
  const watchId = useRef<number | null>(null)

  const fetchLocations = useCallback(async () => {
    if (!user) {
      setLocations([])
      setCurrentLocation(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get("/api/locations")
      setLocations(response.data || [])
      if (response.data && response.data.length > 0) {
        setCurrentLocation(response.data[0])
      }
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: string } }; message?: string }
      setError(apiErr.response?.data?.error || "Failed to fetch locations")
    } finally {
      setLoading(false)
    }
  }, [user])

  const recordLocation = useCallback(
  async (latitude: number, longitude: number, address?: string): Promise<Location | null> => {
    try {
      setError(null)
      const response = await apiClient.post("/api/locations", {
        latitude,
        longitude,
        address,
      })
      const newLocation: Location = response.data
      setLocations((prev) => [newLocation, ...prev])
      setCurrentLocation(newLocation)
      return newLocation
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: string } }; message?: string }
      const errorMsg = apiErr.response?.data?.error || "Failed to record location"
      setError(errorMsg)
      console.error("[v0] Location record error:", errorMsg)
      return null
    }
  },
  [] // no changing dependencies
)

  useEffect(() => {
    fetchLocations()

    // Seed current location from browser if permitted
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          void recordLocation(latitude, longitude)
        },
        (err) => {
          // Provide clear error for UI when permission denied or unavailable
          setError(err.message || "Unable to access location. Please allow permission.")
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 },
      )
    } else {
      setError("Geolocation is not supported by this browser.")
    }
  }, [fetchLocations, recordLocation])

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not available on this device.")
      return
    }
    if (watchId.current != null) return

    setTracking(true)
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        console.log("[v0] GPS update:", latitude, longitude)
        void recordLocation(latitude, longitude)
      },
      (err) => {
        console.error("[v0] Geolocation error:", err.message)
        setError(err.message)
        if (err.code === 1 /* PERMISSION_DENIED */) {
          if (watchId.current != null) {
            navigator.geolocation.clearWatch(watchId.current)
            watchId.current = null
          }
          setTracking(false)
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      },
    )
  }, [recordLocation])

  const stopTracking = useCallback(() => {
  if (watchId.current != null && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId.current)
    watchId.current = null
  }
  setTracking(false)
}, [])


  const activityPath: ActivityPoint[] = locations.map((loc, index) => ({
  id: loc.id,
  lat: loc.latitude,  // Map from Location's latitude
  lng: loc.longitude, // Map from Location's longitude
  activity: ["Walking", "Playing", "Sniffing", "Running", "Resting"][index % 5],
  timestamp: new Date(loc.created_at).toLocaleTimeString(),
}))
  return {
    locations,
    currentLocation,
    activityPath,
    loading,
    error,
    recordLocation,
    startTracking,
    stopTracking,
  }
}
