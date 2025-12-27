/**
 * Stripe Checkout Session API
 * totalaud.io - December 2025
 *
 * Creates a Stripe Checkout session for subscription signup
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { stripe, getPriceId, type SubscriptionTier, type Currency } from '@/lib/stripe'
import { logger } from '@/lib/logger'

const log = logger.scope('StripeCheckout')

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { tier, currency = 'gbp' } = body as {
      tier: SubscriptionTier
      currency?: Currency
    }

    if (!tier || !['starter', 'pro', 'pro_annual'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id, email, full_name')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email || profile?.email,
        name: profile?.full_name || undefined,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      // Save customer ID to profile
      await supabase
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)

      log.info('Created Stripe customer', { userId: user.id, customerId })
    }

    // Get price ID for tier and currency
    const priceId = getPriceId(tier, currency)

    // Determine mode based on tier
    const mode = tier === 'pro_annual' ? 'subscription' : 'subscription'

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/workspace?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout=cancelled`,
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          tier,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
    })

    log.info('Created checkout session', {
      userId: user.id,
      tier,
      currency,
      sessionId: session.id,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    log.error('Checkout session error', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
