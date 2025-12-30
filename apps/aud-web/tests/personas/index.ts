/**
 * Persona-Based Testing System
 *
 * A comprehensive testing framework that simulates realistic user journeys
 * through totalaud.io from the perspective of ICP personas.
 *
 * ## Quick Start
 *
 * ```bash
 * # Run all persona tests
 * pnpm test:personas
 *
 * # Run specific persona
 * pnpm test:personas --grep "Maya"
 *
 * # Seed content for a persona
 * pnpm seed:persona maya
 *
 * # Seed all personas
 * pnpm seed:personas
 *
 * # Generate localStorage data (no Supabase needed)
 * pnpm seed:persona --local maya
 * ```
 *
 * ## Personas
 *
 * - **Maya Chen** - Lo-fi producer, mobile-first, £5 Starter tier
 * - **Marcus Thompson** - UK Hip-Hop, album rollout planning, £19 Pro tier
 * - **Sarah & James** - Folk duo, coordinating between two people, £5 Starter
 * - **Dev Patel** - House producer, going full-time, £19 Pro tier
 * - **Chloe Williams** - Student singer-songwriter, just starting, £5 Starter
 *
 * ## Scenarios
 *
 * - `first-visit` - New user exploring the app
 * - `ideas-capture` - Quick idea capture session
 * - `scout-discovery` - Finding opportunities
 * - `release-planning` - Building a timeline
 * - `pitch-writing` - Crafting bios/pitches
 * - `full-journey` - Complete flow through all modes
 */

// Personas
export {
  type PersonaId,
  type Persona,
  type CareerStage,
  type TechComfort,
  type PricingTier,
  personas,
  allPersonaIds,
  getPersona,
  getPersonasByTier,
  getPersonasByCareerStage,
  generateIdeasForPersona,
  getScoutFiltersForPersona,
  generateTimelineForPersona,
  generatePitchContentForPersona,
  getViewportForPersona,
  getSessionBehaviourForPersona,
} from './personas'

// Scenario Runner
export {
  type ScenarioType,
  type ScenarioResult,
  type ActionRecord,
  type FrictionPoint,
  type ScreenshotRecord,
  type PerformanceMetrics,
  type BatchRunConfig,
  type BatchRunResult,
  PersonaScenarioRunner,
  summariseBatchResults,
} from './scenario-runner'

// Report Generator
export {
  type SessionReport,
  type ComparisonReport,
  generateSessionReport,
  generateComparisonReport,
  formatReportAsMarkdown,
  formatComparisonAsMarkdown,
  saveReportToFile,
  saveComparisonReportToFile,
} from './report-generator'

// Content Seeding
export {
  type SeedConfig,
  type SeedResult,
  seedContentForPersona,
  seedAllPersonas,
  seedIdeasForPersona,
  seedTimelineForPersona,
  seedPitchForPersona,
  generateLocalStorageSeedData,
  getLocalStorageInjectionScript,
} from './seed-content'
