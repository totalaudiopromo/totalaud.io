/**
 * Momentum Cron API
 * Scheduled endpoint for applying momentum decay
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MomentumAutomation } from '@/momentum/MomentumAutomation'

/**
 * Apply decay for all users (scheduled job)
 * In production, this should be called by a cron service every 6 hours
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const supabase = createClient()

    // Get all momentum records
    const { data: momentumRecords, error } = await supabase
      .from('loopos_momentum')
      .select('user_id')

    if (error) {
      console.error('Failed to fetch momentum records:', error)
      return NextResponse.json(
        { error: 'Failed to fetch momentum records' },
        { status: 500 }
      )
    }

    const results = []

    for (const record of momentumRecords) {
      try {
        const decayResult = await MomentumAutomation.applyDecay(
          supabase,
          record.user_id
        )
        results.push({
          user_id: record.user_id,
          ...decayResult,
        })
      } catch (err) {
        console.error(`Failed to apply decay for user ${record.user_id}:`, err)
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    })
  } catch (error) {
    console.error('Momentum cron error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
