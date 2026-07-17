/**
 * Personal access tokens for "bring your own assistant"
 * (Phase 6, docs/ROADMAP_2026.md).
 *
 * A token lets the artist's own AI assistant reach the totalaud.io MCP
 * endpoint. Only the SHA-256 hash is stored; the token itself is shown
 * once at creation and never again.
 */

import { createHash, randomBytes } from 'node:crypto'
import { getSupabaseServiceRoleClient } from '@/lib/supabase/serviceRole'

export const TOKEN_PREFIX = 'aud_pat_'

export function generateToken(): string {
  return `${TOKEN_PREFIX}${randomBytes(24).toString('hex')}`
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export interface TokenIdentity {
  userId: string
  tokenId: string
}

/**
 * Resolve a bearer token to a user. Returns null for anything invalid,
 * revoked, or not ours. Touches last_used_at on success (fire and forget).
 */
export async function resolveToken(bearer: string | null): Promise<TokenIdentity | null> {
  if (!bearer || !bearer.startsWith(TOKEN_PREFIX)) return null

  const supabase = getSupabaseServiceRoleClient()
  const { data, error } = await supabase
    .from('user_api_tokens')
    .select('id, user_id, revoked_at')
    .eq('token_hash', hashToken(bearer))
    .maybeSingle()

  if (error || !data || data.revoked_at) return null

  void supabase
    .from('user_api_tokens')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)
    .then(() => undefined)

  return { userId: data.user_id, tokenId: data.id }
}
