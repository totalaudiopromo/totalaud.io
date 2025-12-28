/**
 * Shared API Response Types
 * totalaud.io - December 2025
 *
 * Standardised response types for consistent error handling across all API routes.
 * Use these types instead of defining response shapes inline.
 */

// ============================================
// Core Response Types
// ============================================

/**
 * Standardised error codes for API responses
 */
export type ApiErrorCode =
  | 'AUTH_ERROR'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'CONFIGURATION_ERROR'

/**
 * Standardised error structure
 */
export interface ApiError {
  code: ApiErrorCode
  message: string
  details?: unknown
}

/**
 * Successful API response
 */
export interface ApiSuccess<T> {
  success: true
  data: T
}

/**
 * Failed API response
 */
export interface ApiFailure {
  success: false
  error: ApiError
}

/**
 * Union type for all API responses
 */
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

// ============================================
// Helper Functions
// ============================================

/**
 * Create a successful API response
 */
export function successResponse<T>(data: T): ApiSuccess<T> {
  return { success: true, data }
}

/**
 * Create a failed API response
 */
export function errorResponse(code: ApiErrorCode, message: string, details?: unknown): ApiFailure {
  return {
    success: false,
    error: { code, message, details },
  }
}

/**
 * Create common error responses
 */
export const apiErrors = {
  unauthorized: (message = 'Authentication required') => errorResponse('AUTH_ERROR', message),

  forbidden: (message = 'Access denied') => errorResponse('FORBIDDEN', message),

  notFound: (resource = 'Resource') => errorResponse('NOT_FOUND', `${resource} not found`),

  validation: (message: string, details?: unknown) =>
    errorResponse('VALIDATION_ERROR', message, details),

  rateLimited: (message = 'Too many requests. Please try again later.') =>
    errorResponse('RATE_LIMITED', message),

  internal: (message = 'An unexpected error occurred') => errorResponse('INTERNAL_ERROR', message),

  externalService: (service: string, message?: string) =>
    errorResponse('EXTERNAL_SERVICE_ERROR', message || `Failed to communicate with ${service}`),

  configuration: (message: string) => errorResponse('CONFIGURATION_ERROR', message),
}

// ============================================
// Type Guards
// ============================================

/**
 * Type guard to check if response is successful
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
  return response.success === true
}

/**
 * Type guard to check if response is a failure
 */
export function isApiFailure<T>(response: ApiResponse<T>): response is ApiFailure {
  return response.success === false
}

// ============================================
// Pagination Types
// ============================================

export interface PaginationParams {
  page?: number
  limit?: number
  cursor?: string
}

export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
  nextCursor?: string
}

export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>

/**
 * Create a paginated successful response
 */
export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
  nextCursor?: string
): ApiSuccess<PaginatedData<T>> {
  return successResponse({
    items,
    total,
    page,
    limit,
    hasMore: page * limit < total,
    nextCursor,
  })
}
