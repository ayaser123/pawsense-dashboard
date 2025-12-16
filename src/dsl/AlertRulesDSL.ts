/**
 * Week 16: Little Languages
 * Alert Rules DSL - A domain-specific language for defining pet alert rules
 * Demonstrates:
 * - Building languages to solve problems
 * - Representing code as data
 * - Grammar and parsing for problem domain
 */

import type { PetADT } from "@/adt/PetADT";
import type { AlertADT } from "@/adt/AlertADT";
import { createAlert, getSeverityFromType } from "@/adt/AlertADT";

/**
 * Alert Rule Definition Language
 * Example syntax:
 *   RULE "Low Energy Alert"
 *     WHEN pet.energy = "Low"
 *     THEN CREATE_ALERT warning "Low Energy" "Pet has low energy" severity 6 action "Monitor"
 *
 *   RULE "Happy Pet"
 *     WHEN pet.mood = "Happy" AND pet.energy = "High"
 *     THEN CREATE_ALERT success "Healthy Pet" "Pet is doing great!" severity 2
 *
 *   RULE "Health Concern"
 *     WHEN pet.mood = "Sick" OR pet.energy = "Low"
 *     THEN CREATE_ALERT critical "Health Concern" "Check pet health immediately" severity 9 action "Find Vet"
 */

// DSL AST Node Types
export interface RuleDefinition {
  name: string;
  condition: ConditionExpression;
  action: AlertAction;
}

export type ConditionExpression = SimpleCondition | CompositeCondition;

export interface SimpleCondition {
  type: "simple";
  field: string;
  operator: "=" | "!=" | ">" | "<" | "contains";
  value: string | number;
}

export interface CompositeCondition {
  type: "composite";
  operator: "AND" | "OR";
  left: ConditionExpression;
  right: ConditionExpression;
}

export interface AlertAction {
  type: "alert";
  alertType: "warning" | "info" | "success" | "critical";
  title: string;
  message: string;
  severity?: number;
  action?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Alert Rules Language Lexer & Parser
 */
export class AlertRulesLanguage {
  /**
   * Parse DSL rule definition from string
   * Grammar:
   *   RULE name WHEN condition THEN action
   */
  static parse(ruleString: string): RuleDefinition {
    const tokens = this.tokenize(ruleString);
    return this.parseRule(tokens);
  }

  private static tokenize(input: string): string[] {
    // Better tokenization that preserves quoted strings
    const tokens: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < input.length; i++) {
      const char = input[i];

      if (char === '"') {
        inQuotes = !inQuotes;
        current += char;
      } else if (!inQuotes && /\s/.test(char)) {
        if (current) {
          tokens.push(current);
          current = "";
        }
      } else {
        current += char;
      }
    }

    if (current) {
      tokens.push(current);
    }

    return tokens.filter((token) => token.length > 0);
  }

  /**
   * Parse rule: RULE name WHEN condition THEN action
   */
  private static parseRule(tokens: string[]): RuleDefinition {
    let index = 0;

    // Expect RULE keyword
    if (tokens[index] !== "RULE") {
      throw new Error("Expected RULE keyword at start");
    }
    index++;

    // Get rule name (quoted string)
    const nameToken = tokens[index];
    if (!nameToken) {
      throw new Error("Expected rule name after RULE");
    }
    const name = nameToken.startsWith('"') ? nameToken.slice(1, -1) : nameToken;
    index++;

    // Expect WHEN
    const whenToken = tokens[index];
    if (whenToken !== "WHEN") {
      throw new Error(`Expected WHEN after rule name, got: ${whenToken}`);
    }
    index++;

    // Parse condition
    const { condition, nextIndex: conditionEndIndex } = this.parseCondition(tokens, index);
    index = conditionEndIndex;

    // Expect THEN
    if (tokens[index] !== "THEN") {
      throw new Error("Expected THEN after condition");
    }
    index++;

    // Parse action
    const action = this.parseAction(tokens, index);

    return {
      name: name,
      condition,
      action,
    };
  }

