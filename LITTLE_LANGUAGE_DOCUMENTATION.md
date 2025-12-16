# Little Language Implementation - Complete Documentation

## Overview

This implementation demonstrates **Weeks 12-14** of the software engineering curriculum through a practical domain-specific language (DSL) for pet behavior analysis.

## Architecture

### Phase 1: Tokenization (Lexical Analysis)

**File:** `src/services/analysisLanguage.ts` (Lines 1-220)

Converts raw text into a stream of tokens using regular expressions and state machine pattern.

```typescript
// Input
"IF activity > 70 THEN mood = \"energetic\""

// Output
[
  { type: "IF", value: "IF", line: 1, column: 1 },
  { type: "IDENTIFIER", value: "activity", line: 1, column: 4 },
  { type: "OPERATOR", value: ">", line: 1, column: 13 },
  { type: "NUMBER", value: "70", line: 1, column: 15 },
  { type: "THEN", value: "THEN", line: 1, column: 18 },
  // ... more tokens
]
```

**Key Concepts (Week 12):**
- Regular expressions for pattern matching
- State machine for string/number parsing
- Character-by-character input consumption
- Line/column tracking for error reporting

**Implementation Details:**
- Keywords recognized: `IF`, `THEN`, `AND`, `OR`, `BETWEEN`
- Operators: `>`, `<`, `=`
- Literals: numbers, strings (double-quoted), identifiers
- Error handling: unterminated strings, unexpected characters

### Phase 2: Parsing (Syntax Analysis)

**File:** `src/services/analysisLanguage.ts` (Lines 222-450)

Builds an Abstract Syntax Tree (AST) from tokens using recursive descent parser.

**Grammar (EBNF notation):**
```ebnf
program        = rule*
rule           = "IF" condition "THEN" assignment
condition      = comparison ( ("AND" | "OR") comparison )*
comparison     = expr ( (">" | "<" | "=" | "BETWEEN") expr )+
assignment     = identifier "=" value
expr           = identifier | number
value          = string | number
identifier     = [a-zA-Z_][a-zA-Z0-9_]*
string         = '"' [^"]* '"'
number         = [0-9]+
```

**Generated AST Example:**
```
Program
  └─ Rule
      ├─ Condition
      │   ├─ operator: "AND"
      │   ├─ left: Comparison
      │   │   ├─ operator: ">"
      │   │   ├─ left: Expression("activity", isIdentifier: true)
      │   │   └─ right: Expression("70", isIdentifier: false)
      │   └─ right: Comparison
      │       ├─ operator: "<"
      │       ├─ left: Expression("stress", isIdentifier: true)
      │       └─ right: Expression("50", isIdentifier: false)
      └─ Assignment
          ├─ identifier: "mood"
          └─ value: Value("happy", isString: true)
```

**Key Concepts (Week 13):**
- Recursive descent parser implementation
- Grammar-driven code generation
- Token consumption and lookahead
- Recursive rule matching for nested conditions

**Implementation Details:**
- `peek()`: Look at current token without consuming
- `advance()`: Consume and return current token
- `expect()`: Require specific token type
- Each grammar rule has corresponding parser method

### Phase 3: Interpretation (Semantic Analysis)

**File:** `src/services/analysisLanguage.ts` (Lines 452-560)

Traverses the AST and evaluates it against a context (data dictionary).

```typescript
// Input
program: Program          // Parsed AST
context: {
  activity: 85,
  stress: 20,
  sleep: 8
}

// Processing: Traverse each rule
// IF activity > 70 → TRUE (85 > 70)
// AND stress < 50 → TRUE (20 < 50)
// → Execute assignment: mood = "happy"

// Output
{
  activity: 85,
  stress: 20,
  sleep: 8,
  mood: "happy"  // ← added by execution
}
```

**Key Concepts (Week 14):**
- Tree traversal: recursive evaluation
- Pattern matching on AST node types
- Context management: variable storage
- Condition evaluation: short-circuit AND/OR

