/**
 * OAuth Handler for External Integrations
 *
 * Simplified OAuth 2.0 flow supporting:
 * - Gmail (Google OAuth)
 * - Google Sheets (Google OAuth)
 * - Airtable (OAuth 2.0 with PKCE)
 * - Mailchimp (OAuth 2.0)
 * - Spotify (OAuth 2.0)
 *
 * Based on tracker.totalaudiopromo.com OAuth system
 */

import { nanoid } from 'nanoid'
import crypto from 'crypto'

export type IntegrationType = 'gmail' | 'google_sheets' | 'airtable' | 'mailchimp' | 'spotify'

/**
 * Generate PKCE code challenge for OAuth 2.0
 */
function generatePKCE() {
  const codeVerifier = nanoid(64)
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url')

  return { codeVerifier, codeChallenge }
}

export interface OAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
  authUrl: string
  tokenUrl: string
}

export interface OAuthTokens {
  access_token: string
  refresh_token?: string
  expires_in?: number
  expires_at?: number
  token_type: string
}

/**
 * OAuth configurations for each provider
 */
const OAUTH_CONFIGS: Record<IntegrationType, Partial<OAuthConfig>> = {
  gmail: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.metadata',
      'https://www.googleapis.com/auth/gmail.send',
    ],
  },
  google_sheets: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
    ],
  },
  airtable: {
    authUrl: 'https://airtable.com/oauth2/v1/authorize',
    tokenUrl: 'https://airtable.com/oauth2/v1/token',
    scopes: ['data.records:read', 'data.records:write', 'schema.bases:read'],
  },
  mailchimp: {
    authUrl: 'https://login.mailchimp.com/oauth2/authorize',
    tokenUrl: 'https://login.mailchimp.com/oauth2/token',
    scopes: [],
  },
  spotify: {
    authUrl: 'https://accounts.spotify.com/authorize',
    tokenUrl: 'https://accounts.spotify.com/api/token',
    scopes: ['user-read-email', 'playlist-read-private', 'playlist-modify-public'],
  },
}

export interface InitiateOAuthParams {
  integrationType: IntegrationType
  clientId: string
  redirectUri: string
  state: string
  codeVerifier?: string
}

export interface HandleCallbackParams {
  integrationType: IntegrationType
  code: string
  clientId: string
  clientSecret: string
  redirectUri: string
  codeVerifier?: string
}

/**
 * OAuth Handler Class
 */
export class OAuthHandler {
  /**
   * Get OAuth configuration for a provider
   */
  private getConfig(
    integrationType: IntegrationType,
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): OAuthConfig {
    const baseConfig = OAUTH_CONFIGS[integrationType]

    if (!baseConfig) {
      throw new Error(`Unknown integration type: ${integrationType}`)
    }

    return {
      clientId,
      clientSecret,
      redirectUri,
      scopes: baseConfig.scopes || [],
      authUrl: baseConfig.authUrl || '',
      tokenUrl: baseConfig.tokenUrl || '',
    }
  }

  /**
   * Generate OAuth authorization URL
   */
  generateAuthUrl(params: InitiateOAuthParams): string {
    const config = this.getConfig(
      params.integrationType,
      params.clientId,
      '',
      params.redirectUri
    )

    const urlParams: Record<string, string> = {
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      state: params.state,
    }

    // Add scopes if provider uses them
    if (config.scopes.length > 0) {
      urlParams.scope = config.scopes.join(' ')
    }

    // Add PKCE parameters for providers that support it
    const usesPKCE = ['airtable', 'mailchimp'].includes(params.integrationType)
    if (usesPKCE && params.codeVerifier) {
      const codeChallenge = crypto
        .createHash('sha256')
        .update(params.codeVerifier)
        .digest('base64url')

      urlParams.code_challenge = codeChallenge
      urlParams.code_challenge_method = 'S256'
    } else {
      // Google OAuth parameters for offline access
      urlParams.access_type = 'offline'
      urlParams.prompt = 'consent'
    }

    return `${config.authUrl}?${new URLSearchParams(urlParams).toString()}`
  }

  /**
   * Exchange authorization code for access tokens
   */
  async exchangeCodeForTokens(params: HandleCallbackParams): Promise<OAuthTokens> {
    const config = this.getConfig(
      params.integrationType,
      params.clientId,
      params.clientSecret,
      params.redirectUri
    )

    const body: Record<string, string> = {
      code: params.code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    }

    // Add PKCE code verifier if used
    if (params.codeVerifier) {
      body.code_verifier = params.codeVerifier
    }

    try {
      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(body).toString(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Token exchange failed: ${response.status} ${errorText}`)
      }

      const tokens: OAuthTokens = await response.json()

      // Calculate expires_at timestamp
      if (tokens.expires_in) {
        tokens.expires_at = Date.now() + tokens.expires_in * 1000
      }

      return tokens
    } catch (error) {
      console.error('[OAuthHandler] Token exchange error:', error)
      throw error
    }
  }

  /**
   * Refresh an expired access token
   */
  async refreshAccessToken(
    integrationType: IntegrationType,
    refreshToken: string,
    clientId: string,
    clientSecret: string
  ): Promise<OAuthTokens> {
    const config = this.getConfig(integrationType, clientId, clientSecret, '')

    const body = new URLSearchParams({
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'refresh_token',
    })

    try {
      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Token refresh failed: ${response.status} ${errorText}`)
      }

      const tokens: OAuthTokens = await response.json()

      // Calculate expires_at timestamp
      if (tokens.expires_in) {
        tokens.expires_at = Date.now() + tokens.expires_in * 1000
      }

      return tokens
    } catch (error) {
      console.error('[OAuthHandler] Token refresh error:', error)
      throw error
    }
  }

  /**
   * Check if an access token is expired (with 5-minute buffer)
   */
  isTokenExpired(expiresAt?: number): boolean {
    if (!expiresAt) return false
    const bufferMs = 5 * 60 * 1000 // 5 minutes
    return Date.now() >= expiresAt - bufferMs
  }

  /**
   * Generate state and code verifier for OAuth initiation
   */
  generateOAuthParams(): { state: string; codeVerifier: string } {
    return {
      state: nanoid(32),
      codeVerifier: nanoid(64),
    }
  }
}
