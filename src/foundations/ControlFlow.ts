/**
 * Week 1-2: Control Flow Patterns
 * 
 * Demonstrates:
 * - If/else conditionals
 * - Switch statements
 * - Ternary operators
 * - Loops (for, while, forEach)
 * - Guard clauses
 * - Early returns
 */

// ============================================================================
// CONDITIONALS
// ============================================================================

/**
 * Week 1: If/else - choose between options
 * Structure: if (condition) { true branch } else { false branch }
 */
export class ConditionalPatterns {
  /**
   * Simple if/else
   */
  checkPetHealth(energy: string, mood: string): string {
    if (energy === "low" && mood === "sick") {
      return "URGENT: Seek veterinary care";
    } else if (energy === "low" || mood === "sick") {
      return "WARNING: Monitor closely";
    } else {
      return "OK: Pet appears healthy";
    }
  }

  /**
   * Nested if/else - multiple levels of conditions
   * Note: Too much nesting = bad readability (use guard clauses instead)
   */
  determineAlertSeverity(energy: string, mood: string, age: number): number {
    if (age > 10) {
      if (energy === "low") {
        if (mood === "sick") {
          return 9; // Critical
        } else {
          return 6; // Warning
        }
      } else {
        return 3; // Info
      }
    } else {
      return 1; // Normal
    }
  }

  /**
   * BETTER: Use guard clauses - early return to avoid nesting
   * This is MORE READABLE than nested if/else
   */
  determineAlertSeverityBetter(energy: string, mood: string, age: number): number {
    // Guard clause 1: Age check
    if (age <= 10) {
      return 1; // Normal for young pets
    }

    // Guard clause 2: Not sick
    if (mood !== "sick" && energy !== "low") {
      return 3; // Info
    }

    // Guard clause 3: Low energy but not sick
    if (energy === "low") {
      return 6; // Warning
    }

    // Default: Both low and sick
    return 9; // Critical
  }

  /**
   * Ternary operator - inline if/else for simple cases
   * Condition ? trueValue : falseValue
   */
  getHealthStatus(energy: string): string {
    return energy === "low" ? "⚠️ Low Energy" : "✓ Good Energy";
  }

  /**
   * Chained ternaries - multiple conditions (but avoid if too complex)
   */
  getMoodEmoji(mood: string): string {
    return mood === "happy"
      ? "😊"
      : mood === "sad"
        ? "😢"
        : mood === "sick"
          ? "🤒"
          : "😐";
  }
}

// ============================================================================
// SWITCH STATEMENTS
// ============================================================================

/**
 * Week 1: Switch - cleaner than multiple if/else
 * Structure: switch (value) { case 1: ...; break; ... default: ... }
 */
export class SwitchPatterns {
  /**
   * Simple switch for string values
   * IMPORTANT: Don't forget 'break' or 'return' to prevent fall-through
   */
  getPetTypeEmoji(type: string): string {
    switch (type) {
      case "dog":
        return "🐕";
      case "cat":
        return "🐈";
      case "bird":
        return "🐦";
      case "rabbit":
        return "🐰";
      default:
        return "🐾";
    }
  }

  /**
   * Switch with multiple cases (fall-through is sometimes useful)
   * All these cases execute the same code
   */
  isSmallPet(type: string): boolean {
    switch (type) {
      case "hamster":
      case "guinea-pig":
      case "rabbit":
      case "ferret":
        return true;
      default:
        return false;
    }
  }

  /**
   * Switch returning values (no fall-through needed)
   */
  getActivityColor(activity: string): string {
    switch (activity) {
      case "sleeping":
        return "gray";
      case "eating":
        return "blue";
      case "playing":
        return "green";
      case "resting":
        return "yellow";
      default:
        return "black";
    }
  }

  /**
   * Prefer ternary/if over switch for simple two-way choices
   * switch is better for 3+ options
   */
  formatEnergy(level: "low" | "normal" | "high"): string {
    // Good use of switch (3 options)
    switch (level) {
      case "low":
        return "Low Energy ⚠️";
      case "normal":
        return "Normal Energy ✓";
      case "high":
        return "High Energy ⚡";
    }
  }
}

// ============================================================================
// LOOPS
// ============================================================================

/**
 * Week 2: Different loop patterns for different situations
 */
export class LoopPatterns {
  /**
   * For loop - when you need index or specific iteration count
   * Structure: for (init; condition; increment) { body }
   */
  sumEnergies(energies: number[]): number {
    let total = 0;
    for (let i = 0; i < energies.length; i++) {
      total += energies[i];
    }
    return total;
  }

  /**
   * For...of loop - iterate over values (not indices)
   * Cleaner than for loop when you don't need index
   */
  getPetNames(pets: { name: string }[]): string[] {
    const names: string[] = [];
    for (const pet of pets) {
      names.push(pet.name);
    }
    return names;
  }

  /**
   * While loop - repeat while condition is true
   * Use when count is unknown
   */
  waitForReady(checkFn: () => boolean, maxAttempts: number): boolean {
    let attempts = 0;
    while (!checkFn() && attempts < maxAttempts) {
      attempts++;
      // In real code: await sleep(100);
    }
    return attempts < maxAttempts;
  }

