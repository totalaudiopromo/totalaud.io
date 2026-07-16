/**
 * TAP (Total Audio Platform) API client — server-side only.
 *
 * Implements the conventions in docs/TAP_API_REFERENCE.md against
 * https://api.totalaudiopromo.com/v1: bearer auth (tap_ak_ keys), cursor
 * pagination, idempotency keys on mutations, dry-run support, and the
 * standard error envelope.
 *
 * Design principles (docs/STRATEGY_2026.md §7):
 * - TAP is the engine room; totalaud.io must degrade gracefully when TAP
 *   is unreachable. Callers should catch TapApiError and fall back.
 * - Never expose TAP_API_KEY client-side; this module must only be
 *   imported from route handlers or other server code.
 */

import { randomUUID } from 'node:crypto'
import { logger } from '@/lib/logger'
import type {
  TapActionQueueItem,
  TapContact,
  TapErrorBody,
  TapList,
  TapOutcome,
  TapOutcomeStatus,
} from './types'

const log = logger.scope('TapClient')

const DEFAULT_BASE_URL = 'https://api.totalaudiopromo.com/v1'
const DEFAULT_TIMEOUT_MS = 15_000

export class TapApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly type: string,
    public readonly code?: string,
    public readonly param?: string
  ) {
    super(message)
    this.name = 'TapApiError'
  }

  /** True for failures worth retrying or degrading on (network, 5xx, 429). */
  get isTransient(): boolean {
    return this.status === 0 || this.status === 429 || this.status >= 500
  }
}

export interface TapClientConfig {
  apiKey?: string
  baseUrl?: string
  timeoutMs?: number
}

export interface TapListParams {
  limit?: number
  starting_after?: string
  ending_before?: string
}

export class TapClient {
  private readonly apiKey: string
  private readonly baseUrl: string
  private readonly timeoutMs: number

  constructor(config: TapClientConfig = {}) {
    this.apiKey = config.apiKey ?? process.env.TAP_API_KEY ?? ''
    // TAP_API_URL historically held the bare host; normalise to the /v1 base.
    const envUrl = config.baseUrl ?? process.env.TAP_API_URL ?? DEFAULT_BASE_URL
    this.baseUrl = envUrl.endsWith('/v1') ? envUrl : `${envUrl.replace(/\/$/, '')}/v1`
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS
  }

  get isConfigured(): boolean {
    return this.apiKey.startsWith('tap_ak_')
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'DELETE',
    path: string,
    options: {
      body?: unknown
      query?: Record<string, string | number | undefined>
      idempotent?: boolean
    } = {}
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`)
    for (const [key, value] of Object.entries(options.query ?? {})) {
      if (value !== undefined) url.searchParams.set(key, String(value))
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
    }
    if (options.body !== undefined) headers['Content-Type'] = 'application/json'
    if (options.idempotent) headers['Idempotency-Key'] = randomUUID()

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      })

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as TapErrorBody | null
        const err = body?.error
        log.error('TAP API error', undefined, {
          status: response.status,
          code: err?.code,
          path,
        })
        throw new TapApiError(
          err?.message ?? `TAP request failed with status ${response.status}`,
          response.status,
          err?.type ?? 'api_error',
          err?.code,
          err?.param
        )
      }

      return (await response.json()) as T
    } catch (error) {
      if (error instanceof TapApiError) throw error
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TapApiError('TAP request timed out', 0, 'api_error', 'timeout')
      }
      throw new TapApiError(
        error instanceof Error ? error.message : 'TAP request failed',
        0,
        'api_error',
        'network_error'
      )
    } finally {
      clearTimeout(timeout)
    }
  }

  // --- Contacts ---

  listContacts(params: TapListParams = {}): Promise<TapList<TapContact>> {
    return this.request<TapList<TapContact>>('GET', '/contacts', { query: { ...params } })
  }

  getContact(contactId: string): Promise<TapContact> {
    return this.request<TapContact>('GET', `/contacts/${encodeURIComponent(contactId)}`)
  }

  /** Enrich a single contact (custom method on the contact resource). */
  enrichContact(contactId: string): Promise<TapContact> {
    return this.request<TapContact>('POST', `/contacts/${encodeURIComponent(contactId)}/enrich`, {
      idempotent: true,
    })
  }

  // --- Outcomes ---

  listOutcomes(params: TapListParams = {}): Promise<TapList<TapOutcome>> {
    return this.request<TapList<TapOutcome>>('GET', '/outcomes', { query: { ...params } })
  }

  logOutcome(input: {
    contact: string
    status: TapOutcomeStatus
    campaign?: string
    pitch?: string
  }): Promise<TapOutcome> {
    return this.request<TapOutcome>('POST', '/outcomes', { body: input, idempotent: true })
  }

  // --- Action queue ---

  listActionQueue(params: TapListParams = {}): Promise<TapList<TapActionQueueItem>> {
    return this.request<TapList<TapActionQueueItem>>('GET', '/action_queue', {
      query: { ...params },
    })
  }
}

let singleton: TapClient | null = null

/** Shared server-side client configured from env. */
export function getTapClient(): TapClient {
  if (!singleton) singleton = new TapClient()
  return singleton
}