  /**
   * Parse condition: SimpleCondition | (condition op condition)
   */
  private static parseCondition(
    tokens: string[],
    startIndex: number
  ): { condition: ConditionExpression; nextIndex: number } {
    let index = startIndex;

    // Try to parse simple condition first
    const { condition: firstCondition, nextIndex } = this.parseSimpleCondition(tokens, index);
    index = nextIndex;

    // Check for AND/OR operators
    if (index < tokens.length && (tokens[index] === "AND" || tokens[index] === "OR")) {
      const operator = tokens[index] as "AND" | "OR";
      index++;

      const { condition: secondCondition, nextIndex: finalIndex } = this.parseCondition(tokens, index);
      index = finalIndex;

      return {
        condition: {
          type: "composite",
          operator,
          left: firstCondition,
          right: secondCondition,
        },
        nextIndex: index,
      };
    }

    return { condition: firstCondition, nextIndex: index };
  }

  /**
   * Parse simple condition: field operator value
   */
  private static parseSimpleCondition(
    tokens: string[],
    startIndex: number
  ): { condition: SimpleCondition; nextIndex: number } {
    let index = startIndex;

    // Parse field (e.g., "pet.energy")
    const field = tokens[index];
    if (!field) throw new Error("Expected field in condition");
    index++;

    // Parse operator
    const operatorToken = tokens[index];
    if (!operatorToken || !["=", "!=", ">", "<", "contains"].includes(operatorToken)) {
      throw new Error(`Invalid operator: ${operatorToken}`);
    }
    const operator = operatorToken as "=" | "!=" | ">" | "<" | "contains";
    index++;

    // Parse value
    const valueToken = tokens[index];
    if (!valueToken) throw new Error("Expected value in condition");
    index++;

    const value = valueToken.replace(/"/g, "");
    const numValue = parseFloat(value);
    const parsedValue = isNaN(numValue) ? value : numValue;

    return {
      condition: {
        type: "simple",
        field,
        operator,
        value: parsedValue,
      },
      nextIndex: index,
    };
  }

  /**
   * Parse action: CREATE_ALERT type title message [severity] [action]
   */
  private static parseAction(tokens: string[], startIndex: number): AlertAction {
    let index = startIndex;

    if (tokens[index] !== "CREATE_ALERT") {
      throw new Error("Expected CREATE_ALERT action");
    }
    index++;

    // Alert type
    const alertTypeToken = tokens[index];
    if (!["warning", "info", "success", "critical"].includes(alertTypeToken)) {
      throw new Error(`Invalid alert type: ${alertTypeToken}`);
    }
    const alertType = alertTypeToken as "warning" | "info" | "success" | "critical";
    index++;

    // Title
    const title = tokens[index].replace(/"/g, "");
    index++;

    // Message
    const message = tokens[index].replace(/"/g, "");
    index++;

    // Optional severity
    let severity = getSeverityFromType(alertType);
    if (tokens[index] === "severity") {
      index++;
      severity = parseInt(tokens[index], 10);
      index++;
    }

    // Optional action
    let action: string | undefined;
    if (tokens[index] === "action") {
      index++;
      action = tokens[index].replace(/"/g, "");
      index++;
    }

    return {
      type: "alert",
      alertType,
      title,
      message,
      severity,
      action,
    };
  }
}

/**
 * Alert Rules Engine
 * Evaluates rules against pet context and generates alerts
 */
export class AlertRulesEngine {
  private rules: RuleDefinition[] = [];

  /**
   * Add a rule to the engine
   */
  addRule(rule: RuleDefinition): void {
    this.rules.push(rule);
  }

  /**
   * Add rule from DSL string
   */
  addRuleFromDSL(ruleString: string): void {
    const rule = AlertRulesLanguage.parse(ruleString);
    this.addRule(rule);
  }

  /**
   * Evaluate all rules against pet
   * Returns alerts for all matching rules
   */
  evaluateRules(pet: PetADT): AlertADT[] {
    const context = {
      [`pet.${pet.getType()}`]: true,
      [`pet.mood`]: pet.getMood(),
      [`pet.age`]: pet.getAge(),
    };

    const alerts: AlertADT[] = [];

    for (const rule of this.rules) {
      if (this.evaluateCondition(rule.condition, context)) {
        // Create alert from action
        const alert = createAlert(
          {
            id: `alert_${rule.name}_${Date.now()}`,
            type: rule.action.alertType,
            title: rule.action.title,
            message: rule.action.message,
            severity: rule.action.severity || getSeverityFromType(rule.action.alertType),
            action: rule.action.action,
            source: "system",
            metadata: rule.action.metadata,
          },
          pet
        );
        alerts.push(alert);
      }
    }

    return alerts;
  }

  /**
   * Evaluate condition recursively
   */
  private evaluateCondition(condition: ConditionExpression, context: Record<string, unknown>): boolean {
    if (condition.type === "simple") {
      return this.evaluateSimpleCondition(condition, context);
    }

    // Composite condition
    const leftResult = this.evaluateCondition(condition.left, context);
    const rightResult = this.evaluateCondition(condition.right, context);

    if (condition.operator === "AND") {
      return leftResult && rightResult;
    }
    return leftResult || rightResult;
  }

  private evaluateSimpleCondition(condition: SimpleCondition, context: Record<string, unknown>): boolean {
    const value = context[condition.field];

    switch (condition.operator) {
      case "=":
        return value === condition.value;
      case "!=":
        return value !== condition.value;
      case ">":
        return typeof value === "number" && value > (condition.value as number);
      case "<":
        return typeof value === "number" && value < (condition.value as number);
      case "contains":
        return typeof value === "string" && value.includes(condition.value as string);
      default:
        return false;
    }
  }
}

/**
 * Global Alert Rules Engine instance
 */
let globalEngine: AlertRulesEngine | null = null;

/**
 * Initialize global alert rules engine with default rules
 */
export function initializeAlertRulesEngine(): AlertRulesEngine {
  if (!globalEngine) {
    globalEngine = new AlertRulesEngine();

    // Register built-in rules
    globalEngine.addRuleFromDSL(
      'RULE "Low Energy Alert" WHEN pet.energy = "Low" THEN CREATE_ALERT warning "Low Energy" "Pet has low energy" severity 6 action "Monitor"'
    );

    globalEngine.addRuleFromDSL(
      'RULE "Sick Detection" WHEN pet.mood = "Sick" THEN CREATE_ALERT critical "Health Alert" "Pet appears sick - seek veterinary care" severity 9 action "Find Vet"'
    );

    globalEngine.addRuleFromDSL(
      'RULE "Happy Pet" WHEN pet.mood = "Happy" THEN CREATE_ALERT success "Happy Pet" "Your pet is happy and healthy!" severity 1'
    );
  }

  return globalEngine;
}

/**
 * Get global engine instance
 */
export function getAlertRulesEngine(): AlertRulesEngine {
  if (!globalEngine) {
    return initializeAlertRulesEngine();
  }
  return globalEngine;
}

/**
 * Factory: Create custom rule
 */
export function createCustomRule(
  name: string,
  fieldPath: string,
  operator: "=" | "!=" | ">" | "<" | "contains",
  value: string | number,
  alertType: "warning" | "info" | "success" | "critical",
  title: string,
  message: string,
  severity?: number,
  action?: string
): RuleDefinition {
  return {
    name,
    condition: {
      type: "simple",
      field: fieldPath,
      operator,
      value,
    },
    action: {
      type: "alert",
      alertType,
      title,
      message,
      severity,
      action,
    },
  };
}
