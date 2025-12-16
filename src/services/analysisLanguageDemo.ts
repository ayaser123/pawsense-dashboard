/**
 * LITTLE LANGUAGE IMPLEMENTATION TEST & EXAMPLES
 * 
 * Week 12-14 Software Engineering Concepts:
 * - Week 12: Recursive Data Types, Grammars, Regular Expressions
 * - Week 13: Parser Generators, Antlr-like Grammar, Generating the Parser
 * - Week 14: Traversing the Parse Tree, Constructing an AST, Handling Errors
 * 
 * This implementation demonstrates:
 * 1. LEXICAL ANALYSIS (Tokenizer) - Breaking input into tokens
 * 2. SYNTAX ANALYSIS (Parser) - Building Abstract Syntax Tree (AST)
 * 3. SEMANTIC ANALYSIS (Interpreter) - Evaluating the AST
 * 4. ERROR HANDLING - Proper error detection and localization
 */

import {
  Tokenizer,
  Parser,
  Interpreter,
  compileAnalysisProgram,
  executeAnalysisProgram,
  analyzeWithLanguage,
  type AnalysisContext,
} from "@/services/analysisLanguage";

// ============================================================================
// EXAMPLE 1: TOKENIZER (Lexical Analysis)
// ============================================================================

export function demonstrateTokenizer() {
  console.log("=".repeat(80));
  console.log("EXAMPLE 1: TOKENIZER (Lexical Analysis - Week 12)");
  console.log("=".repeat(80));

  const input = `IF activity > 70 THEN mood = "energetic"`;
  console.log("Input:", input);

  const tokenizer = new Tokenizer(input);
  const tokens = tokenizer.tokenize();

  console.log("\nTokens generated:");
  tokens.forEach((token) => {
    console.log(`  ${token.type.padEnd(12)} : ${token.value}`);
  });

  console.log("\nKey Concepts:");
  console.log("  - Regular expressions used to identify token patterns");
  console.log("  - Maintains line/column information for error reporting");
  console.log("  - Handles keywords (IF, THEN, BETWEEN) vs identifiers");
}

// ============================================================================
// EXAMPLE 2: PARSER (Syntax Analysis - AST Construction)
// ============================================================================

export function demonstrateParser() {
  console.log("\n" + "=".repeat(80));
  console.log("EXAMPLE 2: PARSER (Syntax Analysis - Week 13-14)");
  console.log("=".repeat(80));

  const input = `IF activity > 70 AND stress < 50 THEN mood = "happy"`;
  console.log("Input:", input);

  try {
    const program = compileAnalysisProgram(input);

    console.log("\nGenerated AST (Abstract Syntax Tree):");
    console.log(JSON.stringify(program, null, 2));

    console.log("\nAST Structure:");
    console.log("  Program");
    console.log("    └─ Rule[0]");
    console.log("        ├─ Condition (AND)");
    console.log("        │  ├─ Comparison(>): activity > 70");
    console.log("        │  └─ Comparison(<): stress < 50");
    console.log("        └─ Assignment: mood = \"happy\"");

    console.log("\nKey Concepts:");
    console.log("  - Grammar-driven parsing (EBNF notation)");
    console.log("  - Recursive descent parser implementation");
    console.log("  - Error detection with line/column information");
  } catch (error: any) {
    console.error("Parse Error:", error.message);
  }
}

// ============================================================================
// EXAMPLE 3: INTERPRETER (Semantic Analysis - AST Evaluation)
// ============================================================================