  /**
   * Do...while - like while but always runs at least once
   * Rarely used, but good for "prompt user until valid input" patterns
   */
  async promptForValidInput(): Promise<number> {
    let input: number;
    do {
      // Get input from user
      input = 42; // Placeholder
    } while (input < 0 || input > 100);
    return input;
  }

  /**
   * ForEach - functional approach, best for processing all items
   * AVOID side effects in forEach (use map/filter instead)
   */
  logAllPets(pets: { name: string }[]): void {
    // OK: forEach for side effects (logging)
    pets.forEach((pet) => {
      console.log(`Pet: ${pet.name}`);
    });
  }

  /**
   * BETTER: Use map when transforming
   * forEach for side effects is OK, but map/filter is clearer for transformations
   */
  getPetNamesMap(pets: { name: string }[]): string[] {
    // Better: map for transformation
    return pets.map((pet) => pet.name);
  }

  /**
   * Breaking out of loops
   */
  findPetByName(pets: { name: string }[], target: string): { name: string } | null {
    for (const pet of pets) {
      if (pet.name === target) {
        return pet; // Early return instead of break
      }
    }
    return null; // Not found
  }

  /**
   * Continue - skip current iteration
   */
  getActivePetNames(pets: { name: string; active: boolean }[]): string[] {
    const names: string[] = [];
    for (const pet of pets) {
      if (!pet.active) {
        continue; // Skip inactive pets
      }
      names.push(pet.name);
    }
    return names;
  }
}

// ============================================================================
// GUARD CLAUSES
// ============================================================================

/**
 * Week 2: Guard clauses - reduce nesting and improve readability
 * Pattern: Handle edge cases at the beginning, return early
 */
export class GuardClausePatterns {
  /**
   * Bad: Multiple nested if statements
   */
  validatePetBad(name: string, age: number, type: string): string {
    if (name && name.length > 0) {
      if (age >= 0 && age <= 30) {
        if (type && type.length > 0) {
          return "valid";
        } else {
          return "error: invalid type";
        }
      } else {
        return "error: invalid age";
      }
    } else {
      return "error: invalid name";
    }
  }

  /**
   * Good: Guard clauses with early returns
   * Much more readable!
   */
  validatePetGood(name: string, age: number, type: string): string {
    // Guard clause 1: Validate name
    if (!name || name.length === 0) {
      return "error: invalid name";
    }

    // Guard clause 2: Validate age
    if (age < 0 || age > 30) {
      return "error: invalid age";
    }

    // Guard clause 3: Validate type
    if (!type || type.length === 0) {
      return "error: invalid type";
    }

    // All checks passed
    return "valid";
  }

  /**
   * Guard against null/undefined - common pattern
   */
  processUserData(user: { name?: string; email?: string } | null): string {
    // Guard: null check
    if (!user) {
      return "error: user not found";
    }

    // Guard: required property
    if (!user.name) {
      return "error: user name required";
    }

    // Safe to use
    return `Hello, ${user.name}`;
  }

  /**
   * Boolean guards with type narrowing
   */
  getDisplayName(user: { name?: string; nickname?: string } | null): string {
    // Multiple guards
    if (!user) return "Unknown User";
    if (!user.name) return "Unnamed";

    // Now we know user and user.name exist
    return user.nickname ? `${user.name} (${user.nickname})` : user.name;
  }
}

// ============================================================================
// BOOLEAN LOGIC
// ============================================================================

/**
 * Week 1: AND (&&), OR (||), NOT (!)
 */
export class BooleanLogic {
  /**
   * && (AND) - both must be true
   * Short-circuits: stops at first false
   */
  shouldAlertUser(energy: string, mood: string): boolean {
    return energy === "low" && mood === "sick";
  }

  /**
   * || (OR) - at least one must be true
   * Short-circuits: stops at first true
   */
  isUrgent(mood: string, energy: string): boolean {
    return mood === "emergency" || energy === "critical";
  }

  /**
   * ! (NOT) - inverts boolean
   */
  isHealthy(isInfected: boolean): boolean {
    return !isInfected;
  }

  /**
   * De Morgan's Laws - simplify boolean logic
   * NOT (A AND B) = (NOT A) OR (NOT B)
   * NOT (A OR B) = (NOT A) AND (NOT B)
   */

  // Bad: Hard to read
  isBadStatus(sick: boolean, injured: boolean): boolean {
    return !(sick && injured); // Either not sick OR not injured
  }

  // Better: Clearer intent
  isGoodStatus(sick: boolean, injured: boolean): boolean {
    return !sick && !injured; // Not sick AND not injured
  }

  /**
   * Nullish coalescing (??) - use default for null/undefined
   * Different from ||: Only triggers for null/undefined, not falsy (0, "", false)
   */
  getEnergyLabel(energy: string | null | undefined): string {
    return energy ?? "unknown"; // Use "unknown" if energy is null/undefined
  }

  /**
   * && for conditional execution - only run if condition true
   */
  renderAlert(show: boolean, message: string): string {
    return show && message ? `Alert: ${message}` : "";
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const ControlFlowConcepts = {
  conditionals: ConditionalPatterns,
  switches: SwitchPatterns,
  loops: LoopPatterns,
  guards: GuardClausePatterns,
  boolean: BooleanLogic,
};
