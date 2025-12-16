import { useCallback } from "react";
import {
  compileAnalysisProgram,
  executeAnalysisProgram,
  type AnalysisContext,
  type Program,
} from "@/services/analysisLanguage";
import { getRulesForSpecies, PetSpecies } from "@/services/analysisRules";

/**
 * Hook for executing pet analysis using the little language
 * 
 * Example usage:
 * ```tsx
 * const { executeRules, executeRulesForSpecies, compileRules } = useAnalysisLanguage();
 * 
 * const context: AnalysisContext = {
 *   activity: 75,
 *   sleep: 8,
 *   heart_rate: 105,
 *   stress: 25,
 * };
 * 
 * const result = executeRulesForSpecies(PetSpecies.DOG, context);
 * // result = { activity: 75, sleep: 8, ..., mood: "energetic", energy: "high" }
 * ```
 */
export function useAnalysisLanguage() {
  /**
   * Execute raw analysis program text against a context
   */
  const executeRules = useCallback(
    (programText: string, context: AnalysisContext): AnalysisContext => {
      try {
        const program = compileAnalysisProgram(programText);
        return executeAnalysisProgram(program, context);
      } catch (error) {
        console.error("Analysis language error:", error);
        return context; // Return unchanged context on error
      }
    },
    []
  );

  /**
   * Execute rules optimized for a specific pet species
   */
  const executeRulesForSpecies = useCallback(
    (species: PetSpecies, context: AnalysisContext): AnalysisContext => {
      const rules = getRulesForSpecies(species);
      return executeRules(rules, context);
    },
    [executeRules]
  );

  /**
   * Pre-compile a program for repeated execution
   * (More efficient if the same program runs many times)
   */
  const compileRules = useCallback((programText: string): Program | null => {
    try {
      return compileAnalysisProgram(programText);
    } catch (error) {
      console.error("Failed to compile analysis program:", error);
      return null;
    }
  }, []);

  /**
   * Execute a pre-compiled program
   */
  const executeCompiledRules = useCallback(
    (program: Program, context: AnalysisContext): AnalysisContext => {
      try {
        return executeAnalysisProgram(program, context);
      } catch (error) {
        console.error("Analysis execution error:", error);
        return context;
      }
    },
    []
  );

  /**
   * Validate if a program text is syntactically correct
   */
  const validateProgram = useCallback(
    (programText: string): { valid: boolean; error?: string } => {
      try {
        compileAnalysisProgram(programText);
        return { valid: true };
      } catch (error: any) {
        return { valid: false, error: error.message };
      }
    },
    []
  );

  return {
    executeRules,
    executeRulesForSpecies,
    compileRules,
    executeCompiledRules,
    validateProgram,
  };
}
