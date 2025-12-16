/**
 * Pet Behavior Analysis Rules - Example Little Language Programs
 * 
 * These programs define domain-specific analysis rules for pets
 * showing how the little language can express complex business logic.
 */

export const STANDARD_ANALYSIS_RULES = `
IF activity > 70 AND sleep > 6 THEN mood = "energetic"
IF activity < 30 THEN energy = "low"
IF activity BETWEEN 30 AND 70 THEN energy = "moderate"
IF activity > 70 THEN energy = "high"
IF heart_rate > 150 THEN stress = "high"
IF heart_rate < 100 THEN stress = "low"
IF stress > 50 AND sleep < 6 THEN health = "concerning"
IF stress < 30 AND sleep > 7 THEN health = "excellent"
`;

/**
 * Canine-specific analysis rules
 */
export const CANINE_ANALYSIS_RULES = `
IF activity > 80 THEN behavior = "playful"
IF activity < 20 AND sleep > 8 THEN behavior = "resting"
IF activity BETWEEN 40 AND 70 THEN behavior = "alert"
IF heart_rate BETWEEN 70 AND 110 THEN vitals = "normal"
IF tail_wag_frequency > 5 THEN mood = "happy"
`;

/**
 * Feline-specific analysis rules
 */
export const FELINE_ANALYSIS_RULES = `
IF activity > 60 AND activity < 80 THEN behavior = "hunting"
IF activity < 20 THEN behavior = "sleeping"
IF purr_volume > 50 THEN mood = "content"
IF purr_volume < 20 AND activity > 40 THEN mood = "agitated"
IF sleep > 12 THEN behavior = "normal_cat"
`;

/**
 * Advanced multi-condition analysis
 */
export const ADVANCED_ANALYSIS_RULES = `
IF activity > 70 AND heart_rate < 120 AND stress < 30 THEN overall = "healthy_active"
IF activity < 30 AND sleep > 8 AND stress < 20 THEN overall = "resting_healthy"
IF activity > 50 AND heart_rate > 130 AND stress > 60 THEN overall = "stressed_anxious"
IF sleep < 4 AND activity > 80 AND stress > 70 THEN overall = "overstimulated"
`;

export enum PetSpecies {
  DOG = "dog",
  CAT = "cat",
  RABBIT = "rabbit",
  BIRD = "bird",
}

/**
 * Get appropriate analysis rules for a pet species
 */
export function getRulesForSpecies(species: PetSpecies): string {
  switch (species) {
    case PetSpecies.DOG:
      return CANINE_ANALYSIS_RULES;
    case PetSpecies.CAT:
      return FELINE_ANALYSIS_RULES;
    default:
      return STANDARD_ANALYSIS_RULES;
  }
}

/**
 * Example of rule composition - combining multiple rule sets
 */
export function composeRules(...ruleSets: string[]): string {
  return ruleSets.join("\n");
}
