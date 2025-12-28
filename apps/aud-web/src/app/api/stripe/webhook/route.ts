/**
 * Stripe Webhook Handler
 * totalaud.io - December 2025
 *
 * Handles Stripe webhook events for subscription lifecycle
 * Includes idempotency protection against replay attacks
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@total-audio/schemas-database'
import { logger } from '@/lib/logger'
import { env, getRequiredEnv } from '@/lib/env'

const log = logger.scope('StripeWebhook')

// Lazy initialisation of admin client to allow env validation
let _supabaseAdmin: SupabaseClient<Database> | null = null

function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!_supabaseAdmin) {
    const serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY')
    _supabaseAdmin = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey)
  }
  return _supabaseAdmin
}

// Map Stripe price to tier name
function getTierFromPrice(priceId: string): string {
  const starterPrices = [
    env.STRIPE_PRICE_STARTER_GBP,
    env.STRIPE_PRICE_STARTER_USD,
    env.STRIPE_PRICE_STARTER_EUR,
  ].filter(Boolean)

  const proPrices = [
    env.STRIPE_PRICE_PRO_GBP,
    env.STRIPE_PRICE_PRO_USD,
    env.STRIPE_PRICE_PRO_EUR,
  ].filter(Boolean)

  const proAnnualPrices = [
    env.STRIPE_PRICE_PRO_ANNUAL_GBP,
    env.STRIPE_PRICE_PRO_ANNUAL_USD,
    env.STRIPE_PRICE_PRO_ANNUAL_EUR,
  ].filter(Boolean)

  if (starterPrices.includes(priceId)) return 'starter'
  if (proPrices.includes(priceId)) return 'pro'
  if (proAnnualPrices.includes(priceId)) return 'pro_annual'

  log.warn('Unknown price ID, defaulting to starter', { priceId })
  return 'starter'
}

/**
 * Check if webhook event has already been processed (idempotency)
 * Returns true if event was already processed
 */
async function isEventProcessed(eventId: string): Promise<boolean> {
  const supabaseAdmin = getSupabaseAdmin()

  const { data } = await supabaseAdmin
    .from('stripe_webhook_events')
    .select('id')
    .eq('event_id', eventId)
    .single()

  return !!data
}

/**
 * Mark webhook event as processed
 */
async function markEventProcessed(eventId: string, eventType: string): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin()

  const { error } = await supabaseAdmin.from('stripe_webhook_events').insert({
    event_id: eventId,
    event_type: eventType,
    processed_at: new Date().toISOString(),
  })

  if (error) {
    // Unique constraint violation means it was already processed (race condition)
    if (error.code === '23505') {
      log.debug('Event already marked as processed (race condition)', { eventId })
      return
    }
    log.error('Failed to mark event as processed', { eventId, error })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    log.warn('Missing Stripe signature')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  // Get webhook secret with validation
  const webhookSecret = getRequiredEnv('STRIPE_WEBHOOK_SECRET')

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    log.error('Webhook signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Idempotency check - prevent replay attacks and duplicate processing
  if (await isEventProcessed(event.id)) {
    log.info('Event already processed, skipping', { eventId: event.id, type: event.type })
    return NextResponse.json({ received: true, skipped: true })
  }

  log.info('Webhook received', { type: event.type, eventId: event.id })

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutComplete(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        log.debug('Unhandled event type', { type: event.type })
    }

    // Mark event as processed after successful handling
    await markEventProcessed(event.id, event.type)

    return NextResponse.json({ received: true })
  } catch (error) {
    log.error('Webhook handler error', error)
    // Don't mark as processed on error - allow retry
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  log.info('Checkout completed', { customerId, subscriptionId })

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  await handleSubscriptionChange(subscription)
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const supabaseAdmin = getSupabaseAdmin()
  const customerId = subscription.customer as string

  // Get user by Stripe customer ID
  const { data: profile, error } = await supabaseAdmin
    .from('user_profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (error || !profile) {
    log.error('User not found for customer', { customerId, error })
    return
  }

  // Get tier from price
  const priceId = subscription.items.data[0]?.price.id
  const tier = getTierFromPrice(priceId)

  // Update user profile
  const { error: updateError } = await supabaseAdmin
    .from('user_profiles')
    .update({
      subscription_status: subscription.status,
      subscription_tier: tier,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id)

  if (updateError) {
    log.error('Failed to update subscription', { userId: profile.id, error: updateError })
    throw updateError // Throw to prevent marking as processed
  }

  log.info('Subscription updated', {
    userId: profile.id,
    status: subscription.status,
    tier,
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabaseAdmin = getSupabaseAdmin()
  const customerId = subscription.customer as string

  // Get user by Stripe customer ID
  const { data: profile, error } = await supabaseAdmin
    .from('user_profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (error || !profile) {
    log.error('User not found for customer', { customerId, error })
    return
  }

  // Reset to no subscription
  const { error: updateError } = await supabaseAdmin
    .from('user_profiles')
    .update({
      subscription_status: 'cancelled',
      subscription_tier: 'none',
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id)

  if (updateError) {
    log.error('Failed to cancel subscription', { userId: profile.id, error: updateError })
    throw updateError // Throw to prevent marking as processed
  }

  log.info('Subscription cancelled', { userId: profile.id })
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const supabaseAdmin = getSupabaseAdmin()
  const customerId = invoice.customer as string

  // Get user by Stripe customer ID
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('id, email')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) {
    log.error('User not found for failed payment', { customerId })
    return
  }

  // Update subscription status
  const { error: updateError } = await supabaseAdmin
    .from('user_profiles')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id)

  if (updateError) {
    log.error('Failed to update payment status', { userId: profile.id, error: updateError })
    throw updateError // Throw to prevent marking as processed
  }

  log.warn('Payment failed', { userId: profile.id, invoiceId: invoice.id })

  // TODO: Send email notification about failed payment
}
