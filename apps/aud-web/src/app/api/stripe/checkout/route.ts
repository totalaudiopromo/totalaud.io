/**
 * Stripe Checkout Session API
 * totalaud.io - December 2025
 *
 * Creates a Stripe Checkout session for subscription signup
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { stripe, getPriceId } from '@/lib/stripe'
import { logger } from '@/lib/logger'

const log = logger.scope('StripeCheckout')

// Zod schema for checkout request validation
const checkoutSchema = z.object({
  tier: z.enum(['starter', 'pro', 'pro_annual']),
  currency: z.enum(['gbp', 'usd', 'eur']).optional().default('gbp'),
})

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

    // Parse and validate request body with Zod
    const body = await request.json()
    const validated = checkoutSchema.safeParse(body)

    if (!validated.success) {
      log.warn('Invalid checkout request', { errors: validated.error.flatten() })
      return NextResponse.json(
        { error: 'Invalid request', details: validated.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { tier, currency } = validated.data

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
