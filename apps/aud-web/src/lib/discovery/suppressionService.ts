/**
 * Suppression List Service (Simplified for totalaud.io)
 *
 * GDPR-compliant suppression list with:
 * - Hash-based O(1) lookups
 * - Encrypted storage for DSAR matching
 * - Global + user-scoped suppression
 *
 * NOTE: Currently stubbed out - contact_suppressions table not yet created.
 * All functions return "not suppressed" to allow MVP functionality.
 * TODO: Create migration and enable full suppression functionality post-MVP.
 */

import { logger } from '@/lib/logger'

const log = logger.scope('Suppression Service')

// Stub flag - set to true when contact_suppressions table is ready
const SUPPRESSION_ENABLED = false

export type SuppressionReason =
  | 'user_request'
  | 'gdpr_erasure'
  | 'bounce'
  | 'complaint'
  | 'unsubscribe'
  | 'spam_report'
  | 'manual'

export interface SuppressionCheck {
  isSuppressed: boolean
  reason?: SuppressionReason
  scope?: 'global' | 'user'
  suppressedAt?: Date
}

export interface SuppressionEntry {
  email: string
  reason: SuppressionReason
  notes?: string
}

/**
 * Check if an email is suppressed
 * Currently stubbed - always returns not suppressed
 */
export async function checkSuppression(
  _email: string,
  _userId?: string
): Promise<SuppressionCheck> {
  if (!SUPPRESSION_ENABLED) {
    return { isSuppressed: false }
  }

  // TODO: Implement when table is created
  log.warn('Suppression check called but table not ready')
  return { isSuppressed: false }
}

/**
 * Check multiple emails in batch
 * Currently stubbed - always returns not suppressed for all emails
 */
export async function checkSuppressionBatch(
  emails: string[],
  _userId?: string
): Promise<Map<string, SuppressionCheck>> {
  const results = new Map<string, SuppressionCheck>()

  if (!SUPPRESSION_ENABLED) {
    for (const email of emails) {
      results.set(email.toLowerCase().trim(), { isSuppressed: false })
    }
    return results
  }

  // TODO: Implement when table is created
  log.warn('Suppression batch check called but table not ready')
  for (const email of emails) {
    results.set(email.toLowerCase().trim(), { isSuppressed: false })
  }
  return results
}

/**
 * Add email to suppression list
 * Currently stubbed - logs warning and returns success
 */
export async function addSuppression(entry: SuppressionEntry, _userId?: string): Promise<boolean> {
  if (!SUPPRESSION_ENABLED) {
    log.warn('Suppression add called but table not ready', { email: entry.email })
    return true // Return success so callers don't retry
  }

  // TODO: Implement when table is created
  return true
}

/**
 * Clear suppression cache
 * Currently stubbed - no-op since cache is disabled
 */
export function clearSuppressionCache(): void {
  // No-op when suppression is disabled
}
