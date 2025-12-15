/**
 * Week 3-4: Functions and Modules
 * 
 * Demonstrates:
 * - Function declaration and parameters
 * - Return types and inference
 * - Closures and scope
 * - Higher-order functions
 * - Module organization
 * - Named exports vs default exports
 */

// ============================================================================
// FUNCTION BASICS
// ============================================================================

/**
 * Week 3: Function declaration
 * Structure: function name(param: Type): ReturnType { body }
 */
export class FunctionBasics {
  /**
   * Simple function with parameters and return type
   * Return type annotation prevents mistakes
   */
  calculateAge(birthYear: number, currentYear: number): number {
    return currentYear - birthYear;
  }

  /**
   * Optional parameters (with default values)
   * Use ? or = for defaults
   */
  greetPet(name: string, greeting: string = "Hello"): string {
    return `${greeting}, ${name}!`;
  }

  /**
   * Rest parameters (...args) - accept variable number of arguments
   * Rest parameter must be last
   */
  sumAll(...numbers: number[]): number {
    return numbers.reduce((sum, n) => sum + n, 0);
  }

  /**
   * Void return type - function doesn't return anything
   */
  logActivity(petName: string, activity: string): void {
    console.log(`${petName} is ${activity}`);
    // No return statement
  }

  /**
   * Function overloading - same function, different signatures
   * TypeScript matches the most specific signature
   */
  formatDuration(seconds: number): string;
  formatDuration(minutes: number, seconds: number): string;
  formatDuration(minutesOrSeconds: number, seconds?: number): string {
    if (seconds !== undefined) {
      // Overload 2: minutes and seconds
      return `${minutesOrSeconds}m ${seconds}s`;
    } else {
      // Overload 1: only seconds
      const mins = Math.floor(minutesOrSeconds / 60);
      const secs = minutesOrSeconds % 60;
      return `${mins}m ${secs}s`;
    }
  }
}

// ============================================================================
// ARROW FUNCTIONS
// ============================================================================

/**
 * Week 3: Arrow functions - modern function syntax
 * Syntax: (params) => body
 * Benefits: Concise, lexical 'this' binding
 */
export class ArrowFunctions {
  /**
   * Single expression arrow function - implicit return
   */
  double = (n: number): number => n * 2;

  /**
   * Multiple statements - need curly braces
   */
  processName = (name: string): string => {
    const trimmed = name.trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  };

  /**
   * No parameters
   */
  getCurrentTimestamp = (): number => Date.now();

  /**
   * Single parameter - optional parentheses
   */
  isPositive = (n: number) => n > 0;

  /**
   * Returning objects - use parentheses to avoid block confusion
   */
  createPetInfo = (name: string, age: number) => ({
    name,
    age,
    isAdult: age > 1,
  });

  /**
   * Higher-order function - returns another function
   */
  makeMultiplier =
    (factor: number) =>
    (n: number): number =>
      n * factor;

  // Usage:
  // const double = makeMultiplier(2);
  // double(5); // 10
}

// ============================================================================
// FUNCTION TYPES
// ============================================================================

/**
 * Week 3: Type signatures for functions
 */
export type PetProcessor = (pet: { name: string; age: number }) => string;
export type AlertHandler = (level: number, message: string) => void;
export type Predicate<T> = (item: T) => boolean;
export type Transformer<T, U> = (item: T) => U;

/**
 * Using function types as parameters
 */
export class FunctionTypes {
  /**
   * Accept any function matching the type
   */
  processPets(
    pets: { name: string; age: number }[],
    processor: PetProcessor
  ): string[] {
    return pets.map(processor);
  }

  /**
   * Predicate - function that returns boolean
   */
  filterPets<T>(items: T[], predicate: Predicate<T>): T[] {
    return items.filter(predicate);
  }

  /**
   * Transformer - function that converts one type to another
   */
  transformPets<T, U>(items: T[], transformer: Transformer<T, U>): U[] {
    return items.map(transformer);
  }

  /**
   * Callback pattern - function passed to async operation
   */
  fetchAndProcess(
    petId: string,
    onSuccess: (data: { name: string }) => void,
    onError: (error: string) => void
  ): void {
    try {
      // Simulate fetch
      onSuccess({ name: "Max" });
    } catch (error) {
      onError("Failed to fetch");
    }
  }
}

// ============================================================================
// CLOSURES AND SCOPE
// ============================================================================

/**
 * Week 4: Closures - inner function has access to outer function's variables
 */
