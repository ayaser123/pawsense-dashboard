/**
 * Week 10-16: Software Engineering Concepts Index
 * Centralized export of all advanced concepts implementations
 * 
 * Includes:
 * - Week 10-11: Abstract Data Types (ADT) with invariants and contracts
 * - Week 12: Recursive Data Types and recursive algorithms
 * - Week 13-14: Grammar, Lexing, Parsing, AST construction
 * - Week 15: Concurrency, Race condition prevention, synchronization
 * - Week 16: Little Languages, DSL for alert rules
 */

// ===== Week 10: Abstract Data Types =====
export { PetADT, createPet, type PetType, type MoodType, type PetRepresentation } from "@/adt/PetADT";

export {
  LocationADT,
  createLocation,
  createLocationError,
  type LocationRepresentation,
} from "@/adt/LocationADT";

export {
  VeterinarianADT,
  createVeterinarian,
  type VeterinarianRepresentation,
} from "@/adt/VeterinarianADT";

export {
  AlertADT,
  createAlert,
  getSeverityFromType,
  type AlertType,
  type AlertSource,
  type AlertRepresentation,
} from "@/adt/AlertADT";

// ===== Week 12: Recursive Data Types =====
export {
  AlertTree,
  createAlertLeaf,
  createAlertBranch,
  type AlertNode,
  type AlertLeaf,
  type AlertBranch,
} from "@/adt/AlertTree";

// ===== Week 13-14: Grammars and Parsing =====
export {
  Lexer,
  Parser,
  Evaluator,
  parseHealthRule,
  evaluateHealthRule,
  type Token,
  type RuleNode,
  type ConditionNode,
  type BinaryOpNode,
  type ASTNode,
  type EvaluationContext,
} from "@/parsers/HealthRuleParser";

// ===== Week 16: Little Languages (DSL) =====
export {
  AlertRulesLanguage,
  AlertRulesEngine,
  initializeAlertRulesEngine,
  getAlertRulesEngine,
  createCustomRule,
  type RuleDefinition,
  type ConditionExpression,
  type SimpleCondition,
  type CompositeCondition,
  type AlertAction,
} from "@/dsl/AlertRulesDSL";

// ===== Week 15: Concurrency Management =====
export {
  Semaphore,
  ConcurrentCache,
  RequestDebouncer,
  RequestThrottler,
  BatchProcessor,
  AtomicCounter,
  ConcurrencyUtils,
} from "@/concurrency/ConcurrencyManager";

// ===== Services using ADT abstractions =====
export {
  getLocationService,
  createLocationService,
  type ILocationService,
} from "@/services/LocationService";
