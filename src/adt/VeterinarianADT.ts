/**
 * Week 10: Abstract Data Type (ADT) for Veterinarian
 * Encapsulates veterinary professional information
 */

export interface VeterinarianRepresentation {
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
 * ADT: Veterinarian
 * Invariant: name, address must be non-empty
 *          rating must be in [0, 5] if provided
 *          distance values must be consistent
 *          coordinates must be valid geographic values
 */
export class VeterinarianADT {
  private readonly rep: VeterinarianRepresentation;

  constructor(rep: VeterinarianRepresentation) {
    this.validateInvariant(rep);
    this.rep = { ...rep };
  }

  /**
   * Rep Invariant: Validates all veterinarian properties
   */
  private validateInvariant(rep: VeterinarianRepresentation): void {
    if (!rep.name || rep.name.trim().length === 0) {
      throw new Error("Invariant violated: Veterinarian name cannot be empty");
    }
    if (!rep.address || rep.address.trim().length === 0) {
      throw new Error("Invariant violated: Veterinarian address cannot be empty");
    }
    if (typeof rep.lat !== "number" || rep.lat < -90 || rep.lat > 90) {
      throw new Error(`Invariant violated: Invalid latitude ${rep.lat}`);
    }
    if (typeof rep.lng !== "number" || rep.lng < -180 || rep.lng > 180) {
      throw new Error(`Invariant violated: Invalid longitude ${rep.lng}`);
    }
    if (rep.rating !== undefined && (rep.rating < 0 || rep.rating > 5)) {
      throw new Error(`Invariant violated: Rating must be in [0, 5], got ${rep.rating}`);
    }
    if (rep.distanceKm < 0) {
      throw new Error(`Invariant violated: Distance cannot be negative`);
    }
  }

  // Public interface
  getName(): string {
    return this.rep.name;
  }

  getAddress(): string {
    return this.rep.address;
  }

  getPhone(): string | undefined {
    return this.rep.phone;
  }

  getWebsite(): string | undefined {
    return this.rep.website;
  }

  getRating(): number | undefined {
    return this.rep.rating;
  }

  getDistance(): string {
    return this.rep.distance;
  }

  getDistanceKm(): number {
    return this.rep.distanceKm;
  }

  isOpen(): boolean | undefined {
    return this.rep.open;
  }

  getLatitude(): number {
    return this.rep.lat;
  }

  getLongitude(): number {
    return this.rep.lng;
  }

  getSpecialty(): string | undefined {
    return this.rep.specialty;
  }

  /**
   * Precondition: rating must be in [0, 5]
   * Postcondition: Returns VeterinarianADT with updated rating
   */
  withRating(rating: number): VeterinarianADT {
    if (rating < 0 || rating > 5) {
      throw new Error("Precondition failed: Rating must be in [0, 5]");
    }
    return new VeterinarianADT({
      ...this.rep,
      rating,
    });
  }

  /**
   * Immutable update with open status
   */
  withOpenStatus(open: boolean): VeterinarianADT {
    return new VeterinarianADT({
      ...this.rep,
      open,
    });
  }

  /**
   * Check if this vet is nearby (within threshold km)
   * Encapsulates proximity logic
   */
  isNearby(thresholdKm: number = 5): boolean {
    return this.rep.distanceKm <= thresholdKm;
  }

  /**
   * Check if vet has good rating (>= threshold)
   * Encapsulates rating evaluation logic
   */
  hasGoodRating(threshold: number = 4.0): boolean {
    if (this.rep.rating === undefined) return false;
    return this.rep.rating >= threshold;
  }

  toRepresentation(): VeterinarianRepresentation {
    return { ...this.rep };
  }

  equals(other: VeterinarianADT): boolean {
    return this.rep.name === other.getName() &&
           this.rep.address === other.getAddress() &&
           Math.abs(this.rep.lat - other.getLatitude()) < 0.0001 &&
           Math.abs(this.rep.lng - other.getLongitude()) < 0.0001;
  }

  toString(): string {
    return `Vet(${this.rep.name}, ${this.rep.distance})`;
  }
}

/**
 * Factory function: Create valid VeterinarianADT
 */
export function createVeterinarian(data: Partial<VeterinarianRepresentation>): VeterinarianADT {
  if (!data.name || !data.address || data.lat === undefined || data.lng === undefined || data.distanceKm === undefined) {
    throw new Error("Precondition failed: name, address, lat, lng, and distanceKm are required");
  }
  return new VeterinarianADT({
    name: data.name,
    address: data.address,
    phone: data.phone,
    website: data.website,
    rating: data.rating,
    distance: data.distance || `${data.distanceKm.toFixed(1)} km`,
    distanceKm: data.distanceKm,
    open: data.open,
    lat: data.lat,
    lng: data.lng,
    specialty: data.specialty,
  });
}
