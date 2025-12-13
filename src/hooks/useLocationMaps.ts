import { useState, useCallback, useEffect } from "react"

export interface Vet {
  id: string
  name: string
  address: string
  phone: string
  rating: number
  distance: number
  lat: number
  lng: number
  openNow?: boolean
  website?: string
  specialties?: string[]
}

export interface Location {
  lat: number
  lng: number
  address?: string
}

export function useLocationMaps() {
  const [vets, setVets] = useState<Vet[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<Location | null>(null)

  // Get user's current location
  const getUserLocation = useCallback(() => {
    setIsLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      setIsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setUserLocation(location)
        setIsLoading(false)
      },
      (err) => {
        setError(err.message || "Failed to get location")
        setIsLoading(false)
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }, [])

  // Find nearby vets using Google Places API
  const findNearbyVets = useCallback(
    async (lat: number, lng: number, radiusMeters = 5000) => {
      setIsLoading(true)
      setError(null)

      try {
        const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY
        if (!apiKey || apiKey.includes("YOUR_")) {
          console.warn("Google Places API key not configured")
          // Return mock data for development
          const mockVets: Vet[] = [
            {
              id: "1",
              name: "Happy Paws Veterinary Clinic",
              address: "123 Pet St, Your City",
              phone: "(555) 123-4567",
              rating: 4.8,
              distance: 0.5,
              lat: lat + 0.005,
              lng: lng + 0.005,
              openNow: true,
              specialties: ["General Care", "Surgery", "Dental"],
            },
            {
              id: "2",
              name: "Furry Friends Animal Hospital",
              address: "456 Pet Ave, Your City",
              phone: "(555) 234-5678",
              rating: 4.6,
              distance: 1.2,
              lat: lat - 0.004,
              lng: lng + 0.006,
              openNow: true,
              specialties: ["Emergency Care", "Cardiology"],
            },
            {
              id: "3",
              name: "Pet Wellness Center",
              address: "789 Animal Blvd, Your City",
              phone: "(555) 345-6789",
              rating: 4.9,
              distance: 2.1,
              lat: lat + 0.008,
              lng: lng - 0.003,
              openNow: false,
              specialties: ["Preventive Care", "Vaccinations"],
            },
          ]
          setVets(mockVets)
          setIsLoading(false)
          return mockVets
        }

        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&type=veterinary_care&key=${apiKey}`
        )

        if (!response.ok) {
          throw new Error("Failed to fetch nearby vets")
        }

        const data = await response.json()

        const formattedVets: Vet[] = (data.results || []).map((place: any) => ({
          id: place.place_id,
          name: place.name,
          address: place.vicinity,
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          rating: place.rating || 0,
          distance: calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng),
          phone: place.formatted_phone_number || "N/A",
          openNow: place.opening_hours?.open_now,
          specialties: extractSpecialties(place.types),
        }))

        // Sort by distance
        formattedVets.sort((a, b) => a.distance - b.distance)
        setVets(formattedVets)
        setIsLoading(false)
        return formattedVets
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to find nearby vets"
        setError(errorMessage)
        console.error("Location error:", err)
        setIsLoading(false)
        return []
      }
    },
    []
  )

  // Get vet details
  const getVetDetails = useCallback(async (placeId: string) => {
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY
      if (!apiKey || apiKey.includes("YOUR_")) {
        return null
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,rating,reviews`
      )

      if (!response.ok) {
        throw new Error("Failed to fetch vet details")
      }

      const data = await response.json()
      return data.result
    } catch (err) {
      console.error("Error fetching vet details:", err)
      return null
    }
  }, [])

  return {
    vets,
    userLocation,
    isLoading,
    error,
    getUserLocation,
    findNearbyVets,
    getVetDetails,
  }
}

// Helper functions
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLng = (lng2 - lng1) * (Math.PI / 180)
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function extractSpecialties(types: string[]): string[] {
  const specialtyMap: Record<string, string> = {
    veterinary_care: "General Care",
    animal_hospital: "Hospital",
    animal_shelter: "Shelter",
  }

  return types.filter((type) => type in specialtyMap).map((type) => specialtyMap[type])
}
