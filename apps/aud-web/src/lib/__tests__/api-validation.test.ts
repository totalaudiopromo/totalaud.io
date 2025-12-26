/**
 * Tests for API Validation Utilities
 *
 * Focus on JSON parsing error handling and validation
 */

import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import {
  safeParseJson,
  validateRequestBody,
  createApiHandler,
  validationErrorResponse,
} from '../api-validation'

// Mock logger to avoid console output during tests
vi.mock('../logger', () => ({
  logger: {
    scope: () => ({
      warn: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
    }),
  },
}))

describe('safeParseJson', () => {
  it('should parse valid JSON successfully', async () => {
    const validJson = JSON.stringify({ name: 'Test', value: 123 })
    const req = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      body: validJson,
      headers: { 'Content-Type': 'application/json' },
    })

    const result = await safeParseJson(req)
    expect(result).toEqual({ name: 'Test', value: 123 })
  })

  it('should throw clear error for malformed JSON', async () => {
    const malformedJson = '{invalid}'
    const req = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      body: malformedJson,
      headers: { 'Content-Type': 'application/json' },
    })

    await expect(safeParseJson(req)).rejects.toThrow('Invalid JSON in request body')
  })

  it('should handle empty JSON object', async () => {
    const emptyJson = '{}'
    const req = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      body: emptyJson,
      headers: { 'Content-Type': 'application/json' },
    })

    const result = await safeParseJson(req)
    expect(result).toEqual({})
  })

  it('should handle JSON array', async () => {
    const jsonArray = JSON.stringify([1, 2, 3])
    const req = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      body: jsonArray,
      headers: { 'Content-Type': 'application/json' },
    })

    const result = await safeParseJson(req)
    expect(result).toEqual([1, 2, 3])
  })
})

describe('validateRequestBody', () => {
  const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    age: z.number().min(0),
  })

  it('should validate and parse valid request body', async () => {
    const validJson = JSON.stringify({ name: 'John', age: 25 })
    const req = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      body: validJson,
      headers: { 'Content-Type': 'application/json' },
    })

    const result = await validateRequestBody(req, schema)
    expect(result).toEqual({ name: 'John', age: 25 })
  })

  it('should throw ZodError for invalid data', async () => {
    const invalidJson = JSON.stringify({ name: '', age: -5 })
    const req = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      body: invalidJson,
      headers: { 'Content-Type': 'application/json' },
    })

    await expect(validateRequestBody(req, schema)).rejects.toThrow()
  })

  it('should throw error for malformed JSON before validation', async () => {
    const malformedJson = '{name: "test"}'
    const req = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      body: malformedJson,
      headers: { 'Content-Type': 'application/json' },
    })

    await expect(validateRequestBody(req, schema)).rejects.toThrow('Invalid JSON in request body')
  })
})

describe('createApiHandler', () => {
  const schema = z.object({
    message: z.string().min(1),
  })

  it('should handle valid requests successfully', async () => {
    const handler = createApiHandler({
      bodySchema: schema,
      handler: async ({ body }) => {
        return { success: true, message: body.message }
      },
    })

    const validJson = JSON.stringify({ message: 'Hello' })
    const req = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      body: validJson,
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await handler(req)
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toEqual({ success: true, message: 'Hello' })
  })

  it('should return 400 for malformed JSON with helpful message', async () => {
    const handler = createApiHandler({
      bodySchema: schema,
      handler: async ({ body }) => {
        return { success: true, message: body.message }
      },
    })

    const malformedJson = '{invalid}'
    const req = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      body: malformedJson,
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await handler(req)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data).toEqual({ error: 'Invalid JSON in request body' })
  })

  it('should return 400 for validation errors', async () => {
    const handler = createApiHandler({
      bodySchema: schema,
      handler: async ({ body }) => {
        return { success: true, message: body.message }
      },
    })

    const invalidJson = JSON.stringify({ message: '' })
    const req = new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      body: invalidJson,
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await handler(req)
    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data).toHaveProperty('error', 'Validation failed')
    expect(data).toHaveProperty('details')
  })

  it('should handle handler without body schema', async () => {
    const handler = createApiHandler({
      handler: async () => {
        return { success: true }
      },
    })

    const req = new NextRequest('http://localhost:3000/api/test', {
      method: 'GET',
    })

    const response = await handler(req)
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toEqual({ success: true })
  })
})

describe('validationErrorResponse', () => {
  it('should format Zod errors correctly', () => {
    const schema = z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email'),
    })

    try {
      schema.parse({ name: '', email: 'invalid' })
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response = validationErrorResponse(error)
        expect(response.status).toBe(400)
      }
    }
  })
})
