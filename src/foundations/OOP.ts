/**
 * Week 5-6: Object-Oriented Design
 * 
 * Demonstrates:
 * - Classes and constructors
 * - Properties and methods
 * - Inheritance
 * - Encapsulation (public/private)
 * - Interfaces and contracts
 * - Polymorphism
 */

// ============================================================================
// BASIC CLASSES
// ============================================================================

/**
 * Week 5: Classes - blueprints for objects
 * Structure: class Name { properties; constructor; methods; }
 */
export class Animal {
  // Properties with types
  private name: string;
  private age: number;
  protected species: string; // Accessible in subclasses

  /**
   * Constructor - called when creating new instance
   * Initialize all properties
   */
  constructor(name: string, age: number, species: string) {
    this.name = name;
    this.age = age;
    this.species = species;
  }

  /**
   * Methods - functions that belong to the class
   */
  getName(): string {
    return this.name;
  }

  getAge(): number {
    return this.age;
  }

  /**
   * Method that uses properties
   */
  describe(): string {
    return `${this.name} is a ${this.age}-year-old ${this.species}`;
  }

  /**
   * Method that modifies state
   */
  birthday(): void {
    this.age++;
  }
}

// ============================================================================
// ENCAPSULATION
// ============================================================================

/**
 * Week 5: Access modifiers - control visibility
 * public: accessible from anywhere
 * private: only accessible within the class
 * protected: accessible in class and subclasses
 */
export class Pet extends Animal {
  // Public - anyone can access
  public status: "healthy" | "sick" | "recovering" = "healthy";

  // Private - only within this class
  private lastCheckup: Date;
  private healthRecords: string[] = [];

  // Protected - accessible in this class and subclasses
  protected owner: string;

  constructor(name: string, age: number, owner: string) {
    super(name, age, "unknown");
    this.owner = owner;
    this.lastCheckup = new Date();
  }

  /**
   * Public method - anyone can call
   */
  public getStatus(): string {
    return `${this.getName()} is ${this.status}`;
  }

  /**
   * Private method - only this class can call
   */
  private recordCheckup(): void {
    this.lastCheckup = new Date();
    this.healthRecords.push(`Checkup on ${this.lastCheckup}`);
  }

  /**
   * Protected method - this class and subclasses can call
   */
  protected getOwner(): string {
    return this.owner;
  }

  /**
   * Public getter - looks like property, but runs code
   */
  get lastCheckupDate(): Date {
    return this.lastCheckup;
  }

  /**
   * Public setter - looks like property assignment, but runs code
   */
  set lastCheckupDate(date: Date) {
    if (date > new Date()) {
      throw new Error("Cannot set future checkup date");
    }
    this.lastCheckup = date;
  }

  /**
   * Method that calls private method
   */
  visitVet(): void {
    console.log(`${this.getName()} visited the vet`);
    this.recordCheckup();
  }
}

// ============================================================================
// INHERITANCE
// ============================================================================

/**
 * Week 5-6: Inheritance - extend existing classes
 * Subclass inherits properties and methods from parent
 */
export class Dog extends Animal {
  private breed: string;
  private barkVolume: number;

  constructor(name: string, age: number, breed: string) {
    super(name, age, "Dog");
    this.breed = breed;
    this.barkVolume = 5;
  }

  /**
   * Override - replace parent's method
   */
  describe(): string {
    return `${super.describe()} (${this.breed} breed)`; // Call parent method
  }

  /**
   * New method specific to Dog
   */
  bark(): void {
    console.log("Woof! ".repeat(this.barkVolume));
  }

  /**
   * Getter specific to Dog
   */
  get canBark(): boolean {
    return true;
  }
}

export class Cat extends Animal {
  private indoor: boolean;

  constructor(name: string, age: number, indoor: boolean) {
    super(name, age, "Cat");
    this.indoor = indoor;
  }

  /**
   * Override parent method
   */
  describe(): string {
    return `${super.describe()}, ${this.indoor ? "indoor" : "outdoor"} cat`;
  }

  meow(): void {
    console.log("Meow");
  }
}

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Week 6: Interfaces - define contracts/shapes
 * What methods/properties an object must have
 */
export interface Trainable {
  train(command: string): void;
  obeyCommand(command: string): boolean;
}

export interface Eatable {
  eat(food: string): void;
  getFoodPreference(): string;
}

export interface Sleeper {
  sleep(hours: number): void;
  getEnergyLevel(): number;
}

/**
 * Class can implement multiple interfaces
 * Must define all methods from interfaces
 */
export class TrainedDog extends Dog implements Trainable {
  private commands: string[] = [];

