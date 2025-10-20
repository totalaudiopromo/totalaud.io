/**
 * OAuth Utilities for Google Integrations (Gmail + Sheets)
 *
 * Handles PKCE flow, state token generation, and token exchange.
 * Privacy: Only requests read-only scopes, never stores email bodies.
 */

import { createClient } from '@supabase/supabase-js'
import { nanoid } from 'nanoid'
import crypto from 'crypto'

export type IntegrationType = 'gmail' | 'google_sheets'

interface OAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
}

/**
 * Google OAuth configuration by integration type
 */
function getOAuthConfig(provider: IntegrationType): Omit<OAuthConfig, 'clientId' | 'clientSecret' | 'redirectUri'> {
  const configs = {
    gmail: {
      scopes: [
        'https://www.googleapis.com/auth/gmail.readonly', // Read-only, metadata only
        'https://www.googleapis.com/auth/gmail.metadata', // Thread/label metadata
      ],
    },
    google_sheets: {
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets.readonly', // Read-only sheets access
      ],
    },
  }

  return configs[provider]
}

/**
 * Generate PKCE code verifier and challenge
 */
export function generatePKCE(): { verifier: string; challenge: string } {
  // Generate random verifier (43-128 chars, base64url)
  const verifier = nanoid(64)

  // Create SHA256 hash and convert to base64url
  const challenge = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  return { verifier, challenge }
}

/**
 * Generate OAuth state token and store in database
 */
export async function generateStateToken(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  provider: IntegrationType
): Promise<string> {
  const state = nanoid(32)

  // Store state token in database (expires in 10 minutes)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  await supabase.from('oauth_state_tokens').insert({
    state,
    user_id: userId,
    provider,
    expires_at: expiresAt,
  } as any)

  return state
}

/**
 * Verify OAuth state token (CSRF protection)
 */
export async function verifyStateToken(
  supabase: ReturnType<typeof createClient>,
  state: string,
  provider: IntegrationType
): Promise<{ valid: boolean; userId?: string; verifier?: string }> {
  const { data, error } = await supabase
    .from('oauth_state_tokens')
    .select('*')
    .eq('state', state)
    .eq('provider', provider)
    .single()

  if (error || !data) {
    return { valid: false }
  }

  const record = data as any

  // Check if token has expired
  const now = new Date()
  const expiresAt = new Date(record.expires_at)

  if (now > expiresAt) {
    // Clean up expired token
    await supabase.from('oauth_state_tokens').delete().eq('state', state)
    return { valid: false }
  }

  // Clean up used token
  await supabase.from('oauth_state_tokens').delete().eq('state', state)

  return {
    valid: true,
    userId: record.user_id,
    verifier: record.code_verifier,
  }
}

/**
 * Get Google OAuth authorization URL
 */
export async function getGoogleAuthUrl(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  provider: IntegrationType
): Promise<{ url: string; state: string; verifier: string }> {
  const config = getOAuthConfig(provider)
  const { verifier, challenge } = generatePKCE()
  const state = await generateStateToken(supabase, userId, provider)

  // Store code verifier for later exchange
  const updatePayload: Record<string, any> = { code_verifier: verifier }
  await (supabase as any)
    .from('oauth_state_tokens')
    .update(updatePayload)
    .eq('state', state)

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const redirectUri = `${appUrl}/api/oauth/google/callback`

  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID not configured')
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    access_type: 'offline', // Request refresh token
    prompt: 'consent', // Force consent screen to get refresh token
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

  return { url: authUrl, state, verifier }
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  verifier: string
): Promise<{
  access_token: string
  refresh_token: string
  expires_in: number
  scope: string
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const redirectUri = `${appUrl}/api/oauth/google/callback`

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured')
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    code_verifier: verifier,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  })

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token exchange failed: ${error}`)
  }

  const tokens = await response.json()

  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_in: tokens.expires_in,
    scope: tokens.scope,
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<{
  access_token: string
  expires_in: number
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured')
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token refresh failed: ${error}`)
  }

  const tokens = await response.json()

  return {
    access_token: tokens.access_token,
    expires_in: tokens.expires_in,
  }
}

/**
 * Save integration tokens to database
 */
export async function saveIntegrationTokens(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  provider: IntegrationType,
  tokens: {
    access_token: string
    refresh_token: string
    expires_in: number
  },
  metadata?: Record<string, any>
): Promise<void> {
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

  // Check if connection already exists
  const { data: existing } = await supabase
    .from('integration_connections')
    .select('id')
    .eq('user_id', userId)
    .eq('provider', provider)
    .single()

  if (existing) {
    // Update existing connection
    const existingRecord = existing as any
    const updatePayload: Record<string, any> = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: expiresAt,
      status: 'active',
      metadata: metadata || {},
      connected_at: new Date().toISOString(),
    }
    await (supabase as any)
      .from('integration_connections')
      .update(updatePayload)
      .eq('id', existingRecord.id)
  } else {
    // Create new connection
    await supabase.from('integration_connections').insert({
      user_id: userId,
      provider,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: expiresAt,
      status: 'active',
      auto_sync_enabled: true,
      metadata: metadata || {},
    } as any)
  }
}

/**
 * Get active integration connection
 */
export async function getIntegrationConnection(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  provider: IntegrationType
): Promise<{
  id: string
  access_token: string
  refresh_token: string
  expires_at: string
  status: string
  metadata?: Record<string, any>
} | null> {
  const { data, error } = await supabase
    .from('integration_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', provider)
    .eq('status', 'active')
    .single()

  if (error || !data) {
    return null
  }

  return data as any
}

/**
 * Check if token needs refresh (5-minute buffer)
 */
export function needsTokenRefresh(expiresAt: string): boolean {
  const now = new Date()
  const expiry = new Date(expiresAt)
  const bufferMs = 5 * 60 * 1000 // 5 minutes

  return now.getTime() + bufferMs >= expiry.getTime()
}

/**
 * Get valid access token (auto-refresh if needed)
 */
export async function getValidAccessToken(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  provider: IntegrationType
): Promise<string | null> {
  const connection = await getIntegrationConnection(supabase, userId, provider)

  if (!connection) {
    return null
  }

  // Check if token needs refresh
  if (needsTokenRefresh(connection.expires_at)) {
    try {
      const newTokens = await refreshAccessToken(connection.refresh_token)

      // Update connection with new tokens
      const expiresAt = new Date(Date.now() + newTokens.expires_in * 1000).toISOString()
      const updatePayload: Record<string, any> = {
        access_token: newTokens.access_token,
        expires_at: expiresAt,
      }

      await (supabase as any)
        .from('integration_connections')
        .update(updatePayload)
        .eq('id', connection.id)

      return newTokens.access_token
    } catch (error) {
      console.error('[OAuth] Token refresh failed:', error)
      return null
    }
  }

  return connection.access_token
}

/**
 * Disconnect integration (soft delete - mark as inactive)
 */
export async function disconnectIntegration(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  provider: IntegrationType
): Promise<void> {
  const updatePayload: Record<string, any> = {
    status: 'inactive',
    auto_sync_enabled: false,
  }
  await (supabase as any)
    .from('integration_connections')
    .update(updatePayload)
    .eq('user_id', userId)
    .eq('provider', provider)
}
