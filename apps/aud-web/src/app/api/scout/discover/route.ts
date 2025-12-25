/**
 * Scout Discovery API Route
 *
 * MVP approach: User pastes a URL, we:
 * 1. Fetch the page
 * 2. Extract all visible email addresses
 * 3. Classify each as B2B/B2C
 * 4. Verify against suppression list
 * 5. Return verified B2B contacts
 *
 * This avoids Perplexity API costs while still providing real value.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  extractEmailsFromHtml,
  verifyEmailsBatchFromSource,
  classifyContact,
  checkSuppressionBatch,
  extractDomainFromUrl,
  determineOutletType,
} from '@/lib/discovery'
import { logger } from '@/lib/logger'
import { validateRequestBody, validationErrorResponse } from '@/lib/api-validation'

const log = logger.scope('Scout Discovery')

// Validation schema
const discoverRequestSchema = z.object({
  url: z.string().url('Invalid URL format'),
})

export interface DiscoveredContact {
  id: string
  email: string
  name: string | null
  role: string | null
  outlet: string | null
  outletType: string | null
  sourceUrl: string
  sourceDomain: string
  classification: 'b2b' | 'b2c' | 'unknown'
  confidence: number
  verified: boolean
  verificationMethod: string
}

export interface DiscoveryResponse {
  contacts: DiscoveredContact[]
  sourceUrl: string
  sourceDomain: string
  totalFound: number
  totalVerified: number
  totalB2B: number
  fetchTimeMs: number
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Validate request body
    const { url } = await validateRequestBody(request, discoverRequestSchema)

    const sourceDomain = extractDomainFromUrl(url)

    // Fetch the page
    const pageResponse = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })

    if (!pageResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch page: HTTP ${pageResponse.status}` },
        { status: 400 }
      )
    }

    const html = await pageResponse.text()

    // Extract emails from visible content
    const emails = extractEmailsFromHtml(html)

    if (emails.length === 0) {
      return NextResponse.json({
        contacts: [],
        sourceUrl: url,
        sourceDomain,
        totalFound: 0,
        totalVerified: 0,
        totalB2B: 0,
        fetchTimeMs: Date.now() - startTime,
      })
    }

    // Verify all emails exist on the page (batch for efficiency)
    const verificationResults = await verifyEmailsBatchFromSource(emails, url)

    // Check suppression list
    const suppressionResults = await checkSuppressionBatch(emails)

    // Process each email
    const contacts: DiscoveredContact[] = []
    let verifiedCount = 0
    let b2bCount = 0

    for (const email of emails) {
      const verification = verificationResults.results.get(email)
      const suppression = suppressionResults.get(email.toLowerCase())

      // Skip suppressed emails
      if (suppression?.isSuppressed) {
        continue
      }

      // Skip unverified emails
      if (!verification?.verified) {
        continue
      }

      verifiedCount++

      // Classify the contact
      const classification = classifyContact(
        email.split('@')[0], // Use local part as "name" for now
        email,
        undefined,
        sourceDomain,
        url
      )

      // For MVP, only return B2B contacts
      if (classification.type === 'b2c') {
        continue
      }

      b2bCount++

      // Try to determine outlet type from domain
      const outletType = determineOutletType(sourceDomain, url)

      contacts.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email,
        name: null, // Would need more sophisticated extraction
        role: null, // Would need more sophisticated extraction
        outlet: sourceDomain,
        outletType,
        sourceUrl: url,
        sourceDomain,
        classification: classification.type,
        confidence: classification.confidence,
        verified: true,
        verificationMethod: verification.method,
      })
    }

    const response: DiscoveryResponse = {
      contacts,
      sourceUrl: url,
      sourceDomain,
      totalFound: emails.length,
      totalVerified: verifiedCount,
      totalB2B: b2bCount,
      fetchTimeMs: Date.now() - startTime,
    }

    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof z.ZodError) {
      log.warn('Validation error', { errors: error.errors })
      return validationErrorResponse(error)
    }

    log.error('Discovery error', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Discovery failed' },
      { status: 500 }
    )
  }
}