  train(command: string): void {
    this.commands.push(command);
    console.log(`${this.getName()} learned: ${command}`);
  }

  obeyCommand(command: string): boolean {
    return this.commands.includes(command);
  }
}

// ============================================================================
// POLYMORPHISM
// ============================================================================

/**
 * Week 6: Polymorphism - same method, different implementations
 * Different types can implement same interface differently
 */
export class AnimalShelter {
  /**
   * Accept any Animal - polymorphism
   * Actual method called depends on runtime type
   */
  describeAnimal(animal: Animal): string {
    return animal.describe();
  }

  /**
   * Work with any object that has describe() method
   * This is "duck typing" - if it looks like an Animal, treat it as one
   */
  describeMany(animals: Animal[]): string[] {
    return animals.map((animal) => animal.describe());
  }

  /**
   * Polymorphism with Trainable interface
   */
  trainAll(animals: Trainable[]): void {
    animals.forEach((animal) => {
      animal.train("sit");
    });
  }
}

// ============================================================================
// ABSTRACT CLASSES
// ============================================================================

/**
 * Week 6: Abstract classes - base class for inheritance
 * Cannot be instantiated directly
 * Subclasses must implement abstract methods
 */
export abstract class Vehicle {
  protected speed: number = 0;

  abstract getMaxSpeed(): number;

  /**
   * Concrete method - implemented in base class
   */
  describe(): string {
    return `Vehicle with max speed of ${this.getMaxSpeed()}`;
  }
}

export class Car extends Vehicle {
  getMaxSpeed(): number {
    return 200; // km/h
  }
}

export class Bicycle extends Vehicle {
  getMaxSpeed(): number {
    return 40; // km/h
  }
}

// ============================================================================
// COMPOSITION VS INHERITANCE
// ============================================================================

/**
 * Week 6: Composition - "has a" instead of "is a"
 * Often better than inheritance
 */
export interface Engine {
  start(): void;
  stop(): void;
  getHorsepower(): number;
}

export class SimpleEngine implements Engine {
  start(): void {
    console.log("Engine started");
  }

  stop(): void {
    console.log("Engine stopped");
  }

  getHorsepower(): number {
    return 150;
  }
}

/**
 * Composition: Car "has an" Engine
 * Instead of: class Car extends Engine
 */
export class ComposedCar {
  private engine: Engine;
  private model: string;

  constructor(model: string, engine: Engine) {
    this.model = model;
    this.engine = engine;
  }

  start(): void {
    console.log(`${this.model} starting...`);
    this.engine.start();
  }

  getPerformance(): string {
    return `${this.model} has ${this.engine.getHorsepower()}hp`;
  }
}

/**
 * Why composition is often better:
 * 1. Flexibility - swap engine without changing Car
 * 2. No fragile base class problem
 * 3. Can use multiple components
 * 4. Clearer intent
 */

// ============================================================================
// STATIC MEMBERS
// ============================================================================

/**
 * Week 6: Static - belongs to class, not instances
 * Shared across all instances
 */
export class Counter {
  private static count: number = 0;
  private instanceNumber: number;

  constructor() {
    Counter.count++;
    this.instanceNumber = Counter.count;
  }

  /**
   * Static method - called on class, not instance
   * Counter.getTotal(), not counter.getTotal()
   */
  static getTotal(): number {
    return Counter.count;
  }

  getInstance(): number {
    return this.instanceNumber;
  }
}

// Usage: const total = Counter.getTotal(); // Works
// const c = new Counter(); const num = c.getInstance(); // Works

// ============================================================================
// SINGLETON PATTERN
// ============================================================================

/**
 * Week 6: Singleton - only one instance of a class
 * Useful for global state, configuration, logging
 */
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected: boolean = false;

  /**
   * Private constructor - cannot be instantiated directly
   */
  private constructor() {}

  /**
   * Get the single instance
   */
  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  connect(): void {
    this.isConnected = true;
    console.log("Connected to database");
  }

  disconnect(): void {
    this.isConnected = false;
    console.log("Disconnected from database");
  }

  isConnectedStatus(): boolean {
    return this.isConnected;
  }
}

// Usage:
// const db1 = DatabaseConnection.getInstance();
// const db2 = DatabaseConnection.getInstance();
// db1 === db2 // true - same instance!

// ============================================================================
// EXPORTS
// ============================================================================

export const OODConcepts = {
  animals: { Animal, Dog, Cat, Pet },
  interfaces: {
    "Trainable": "interface for trainable entities",
    "Eatable": "interface for eatable items",
    "Sleeper": "interface for entities that sleep"
  },
  abstracts: { Vehicle, Car, Bicycle },
  composition: { SimpleEngine, ComposedCar },
};
