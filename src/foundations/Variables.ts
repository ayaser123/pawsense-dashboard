/**
 * Week 1-2: Variables and Type Systems
 * 
 * Demonstrates:
 * - Primitive types (number, string, boolean)
 * - Type annotations and inference
 * - Variable scoping
 * - Const immutability patterns
 */

// ============================================================================
// PRIMITIVE TYPES
// ============================================================================

/** Week 1: Basic primitive types with annotations */
export interface PrimitiveTypes {
  age: number;           // Integer and floating point
  name: string;          // Text values
  isActive: boolean;     // True/false values
  timestamp: number;     // Date as milliseconds
  score: number;         // Floating point
}

/**
 * Week 1: Demonstrate variable declaration patterns
 * Best practice: Use `const` by default, `let` only when reassignment needed
 */
export class VariableManager {
  // Immutable constants (preferred)
  private readonly maxPets = 10;
  private readonly defaultEnergy = "normal";
  private readonly minAge = 0;
  private readonly maxAge = 30;

  /**
   * Type inference - TypeScript deduces type from value
   * const inferred = "hello"; // TypeScript knows this is string
   */
  getDefaultPet() {
    const name = "Unknown";  // inferred as string
    const age = 0;           // inferred as number
    const active = true;     // inferred as boolean
    
    return { name, age, active };
  }

  /**
   * Variable scope - where variables are accessible
   * Block scope: variables inside {} only accessible within block
   */
  validateAge(age: number): boolean {
    // Block scope with const
    const minAge = 0;    // Only accessible in this function
    const maxAge = 30;   // Only accessible in this function
    
    return age >= minAge && age <= maxAge;
  }

  /**
   * Never use implicit any - always annotate types
   * Bad: function process(data) { ... }
   * Good: function process(data: Pet) { ... }
   */
  processUserData(userId: string, age: number): void {
    const id: string = userId;     // Explicit type (though obvious)
    const yearsOld: number = age;  // Explicit type (though obvious)
  }
}

// ============================================================================
// TYPE GUARDS AND NARROWING
// ============================================================================

/**
 * Week 2: Type narrowing - verify type before using
 * Prevents runtime errors from using wrong type
 */
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

/**
 * Type guard narrows union types
 */
export function processValue(value: string | number | boolean) {
  if (isString(value)) {
    // TypeScript knows: value is string
    console.log(value.toUpperCase());
  } else if (isNumber(value)) {
    // TypeScript knows: value is number
    console.log(value.toFixed(2));
  } else {
    // TypeScript knows: value is boolean
    console.log(!value);
  }
}

// ============================================================================
// NULLABLE TYPES
// ============================================================================

/**
 * Week 2: Optional values (may or may not exist)
 * Prevents null pointer errors with TypeScript's strict null checking
 */
export interface Pet {
  name: string;
  age: number;
  nickname?: string;      // Optional property
  lastCheckup?: Date;     // May be undefined
}

/**
 * Work safely with optional values
 */
export function getPetNickname(pet: Pet): string {
  // Option 1: Check existence
  if (pet.nickname) {
    return pet.nickname;
  }
  return pet.name;

  // Option 2: Nullish coalescing operator (??)
  // return pet.nickname ?? pet.name;
}

/**
 * Optional chaining - safely access nested properties
 */
export function getLastCheckupMonth(pet: Pet): number | undefined {
  // Safe access: return undefined if lastCheckup doesn't exist
  return pet.lastCheckup?.getMonth();
}

// ============================================================================
// UNION TYPES
// ============================================================================

/**
 * Week 2: Union types - value can be one of several types
 * Safer than 'any' for flexible functions
 */
export type PetStatus = "healthy" | "sick" | "recovering" | "emergency";
export type EnergyLevel = "low" | "normal" | "high";
export type Activity = "sleeping" | "playing" | "eating" | "resting";

/**
 * Use union types instead of 'any'
 * Bad: function getStatusColor(status: any) { ... }
 * Good: function getStatusColor(status: PetStatus) { ... }
 */
export function getStatusColor(status: PetStatus): string {
  switch (status) {
    case "healthy": return "green";
    case "sick": return "orange";
    case "recovering": return "yellow";
    case "emergency": return "red";
  }
}

export function getEnergyIcon(energy: EnergyLevel): string {
  switch (energy) {
    case "low": return "⚠️";
    case "normal": return "✓";
    case "high": return "⚡";
  }
}

// ============================================================================
// CONSTANTS VS VARIABLES
// ============================================================================

/**
 * Week 1: Use const for values that don't change
 * Use let only when reassignment is necessary
 * NEVER use var (outdated, confusing scope rules)
 */
export class ConfigManager {
  // Top-level constants - all caps by convention
  private static readonly APP_NAME = "PawSense";
  private static readonly MAX_RETRIES = 3;
  private static readonly TIMEOUT_MS = 5000;
  private static readonly API_BASE_URL = "https://api.pawsense.local";

  // Constants that may be reassigned during init
  private isDevelopment: boolean;
  private debugMode: boolean;

  constructor(dev: boolean) {
    // Variables that change can use let
    this.isDevelopment = dev;
    this.debugMode = dev && process.env.DEBUG === "true";
  }

  getConfig() {
    return {
      appName: ConfigManager.APP_NAME,
      maxRetries: ConfigManager.MAX_RETRIES,
      isDevelopment: this.isDevelopment,
      baseUrl: ConfigManager.API_BASE_URL,
    };
  }
}

// ============================================================================
// TYPE ALIASES VS INTERFACES
// ============================================================================

/**
 * Week 2: Type aliases - create new name for existing type
 * Good for simple types, unions, and tuples
 */
export type UserId = string & { readonly __brand: "UserId" };
export type PetId = string & { readonly __brand: "PetId" };
export type Coordinates = [latitude: number, longitude: number];

/**
 * Create branded types - special types that prevent mistakes
 * const id: UserId = "123" as UserId; // Cast to branded type
 * const petId: PetId = "456" as PetId;
 * // TypeScript prevents mixing: const x: UserId = petId; // ERROR
 */
export function createUserId(value: string): UserId {
  return value as UserId;
}

export function createPetId(value: string): PetId {
  return value as PetId;
}

/**
 * Tuple types - fixed-length arrays with specific types at each position
 */
export type LocationTuple = [latitude: number, longitude: number, label: string];

export function parseLocation(location: LocationTuple): object {
  const [lat, lng, label] = location;
  return { latitude: lat, longitude: lng, label };
}

// ============================================================================
// DECLARATIONS
// ============================================================================

/**
 * Week 1: Proper variable initialization
 * Always initialize, never rely on implicit undefined
 */
export class StateManager {
  private petCount: number = 0;          // Initialize to 0
  private pets: string[] = [];           // Initialize to empty array
  private lastUpdate: Date = new Date(); // Initialize to current time
  private isReady: boolean = false;      // Initialize to false

  reset() {
    // Re-initialize state
    this.petCount = 0;
    this.pets = [];
    this.lastUpdate = new Date();
    this.isReady = false;
  }

  addPet(name: string): void {
    this.pets.push(name);
    this.petCount = this.pets.length;
    this.lastUpdate = new Date();
  }

  getState() {
    return {
      count: this.petCount,
      pets: [...this.pets],  // Return copy, not reference
      lastUpdate: this.lastUpdate,
      isReady: this.isReady,
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export interface VariablesConcepts {
  primitives: PrimitiveTypes;
  typeGuards: typeof isString | typeof isNumber | typeof isBoolean;
  unions: {
    PetStatus;
    EnergyLevel;
    Activity;
  };
}