export class ClosureExamples {
  /**
   * Creating a closure - inner function remembers outer variables
   */
  makeCounter(initialValue: number = 0) {
    let count = initialValue; // Captured by closure

    return {
      increment: () => ++count,
      decrement: () => --count,
      getCount: () => count,
      reset: () => {
        count = initialValue;
      },
    };
  }

  /**
   * Private state through closure
   * The count variable is completely private
   */
  createPrivatePetList() {
    let pets: string[] = []; // Only accessible through returned functions

    return {
      addPet: (name: string) => {
        pets.push(name);
      },
      removePet: (name: string) => {
        pets = pets.filter((p) => p !== name);
      },
      getPets: () => [...pets], // Return copy, not reference
      count: () => pets.length,
    };
  }

  /**
   * Closure with callback - remember data from enclosing scope
   */
  createPetAlert(petName: string, alertLevel: number) {
    return (message: string) => {
      // Closure: remembers petName and alertLevel from outer scope
      console.log(`[${alertLevel}] ${petName}: ${message}`);
    };
  }

  /**
   * Practical closure: Logger with context
   */
  createLogger(context: string) {
    return {
      info: (msg: string) => console.log(`[INFO] ${context}: ${msg}`),
      warn: (msg: string) => console.warn(`[WARN] ${context}: ${msg}`),
      error: (msg: string) => console.error(`[ERROR] ${context}: ${msg}`),
    };
  }

  /**
   * Variable shadowing - be careful with closure scopes
   */
  createConfusingClosure() {
    const x = 1;
    const fn1 = () => {
      const x = 2; // Shadows outer x
      return x; // Returns 2
    };

    const fn2 = () => {
      return x; // Returns 1 (original outer x)
    };

    return { fn1, fn2 };
  }
}

// ============================================================================
// HIGHER-ORDER FUNCTIONS
// ============================================================================

/**
 * Week 4: Higher-order functions - take or return functions
 * Enables functional programming patterns
 */
export class HigherOrderFunctions {
  /**
   * Function that takes a function as parameter
   */
  applyTwice(fn: (x: number) => number, x: number): number {
    return fn(fn(x));
  }

  /**
   * Function that returns a function
   */
  createMultiplier(factor: number): (x: number) => number {
    return (x: number) => x * factor;
  }

  /**
   * Composition - combine functions
   */
  compose<A, B, C>(
    f: (a: A) => B,
    g: (b: B) => C
  ): (a: A) => C {
    return (a: A) => g(f(a));
  }

  /**
   * Pipe - reverse order of composition
   */
  pipe<A, B, C>(
    f: (a: A) => B,
    g: (b: B) => C
  ): (a: A) => C {
    return (a: A) => g(f(a));
  }

  /**
   * Memoization - cache function results
   */
  memoize<T, R>(fn: (arg: T) => R): (arg: T) => R {
    const cache = new Map<T, R>();

    return (arg: T) => {
      if (cache.has(arg)) {
        return cache.get(arg)!;
      }
      const result = fn(arg);
      cache.set(arg, result);
      return result;
    };
  }

  /**
   * Debounce - delay function execution
   * Useful for search input, resize handlers
   */
  debounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }

  /**
   * Throttle - limit function execution frequency
   * Useful for scroll, mousemove handlers
   */
  throttle<T extends (...args: unknown[]) => unknown>(
    fn: T,
    interval: number
  ): (...args: Parameters<T>) => void {
    let lastCall = 0;

    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= interval) {
        lastCall = now;
        fn(...args);
      }
    };
  }

  /**
   * Currying - convert function to series of single-argument functions
   */
  curry(fn: (a: number, b: number, c: number) => number) {
    return (a: number) => (b: number) => (c: number) => fn(a, b, c);
  }
}

// ============================================================================
// MODULE ORGANIZATION
// ============================================================================

/**
 * Week 4: Modules - organize code into reusable pieces
 * Benefits: Encapsulation, reusability, clarity
 */

// Named exports - explicit about what's exported
export function calculateDaysSinceLastCheckup(lastDate: Date): number {
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lastDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Default export - one per module
export default class PetUtilities {
  static calculateAgeInMonths(birthDate: Date): number {
    const today = new Date();
    let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
    months += today.getMonth() - birthDate.getMonth();
    return months;
  }

  static isJuvenile(ageMonths: number): boolean {
    return ageMonths < 12;
  }

  static isAdult(ageMonths: number): boolean {
    return ageMonths >= 12 && ageMonths < 84;
  }

  static isSenior(ageMonths: number): boolean {
    return ageMonths >= 84;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const FunctionsConcepts = {
  basics: FunctionBasics,
  arrows: ArrowFunctions,
  types: FunctionTypes,
  closures: ClosureExamples,
  higherOrder: HigherOrderFunctions,
};
