## Software Engineering Concepts Implementation Guide

This refactored PawSense Dashboard demonstrates advanced software engineering concepts from Weeks 10-16 of a computer science curriculum.

### Architecture Overview

The codebase implements a layered architecture with multiple concepts integrated:

```
Dashboard (UI Layer)
    ↓
Services (ADT + Concurrency Layer)
    ↓
Abstractions (LocationService, AlertsService)
    ↓
ADT Layer (Type-Safe Data Structures)
    ↓
DSL & Parsers (Rules Engine & Language Processing)
    ↓
Concurrency Manager (Race Condition Prevention)
```

---

## Week 10-11: Abstract Data Types (ADT) and Invariants

### Concepts Demonstrated

**Abstraction**: Hiding implementation details behind public interfaces
**Encapsulation**: Private data with controlled access through methods
**Invariants**: Constraints that always hold for valid objects
**Rep Invariant**: Rules for internal representation validity
**Preconditions & Postconditions**: Method contracts

### Implementation Files

#### `src/adt/PetADT.ts`
- **Class**: `PetADT`
- **Invariant**: Pet must have non-empty name/breed, valid age (≥0), valid type and mood
- **Rep Invariant**: All fields must satisfy business rules
- **Key Methods**:
  - `constructor()`: Validates invariant, throws if violated
  - `getMood()`, `getName()`: Provide immutable access
  - `withMood(newMood)`: Returns new immutable instance
  - `equals()`: Type-safe equality checking

**Example Usage**:
```typescript
import { createPet } from "@/adt/PetADT";

const pet = createPet({
  id: "pet1",
  name: "Luna",
  type: "dog",
  breed: "Golden Retriever",
  age: 3
});

const happyPet = pet.withMood("happy");
```

#### `src/adt/LocationADT.ts`
- **Class**: `LocationADT`
- **Invariant**: Latitude ∈ [-90, 90], Longitude ∈ [-180, 180]
- **Encapsulated Operations**:
  - `distanceTo(other)`: Haversine distance calculation
  - `bearingTo(other)`: Geographic bearing computation
- **Key Benefit**: All geographic operations hidden from clients

#### `src/adt/VeterinarianADT.ts`
- **Class**: `VeterinarianADT`
- **Invariant**: Non-empty name/address, valid rating [0-5], valid coordinates
- **Encapsulated Logic**:
  - `isNearby(threshold)`: Proximity checking
  - `hasGoodRating(threshold)`: Rating evaluation
- **Key Benefit**: Veterinarian quality metrics abstracted

#### `src/adt/AlertADT.ts`
- **Class**: `AlertADT`
- **Invariant**: Non-empty ID/title/message, valid type/source, severity ∈ [0-10]
- **Preconditions**: Validation in constructor
- **Postconditions**: Guaranteed valid state or exception
- **Methods**:
  - `markAsRead()`: Immutable update returning new AlertADT
  - `requiresImmediateAction()`: Encapsulated severity logic

---

## Week 12: Recursive Data Types

### Concepts Demonstrated

**Recursive Definitions**: Data types that reference themselves
**Recursive Algorithms**: Solving problems by breaking into subproblems
**Choosing Right Subproblem**: Correct recursive decomposition
**Tree Structures**: Hierarchical organization

### Implementation File

#### `src/adt/AlertTree.ts`
- **Type Definition**: `AlertNode` = `AlertLeaf` | `AlertBranch`
- **Base Case**: `AlertLeaf` contains single alert
- **Recursive Case**: `AlertBranch` contains parent alert + array of child nodes

**Recursive Operations Implemented**:

1. **getAllAlerts()** - Depth-first traversal
   ```
   Base case: Leaf returns its alert
   Recursive case: Branch returns alert + all children's alerts
   ```

2. **countAlerts()** - Count nodes in tree
   ```
   Base case: Leaf = 1
   Recursive case: 1 + sum of children's counts
   ```

3. **findAlertById(id)** - Search tree
   ```
   Base case: Return if node matches ID
   Recursive case: Search children if not found
   ```

4. **getDepth()** - Tree height
   ```
   Base case: Leaf depth = 0
   Recursive case: 1 + max(children depths)
   ```

5. **mapAlerts(fn)** - Functional transformation
   ```
   Base case: Transform leaf alert
   Recursive case: Transform node + recursively transform children
   ```

6. **filterCritical()** - Structural recursion filtering
   ```
   Base case: Keep leaf if critical
   Recursive case: Keep branch if critical or has critical children
   ```

**Common Mistakes Prevented**:
- ✓ Handling both base and recursive cases
- ✓ Ensuring termination (base case reached)
- ✓ Proper subproblem selection (children in tree)
- ✓ Immutable data structures for safety

---

