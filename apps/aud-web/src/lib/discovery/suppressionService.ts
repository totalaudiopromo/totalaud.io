/**
 * Suppression List Service (Simplified for totalaud.io)
 *
 * GDPR-compliant suppression list with:
 * - Hash-based O(1) lookups
 * - Encrypted storage for DSAR matching
 * - Global + user-scoped suppression
 *
 * Uses shared Supabase instance with Total Audio Platform.
 *
 * Note: contact_suppressions is a shared table with TAP that isn't
 * in totalaud.io's local Supabase types. We use type assertions here.
 */

import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

// Type for the shared contact_suppressions table (not in local schema)
interface ContactSuppressionRow {
  email_hash: string
  domain_hash: string | null
  email_encrypted: string | null
  domain_encrypted: string | null
  scope: string
  reason: string
  source: string
  added_by: string | null
  notes: string | null
  created_at: string
}

// Helper to bypass type checking for shared table
function getSuppressionTable(supabase: SupabaseClient) {
  return (supabase as any).from('contact_suppressions')
}
import {
  hashEmail,
  hashDomain,
  extractDomain,
  encryptAES256GCM,
  isValidEncryptionKey,
} from './crypto'
import { logger } from '@/lib/logger'

const log = logger.scope('Suppression Service')

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

// In-memory cache for suppression checks (5 minute TTL)
const suppressionCache = new Map<string, { result: SuppressionCheck; expiresAt: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Get encryption key from environment
 */
function getEncryptionKey(): string | undefined {
  const key = process.env.SUPPRESSION_ENCRYPTION_KEY
  if (key && isValidEncryptionKey(key)) {
    return key
  }
  return undefined
}

/**
 * Check if an email is suppressed (hash-based O(1) lookup)
 */
export async function checkSuppression(email: string, userId?: string): Promise<SuppressionCheck> {
  const normalised = email.toLowerCase().trim()
  const cacheKey = `${normalised}:${userId || 'global'}`

  // Check cache first
  const cached = suppressionCache.get(cacheKey)
  if (cached && Date.now() < cached.expiresAt) {
    return cached.result
  }

  try {
    const supabase = createBrowserSupabaseClient()
    const emailHash = hashEmail(normalised)
    const domain = extractDomain(normalised)
    const domainHash = hashDomain(domain)

    // Query suppression list (shared with TAP)
    const { data, error } = (await getSuppressionTable(supabase)
      .select('reason, scope, created_at')
      .or(`email_hash.eq.${emailHash},domain_hash.eq.${domainHash}`)
      .eq('scope', 'global') // For now, only check global suppressions
      .limit(1)) as { data: ContactSuppressionRow[] | null; error: Error | null }

    if (error) {
      log.error('Query error', error)
      // Fail open - don't block on errors
      return { isSuppressed: false }
    }

    const result: SuppressionCheck =
      data && data.length > 0
        ? {
            isSuppressed: true,
            reason: data[0].reason as SuppressionReason,
            scope: data[0].scope as 'global' | 'user',
            suppressedAt: new Date(data[0].created_at ?? Date.now()),
          }
        : { isSuppressed: false }

    // Cache result
    suppressionCache.set(cacheKey, {
      result,
      expiresAt: Date.now() + CACHE_TTL,
    })

    return result
  } catch (error) {
    log.error('Check error', error)
    // Fail open
    return { isSuppressed: false }
  }
}

/**
 * Check multiple emails in batch
 */
export async function checkSuppressionBatch(
  emails: string[],
  userId?: string
): Promise<Map<string, SuppressionCheck>> {
  const results = new Map<string, SuppressionCheck>()

  // Check cache for all emails first
  const uncached: string[] = []
  for (const email of emails) {
    const normalised = email.toLowerCase().trim()
    const cacheKey = `${normalised}:${userId || 'global'}`
    const cached = suppressionCache.get(cacheKey)

    if (cached && Date.now() < cached.expiresAt) {
      results.set(normalised, cached.result)
    } else {
      uncached.push(normalised)
    }
  }

  // If all cached, return early
  if (uncached.length === 0) {
    return results
  }

  try {
    const supabase = createBrowserSupabaseClient()

    // Generate hashes for all uncached emails
    const hashes = uncached.map((email) => ({
      email,
      emailHash: hashEmail(email),
      domainHash: hashDomain(extractDomain(email)),
    }))

    const allEmailHashes = hashes.map((h) => h.emailHash)
    const allDomainHashes = hashes.map((h) => h.domainHash)

    // Query all at once
    const { data, error } = (await getSuppressionTable(supabase)
      .select('email_hash, domain_hash, reason, scope, created_at')
      .or(
        `email_hash.in.(${allEmailHashes.join(',')}),domain_hash.in.(${allDomainHashes.join(',')})`
      )
      .eq('scope', 'global')) as { data: ContactSuppressionRow[] | null; error: Error | null }

    if (error) {
      log.error('Batch query error', error)
      uncached.forEach((email) => results.set(email, { isSuppressed: false }))
      return results
    }

    // Build hash -> suppression lookup
    const suppressedHashes = new Map<string, SuppressionCheck>()
    for (const row of data || []) {
      const check: SuppressionCheck = {
        isSuppressed: true,
        reason: row.reason as SuppressionReason,
        scope: row.scope as 'global' | 'user',
        suppressedAt: new Date(row.created_at ?? Date.now()),
      }
      if (row.email_hash) suppressedHashes.set(row.email_hash, check)
      if (row.domain_hash) suppressedHashes.set(row.domain_hash, check)
    }

    // Check each uncached email against suppressed hashes
    for (const { email, emailHash, domainHash } of hashes) {
      const check = suppressedHashes.get(emailHash) || suppressedHashes.get(domainHash)
      const result: SuppressionCheck = check || { isSuppressed: false }
      results.set(email, result)

      // Cache result
      const cacheKey = `${email}:${userId || 'global'}`
      suppressionCache.set(cacheKey, {
        result,
        expiresAt: Date.now() + CACHE_TTL,
      })
    }

    return results
  } catch (error) {
    log.error('Batch check error', error)
    uncached.forEach((email) => results.set(email, { isSuppressed: false }))
    return results
  }
}

/**
 * Add email to suppression list
 * Note: Uses service role key, so this should only be called from API routes
 */
export async function addSuppression(entry: SuppressionEntry, userId?: string): Promise<boolean> {
  try {
    const supabase = createBrowserSupabaseClient()
    const normalised = entry.email.toLowerCase().trim()
    const domain = extractDomain(normalised)

    // Generate hashes
    const emailHash = hashEmail(normalised)
    const domainHash = hashDomain(domain)

    // Encrypt if key available
    const encryptionKey = getEncryptionKey()
    let emailEncrypted: string | null = null
    let domainEncrypted: string | null = null

    if (encryptionKey) {
      emailEncrypted = encryptAES256GCM(normalised, encryptionKey)
      domainEncrypted = encryptAES256GCM(domain, encryptionKey)
    }

    const { error } = (await getSuppressionTable(supabase).insert({
      email_hash: emailHash,
      domain_hash: domainHash,
      email_encrypted: emailEncrypted,
      domain_encrypted: domainEncrypted,
      scope: 'global',
      reason: entry.reason,
      source: 'user_report',
      added_by: userId || null,
      notes: entry.notes || null,
    })) as { error: Error | null }

    if (error) {
      // Handle duplicate (already suppressed)
      const pgError = error as { code?: string }
      if (pgError.code === '23505') {
        log.info('Email already suppressed')
        return true
      }
      log.error('Add error', error)
      return false
    }

    // Invalidate cache
    suppressionCache.delete(`${normalised}:global`)
    if (userId) {
      suppressionCache.delete(`${normalised}:${userId}`)
    }

    return true
  } catch (error) {
    log.error('Add suppression error', error)
    return false
  }
}

/**
 * Clear suppression cache
 */
export function clearSuppressionCache(): void {
  suppressionCache.clear()
}
