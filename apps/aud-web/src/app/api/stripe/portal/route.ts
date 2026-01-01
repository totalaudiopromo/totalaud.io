/**
 * Stripe Customer Portal API
 * totalaud.io - December 2025
 *
 * Creates a Stripe Customer Portal session for managing subscriptions
 */

import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { logger } from '@/lib/logger'
import { env } from '@/lib/env'
import { requireAuth } from '@/lib/api/auth'

const log = logger.scope('StripePortal')

export async function POST() {
  try {
    const auth = await requireAuth()
    if (auth instanceof NextResponse) {
      return auth
    }

    const { supabase, session: authSession } = auth
    const user = authSession.user

    // Get Stripe customer ID
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${env.NEXT_PUBLIC_APP_URL}/workspace`,
    })

    log.info('Created portal session', { userId: user.id })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    log.error('Portal session error', error)
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}
