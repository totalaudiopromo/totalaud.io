/**
 * Performance Package
 * Phase 21 - Real-time Adaptive Performance Engine
 * Exports all adaptive performance modules
 */

// Adaptive Monitor
export type {
  PerformanceState,
  AudioState,
  SocialState,
  EvolutionState,
  SceneProgress,
  AdaptiveMetrics,
} from './adaptiveMonitor'
export {
  computeAdaptiveMetrics,
  resetMetricsHistory,
  getMetricsHistory,
} from './adaptiveMonitor'

// Adaptive Rules Engine
export type { AdaptiveDirectiveType, AdaptiveDirective } from './adaptiveRulesEngine'
export {
  runAdaptiveRules,
  validateDirective,
  deduplicateDirectives,
} from './adaptiveRulesEngine'

// Adaptive Log
export type { AdaptiveLogEntry } from './adaptiveLog'
export {
  addAdaptiveLogEntry,
  getAdaptiveLog,
  getAdaptiveLogByScene,
  getAdaptiveLogByTimeRange,
  getAdaptiveLogByDirectiveType,
  getRecentAdaptiveLog,
  clearAdaptiveLog,
  getAdaptiveLogStatistics,
  exportAdaptiveLogNDJSON,
  exportAdaptiveLogJSON,
  exportAdaptiveLogSummary,
  downloadAdaptiveLog,
} from './adaptiveLog'

// Adaptive Runtime Controller
export type { AdaptiveLoopCallback } from './adaptiveRuntimeController'
export { AdaptiveRuntimeController, createAdaptiveRuntime } from './adaptiveRuntimeController'
