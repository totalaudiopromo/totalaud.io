import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError, ZodSchema } from 'zod'
import { logger } from '@total-audio/core-logger'

const log = logger.scope('APIValidation')

/**
 * API Validation Error Response
 */
export interface ValidationErrorResponse {
  error: string
  details?: Array<{
    field: string
    message: string
  }>
}

/**
 * Validate request body against a Zod schema
 */
export async function validateRequestBody<T extends ZodSchema>(
  req: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  try {
    const body = await req.json()
    const validated = schema.parse(body)
    log.debug('Request body validated successfully')
    return validated
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      log.warn('Request body validation failed', { details })
      throw new ValidationError('Invalid request body', details)
    }
    throw error
  }
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQueryParams<T extends ZodSchema>(req: NextRequest, schema: T): z.infer<T> {
  try {
    const { searchParams } = new URL(req.url)
    const params = Object.fromEntries(searchParams.entries())
    const validated = schema.parse(params)
    log.debug('Query parameters validated successfully')
    return validated
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      log.warn('Query parameter validation failed', { details })
      throw new ValidationError('Invalid query parameters', details)
    }
    throw error
  }
}

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public details?: Array<{ field: string; message: string }>
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Create error response for validation failures
 */
export function validationErrorResponse(error: ValidationError): NextResponse {
  const response: ValidationErrorResponse = {
    error: error.message,
    details: error.details,
  }
  return NextResponse.json(response, { status: 400 })
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // UUID validation
  uuid: z.string().uuid('Invalid UUID format'),

  // Pagination
  pagination: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),

  // Agent message
  agentMessage: z.object({
    from_agent: z.string().min(1, 'from_agent is required'),
    to_agent: z.string().min(1, 'to_agent is required'),
    content: z.string().min(1, 'content is required'),
    session_id: z.string().uuid('session_id must be a valid UUID'),
    metadata: z.record(z.unknown()).optional(),
  }),

  // Flow creation
  flowCreate: z.object({
    name: z.string().min(1, 'Flow name is required').max(255),
    description: z.string().max(1000).optional(),
    agent_name: z.string().min(1).max(100).optional().default('custom-flow'),
    initial_input: z.record(z.unknown()).optional().default({}),
  }),

  // Skill invocation
  skillInvoke: z.object({
    input: z.record(z.unknown()),
    session_id: z.string().uuid('session_id must be a valid UUID'),
  }),
}

/**
 * Higher-order function to create type-safe API route handlers
 */
export interface ApiHandlerConfig<TBody = unknown, TParams = unknown> {
  bodySchema?: ZodSchema<TBody>
  paramsSchema?: ZodSchema<TParams>
  handler: (context: {
    req: NextRequest
    body?: TBody
    params?: TParams
  }) => Promise<Response | NextResponse | { [key: string]: unknown }>
}

export function createApiHandler<TBody = unknown, TParams = unknown>(
  config: ApiHandlerConfig<TBody, TParams>
) {
  return async (req: NextRequest, context?: { params: unknown }): Promise<Response> => {
    try {
      // Validate body if schema provided
      let validatedBody: TBody | undefined
      if (config.bodySchema) {
        validatedBody = await validateRequestBody(req, config.bodySchema)
      }

      // Validate params if schema provided
      let validatedParams: TParams | undefined
      if (config.paramsSchema && context?.params) {
        validatedParams = config.paramsSchema.parse(context.params)
      }

      // Execute handler
      const result = await config.handler({
        req,
        body: validatedBody,
        params: validatedParams,
      })

      // If handler returns a Response, return it directly
      if (result instanceof Response) {
        return result
      }

      // Otherwise, wrap in JSON response
      return NextResponse.json(result)
    } catch (error) {
      if (error instanceof ValidationError) {
        return validationErrorResponse(error)
      }

      log.error('API handler error', error)

      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Internal server error',
        },
        { status: 500 }
      )
    }
  }
}
