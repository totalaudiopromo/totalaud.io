import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import {
  validateRequestBody,
  validateQueryParams,
  ValidationError,
  validationErrorResponse,
  commonSchemas,
} from '../api-validation'

describe('api-validation', () => {
  describe('validateRequestBody', () => {
    it('should validate a valid request body', async () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      })

      const req = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        body: JSON.stringify({ name: 'John', age: 30 }),
      })

      const result = await validateRequestBody(req, schema)

      expect(result).toEqual({ name: 'John', age: 30 })
    })

    it('should throw ValidationError for invalid request body', async () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      })

      const req = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        body: JSON.stringify({ name: 'John', age: 'invalid' }),
      })

      await expect(validateRequestBody(req, schema)).rejects.toThrow(ValidationError)
    })

    it('should provide detailed error information', async () => {
      const schema = z.object({
        email: z.string().email(),
      })

      const req = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        body: JSON.stringify({ email: 'not-an-email' }),
      })

      try {
        await validateRequestBody(req, schema)
        expect.fail('Should have thrown ValidationError')
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
        const validationError = error as ValidationError
        expect(validationError.details).toBeDefined()
        expect(validationError.details?.[0].field).toBe('email')
      }
    })
  })

  describe('validateQueryParams', () => {
    it('should validate valid query parameters', () => {
      const schema = z.object({
        page: z.coerce.number(),
        limit: z.coerce.number(),
      })

      const req = new NextRequest('http://localhost:3000/api/test?page=1&limit=10')

      const result = validateQueryParams(req, schema)

      expect(result).toEqual({ page: 1, limit: 10 })
    })

    it('should throw ValidationError for invalid query parameters', () => {
      const schema = z.object({
        page: z.coerce.number().positive(),
      })

      const req = new NextRequest('http://localhost:3000/api/test?page=-1')

      expect(() => validateQueryParams(req, schema)).toThrow(ValidationError)
    })
  })

  describe('validationErrorResponse', () => {
    it('should create a proper error response', () => {
      const error = new ValidationError('Invalid input', [
        { field: 'email', message: 'Invalid email format' },
      ])

      const response = validationErrorResponse(error)

      expect(response.status).toBe(400)
    })
  })

  describe('commonSchemas', () => {
    describe('uuid', () => {
      it('should validate valid UUIDs', () => {
        const validUuid = '123e4567-e89b-12d3-a456-426614174000'
        const result = commonSchemas.uuid.parse(validUuid)
        expect(result).toBe(validUuid)
      })

      it('should reject invalid UUIDs', () => {
        expect(() => commonSchemas.uuid.parse('not-a-uuid')).toThrow()
      })
    })

    describe('pagination', () => {
      it('should parse pagination params with defaults', () => {
        const result = commonSchemas.pagination.parse({})
        expect(result).toEqual({ page: 1, limit: 20 })
      })

      it('should parse custom pagination params', () => {
        const result = commonSchemas.pagination.parse({ page: '2', limit: '50' })
        expect(result).toEqual({ page: 2, limit: 50 })
      })

      it('should reject invalid pagination params', () => {
        expect(() => commonSchemas.pagination.parse({ page: '-1' })).toThrow()
        expect(() => commonSchemas.pagination.parse({ limit: '200' })).toThrow()
      })
    })

    describe('agentMessage', () => {
      it('should validate valid agent messages', () => {
        const message = {
          from_agent: 'scout',
          to_agent: 'coach',
          content: 'Hello',
          session_id: '123e4567-e89b-12d3-a456-426614174000',
        }

        const result = commonSchemas.agentMessage.parse(message)
        expect(result).toEqual(message)
      })

      it('should reject invalid agent messages', () => {
        expect(() =>
          commonSchemas.agentMessage.parse({
            from_agent: '',
            to_agent: 'coach',
            content: 'Hello',
            session_id: 'invalid-uuid',
          })
        ).toThrow()
      })
    })

    describe('flowCreate', () => {
      it('should validate valid flow creation', () => {
        const flow = {
          name: 'Radio Promo Campaign',
          description: 'Promote single to radio',
        }

        const result = commonSchemas.flowCreate.parse(flow)
        expect(result.name).toBe(flow.name)
        expect(result.description).toBe(flow.description)
        expect(result.agent_name).toBe('custom-flow') // default
        expect(result.initial_input).toEqual({}) // default
      })

      it('should reject invalid flow creation', () => {
        expect(() =>
          commonSchemas.flowCreate.parse({
            name: '', // empty name
            description: 'Test',
          })
        ).toThrow()
      })
    })
  })
})
