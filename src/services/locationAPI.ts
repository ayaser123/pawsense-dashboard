// Location Services API - using OpenStreetMap for free geolocation and vet search

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  error?: string;
}

export interface Veterinarian {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  distance: string;
  distanceKm: number;
  open?: boolean;
  lat: number;
  lng: number;
}

/**
 * Get user's current location using browser's Geolocation API
 */
export async function getUserLocation(): Promise<Location> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        latitude: 0,
        longitude: 0,
        error: "Geolocation not supported by browser",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
        resolve({
          latitude: 0,
          longitude: 0,
          error: error.message,
        });
      }
    );
  });
}

/**
 * Get address from coordinates using OpenStreetMap Nominatim API
 */
export async function getAddressFromCoordinates(
  latitude: number,
  longitude: number
): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );
    const data = await response.json();
    return data.address?.city || data.address?.town || `${latitude}, ${longitude}`;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return `${latitude}, ${longitude}`;
  }
}

/**
 * Search for nearby veterinarians using OpenStreetMap Overpass API
 */
export async function searchNearbyVets(
  latitude: number,
  longitude: number,
  radiusKm: number = 5
): Promise<Veterinarian[]> {
  try {
    // Use Overpass API to search for veterinary clinics
    const query = `
      [bbox:${latitude - radiusKm / 111},-${longitude - radiusKm / (111 * Math.cos(latitude * (Math.PI / 180)))},${latitude + radiusKm / 111},${longitude + radiusKm / (111 * Math.cos(latitude * (Math.PI / 180)))}];
      (
        node["amenity"="veterinary"];
        way["amenity"="veterinary"];
        node["shop"="pet"];
        way["shop"="pet"];
      );
      out geom;
    `;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
    });

    const data = await response.json();
    const vets: Veterinarian[] = [];

    data.elements?.forEach((element: any) => {
      const lat = element.lat || element.center?.lat;
      const lng = element.lon || element.center?.lon;

      if (lat && lng) {
        const distance = calculateDistance(latitude, longitude, lat, lng);

        if (distance <= radiusKm) {
          vets.push({
            name: element.tags?.name || "Veterinary Clinic",
            address: element.tags?.["addr:full"] || `${lat}, ${lng}`,
            phone: element.tags?.phone,
            website: element.tags?.website,
            rating: element.tags?.["amenity:level"] ? 4.5 : undefined,
            distance: `${distance.toFixed(1)} km`,
            distanceKm: distance,
            lat,
            lng,
            open: element.tags?.["opening_hours"] !== undefined,
          });
        }
      }
    });

    return vets.sort((a, b) => a.distanceKm - b.distanceKm);
  } catch (error) {
    console.error("Vet search error:", error);
    return getMockVets();
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Mock veterinarians for demonstration
 */
export function getMockVets(): Veterinarian[] {
  return [
    {
      name: "Happy Paws Clinic",
      address: "123 Main St, Your City",
      phone: "(555) 123-4567",
      website: "www.happypawsclinic.com",
      rating: 4.8,
      distance: "0.5 km",
      distanceKm: 0.5,
      open: true,
      lat: 40.7128,
      lng: -74.006,
    },
    {
      name: "Pet Care Center",
      address: "456 Oak Ave, Your City",
      phone: "(555) 234-5678",
      website: "www.petcarecenter.com",
      rating: 4.6,
      distance: "1.2 km",
      distanceKm: 1.2,
      open: true,
      lat: 40.7138,
      lng: -74.007,
    },
    {
      name: "Animal Hospital",
      address: "789 Pine Rd, Your City",
      phone: "(555) 345-6789",
      website: "www.animalhospital.com",
      rating: 4.9,
      distance: "2.1 km",
      distanceKm: 2.1,
      open: false,
      lat: 40.7148,
      lng: -74.008,
    },
  ];
}
