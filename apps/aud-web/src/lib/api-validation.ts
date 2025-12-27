/**
 * API Validation Utilities
 *
 * Provides Zod-based validation for API request bodies and parameters.
 * Includes common schemas for reuse across routes.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z, ZodSchema, ZodError } from 'zod'
import { logger } from './logger'

const log = logger.scope('API Validation')

/**
 * Validate request body against a Zod schema
 * @throws ZodError if validation fails
 */
export async function validateRequestBody<T>(req: NextRequest, schema: ZodSchema<T>): Promise<T> {
  const body = await req.json()
  return schema.parse(body)
}

/**
 * Validate URL search params against a Zod schema
 * @throws ZodError if validation fails
 */
export function validateSearchParams<T>(req: NextRequest, schema: ZodSchema<T>): T {
  const searchParams = Object.fromEntries(req.nextUrl.searchParams)
  return schema.parse(searchParams)
}

/**
 * Create a validation error response
 */
export function validationErrorResponse(error: ZodError): NextResponse {
  return NextResponse.json(
    {
      error: 'Validation failed',
      details: error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    },
    { status: 400 }
  )
}

/**
 * Handler options for createApiHandler
 */
interface ApiHandlerOptions<TBody, TParams> {
  bodySchema?: ZodSchema<TBody>
  paramsSchema?: ZodSchema<TParams>
  handler: (context: {
    body: TBody
    params: TParams
    req: NextRequest
  }) => Promise<NextResponse | object>
}

/**
 * Create a validated API handler with automatic error handling
 *
 * @example
 * export const POST = createApiHandler({
 *   bodySchema: z.object({ name: z.string() }),
 *   handler: async ({ body }) => {
 *     return { success: true, data: body }
 *   }
 * })
 */
export function createApiHandler<TBody = unknown, TParams = unknown>(
  options: ApiHandlerOptions<TBody, TParams>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      let body = {} as TBody
      let params = {} as TParams

      // Validate body if schema provided
      if (options.bodySchema) {
        const rawBody = await req.json()
        body = options.bodySchema.parse(rawBody)
      }

      // Validate params if schema provided
      if (options.paramsSchema) {
        const searchParams = Object.fromEntries(req.nextUrl.searchParams)
        params = options.paramsSchema.parse(searchParams)
      }

      // Call handler
      const result = await options.handler({ body, params, req })

      // If handler returns NextResponse, return it directly
      if (result instanceof NextResponse) {
        return result
      }

      // Otherwise wrap in JSON response
      return NextResponse.json(result)
    } catch (error) {
      if (error instanceof ZodError) {
        log.warn('Validation error', { errors: error.errors })
        return validationErrorResponse(error)
      }

      log.error('Handler error', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}

// ============================================
// Common Validation Schemas
// ============================================

/**
 * Common schemas for reuse across API routes
 */
export const commonSchemas = {
  /** Pagination parameters */
  pagination: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),

  /** UUID validation */
  id: z.object({
    id: z.string().uuid('Invalid ID format'),
  }),

  /** Message content validation */
  message: z.object({
    content: z.string().min(1, 'Content is required').max(10000, 'Content too long'),
  }),

  /** Flow creation validation */
  flowCreate: z.object({
    goal: z.string().min(1, 'Goal is required'),
    flowType: z.string().optional(),
  }),

  /** Contact validation */
  contact: z.object({
    email: z.string().email('Invalid email'),
    name: z.string().optional(),
    outlet: z.string().optional(),
    role: z.string().optional(),
  }),

  /** Campaign validation */
  campaign: z.object({
    title: z.string().min(1, 'Title is required'),
    artistName: z.string().min(1, 'Artist name is required'),
    releaseDate: z.string().optional(),
    genre: z.string().optional(),
  }),

  /** URL validation */
  url: z.object({
    url: z.string().url('Invalid URL format'),
  }),

  /** Date range validation */
  dateRange: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  }),
}