## Week 13-14: Grammars and Parsing

### Concepts Demonstrated

**Formal Grammar**: Specification of language syntax
**Lexical Analysis**: Converting input to tokens
**Parsing**: Building abstract syntax trees (AST)
**Error Handling**: Reporting parse failures
**AST Traversal**: Processing parsed structures

### Implementation File

#### `src/parsers/HealthRuleParser.ts`

**Grammar (BNF)**:
```
Rule := Condition (("AND" | "OR") Condition)*
Condition := Metric Operator Value
Metric := "age" | "energy" | "mood" | "activity"
Operator := ">" | "<" | "==" | "!=" | "contains"
Value := NUMBER | STRING
```

**AST Node Types**:
```typescript
ConditionNode {
  type: "condition"
  metric: string
  operator: string
  value: string | number
}

BinaryOpNode {
  type: "binaryOp"
  operator: "AND" | "OR"
  left: ConditionNode | BinaryOpNode
  right: ConditionNode | BinaryOpNode
}
```

**Three-Phase Implementation**:

1. **Lexer** - Tokenization
   - Handles whitespace, identifiers, numbers, strings, operators
   - Error reporting with character positions
   - Precondition: Input is string
   - Postcondition: Array of tokens or error

2. **Parser** - Recursive Descent Parsing
   - `parseRule()`: Handles binary operators (left-associative)
   - `parseCondition()`: Parses metric, operator, value
   - `parseValue()`: Extracts number or string
   - Error messages include position information
   - Precondition: Valid tokens
   - Postcondition: AST or parse error

3. **Evaluator** - AST Interpretation
   - Recursive evaluation of tree structure
   - Supports all operators (>, <, ==, !=, contains)
   - Precondition: Valid AST and evaluation context
   - Postcondition: Boolean result

**Example Usage**:
```typescript
import { parseHealthRule, evaluateHealthRule } from "@/parsers/HealthRuleParser";

const rule = parseHealthRule("age > 5 AND mood = Happy");

const result = evaluateHealthRule(
  "age > 5 AND mood = Happy",
  { age: 7, mood: "Happy" }
); // true
```

---

## Week 16: Little Languages (Domain-Specific Languages)

### Concepts Demonstrated

**Domain-Specific Language (DSL)**: Language tailored to specific problem domain
**Representing Code as Data**: Rules expressed as data structures
**Language Design**: Syntax and semantics for problem solving
**Declarative Programming**: Specifying what, not how

### Implementation File

#### `src/dsl/AlertRulesDSL.ts`

**Alert Rules DSL Syntax**:
```
RULE "Rule Name"
  WHEN condition
  THEN CREATE_ALERT type "title" "message" [severity N] [action "action text"]

Examples:
  RULE "Low Energy Alert"
    WHEN pet.energy = "Low"
    THEN CREATE_ALERT warning "Low Energy" "Pet has low energy" severity 6

  RULE "Health Concern"
    WHEN pet.mood = "Sick" OR pet.energy = "Low"
    THEN CREATE_ALERT critical "Health Alert" "Seek veterinary care" severity 9 action "Find Vet"
```

**Key Components**:

1. **RuleDefinition** - AST for rules
   ```typescript
   {
     name: string
     condition: ConditionExpression
     action: AlertAction
   }
   ```

2. **ConditionExpression** - Recursive condition structure
   - `SimpleCondition`: field operator value
   - `CompositeCondition`: condition AND/OR condition

3. **AlertRulesLanguage** - Parser for DSL
   - `parse(ruleString)`: Complete parsing pipeline
   - Tokenization → Parsing → AST construction
   - Error handling throughout

4. **AlertRulesEngine** - Rule evaluation engine
   - `addRule(rule)`: Register rule
   - `addRuleFromDSL(ruleString)`: Parse and register
   - `evaluateRules(pet)`: Execute all matching rules
   - Returns generated alerts

**Example Usage**:
```typescript
import { AlertRulesEngine, initializeAlertRulesEngine } from "@/dsl/AlertRulesDSL";

const engine = initializeAlertRulesEngine();

// Add custom rule
engine.addRuleFromDSL(
  'RULE "Old Pet Alert" WHEN pet.age > 10 ' +
  'THEN CREATE_ALERT warning "Senior Pet" "Monitor health closely" severity 5'
);

// Evaluate rules
const alerts = engine.evaluateRules(myPet);
```

**Benefits**:
- Non-programmers can define business rules
- Easy to test, extend, and maintain
- Declarative (easier to understand than procedural code)
- Reusable across different contexts

---

## Week 15: Concurrency

### Concepts Demonstrated

