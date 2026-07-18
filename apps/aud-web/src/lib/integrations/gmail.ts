/**
 * Gmail connection helpers — send-from-your-own-inbox for pitches
 * (Phase 6, docs/ROADMAP_2026.md).
 *
 * The artist connects their own Gmail once; pitches then go out from their
 * own address, only when they press send. Tokens live in gmail_connections,
 * which has no user RLS policies — every read and write happens here on the
 * server through the service role, so tokens never reach the browser.
 */

import { OAuthHandler, type OAuthTokens } from '@total-audio/core-integrations'
import { getSupabaseServiceRoleClient } from '@/lib/supabase/serviceRole'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'

const log = logger.scope('GmailIntegration')

export const GMAIL_STATE_COOKIE = 'gmail_oauth_state'

export interface GmailConnection {
  email: string
  accessToken: string
  refreshToken: string | null
  expiresAt: string | null
}

export function isGmailConfigured(): boolean {
  return !!env.GOOGLE_CLIENT_ID && !!env.GOOGLE_CLIENT_SECRET
}

export function getGmailRedirectUri(): string {
  if (env.GOOGLE_REDIRECT_URI) return env.GOOGLE_REDIRECT_URI
  const base = env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return `${base.replace(/\/$/, '')}/api/integrations/gmail/callback`
}

const oauth = new OAuthHandler()

export function buildGmailAuthUrl(state: string): string {
  return oauth.generateAuthUrl({
    integrationType: 'gmail',
    clientId: env.GOOGLE_CLIENT_ID ?? '',
    redirectUri: getGmailRedirectUri(),
    state,
  })
}

export async function exchangeGmailCode(code: string): Promise<OAuthTokens> {
  return oauth.exchangeCodeForTokens({
    integrationType: 'gmail',
    code,
    clientId: env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: env.GOOGLE_CLIENT_SECRET ?? '',
    redirectUri: getGmailRedirectUri(),
  })
}

export async function saveGmailConnection(
  userId: string,
  email: string,
  tokens: OAuthTokens
): Promise<void> {
  const supabase = getSupabaseServiceRoleClient()
  const { error } = await supabase.from('gmail_connections').upsert(
    {
      user_id: userId,
      email,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? null,
      expires_at: tokens.expires_at ? new Date(tokens.expires_at).toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )
  if (error) throw new Error(`Could not save Gmail connection: ${error.message}`)
}

export async function getGmailConnection(userId: string): Promise<GmailConnection | null> {
  const supabase = getSupabaseServiceRoleClient()
  const { data, error } = await supabase
    .from('gmail_connections')
    .select('email, access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    log.error('Could not load Gmail connection', new Error(error.message))
    return null
  }
  if (!data) return null

  return {
    email: data.email,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
  }
}

export async function deleteGmailConnection(userId: string): Promise<void> {
  const supabase = getSupabaseServiceRoleClient()
  const { error } = await supabase.from('gmail_connections').delete().eq('user_id', userId)
  if (error) throw new Error(`Could not disconnect Gmail: ${error.message}`)
}

/**
 * Return a usable access token, refreshing (and persisting) it first when
 * it has expired. Returns null when the connection cannot be refreshed —
 * the caller should ask the artist to reconnect.
 */
export async function getFreshAccessToken(
  userId: string,
  connection: GmailConnection
): Promise<string | null> {
  const expiresAtMs = connection.expiresAt ? Date.parse(connection.expiresAt) : undefined
  if (!oauth.isTokenExpired(expiresAtMs)) return connection.accessToken
  if (!connection.refreshToken) return null

  try {
    const refreshed = await oauth.refreshAccessToken(
      'gmail',
      connection.refreshToken,
      env.GOOGLE_CLIENT_ID ?? '',
      env.GOOGLE_CLIENT_SECRET ?? ''
    )
    await saveGmailConnection(userId, connection.email, {
      ...refreshed,
      refresh_token: refreshed.refresh_token ?? connection.refreshToken,
    })
    return refreshed.access_token
  } catch (error) {
    log.warn('Gmail token refresh failed', {
      message: error instanceof Error ? error.message : 'unknown',
    })
    return null
  }
}
