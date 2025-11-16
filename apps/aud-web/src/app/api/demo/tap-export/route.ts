/**
 * TAP Export Stub API
 * Phase 28C - Liberty Demo
 *
 * IMPORTANT: This is a DEMO STUB ONLY.
 * Does NOT call real Total Audio Promo infrastructure.
 *
 * TODO (Fusion Lite): Replace with real TAP integration when ready.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const TapExportSchema = z.object({
  demoMode: z.enum(['artist', 'liberty']),
  campaignName: z.string().optional(),
  artist: z.string().optional(),
  targetAudience: z.string().optional(),
  timestamp: z.string().optional(),
  pseudoCampaignSummary: z.any().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = TapExportSchema.parse(body)

    // Log to console for debugging (demo purposes)
    console.log('[TAP Export Stub] Received export request:', {
      demoMode: data.demoMode,
      campaignName: data.campaignName,
      artist: data.artist,
      targetAudience: data.targetAudience,
      timestamp: data.timestamp || new Date().toISOString(),
    })

    // Simulate network delay (300-700ms)
    const delay = 300 + Math.random() * 400
    await new Promise((resolve) => setTimeout(resolve, delay))

    // Always return success for demo
    // In real implementation, this would call TAP API
    const demoExportId = `demo-export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    return NextResponse.json({
      success: true,
      message: 'Campaign exported to TAP (Preview Mode)',
      demoExportId,
      previewMode: true,
      note: 'This is a demo stub. Real TAP integration coming with Fusion Lite.',
    })
  } catch (error) {
    console.error('[TAP Export Stub] Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Export failed',
      },
      { status: 500 }
    )
  }
}
