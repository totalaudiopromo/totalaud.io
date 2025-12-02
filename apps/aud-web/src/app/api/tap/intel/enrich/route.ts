/**
 * TAP Intel Enrichment Proxy Route
 *
 * Enriches contacts using Total Audio Platform's Intel service.
 * Used by Scout Mode to validate and enrich opportunity contacts.
 *
 * POST /api/tap/intel/enrich
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { tapClient, TotalAudioApiError, type EnrichContactInput } from '@/lib/tap-client'

const log = logger.scope('TAPIntelEnrich')

// Request validation schema
const enrichRequestSchema = z.object({
  contacts: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Valid email is required'),
        outlet: z.string().optional(),
        role: z.string().optional(),
        genre_tags: z.array(z.string()).optional(),
      })
    )
    .min(1, 'At least one contact is required')
    .max(10, 'Maximum 10 contacts per request'),
  options: z
    .object({
      forceRefresh: z.boolean().optional(),
      includeConfidence: z.boolean().optional(),
    })
    .optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Check if Intel is configured
    if (!tapClient.isConfigured('intel')) {
      log.warn('Intel API not configured')
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_CONFIGURED',
            message: 'Intel service is not configured',
          },
        },
        { status: 503 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = enrichRequestSchema.safeParse(body)

    if (!validationResult.success) {
      log.warn('Validation failed', { errors: validationResult.error.errors })
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: validationResult.error.errors,
          },
        },
        { status: 400 }
      )
    }

    const { contacts, options } = validationResult.data

    log.info('Enriching contacts', { count: contacts.length })

    // Call TAP Intel service
    const enriched = await tapClient.intel.enrichContacts(contacts as EnrichContactInput[], options)

    log.info('Enrichment complete', { enrichedCount: enriched.length })

    return NextResponse.json({
      success: true,
      data: {
        enriched,
        processed: enriched.length,
      },
    })
  } catch (error) {
    if (error instanceof TotalAudioApiError) {
      log.error('TAP Intel API error', undefined, { code: error.code, status: error.status })
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.status }
      )
    }

    log.error('Unexpected error in Intel enrichment', error as Error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to enrich contacts',
        },
      },
      { status: 500 }
    )
  }
}
