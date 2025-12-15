/**
 * Week 10: Abstraction for Location Services
 * Demonstrates:
 * - Abstract data types hiding implementation
 * - Encapsulation of geographic operations
 * - Location service operations as abstract interface
 */

import { LocationADT, createLocation, createLocationError } from "@/adt/LocationADT";
import { VeterinarianADT, createVeterinarian } from "@/adt/VeterinarianADT";
import { Semaphore, ConcurrentCache, ConcurrencyUtils } from "@/concurrency/ConcurrencyManager";

/**
 * Abstract Location Service Interface
 * Hides implementation details of location providers
 */
export interface ILocationService {
  /**
   * Get current user location
   * Precondition: Browser must support Geolocation API
   * Postcondition: Returns LocationADT with valid coordinates or error
   */
  getUserLocation(): Promise<LocationADT>;

  /**
   * Get address from coordinates
   * Precondition: Valid coordinates
   * Postcondition: LocationADT with address details or error
   */
  getAddressFromCoordinates(latitude: number, longitude: number): Promise<LocationADT>;

  /**
   * Search veterinarians near location
   * Precondition: Valid location
   * Postcondition: Array of VeterinarianADT objects
   */
  searchNearbyVeterinarians(
    latitude: number,
    longitude: number,
    radiusKm: number
  ): Promise<VeterinarianADT[]>;
}

/**
 * Concrete implementation of Location Service
 * Uses OpenStreetMap and Overpass API
 */
export class LocationService implements ILocationService {
  private cache: ConcurrentCache<string, LocationADT>;
  private vetCache: ConcurrentCache<string, VeterinarianADT[]>;
  private semaphore: Semaphore;

  constructor(maxConcurrentRequests: number = 3) {
    // Limit concurrent requests to prevent overwhelming APIs
    this.semaphore = new Semaphore(maxConcurrentRequests);

    // Cache results with 10-minute TTL
    this.cache = new ConcurrentCache<string, LocationADT>(1);
    this.vetCache = new ConcurrentCache<string, VeterinarianADT[]>(1);
  }

