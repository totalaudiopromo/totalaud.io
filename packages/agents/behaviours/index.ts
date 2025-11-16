/**
 * Agent Behaviours
 * Exports all agent behaviour implementations
 */

export { scoutBehaviour } from './scout'
export { coachBehaviour } from './coach'
export { trackerBehaviour } from './tracker'
export { insightBehaviour } from './insight'

import { scoutBehaviour } from './scout'
import { coachBehaviour } from './coach'
import { trackerBehaviour } from './tracker'
import { insightBehaviour } from './insight'

export const ALL_BEHAVIOURS = [
  scoutBehaviour,
  coachBehaviour,
  trackerBehaviour,
  insightBehaviour,
]
