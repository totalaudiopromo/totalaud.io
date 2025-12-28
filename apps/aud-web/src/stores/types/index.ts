/**
 * Store Types
 *
 * Centralised type definitions for Zustand stores.
 * Separates state shapes from action implementations for:
 * - Better testability (mock state without actions)
 * - Cleaner imports (import types without store)
 * - Type reuse across components and hooks
 */

export * from './ideas'
export * from './timeline'
export * from './identity'
export * from './pitch'
export * from './scout'