export function demonstrateInterpreter() {
  console.log("\n" + "=".repeat(80));
  console.log("EXAMPLE 3: INTERPRETER (Semantic Analysis - Week 14)");
  console.log("=".repeat(80));

  const programText = `
IF activity > 70 THEN energy = "high"
IF activity BETWEEN 30 AND 70 THEN energy = "medium"
IF activity < 30 THEN energy = "low"
IF stress > 50 AND sleep < 6 THEN health = "concerning"
IF stress < 30 AND sleep > 7 THEN health = "excellent"
`;

  console.log("Program:\n", programText);

  const program = compileAnalysisProgram(programText);
  console.log("\nCompiled AST has", program.rules.length, "rules");

  // Test Case 1: Active, well-rested pet
  const context1: AnalysisContext = {
    activity: 85,
    stress: 20,
    sleep: 8,
  };

  console.log("\n--- Test Case 1 ---");
  console.log("Input Context:", context1);
  const result1 = executeAnalysisProgram(program, context1);
  console.log("Output Context:", result1);
  console.log("Interpretation: High activity + low stress + good sleep = excellent health");

  // Test Case 2: Stressed, tired pet
  const context2: AnalysisContext = {
    activity: 25,
    stress: 75,
    sleep: 4,
  };

  console.log("\n--- Test Case 2 ---");
  console.log("Input Context:", context2);
  const result2 = executeAnalysisProgram(program, context2);
  console.log("Output Context:", result2);
  console.log("Interpretation: Low activity + high stress + poor sleep = concerning health");

  console.log("\nKey Concepts:");
  console.log("  - Tree traversal: recursive evaluation of conditions");
  console.log("  - Variable resolution from context");
  console.log("  - Condition evaluation: AND, OR, comparison operators");
  console.log("  - State mutation: assignments modify context");
}

// ============================================================================
// EXAMPLE 4: ERROR HANDLING (Localization & Detection)
// ============================================================================

export function demonstrateErrorHandling() {
  console.log("\n" + "=".repeat(80));
  console.log("EXAMPLE 4: ERROR HANDLING (Week 5 - Localization)");
  console.log("=".repeat(80));

  // Test Case 1: Syntax Error - Missing operator
  console.log("\n--- Error Case 1: Missing operator ---");
  try {
    const invalid1 = `IF activity 70 THEN mood = "invalid"`;
    compileAnalysisProgram(invalid1);
  } catch (error: any) {
    console.error("Error:", error.message);
    console.log("Detection: Failed at parsing comparison operator");
  }

  // Test Case 2: Undefined variable
  console.log("\n--- Error Case 2: Undefined variable ---");
  try {
    const program = compileAnalysisProgram(`IF undefined_var > 50 THEN mood = "fail"`);
    executeAnalysisProgram(program, { activity: 75 }); // missing undefined_var
  } catch (error: any) {
    console.error("Error:", error.message);
    console.log("Detection: Variable resolution failed at runtime");
  }

  // Test Case 3: Invalid BETWEEN syntax
  console.log("\n--- Error Case 3: Invalid BETWEEN syntax ---");
  try {
    const invalid3 = `IF activity BETWEEN 30 THEN mood = "invalid"`;
    compileAnalysisProgram(invalid3);
  } catch (error: any) {
    console.error("Error:", error.message);
    console.log("Detection: BETWEEN requires AND clause");
  }

  console.log("\nKey Concepts:");
  console.log("  - Line/column error information for debugging");
  console.log("  - Lexical errors: tokenization failures");
  console.log("  - Syntax errors: parsing failures");
  console.log("  - Semantic errors: undefined variables, type mismatches");
}

// ============================================================================
// EXAMPLE 5: PRACTICAL PET ANALYSIS
// ============================================================================

export function demonstratePetAnalysis() {
  console.log("\n" + "=".repeat(80));
  console.log("EXAMPLE 5: PRACTICAL PET ANALYSIS");
  console.log("=".repeat(80));

  // Define canine-specific analysis program
  const canineProgram = `
IF activity > 80 THEN behavior = "playful"
IF activity < 20 AND sleep > 8 THEN behavior = "resting"
IF heart_rate > 150 THEN stress = "high"
IF heart_rate < 100 THEN stress = "low"
IF tail_wag_frequency > 5 THEN mood = "happy"
IF stress > 50 AND activity < 30 THEN recommendation = "needs_exercise"
`;

  console.log("Canine Analysis Program:\n", canineProgram);

  // Simulate pet metrics
  const dogMetrics: AnalysisContext = {
    activity: 95,
    sleep: 6,
    heart_rate: 95,
    stress: 15,
    tail_wag_frequency: 8,
  };

  console.log("\nDog Metrics:", dogMetrics);

  const result = analyzeWithLanguage(canineProgram, dogMetrics);
  console.log("\nAnalysis Result:", result);

  console.log("\nInterpretation:");
  console.log("  - High activity (95) → playful behavior");
  console.log("  - Low heart rate (95) → low stress");
  console.log("  - High tail wag (8) → happy mood");
  console.log("  - Overall: Healthy, happy, active dog");
}

