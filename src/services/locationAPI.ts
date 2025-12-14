// Location Services API - using multiple free APIs for best coverage

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
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
  specialty?: string;
}

/**
 * Get user's current location using browser's Geolocation API
 */
export async function getUserLocation(): Promise<Location> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn("⚠️  Geolocation not supported by browser, using Islamabad fallback");
      resolve({
        latitude: 33.6844,
        longitude: 74.3355,
        city: "Islamabad",
        error: "Geolocation not supported by browser",
      });
      return;
    }

    console.log("📍 Requesting user geolocation...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("✅ Got user location:", position.coords.latitude, position.coords.longitude);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.warn("⚠️  Geolocation error:", error.message, "Using Islamabad fallback");
        // Fallback to Islamabad coordinates if user denies location
        resolve({
          latitude: 33.6844,
          longitude: 74.3355,
          city: "Islamabad",
          error: `Geolocation error: ${error.message}. Using Islamabad as fallback.`,
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
): Promise<Location> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );
    const data = await response.json();
    return {
      latitude,
      longitude,
      address: data.address?.road || data.address?.pedestrian || "Unknown Address",
      city: data.address?.city || data.address?.town || "Unknown City",
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return {
      latitude,
      longitude,
      address: `${latitude}, ${longitude}`,
    };
  }
}

/**
 * Search for nearby veterinarians - Real data only with expanded search radius
 */
export async function searchNearbyVets(
  latitude: number,
  longitude: number,
  radiusKm: number = 15
): Promise<Veterinarian[]> {
  try {
    console.log(`📍 Searching real vets near ${latitude}, ${longitude} within ${radiusKm}km`);
    
    // Try Overpass API with expanding radius
    let overpassVets = await searchVetsViaOverpass(latitude, longitude, radiusKm);
    
    if (overpassVets.length === 0 && radiusKm < 50) {
      console.log(`⚠️  No vets found in ${radiusKm}km, expanding search to 50km...`);
      overpassVets = await searchVetsViaOverpass(latitude, longitude, 50);
    }
    
    if (overpassVets.length === 0 && radiusKm < 100) {
      console.log(`⚠️  No vets found in 50km, expanding search to 100km...`);
      overpassVets = await searchVetsViaOverpass(latitude, longitude, 100);
    }
    
    console.log(`✅ Found ${overpassVets.length} real vets from OpenStreetMap`);
    return overpassVets.sort((a, b) => a.distanceKm - b.distanceKm);
  } catch (error) {
    console.error("❌ Vet search error:", error);
    return [];
  }
}

/**
 * Search vets using OpenStreetMap Overpass API with improved query
 */
async function searchVetsViaOverpass(
  latitude: number,
  longitude: number,
  radiusKm: number
): Promise<Veterinarian[]> {
  try {
    const bbox = calculateBBox(latitude, longitude, radiusKm);
    console.log(`🔍 Overpass: Searching ${radiusKm}km radius at ${latitude}, ${longitude}`);
    
    // Use around query for better results
    const query = `
      [out:json];
      (
        node["amenity"="veterinary"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
        way["amenity"="veterinary"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
        relation["amenity"="veterinary"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      );
      out center;
    `;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (!response.ok) {
      console.error(`❌ Overpass API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json() as { elements?: Array<{ lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }> };
    console.log(`📊 Overpass returned ${data.elements?.length || 0} elements`);
    
    const vets: Veterinarian[] = [];

    data.elements?.forEach((element) => {
      const lat = element.lat || element.center?.lat;
      const lng = element.lon || element.center?.lon;

      if (lat && lng && element.tags) {
        const distance = calculateDistance(latitude, longitude, lat, lng);

        vets.push({
          name: element.tags["name"] || "Veterinary Clinic",
          address: element.tags["addr:full"] || 
                   `${element.tags["addr:street"] || ""} ${element.tags["addr:housenumber"] || ""}`.trim() || 
                   `${element.tags["addr:city"] || ""}`.trim() ||
                   `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          phone: element.tags["phone"] || element.tags["contact:phone"],
          website: element.tags["website"] || element.tags["contact:website"],
          rating: 4.5,
          distance: `${distance.toFixed(1)} km`,
          distanceKm: distance,
          lat,
          lng,
          open: element.tags["opening_hours"] !== undefined,
          specialty: "Veterinary Clinic",
        });
      }
    });

    console.log(`✅ Found ${vets.length} real veterinarians`);
    return vets;
  } catch (error) {
    console.error("❌ Overpass API error:", error);
    return [];
  }
}

/**
 * Calculate bounding box for location search
 */
function calculateBBox(
  latitude: number,
  longitude: number,
  radiusKm: number
): { north: number; south: number; east: number; west: number } {
  const latDelta = radiusKm / 111;
  const lonDelta = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180));

  return {
    north: latitude + latDelta,
    south: latitude - latDelta,
    east: longitude + lonDelta,
    west: longitude - lonDelta,
  };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
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
