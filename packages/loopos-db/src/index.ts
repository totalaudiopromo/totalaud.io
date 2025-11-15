/**
 * LoopOS Database Package
 *
 * Provides type-safe database operations for LoopOS.
 * All operations use Zod validation and RLS-protected Supabase queries.
 */

// Export types
export * from './types'

// Export database operations
export * from './nodes'
export * from './journal'
export * from './agent-executions'

// Re-export Supabase client from core package
export { supabase } from '@total-audio/core-supabase'