  /**
   * Encapsulation: Hide geolocation implementation
   * Precondition: Geolocation API available
   * Postcondition: LocationADT with valid coordinates
   */
  async getUserLocation(): Promise<LocationADT> {
    return this.semaphore.withPermit(async () => {
      // Try to use cached location (5 minutes old is ok for general location)
      const cached = await this.cache.get("user_location");
      if (cached) return cached;

      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          const error = createLocationError("Geolocation not supported by browser");
          resolve(error);
          return;
        }

        // Timeout after 5 seconds
        const timeoutId = setTimeout(() => {
          const error = createLocationError(
            "Location detection timeout. Please search for your city manually."
          );
          resolve(error);
        }, 5000);

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            clearTimeout(timeoutId);
            const location = createLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            // Cache for 5 minutes
            await this.cache.set("user_location", location, 300000);
            resolve(location);
          },
          () => {
            clearTimeout(timeoutId);
            const error = createLocationError(
              "Location permission denied. Please search for your city manually."
            );
            resolve(error);
          }
        );
      });
    });
  }

  /**
   * Encapsulation: Hide address lookup implementation
   * Precondition: Valid coordinates
   * Postcondition: LocationADT with address or error
   */
  async getAddressFromCoordinates(latitude: number, longitude: number): Promise<LocationADT> {
    return this.semaphore.withPermit(async () => {
      const cacheKey = `address_${latitude.toFixed(4)}_${longitude.toFixed(4)}`;

      // Check cache
      const cached = await this.cache.get(cacheKey);
      if (cached) return cached;

      try {
        // Use OpenStreetMap Nominatim API
        const response = await ConcurrencyUtils.retryWithBackoff(
          () =>
            fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            ),
          2,
          500
        );

        const data = await response.json();
        const location = createLocation({
          latitude,
          longitude,
          address: data.address?.road || data.address?.pedestrian || "Unknown Address",
          city: data.address?.city || data.address?.town || "Unknown City",
        });

        // Cache for 1 hour
        await this.cache.set(cacheKey, location, 3600000);
        return location;
      } catch (error) {
        return createLocationError(`Failed to get address: ${(error as Error).message}`);
      }
    });
  }

  /**
   * Encapsulation: Hide veterinarian search implementation
   * Precondition: Valid coordinates and positive radius
   * Postcondition: Array of VeterinarianADT objects sorted by distance
   */
  async searchNearbyVeterinarians(
    latitude: number,
    longitude: number,
    radiusKm: number
  ): Promise<VeterinarianADT[]> {
    return this.semaphore.withPermit(async () => {
      const cacheKey = `vets_${latitude.toFixed(4)}_${longitude.toFixed(4)}_${radiusKm}`;

      // Check cache
      const cached = await this.vetCache.get(cacheKey);
      if (cached) return cached;

      try {
        // Convert radius to bounding box (approximate)
        const latDelta = radiusKm / 111; // 1 degree latitude ≈ 111 km
        const lngDelta = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180));

        const bbox = {
          south: latitude - latDelta,
          west: longitude - lngDelta,
          north: latitude + latDelta,
          east: longitude + lngDelta,
        };

        // Query Overpass API
        const query = `
          [bbox:${bbox.south},${bbox.west},${bbox.north},${bbox.east}];
          (node["amenity"="veterinary"];way["amenity"="veterinary"];relation["amenity"="veterinary"];);
          out center;
        `;

        const response = await ConcurrencyUtils.retryWithBackoff(
          () =>
            fetch("https://overpass-api.de/api/interpreter", {
              method: "POST",
              body: query,
            }),
          2,
          1000
        );

        const data = await response.json();

        // Transform Overpass data to VeterinarianADT objects
        interface OverpassElement {
          center?: { lat: number; lon: number };
          lat?: number;
          lon?: number;
          tags?: Record<string, string>;
        }

        const vets = (data.elements as OverpassElement[] | undefined || [])
          .map((element: OverpassElement) => {
            const lat = element.center?.lat || element.lat;
            const lng = element.center?.lon || element.lon;

            if (!lat || !lng) return null;

            const userLocation = createLocation({ latitude, longitude });
            const vetLocation = createLocation({ latitude: lat, longitude: lng });
            const distanceKm = userLocation.distanceTo(vetLocation);

            if (distanceKm > radiusKm) return null; // Filter by radius

            return createVeterinarian({
              name: element.tags?.name || "Unknown Veterinarian",
              address: element.tags?.["addr:full"] || "Address not available",
              lat,
              lng,
              distanceKm,
              phone: element.tags?.phone,
              website: element.tags?.website,
              specialty: element.tags?.specialisation,
            });
          })
          .filter((v: VeterinarianADT | null): v is VeterinarianADT => v !== null)
          // Sort by distance (closest first)
          .sort((a: VeterinarianADT, b: VeterinarianADT) => a.getDistanceKm() - b.getDistanceKm());

        // Cache for 1 hour
        await this.vetCache.set(cacheKey, vets, 3600000);
        return vets;
      } catch (error) {
        console.error("Error searching for veterinarians:", error);
        return [];
      }
    });
  }

  /**
   * Clear caches to force refresh
   */
  async clearCaches(): Promise<void> {
    await this.cache.clear();
    await this.vetCache.clear();
  }
}

/**
 * Factory: Create location service with singleton pattern
 */
let locationServiceInstance: LocationService | null = null;

export function getLocationService(): LocationService {
  if (!locationServiceInstance) {
    locationServiceInstance = new LocationService(3);
  }
  return locationServiceInstance;
}

/**
 * Factory: Create new service instance (for testing)
 */
export function createLocationService(maxConcurrent: number = 3): LocationService {
  return new LocationService(maxConcurrent);
}
