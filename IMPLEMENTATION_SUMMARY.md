# PawSense Dashboard - Software Engineering Concepts Implementation

## Overview

This refactored PawSense Dashboard integrates advanced software engineering concepts from Weeks 10-16 of a computer science curriculum, while maintaining full backward compatibility and all original functionality.

**All existing features work exactly as before.** The refactoring adds enterprise-grade architectural patterns underneath.

---

## What Was Implemented

### ✅ Week 10-11: Abstract Data Types (ADT) with Invariants

Created type-safe wrapper classes with guaranteed invariants:

- **PetADT** (`src/adt/PetADT.ts`) - Pet with validated properties
- **LocationADT** (`src/adt/LocationADT.ts`) - Geographic coordinates with distance calculations  
- **VeterinarianADT** (`src/adt/VeterinarianADT.ts`) - Veterinarian profiles with quality metrics
- **AlertADT** (`src/adt/AlertADT.ts`) - Type-safe alerts with severity levels

Each ADT enforces:
- ✓ Rep Invariants (internal consistency rules)
- ✓ Preconditions (method requirements)
- ✓ Postconditions (method guarantees)
- ✓ Immutability (no side effects)

### ✅ Week 12: Recursive Data Types

Implemented **AlertTree** (`src/adt/AlertTree.ts`) - a recursive tree structure for hierarchical alerts with 6 recursive algorithms:

- `getAllAlerts()` - Depth-first traversal
- `countAlerts()` - Count nodes
- `findAlertById()` - Search tree
- `getDepth()` - Calculate height
- `mapAlerts()` - Transform all nodes
- `filterCritical()` - Structural filtering

Each demonstrates correct recursive decomposition with base and recursive cases.

### ✅ Week 13-14: Formal Grammars and Parsing

Implemented a complete parsing pipeline in **HealthRuleParser** (`src/parsers/HealthRuleParser.ts`):

1. **Lexer** - Tokenizes input (numbers, strings, operators, keywords)
2. **Parser** - Recursive descent parser builds Abstract Syntax Tree (AST)
3. **Evaluator** - Interprets AST against evaluation context

Supports rule expressions:
```
age > 5 AND mood = Happy OR energy = Low
```

Proper error reporting with character positions.

### ✅ Week 15: Concurrency Management

Complete concurrency toolkit in **ConcurrencyManager** (`src/concurrency/ConcurrencyManager.ts`):

- **Semaphore** - Limit concurrent operations
- **ConcurrentCache** - Thread-safe cache with TTL
- **RequestThrottler** - Max once per interval
- **RequestDebouncer** - Delay until activity stops
- **BatchProcessor** - Collect and process together
- **AtomicCounter** - Race-condition-free counter
- **ConcurrencyUtils** - Retry with exponential backoff, timeouts

**Real-world use**: LocationService uses Semaphore(3) to limit concurrent API requests.

### ✅ Week 16: Little Languages (DSL)

Alert Rules Domain-Specific Language in **AlertRulesDSL** (`src/dsl/AlertRulesDSL.ts`):

Write business rules in declarative syntax:
```
RULE "Low Energy Alert"
  WHEN pet.energy = "Low"
  THEN CREATE_ALERT warning "Low Energy" "Pet has low energy" severity 6 action "Monitor"
```

Features:
- ✓ Full DSL parser (Lexer → Parser → AST)
- ✓ AlertRulesEngine for rule evaluation
- ✓ Generates alerts automatically based on pet state
- ✓ Non-programmers can define rules

### ✅ Integration: Services with ADT + Concurrency

**LocationService** (`src/services/LocationService.ts`):
- Abstracts geographic operations
- Limits concurrent requests (Semaphore)
- Caches results with TTL
- Returns LocationADT and VeterinarianADT objects
- Retry logic for resilience

**AlertsService** (updated `src/services/alertsService.ts`):
- Uses AlertADT for type safety
- AlertTree for hierarchical organization
- AlertRulesDSL for rule-based generation
- Concurrent access control with Semaphore

---

## Directory Structure

```
src/
├── adt/                          # Week 10-12: Abstract Data Types
│   ├── PetADT.ts                # Pet with invariants
│   ├── LocationADT.ts           # Location with geography
│   ├── VeterinarianADT.ts       # Vet with metrics
│   ├── AlertADT.ts             # Alert with severity
│   └── AlertTree.ts            # Recursive alert tree
│
├── parsers/                     # Week 13-14: Grammars & Parsing
│   └── HealthRuleParser.ts      # Lexer, Parser, Evaluator
│
├── dsl/                         # Week 16: Little Languages
│   └── AlertRulesDSL.ts        # Alert rules domain language
│
├── concurrency/                 # Week 15: Concurrency
│   └── ConcurrencyManager.ts   # Semaphore, Cache, Throttle, etc.
│
├── services/                    # Service layer with ADT
│   ├── LocationService.ts      # Location with concurrency
│   └── alertsService.ts        # Alerts with DSL integration
│
└── [existing code unchanged]
```

---

## Backward Compatibility

✅ **All existing code works unchanged:**

- Existing imports still work
- Legacy alert creation functions preserved
- Dashboard works exactly as before
- No breaking changes to APIs

## How to Use

### 1. Create Type-Safe Pet

```typescript
import { createPet } from "@/adt/PetADT";

const pet = createPet({
  id: "pet1",
  name: "Luna",
  type: "dog",
  breed: "Golden Retriever",
  age: 3,
  mood: "happy"
});

// Invariant enforced: throws if breed is empty or age < 0
```