**Implementation Details:**
- `evaluateCondition()`: Recursively evaluate conditions
- `evaluateComparison()`: Compare two expressions
- `evaluateExpression()`: Resolve variable or return literal
- `executeAssignment()`: Update context

### Phase 4: Error Handling (Week 5)

Proper error detection with localization:

```typescript
// Tokenizer Error (Line/Column)
"IF activity 70 THEN mood" 
            ^ unexpected - missing operator

// Parser Error
"IF activity BETWEEN 30 THEN"
                      ^ missing upper bound, expected "AND"

// Runtime Error
"IF undefined > 50 THEN mood = 'ok'"
   ^ Undefined variable: undefined
```

## Usage Examples

### Example 1: Basic Analysis

```typescript
import { analyzeWithLanguage, type AnalysisContext } from "@/services/analysisLanguage";

const program = `
IF activity > 70 THEN energy = "high"
IF activity < 30 THEN energy = "low"
`;

const context: AnalysisContext = {
  activity: 85,
};

const result = analyzeWithLanguage(program, context);
// result = { activity: 85, energy: "high" }
```

### Example 2: Using the Hook

```typescript
import { useAnalysisLanguage } from "@/hooks/useAnalysisLanguage";
import { PetSpecies } from "@/services/analysisRules";

function PetAnalysisComponent({ petSpecies, metrics }) {
  const { executeRulesForSpecies } = useAnalysisLanguage();
  
  const analysis = executeRulesForSpecies(petSpecies, metrics);
  // Applies species-specific rules
}
```

### Example 3: Complex Rules

```typescript
const rules = `
IF activity > 70 AND heart_rate < 120 AND stress < 30 THEN overall = "healthy_active"
IF activity < 30 AND sleep > 8 AND stress < 20 THEN overall = "resting_healthy"
IF activity > 50 AND heart_rate > 130 AND stress > 60 THEN overall = "stressed_anxious"
`;

const petData = {
  activity: 65,
  heart_rate: 125,
  stress: 45,
  sleep: 6,
};

const result = analyzeWithLanguage(rules, petData);
// No rule matches, returns unchanged context
```

## Integration with Video Analysis

**File:** `src/services/geminiAPI.ts`

The little language is applied to enrich Ollama analysis:

```typescript
// 1. Ollama generates initial analysis
const analysis = {
  behavior: "playing",
  mood: "happy",
  energy: "High"
};

// 2. Convert to numerical context
const context: AnalysisContext = {
  activity: extractFromAnalysis(analysis),
  stress: calculateFromVideo(),
  heart_rate: detectFromVideo(),
};

// 3. Apply rules
const enrichedContext = analyzeWithLanguage(ENRICHMENT_RULES, context);

// 4. Map back to analysis
result.mood = enrichedContext.mood;
result.energy = enrichedContext.energy;
```

## Rule Examples

### Canine (Dog) Rules

```typescript
export const CANINE_ANALYSIS_RULES = `
IF activity > 80 THEN behavior = "playful"
IF activity < 20 AND sleep > 8 THEN behavior = "resting"
IF activity BETWEEN 40 AND 70 THEN behavior = "alert"
IF heart_rate BETWEEN 70 AND 110 THEN vitals = "normal"
IF tail_wag_frequency > 5 THEN mood = "happy"
`;
```

### Feline (Cat) Rules

```typescript
export const FELINE_ANALYSIS_RULES = `
IF activity > 60 AND activity < 80 THEN behavior = "hunting"
IF activity < 20 THEN behavior = "sleeping"
IF purr_volume > 50 THEN mood = "content"
IF sleep > 12 THEN behavior = "normal_cat"
`;
```

## Language Grammar Visualization

```
┌─────────────────────────────────────────┐
│         PROGRAM                         │
├─────────────────────────────────────────┤
│  IF condition THEN assignment           │
│  IF condition THEN assignment           │
│  ...                                    │
└─────────────────────────────────────────┘
         ↑              ↑
         │              │
    ┌────┴──────┐  ┌────┴─────────┐
    │           │  │              │
  CONDITION   ASSIGNMENT      
    │           │
    ├─ expr op expr           identifier = value
    ├─ AND                    
    ├─ OR                     
    └─ BETWEEN...AND          
```