**Race Conditions**: Multiple threads accessing shared state
**Synchronization**: Preventing race conditions
**Semaphores**: Mutual exclusion primitives
**Concurrent Programming Models**: Async/await with proper safeguards
**Testing Concurrency**: Challenges and patterns

### Implementation File

#### `src/concurrency/ConcurrencyManager.ts`

**Key Classes**:

1. **Semaphore** - Binary or counting semaphore
   - `acquire()`: Get permit or block
   - `release()`: Release permit, wake waiting task
   - `withPermit(fn)`: Execute function with permit
   - Guarantees: Only N operations run concurrently
   ```typescript
   const semaphore = new Semaphore(3); // Max 3 concurrent
   await semaphore.withPermit(async () => {
     // Only 3 of these run simultaneously
   });
   ```

2. **ConcurrentCache** - Thread-safe cache with TTL
   - `get(key)`: Retrieve cached value
   - `set(key, value, ttlMs)`: Store with expiration
   - Race-condition free due to semaphore protection
   - Perfect for API response caching

3. **RequestThrottler** - Prevent request spam
   - `throttle(fn)`: Execute at most once per interval
   - Returns null if called too soon
   - Use case: Preventing duplicate API calls

4. **RequestDebouncer** - Delay execution until activity stops
   - `debounce(callback)`: Delay callback
   - `cancel()`: Cancel pending execution
   - Use case: Deferring expensive operations until user stops typing

5. **BatchProcessor** - Collect and process together
   - `add(item)`: Queue item
   - Automatically batches when threshold reached or timeout expires
   - Reduces overhead, prevents thundering herd
   - Use case: Bulk sending analytics events

6. **AtomicCounter** - Race-condition free counter
   - `increment()`, `decrement()`, `get()`, `set()`
   - All operations atomic (one at a time)
   - Use case: Request counting

7. **ConcurrencyUtils** - Helper functions
   - `race(promises)`: First promise wins
   - `allWithTimeout(promises, ms)`: Timeout protection
   - `retryWithBackoff(fn, attempts, baseDelay)`: Resilient retries

**Real-World Integration**:

LocationService uses concurrency:
```typescript
class LocationService {
  private semaphore: Semaphore;
  private cache: ConcurrentCache;
  
  constructor() {
    // Max 3 concurrent API requests
    this.semaphore = new Semaphore(3);
  }
  
  async getUserLocation(): Promise<LocationADT> {
    return this.semaphore.withPermit(async () => {
      // Check cache first
      const cached = await this.cache.get("user_location");
      if (cached) return cached;
      
      // Fetch location with max 5 second timeout
      const location = await this.fetchLocation();
      
      // Cache for 5 minutes
      await this.cache.set("user_location", location, 300000);
      return location;
    });
  }
}
```

**Race Condition Prevention Example**:

Without Semaphore (❌ unsafe):
```typescript
let count = 0;
// Two concurrent increment() calls might result in count=1 instead of 2
// due to read-modify-write race condition
async function increment() {
  const current = count; // Read
  count = current + 1;   // Write (but current might be stale!)
}
```

With Semaphore (✓ safe):
```typescript
const semaphore = new Semaphore(1);
let count = 0;
async function increment() {
  return semaphore.withPermit(async () => {
    const current = count; // Read
    count = current + 1;   // Write (guaranteed no interference)
  });
}
```

---

## Integration: Services with ADT and Concurrency

### `src/services/LocationService.ts`

Demonstrates:
- ✓ Abstract interface (`ILocationService`)
- ✓ Concrete implementation with ADT objects
- ✓ Concurrency management (Semaphore, ConcurrentCache)
- ✓ Error handling with LocationADT error states
- ✓ Encapsulation of geographic algorithms

```typescript
class LocationService implements ILocationService {
  async getUserLocation(): Promise<LocationADT> {
    return this.semaphore.withPermit(async () => {
      // Check cache (race-safe due to semaphore)
      const cached = await this.cache.get("user_location");
      if (cached) return cached;
      
      // Fetch with retry (exponential backoff)
      const location = await ConcurrencyUtils.retryWithBackoff(
        () => this.fetchLocation(),
        3,
        500
      );
      
      // Cache result
      await this.cache.set("user_location", location, 300000);
      return location;
    });
  }
}
```

### `src/services/AlertsService.ts`

Demonstrates:
- ✓ AlertADT integration for type-safe alerts
- ✓ AlertTree for hierarchical alert management
- ✓ AlertRulesDSL for rule-based generation
- ✓ Concurrent access control
- ✓ Throttling to prevent alert spam

---

## How to Use the Refactored Code

### 1. Create Type-Safe Pet
```typescript
import { createPet, type MoodType } from "@/adt/PetADT";

const pet = createPet({
  id: "pet123",
  name: "Max",
  type: "dog",
  breed: "Labrador",
  age: 5
});

// Invariant: Will throw if breed is empty or age is negative
const pet2 = createPet({ name: "Luna" }); // ❌ Missing required fields
```

