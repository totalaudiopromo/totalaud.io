/**
 * Newsletter audience sync (Resend)
 * totalaud.io
 *
 * Adds newsletter signups to the Resend Audience that backs
 * The Unsigned Advantage, so captures land in a broadcastable list rather than
 * only in Supabase. Broadcasts are then sent from Resend against this audience.
 *
 * Graceful no-op: when RESEND_API_KEY or RESEND_AUDIENCE_ID is unset, this
 * returns without error so a signup never fails because the newsletter send
 * path is not yet configured.
 *
 * Usage:
 *   import { addNewsletterContact } from '@/lib/newsletter-audience'
 *   await addNewsletterContact('artist@example.com', { source: 'newsletter-notes' })
 */

import { Resend } from 'resend'
import { env, isNewsletterAudienceConfigured } from './env'
import { logger } from './logger'

const log = logger.scope('NewsletterAudience')

interface AddContactResult {
  success: boolean
  id?: string
  error?: string
  skipped?: boolean
}

interface AddContactOptions {
  firstName?: string
  /** Capture source tag, for logging/observability only. */
  source?: string
}

/**
 * Add (or re-add) an email to the newsletter Resend Audience.
 *
 * Idempotent from the caller's perspective: Resend keys contacts by email
 * within an audience, so a repeat add for an existing contact is treated as a
 * success rather than an error.
 */
export async function addNewsletterContact(
  email: string,
  options: AddContactOptions = {}
): Promise<AddContactResult> {
  if (!isNewsletterAudienceConfigured()) {
    log.warn('Skipping audience add — Resend newsletter audience not configured', {
      source: options.source,
    })
    return { success: false, skipped: true, error: 'Newsletter audience not configured' }
  }

  try {
    const resend = new Resend(env.RESEND_API_KEY)

    const { data, error } = await resend.contacts.create({
      email,
      audienceId: env.RESEND_AUDIENCE_ID!,
      unsubscribed: false,
      firstName: options.firstName,
    })

    if (error) {
      // An already-existing contact is not a failure for our purposes.
      const message = error.message ?? 'Unknown Resend error'
      if (/already exists/i.test(message)) {
        log.info('Newsletter contact already present', { email, source: options.source })
        return { success: true }
      }
      log.error('Failed to add newsletter contact', { email, message })
      return { success: false, error: message }
    }

    log.info('Newsletter contact added', { email, id: data?.id, source: options.source })
    return { success: true, id: data?.id }
  } catch (err) {
    log.error('Error adding newsletter contact', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}
