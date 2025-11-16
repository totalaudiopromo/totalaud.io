import { env } from '@/lib/env'

export class TAPApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message)
    this.name = 'TAPApiError'
  }
}

interface TAPRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  headers?: Record<string, string>
}

class TAPClient {
  private baseUrl: string
  private apiKey: string | undefined

  constructor() {
    this.baseUrl = env.TAP_API_URL || 'https://api.totalaudiopromo.com'
    this.apiKey = env.TAP_API_KEY
  }

  private async request<T>(endpoint: string, options: TAPRequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options

    // Check if TAP is configured
    if (!this.apiKey) {
      throw new TAPApiError('TAP API key not configured')
    }

    const url = `${this.baseUrl}${endpoint}`

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      ...headers,
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new TAPApiError(
          errorData.message || `TAP API error: ${response.statusText}`,
          response.status,
          errorData
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof TAPApiError) {
        throw error
      }
      throw new TAPApiError(
        error instanceof Error ? error.message : 'Unknown TAP API error'
      )
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body: data })
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body: data })
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body: data })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  isConfigured(): boolean {
    return !!this.apiKey
  }
}

export const tapClient = new TAPClient()
