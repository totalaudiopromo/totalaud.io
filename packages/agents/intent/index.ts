/**
 * Intent Engine - Phase 20
 * Autonomous Composition System for totalaud.io
 *
 * Exports all intent system components
 */

// Types
export type {
  OSName,
  IntentStyle,
  IntentArc,
  IntentPalette,
  IntentMap,
  CreativeScore,
  CreativeScene,
  CreativeSonicProfile,
  CreativeVisualProfile,
  CreativeEvent,
  BehaviourDirective,
  BehaviourDirectorEngines,
  IntentPreset,
  PerformanceSegment,
  OSActivityState,
} from './intent.types'

// Parser
export { parseIntentText, INTENT_PRESETS } from './intentParser'

// Composer
export { composeCreativeScore, getScoreSummary } from './intentComposer'

// Director
export {
  BehaviourDirector,
  applyCreativeScoreToEngines,
  getDirectivesForOS,
  getDirectivesAtTime,
} from './behaviourDirector'

// Exporter
export {
  exportCreativeScoreJSON,
  exportCreativeScoreMarkdown,
  exportCreativeScoreCSV,
  downloadCreativeScore,
  exportAdaptiveRewritesJSON,
  exportAdaptiveSummaryMarkdown,
} from './creativeScoreExporter'

// Rewriter (Phase 21)
export type { AdaptiveRewriteEntry, AdaptiveCreativeScore } from './creativeScoreRewriter'
export {
  applyAdaptiveRewrites,
  insertMicroScene,
  getRewriteSummary,
} from './creativeScoreRewriter'