## Test Cases

Run demonstrations with:

```typescript
import { runAllDemonstrations } from "@/services/analysisLanguageDemo";

// In browser console or component
runAllDemonstrations();
```

**Available demonstrations:**
1. `demonstrateTokenizer()` - Lexical analysis
2. `demonstrateParser()` - Syntax analysis & AST
3. `demonstrateInterpreter()` - Semantic analysis
4. `demonstrateErrorHandling()` - Error cases
5. `demonstratePetAnalysis()` - Practical usage
6. `demonstrateLanguageFeatures()` - Language capabilities

## Software Engineering Principles Applied

### Week 12: Recursive Data Types & Grammars
- ✓ Grammar defined in EBNF notation
- ✓ Recursive data structures for AST nodes
- ✓ Nested conditions support recursion

### Week 13: Parser Generators & Grammar
- ✓ Parser generated from grammar rules
- ✓ Recursive descent implementation
- ✓ Token-based input processing

### Week 14: Parse Tree Traversal & AST
- ✓ AST construction during parsing
- ✓ Recursive tree traversal in interpreter
- ✓ Error handling with position information

### Week 5: Avoiding Debugging & Assertions
- ✓ Specific error types for each phase
- ✓ Line/column information for localization
- ✓ Type validation at each stage

### Week 6: Mutability & Contracts
- ✓ Immutable token stream
- ✓ Immutable AST nodes
- ✓ Context mutation controlled by rules

## Performance Characteristics

| Phase | Time Complexity | Space Complexity |
|-------|-----------------|------------------|
| Tokenize | O(n) | O(n) tokens |
| Parse | O(n) | O(d) AST depth |
| Interpret | O(r·d) | O(v) variables |

Where:
- n = input length
- d = nesting depth
- r = number of rules
- v = number of variables

## Extension Points

### Add New Operators

```typescript
// In Tokenizer
case "!":
  this.tokens.push({
    type: "OPERATOR",
    value: "!=",
    ...
  });

// In Comparison
case "!=":
  return leftValue !== rightValue;
```

### Add New Functions

```typescript
// Extend grammar
expr = identifier | number | function_call
function_call = identifier "(" expr ("," expr)* ")"

// Implement evaluation
if (isFunctionCall(expr)) {
  return evaluateFunction(expr.name, expr.args);
}
```

### Add Variable Types

```typescript
// Currently supports: number, string
// Could add: boolean, array, object

// Update Value node type
interface Value extends ASTNode {
  type: "Value";
  value: string | number | boolean | object;
  valueType: "string" | "number" | "boolean" | "array";
}
```

## Files Created

```
src/
├── services/
│   ├── analysisLanguage.ts          # Tokenizer, Parser, Interpreter
│   ├── analysisRules.ts             # Rule definitions & species-specific rules
│   └── analysisLanguageDemo.ts      # Examples & demonstrations
├── hooks/
│   └── useAnalysisLanguage.ts       # React hook for language usage
└── services/
    └── geminiAPI.ts                 # Integration with video analysis
```

## Key Takeaways

1. **Language Design**: Created a complete DSL from scratch
2. **Parser Implementation**: Recursive descent parser from grammar
3. **AST Construction**: Proper tree representation of programs
4. **Interpretation**: Semantic analysis through tree traversal
5. **Error Handling**: Localized error reporting with positions
6. **Integration**: Little language enhances real-world AI analysis
7. **Extensibility**: Easy to add new rules without code changes
8. **Domain-Specific**: Tailored for pet behavior analysis

## References

- EBNF Grammar: Extended Backus-Naur Form notation
- Recursive Descent Parsing: Standard parsing technique
- Abstract Syntax Trees: Compiler design pattern
- Semantic Analysis: Understanding program meaning
