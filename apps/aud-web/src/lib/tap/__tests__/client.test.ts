import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TapApiError, TapClient } from '../client'

const contactFixture = {
  id: 'ctc_a1b2c3',
  object: 'contact',
  name: 'Jo Smith',
  email: 'jo@example.com',
  outlet: 'BBC Radio 6 Music',
  created: 1711800000,
}

const listFixture = {
  object: 'list',
  data: [contactFixture],
  has_more: true,
  next_cursor: 'ctc_a1b2c3',
  url: '/v1/contacts',
}

const actionQueueFixture = {
  object: 'list',
  data: [
    {
      id: 'act_u1v2w3x4',
      object: 'action_queue_item',
      type: 'follow_up',
      priority: 1,
      follow_up: { contact: 'ctc_a1b2c3', pitch: 'pch_i9j0k1l2', due_at: 1712200000 },
    },
  ],
  has_more: false,
  next_cursor: null,
  url: '/v1/action_queue',
}

const errorFixture = {
  error: {
    message: 'The email at contacts[3] failed SMTP validation.',
    type: 'invalid_request_error',
    code: 'email_undeliverable',
    param: 'contacts[3].email',
  },
}

function mockFetchOnce(status: number, body: unknown) {
  const fn = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  )
  vi.stubGlobal('fetch', fn)
  return fn
}

describe('TapClient', () => {
  beforeEach(() => {
    vi.stubEnv('TAP_API_KEY', 'tap_ak_test123')
    vi.stubEnv('TAP_API_URL', 'https://api.totalaudiopromo.com')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('reports configured only with a tap_ak_ key', () => {
    expect(new TapClient({ apiKey: 'tap_ak_abc' }).isConfigured).toBe(true)
    expect(new TapClient({ apiKey: 'sk-something-else' }).isConfigured).toBe(false)
    expect(new TapClient({ apiKey: '' }).isConfigured).toBe(false)
  })

  it('normalises the base URL to the /v1 subdomain form', async () => {
    const fetchMock = mockFetchOnce(200, listFixture)
    await new TapClient({
      apiKey: 'tap_ak_x',
      baseUrl: 'https://api.totalaudiopromo.com',
    }).listContacts()
    const url = fetchMock.mock.calls[0][0] as URL
    expect(url.toString()).toBe('https://api.totalaudiopromo.com/v1/contacts')
  })

  it('sends bearer auth and cursor pagination params', async () => {
    const fetchMock = mockFetchOnce(200, listFixture)
    const client = new TapClient({ apiKey: 'tap_ak_x' })

    const result = await client.listContacts({ limit: 25, starting_after: 'ctc_abc' })

    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit]
    expect(url.searchParams.get('limit')).toBe('25')
    expect(url.searchParams.get('starting_after')).toBe('ctc_abc')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tap_ak_x')
    expect(result.data[0].id).toBe('ctc_a1b2c3')
    expect(result.has_more).toBe(true)
  })

  it('adds an Idempotency-Key header on mutations', async () => {
    const fetchMock = mockFetchOnce(200, {
      id: 'out_m3n4o5p6',
      object: 'outcome',
      contact: 'ctc_a1b2c3',
      status: 'added',
      created: 1712200000,
    })
    const client = new TapClient({ apiKey: 'tap_ak_x' })

    await client.logOutcome({ contact: 'ctc_a1b2c3', status: 'added' })

    const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit]
    const headers = init.headers as Record<string, string>
    expect(headers['Idempotency-Key']).toBeTruthy()
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual({ contact: 'ctc_a1b2c3', status: 'added' })
  })

  it('parses the action queue heterogeneous items', async () => {
    mockFetchOnce(200, actionQueueFixture)
    const client = new TapClient({ apiKey: 'tap_ak_x' })

    const queue = await client.listActionQueue()

    expect(queue.data[0].type).toBe('follow_up')
    expect(queue.data[0].follow_up?.contact).toBe('ctc_a1b2c3')
  })

  it('throws TapApiError with the error envelope fields', async () => {
    mockFetchOnce(422, errorFixture)
    const client = new TapClient({ apiKey: 'tap_ak_x' })

    const error = await client.listContacts().catch((e) => e)

    expect(error).toBeInstanceOf(TapApiError)
    expect(error.status).toBe(422)
    expect(error.code).toBe('email_undeliverable')
    expect(error.param).toBe('contacts[3].email')
    expect(error.isTransient).toBe(false)
  })

  it('marks network failures and 5xx as transient', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')))
    const client = new TapClient({ apiKey: 'tap_ak_x' })

    const networkError = await client.listContacts().catch((e) => e)
    expect(networkError).toBeInstanceOf(TapApiError)
    expect(networkError.isTransient).toBe(true)

    mockFetchOnce(503, { error: { message: 'Upstream unavailable', type: 'api_error' } })
    const serverError = await client.listContacts().catch((e) => e)
    expect(serverError.isTransient).toBe(true)
  })
})