### 2. Use Location Service (Concurrency-Safe)

```typescript
import { getLocationService } from "@/services/LocationService";

const service = getLocationService();

// Automatically cached & thread-safe
const location = await service.getUserLocation();
const nearbyVets = await service.searchNearbyVeterinarians(
  location.getLatitude(),
  location.getLongitude(),
  10 // km radius
);
```

### 3. Define Alert Rules

```typescript
import { initializeAlertRulesEngine } from "@/dsl/AlertRulesDSL";

const engine = initializeAlertRulesEngine();

engine.addRuleFromDSL(
  'RULE "Old Pet Care" ' +
  'WHEN pet.age > 10 ' +
  'THEN CREATE_ALERT warning "Senior Pet" ' +
  '"Monitor health closely" severity 6'
);

const alerts = engine.evaluateRules(myPet);
```

### 4. Work with Alert Trees

```typescript
import { AlertTree } from "@/adt/AlertTree";

const tree = new AlertTree(rootAlert);

// Recursive operations
const all = tree.getAllAlerts();        // Get all
const count = tree.countAlerts();       // Count
const critical = tree.filterCritical(); // Filter by severity
```

### 5. Parse Rules

```typescript
import { parseHealthRule, evaluateHealthRule } from "@/parsers/HealthRuleParser";

const result = evaluateHealthRule(
  "age > 5 AND mood = Happy",
  { age: 7, mood: "Happy" }
); // true
```

---

## Key Design Patterns

### 1. Abstract Data Type (ADT) Pattern
```typescript
class PetADT {
  private readonly rep: PetRepresentation;
  
  // Invariant validation
  constructor(rep) {
    this.validateInvariant(rep);
  }
  
  // Public interface only (no direct access to rep)
  getName(): string { return this.rep.name; }
  
  // Immutable updates
  withMood(mood): PetADT { ... }
}
```

### 2. Recursive Type Pattern
```typescript
type AlertNode = AlertLeaf | AlertBranch;

interface AlertLeaf { alert: AlertADT }
interface AlertBranch { 
  alert: AlertADT;
  children: AlertNode[] // Recursive!
}
```

### 3. Semaphore for Concurrency
```typescript
const semaphore = new Semaphore(3); // Max 3 concurrent

async function getLimite () {
  return semaphore.withPermit(async () => {
    // Only 3 of these run simultaneously
  });
}
```

### 4. Parser Pattern (Lexer → Parser → Evaluator)
```
Input: "age > 5 AND mood = Happy"
  ↓ Lexer tokenizes
Tokens: ["age", ">", "5", "AND", "mood", "=", "Happy"]
  ↓ Parser builds AST
AST: BinaryOp(AND, Condition(age > 5), Condition(mood = Happy))
  ↓ Evaluator interprets
Result: true/false
```

### 5. DSL Pattern (Declarative Rules)
```
Instead of: if (pet.energy === "Low") createAlert(...)
Write: RULE "Low Energy" WHEN pet.energy = "Low" THEN CREATE_ALERT ...
```

---

## Performance Considerations

### Caching
- LocationService caches results for 1 hour
- AlertTree reuses shared structure
- Concurrent requests limited to prevent API overload

### Concurrency Limits
- LocationService: Max 3 concurrent requests
- AlertsService: Max 2 concurrent operations
- Throttle: Max 1 alert generation per second

### Memory
- AlertTree shares immutable data structures
- Recursive operations use tail-call patterns where possible
- Cache bounds: Fixed to prevent memory leaks

---

## Testing

All new components are designed to be testable:

```typescript
// Test ADT invariants
test("PetADT enforces non-empty name", () => {
  expect(() => createPet({ name: "" })).toThrow();
});

// Test recursive operations
test("AlertTree.getDepth() works", () => {
  const tree = new AlertTree(leaf);
  expect(tree.getDepth()).toBe(0);
});

// Test parser
test("HealthRuleParser handles AND/OR", () => {
  const ast = parseHealthRule("a > 5 AND b = 10");
  expect(ast.type).toBe("binaryOp");
});

// Test concurrency
test("Semaphore limits concurrency", async () => {
  const sem = new Semaphore(2);
  // Only 2 run at once
});
```

---

## Documentation

For detailed information on each concept, see:

📖 **SOFTWARE_ENGINEERING_CONCEPTS.md** - Complete guide with:
- Architecture overview
- Implementation details for each concept
- Real-world examples
- Testing strategies
- Best practices

---

## What Didn't Change

✅ Dashboard UI/UX - Exactly the same
✅ User experience - Completely unchanged  
✅ API endpoints - All preserved
✅ Data storage - Same localStorage usage
✅ Authentication - Supabase integration unchanged

---

## Future Enhancements

1. **More DSL Rules** - Add more conditions and actions
2. **Database Integration** - Persist rules and alerts
3. **Rule Editor UI** - Visual rule builder
4. **Performance Monitoring** - Track concurrent operation metrics
5. **Advanced Parsing** - Support more complex expressions
6. **Serialization** - Persist ADT objects to JSON

---

## Summary

This refactoring demonstrates professional software engineering practices while preserving all existing functionality. Every line of code works exactly as before, but now with:

- ✅ Type safety (ADTs)
- ✅ Guaranteed properties (Invariants)
- ✅ Hierarchical organization (Recursive data types)
- ✅ Declarative rules (DSL)
- ✅ Race condition prevention (Concurrency)
- ✅ Formal parsing (Grammars)

The code is now production-ready, maintainable, and extensible.
