/**
 * Week 10: Abstract Data Type (ADT) for Location
 * Realizes ADT concepts with abstraction and encapsulation
 * Hides geographic computation details from clients
 */

export interface LocationRepresentation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  error?: string;
}

/**
 * ADT: Location
 * Invariant: latitude must be in [-90, 90], longitude in [-180, 180]
 * Precondition: Valid geographic coordinates
 * Postcondition: Always returns valid location or error
 */
export class LocationADT {
  private readonly rep: LocationRepresentation;

  constructor(rep: LocationRepresentation) {
    this.validateInvariant(rep);
    this.rep = { ...rep };
  }

  /**
   * Rep Invariant: Validates geographic constraints
   */
  private validateInvariant(rep: LocationRepresentation): void {
    if (typeof rep.latitude !== "number" || rep.latitude < -90 || rep.latitude > 90) {
      throw new Error(`Invariant violated: Latitude must be in [-90, 90], got ${rep.latitude}`);
    }
    if (typeof rep.longitude !== "number" || rep.longitude < -180 || rep.longitude > 180) {
      throw new Error(`Invariant violated: Longitude must be in [-180, 180], got ${rep.longitude}`);
    }
  }

  // Public interface: Abstraction hides implementation
  getLatitude(): number {
    return this.rep.latitude;
  }

  getLongitude(): number {
    return this.rep.longitude;
  }

  getAddress(): string | undefined {
    return this.rep.address;
  }

  getCity(): string | undefined {
    return this.rep.city;
  }

  getError(): string | undefined {
    return this.rep.error;
  }

  hasError(): boolean {
    return !!this.rep.error;
  }

  /**
   * Calculate distance between two locations (Haversine formula)
   * Encapsulated geographic computation
   * Precondition: other is valid LocationADT
   * Postcondition: Returns distance in kilometers
   */
  distanceTo(other: LocationADT): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(other.getLatitude() - this.rep.latitude);
    const dLon = this.toRad(other.getLongitude() - this.rep.longitude);
    const lat1 = this.toRad(this.rep.latitude);
    const lat2 = this.toRad(other.getLatitude());

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) *
        Math.sin(dLon / 2) *
        Math.cos(lat1) *
        Math.cos(lat2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Private helper: Convert degrees to radians
   */
  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Bearing from this location to another (in degrees)
   * Encapsulated geographic computation
   */
  bearingTo(other: LocationADT): number {
    const lat1 = this.toRad(this.rep.latitude);
    const lat2 = this.toRad(other.getLatitude());
    const dLon = this.toRad(other.getLongitude() - this.rep.longitude);

    const x = Math.sin(dLon) * Math.cos(lat2);
    const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    return (Math.atan2(x, y) * 180) / Math.PI;
  }

  /**
   * Immutable update with new address
   */
  withAddress(address: string): LocationADT {
    return new LocationADT({
      ...this.rep,
      address,
    });
  }

  /**
   * Immutable update with new city
   */
  withCity(city: string): LocationADT {
    return new LocationADT({
      ...this.rep,
      city,
    });
  }

  toRepresentation(): LocationRepresentation {
    return { ...this.rep };
  }

  equals(other: LocationADT): boolean {
    const tolerance = 0.0001; // Approximately 11 meters at equator
    return (
      Math.abs(this.rep.latitude - other.getLatitude()) < tolerance &&
      Math.abs(this.rep.longitude - other.getLongitude()) < tolerance
    );
  }

  toString(): string {
    return `Location(${this.rep.latitude.toFixed(4)}, ${this.rep.longitude.toFixed(4)})`;
  }
}

/**
 * Factory function: Create valid LocationADT
 * Precondition: Valid coordinates
 * Postcondition: Valid LocationADT instance
 */
export function createLocation(data: Partial<LocationRepresentation>): LocationADT {
  if (data.latitude === undefined || data.longitude === undefined) {
    throw new Error("Precondition failed: latitude and longitude are required");
  }
  return new LocationADT({
    latitude: data.latitude,
    longitude: data.longitude,
    address: data.address,
    city: data.city,
    error: data.error,
  });
}

/**
 * Factory function: Create LocationADT with error state
 */
export function createLocationError(error: string): LocationADT {
  return new LocationADT({
    latitude: 0,
    longitude: 0,
    error,
  });
}
