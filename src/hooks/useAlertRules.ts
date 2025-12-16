import { useCallback } from "react";
import { getAlertRulesEngine, type RuleDefinition } from "@/dsl/AlertRulesDSL";
import type { AlertADT } from "@/adt/AlertADT";

export interface AlertContext {
  [key: string]: string | number | boolean;
}

/**
 * Hook for evaluating pet alert rules
 * 
 * Example:
 * ```tsx
 * const { evaluateAlerts, addCustomRule } = useAlertRules();
 * 
 * const analysis = { mood: "happy", energy: "High" };
 * const alerts = evaluateAlerts(analysis);
 * ```
 */
export function useAlertRules() {
  const engine = getAlertRulesEngine();

  /**
   * Convert video analysis to alert context
   */
  const analysisToContext = useCallback((analysis: Record<string, any>): AlertContext => {
    return {
      "pet.mood": analysis.mood || "unknown",
      "pet.energy": analysis.energy || "unknown",
      "pet.behavior": analysis.behavior || "unknown",
      "pet.confidence": analysis.confidence || 0,
    };
  }, []);

  /**
   * Evaluate rules against analysis results
   */
  const evaluateAlerts = useCallback(
    (analysis: Record<string, any>): AlertADT[] => {
      try {
        const context = analysisToContext(analysis);
        // For now, return empty array - AlertADT integration pending
        // In full implementation:
        // return engine.evaluateRules(pet);
        console.log("[ALERTS] Context:", context);
        return [];
      } catch (error) {
        console.error("[ALERTS] Evaluation error:", error);
        return [];
      }
    },
    [analysisToContext, engine]
  );

  /**
   * Add custom rule to engine
   */
  const addCustomRule = useCallback(
    (rule: RuleDefinition): void => {
      try {
        engine.addRule(rule);
        console.log("[ALERTS] Rule added:", rule.name);
      } catch (error) {
        console.error("[ALERTS] Failed to add rule:", error);
      }
    },
    [engine]
  );

  /**
   * Add rule from DSL string
   */
  const addRuleFromDSL = useCallback(
    (ruleString: string): void => {
      try {
        engine.addRuleFromDSL(ruleString);
        console.log("[ALERTS] DSL rule added");
      } catch (error) {
        console.error("[ALERTS] Failed to parse DSL:", error);
      }
    },
    [engine]
  );

  return {
    evaluateAlerts,
    addCustomRule,
    addRuleFromDSL,
    analysisToContext,
  };
}