### 2. Use Location Service with Concurrency
```typescript
import { getLocationService } from "@/services/LocationService";

const service = getLocationService(); // Singleton

const location = await service.getUserLocation();
if (location.hasError()) {
  console.log("Error:", location.getError());
} else {
  console.log("Location:", location.getLatitude(), location.getLongitude());
}

// Automatically cached and race-condition free
```

### 3. Define Rules in DSL
```typescript
import { initializeAlertRulesEngine } from "@/dsl/AlertRulesDSL";

const engine = initializeAlertRulesEngine();

// Add custom business rule
engine.addRuleFromDSL(
  'RULE "Puppy Celebration" ' +
  'WHEN pet.age < 1 ' +
  'THEN CREATE_ALERT success "Welcome Puppy!" ' +
  '"Your puppy is growing up!" severity 1'
);

const alerts = engine.evaluateRules(myPet);
```

### 4. Work with Alert Trees
```typescript
import { AlertTree, type AlertNode } from "@/adt/AlertTree";

const tree = new AlertTree(rootAlert);

// Recursive operations
const allAlerts = tree.getAllAlerts();
const depth = tree.getDepth();
const critical = tree.filterCritical();

// Find specific alert
const alert = tree.findAlertById("alert_123");
```

### 5. Parse Health Rules
```typescript
import { parseHealthRule, evaluateHealthRule } from "@/parsers/HealthRuleParser";

const rule = parseHealthRule("age > 5 AND mood = Happy");

const context = { age: 7, mood: "Happy" };
const isValid = evaluateHealthRule(
  "age > 5 AND mood = Happy",
  context
); // true
```

---

## Testing Considerations

### Testing ADT Invariants
```typescript
import { PetADT, createPet } from "@/adt/PetADT";

test("PetADT enforces invariants", () => {
  expect(() => createPet({ 
    name: "", // Empty name violates invariant
    type: "dog"
  })).toThrow("Invariant violated");
});
```

### Testing Recursive Functions
```typescript
test("AlertTree.getDepth() calculates correctly", () => {
  const leaf = createAlertLeaf(alert1);
  const tree = new AlertTree(leaf);
  expect(tree.getDepth()).toBe(0); // Leaf has depth 0
  
  const branch = createAlertBranch(alert2, [leaf]);
  const tree2 = new AlertTree(branch);
  expect(tree2.getDepth()).toBe(1); // Branch with leaf has depth 1
});
```

### Testing Concurrency
```typescript
test("Semaphore limits concurrent access", async () => {
  const semaphore = new Semaphore(2);
  const executed: number[] = [];
  
  await Promise.all([
    semaphore.withPermit(async () => executed.push(1)),
    semaphore.withPermit(async () => executed.push(2)),
    semaphore.withPermit(async () => executed.push(3)),
  ]);
  
  expect(executed.length).toBe(3); // All executed
  // But only 2 ran simultaneously
});
```

### Testing DSL Parsing
```typescript
test("AlertRulesDSL parses rules correctly", () => {
  const rule = AlertRulesLanguage.parse(
    'RULE "Test" WHEN pet.mood = "Happy" ' +
    'THEN CREATE_ALERT info "Happy" "Pet is happy"'
  );
  
  expect(rule.name).toBe("Test");
  expect(rule.condition.type).toBe("simple");
  expect(rule.action.title).toBe("Happy");
});
```

---

## Summary of Implementations

| Week | Concept | Files | Key Classes |
|------|---------|-------|------------|
| 10-11 | ADT & Invariants | `adt/*.ts` | PetADT, LocationADT, VeterinarianADT, AlertADT |
| 12 | Recursive Data Types | `adt/AlertTree.ts` | AlertTree (recursive operations) |
| 13-14 | Grammar & Parsing | `parsers/HealthRuleParser.ts` | Lexer, Parser, Evaluator |
| 15 | Concurrency | `concurrency/ConcurrencyManager.ts` | Semaphore, ConcurrentCache, Throttler, etc. |
| 16 | Little Languages | `dsl/AlertRulesDSL.ts` | AlertRulesLanguage, AlertRulesEngine |
| Integration | Services | `services/*.ts` | LocationService, AlertsService |

---

## Next Steps

1. **Testing**: Write unit tests for each ADT and recursive function
2. **Optimization**: Consider caching expensive recursive operations
3. **Monitoring**: Add metrics for concurrent operation contention
4. **Documentation**: User guides for DSL syntax
5. **Extension**: Add more rule types and conditions to DSL
6. **Performance**: Profile and optimize hot paths with concurrency