// ============================================================================
// EXAMPLE 6: LANGUAGE FEATURES DEMONSTRATION
// ============================================================================

export function demonstrateLanguageFeatures() {
  console.log("\n" + "=".repeat(80));
  console.log("EXAMPLE 6: LANGUAGE FEATURES");
  console.log("=".repeat(80));

  console.log("\n--- Feature 1: Compound Conditions (AND/OR) ---");
  const complexProgram = `
IF activity > 70 AND sleep > 6 THEN mood = "energetic"
IF stress > 50 OR activity < 20 THEN health = "at_risk"
`;
  const context1 = analyzeWithLanguage(complexProgram, {
    activity: 80,
    sleep: 8,
    stress: 30,
  });
  console.log("Result:", context1);

  console.log("\n--- Feature 2: Range Checking (BETWEEN) ---");
  const rangeProgram = `
IF heart_rate BETWEEN 80 AND 120 THEN vitals = "normal"
IF temperature BETWEEN 98 AND 103 THEN temp = "ok"
`;
  const context2 = analyzeWithLanguage(rangeProgram, {
    heart_rate: 105,
    temperature: 101.5,
  });
  console.log("Result:", context2);

  console.log("\n--- Feature 3: Multiple Assignments ---");
  const multiProgram = `
IF activity > 60 THEN energy = "high"
IF activity > 60 THEN mood = "happy"
IF activity > 60 THEN behavior = "active"
`;
  const context3 = analyzeWithLanguage(multiProgram, {
    activity: 75,
  });
  console.log("Result:", context3);

  console.log("\nKey Language Features:");
  console.log("  ✓ Conditional statements (IF-THEN)");
  console.log("  ✓ Boolean operators (AND, OR)");
  console.log("  ✓ Comparison operators (>, <, =)");
  console.log("  ✓ Range operator (BETWEEN...AND)");
  console.log("  ✓ Multiple assignments");
  console.log("  ✓ String and numeric literals");
  console.log("  ✓ Variable identifiers");
}

// ============================================================================
// RUN ALL DEMONSTRATIONS
// ============================================================================

export function runAllDemonstrations() {
  demonstrateTokenizer();
  demonstrateParser();
  demonstrateInterpreter();
  demonstrateErrorHandling();
  demonstratePetAnalysis();
  demonstrateLanguageFeatures();

  console.log("\n" + "=".repeat(80));
  console.log("SUMMARY: Little Language Implementation");
  console.log("=".repeat(80));
  console.log(`
Architecture (Week 12-14 Concepts):
  
  1. TOKENIZER (Lexical Analysis)
     - Input: Raw program text
     - Output: Stream of tokens
     - Technique: Regular expressions, state machine
     
  2. PARSER (Syntax Analysis)
     - Input: Token stream
     - Output: Abstract Syntax Tree (AST)
     - Technique: Recursive descent parser, EBNF grammar
     
  3. INTERPRETER (Semantic Analysis)
     - Input: AST + context data
     - Output: Modified context
     - Technique: Tree traversal, pattern matching
     
  4. ERROR HANDLING
     - Detection: Lexical, syntax, semantic errors
     - Localization: Line/column information
     - Recovery: Graceful degradation

Benefits:
  ✓ Domain-specific: Tailored for pet analysis
  ✓ Extensible: Add new rules without code changes
  ✓ Testable: Each phase independently testable
  ✓ Debuggable: Clear error messages
  ✓ Maintainable: Separation of concerns
  `);
}
