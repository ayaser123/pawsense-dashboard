/**
 * Week 10: Abstract Data Type (ADT) for Pet
 * Realizes ADT concepts with:
 * - Abstraction: Public interface hides implementation
 * - Encapsulation: Private fields with getter methods
 * - Invariants: All valid Pet states must satisfy constraints
 * - Rep Invariant: breed.length > 0, age >= 0, type is valid
 */

export type PetType = "dog" | "cat" | "bird" | "rabbit";
export type MoodType = "happy" | "calm" | "anxious" | "sick" | "playful";

export interface PetRepresentation {
  id: string;
  name: string;
  type: PetType;
  breed: string;
  age: number;
  image: string;
  mood: MoodType;
  lastActivity: string;
}

/**
 * ADT: Pet
 * Invariant: All pets must have valid properties that satisfy business rules
 * - name and breed must not be empty
 * - age must be >= 0
 * - type must be one of the valid types
 * - mood must be one of the valid moods
 */
export class PetADT {
  private readonly rep: PetRepresentation;

  constructor(rep: PetRepresentation) {
    // Precondition: Validate input satisfies invariant
    this.validateInvariant(rep);
    this.rep = { ...rep };
  }

  /**
   * Rep Invariant: Checks if pet representation is valid
   * @throws Error if invariant is violated
   */
  private validateInvariant(rep: PetRepresentation): void {
    const validTypes: PetType[] = ["dog", "cat", "bird", "rabbit"];
    const validMoods: MoodType[] = ["happy", "calm", "anxious", "sick", "playful"];

    if (!rep.id || rep.id.trim().length === 0) {
      throw new Error("Invariant violated: Pet ID cannot be empty");
    }
    if (!rep.name || rep.name.trim().length === 0) {
      throw new Error("Invariant violated: Pet name cannot be empty");
    }
    if (!rep.breed || rep.breed.trim().length === 0) {
      throw new Error("Invariant violated: Pet breed cannot be empty");
    }
    if (!Number.isInteger(rep.age) || rep.age < 0) {
      throw new Error("Invariant violated: Pet age must be non-negative integer");
    }
    if (!validTypes.includes(rep.type)) {
      throw new Error(`Invariant violated: Pet type must be one of ${validTypes.join(", ")}`);
    }
    if (!validMoods.includes(rep.mood)) {
      throw new Error(`Invariant violated: Pet mood must be one of ${validMoods.join(", ")}`);
    }
  }

  // Getter methods: Public interface exposes immutable access
  getId(): string {
    return this.rep.id;
  }

  getName(): string {
    return this.rep.name;
  }

  getType(): PetType {
    return this.rep.type;
  }

  getBreed(): string {
    return this.rep.breed;
  }

  getAge(): number {
    return this.rep.age;
  }

  getImage(): string {
    return this.rep.image;
  }

  getMood(): MoodType {
    return this.rep.mood;
  }

  getLastActivity(): string {
    return this.rep.lastActivity;
  }

  /**
   * Postcondition: Returns new PetADT with updated mood
   * Original pet is unchanged (immutability)
   */
  withMood(newMood: MoodType): PetADT {
    return new PetADT({
      ...this.rep,
      mood: newMood,
    });
  }

  /**
   * Postcondition: Returns new PetADT with updated activity
   */
  withLastActivity(activity: string): PetADT {
    if (!activity || activity.trim().length === 0) {
      throw new Error("Precondition failed: Activity cannot be empty");
    }
    return new PetADT({
      ...this.rep,
      lastActivity: activity,
    });
  }

  /**
   * Postcondition: Returns representation for serialization
   */
  toRepresentation(): PetRepresentation {
    return { ...this.rep };
  }

  /**
   * Equality based on immutable ID and properties
   */
  equals(other: PetADT): boolean {
    return this.rep.id === other.getId() && 
           this.rep.name === other.getName() &&
           this.rep.type === other.getType();
  }

  toString(): string {
    return `Pet(${this.rep.name}, ${this.rep.type}, age=${this.rep.age})`;
  }
}

/**
 * Factory function: Smart constructor with validation
 * Precondition: Input must be valid
 * Postcondition: Returns valid PetADT or throws error
 */
export function createPet(data: Partial<PetRepresentation>): PetADT {
  // Preconditions
  if (!data.id || !data.name || !data.type) {
    throw new Error("Precondition failed: id, name, and type are required");
  }

  const pet: PetRepresentation = {
    id: data.id,
    name: data.name,
    type: data.type,
    breed: data.breed || "Unknown",
    age: data.age ?? 0,
    image: data.image || "🐾",
    mood: data.mood || "calm",
    lastActivity: data.lastActivity || "No activity recorded",
  };

  return new PetADT(pet);
}
