/**
 * Built-in Agent Skills for LoopOS
 *
 * This module exports all default skills and provides an auto-registration function.
 */

import { generateNodesSkill } from './generateNodesSkill'
import { improveSequenceSkill } from './improveSequenceSkill'
import { coachDailyPlanSkill } from './coachDailyPlanSkill'
import { insightExplainerSkill } from './insightExplainerSkill'
import { packCustomiserSkill } from './packCustomiserSkill'
import { skillRegistry } from '../registry'

/**
 * All built-in skills
 */
export const builtInSkills = {
  generateNodesSkill,
  improveSequenceSkill,
  coachDailyPlanSkill,
  insightExplainerSkill,
  packCustomiserSkill,
}

/**
 * Register all built-in skills
 */
export function registerBuiltInSkills(): void {
  skillRegistry.registerSkill(generateNodesSkill)
  skillRegistry.registerSkill(improveSequenceSkill)
  skillRegistry.registerSkill(coachDailyPlanSkill)
  skillRegistry.registerSkill(insightExplainerSkill)
  skillRegistry.registerSkill(packCustomiserSkill)
}

// Export individual skills
export {
  generateNodesSkill,
  improveSequenceSkill,
  coachDailyPlanSkill,
  insightExplainerSkill,
  packCustomiserSkill,
}
