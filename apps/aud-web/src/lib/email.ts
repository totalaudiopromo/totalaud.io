/**
 * Email Client (Resend)
 * totalaud.io - December 2025
 *
 * Handles transactional email sending via Resend.
 * Used for welcome emails, notifications, and drip sequences.
 *
 * Usage:
 *   import { sendWelcomeEmail } from '@/lib/email'
 *   await sendWelcomeEmail({ to: 'artist@example.com', artistName: 'Luna' })
 */

import { Resend } from 'resend'
import { env, isEmailConfigured } from './env'
import { logger } from './logger'

const log = logger.scope('Email')

// ============================================
// Client Setup
// ============================================

let resendClient: Resend | null = null

function getResendClient(): Resend {
  if (!resendClient) {
    if (!isEmailConfigured()) {
      throw new Error('Email not configured: RESEND_API_KEY is missing')
    }
    resendClient = new Resend(env.RESEND_API_KEY)
  }
  return resendClient
}

// ============================================
// Email Templates
// ============================================

interface WelcomeEmailData {
  to: string
  artistName: string
  primaryGoal?: 'discover' | 'plan' | 'pitch' | 'explore'
}

interface EmailResult {
  success: boolean
  id?: string
  error?: string
}

// ============================================
// Email Sending Functions
// ============================================

/**
 * Send welcome email after onboarding completion
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<EmailResult> {
  if (!isEmailConfigured()) {
    log.warn('Skipping welcome email - Resend not configured')
    return { success: false, error: 'Email not configured' }
  }

  const { to, artistName, primaryGoal = 'explore' } = data

  // Goal-specific CTA
  const goalMessages: Record<string, { action: string; mode: string }> = {
    discover: { action: 'Find your first opportunity', mode: 'scout' },
    plan: { action: 'Start planning your release', mode: 'timeline' },
    pitch: { action: 'Craft your first pitch', mode: 'pitch' },
    explore: { action: 'Capture your first idea', mode: 'ideas' },
  }

  const goalInfo = goalMessages[primaryGoal] || goalMessages.explore
  const appUrl = env.NEXT_PUBLIC_APP_URL || 'https://totalaud.io'

  try {
    const resend = getResendClient()

    const { data: result, error } = await resend.emails.send({
      from: 'Audio <info@totalaudiopromo.com>',
      to: [to],
      subject: `Welcome to totalaud.io, ${artistName}! 🎵`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to totalaud.io</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0F1113; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0F1113; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <img src="${appUrl}/brand/svg/ta-logo-cyan.svg" alt="totalaud.io" width="48" height="48" style="display: block;">
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding-bottom: 24px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #F7F8F9; line-height: 1.3;">
                Hey ${artistName},
              </h1>
            </td>
          </tr>

          <!-- Welcome message -->
          <tr>
            <td style="padding-bottom: 24px;">
              <p style="margin: 0; font-size: 16px; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">
                Welcome to your creative workspace. totalaud.io is designed to help you get your music heard – without the chaos.
              </p>
            </td>
          </tr>

          <!-- 4 Modes -->
          <tr>
            <td style="padding-bottom: 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 16px; background-color: rgba(255, 255, 255, 0.03); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.06);">
                    <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #3AA9BE;">
                      Your workspace has four modes:
                    </p>
                    <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.6); line-height: 1.8;">
                      <strong style="color: #F7F8F9;">Ideas</strong> – Capture and organise your creative thoughts<br>
                      <strong style="color: #F7F8F9;">Scout</strong> – Discover playlists, blogs, and radio opportunities<br>
                      <strong style="color: #F7F8F9;">Timeline</strong> – Plan your release with a visual calendar<br>
                      <strong style="color: #F7F8F9;">Pitch</strong> – Craft compelling pitches with AI coaching
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <a href="${appUrl}/workspace?mode=${goalInfo.mode}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #3AA9BE 0%, #2D8A9C 100%); color: #0F1113; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 10px;">
                ${goalInfo.action} →
              </a>
            </td>
          </tr>

          <!-- Support -->
          <tr>
            <td style="padding-bottom: 24px;">
              <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.5); line-height: 1.6;">
                Questions? Just reply to this email – we're real humans and we'd love to help.
              </p>
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="padding-bottom: 40px; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
              <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.6);">
                Keep creating,<br>
                <strong style="color: #F7F8F9;">The Total Audio Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 24px;">
              <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.3); text-align: center;">
                totalaud.io • Built by radio promotion veterans in the UK<br>
                <a href="${appUrl}/unsubscribe" style="color: rgba(255, 255, 255, 0.4); text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
      text: `
Hey ${artistName},

Welcome to your creative workspace! totalaud.io is designed to help you get your music heard – without the chaos.

Your workspace has four modes:
• Ideas – Capture and organise your creative thoughts
• Scout – Discover playlists, blogs, and radio opportunities
• Timeline – Plan your release with a visual calendar
• Pitch – Craft compelling pitches with AI coaching

Ready to get started? ${goalInfo.action}:
${appUrl}/workspace?mode=${goalInfo.mode}

Questions? Just reply to this email – we're real humans and we'd love to help.

Keep creating,
The Total Audio Team

---
totalaud.io • Built by radio promotion veterans in the UK
      `.trim(),
    })

    if (error) {
      log.error('Failed to send welcome email', error)
      return { success: false, error: error.message }
    }

    log.info('Welcome email sent', { to, id: result?.id })
    return { success: true, id: result?.id }
  } catch (error) {
    log.error('Error sending welcome email', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================
// Payment & Subscription Emails
// ============================================

interface PaymentConfirmationData {
  to: string
  customerName: string
  tierName: string
  amount: string
  currency: string
  billingCycle: 'monthly' | 'annual'
}

/**
 * Send payment confirmation after successful subscription checkout
 */
export async function sendPaymentConfirmationEmail(
  data: PaymentConfirmationData
): Promise<EmailResult> {
  if (!isEmailConfigured()) {
    log.warn('Skipping payment confirmation email - Resend not configured')
    return { success: false, error: 'Email not configured' }
  }

  const { to, customerName, tierName, amount, currency, billingCycle } = data
  const appUrl = env.NEXT_PUBLIC_APP_URL || 'https://totalaud.io'
  const cycleText = billingCycle === 'annual' ? 'year' : 'month'

  try {
    const resend = getResendClient()

    const { data: result, error } = await resend.emails.send({
      from: 'Audio <info@totalaudiopromo.com>',
      to: [to],
      subject: `You're subscribed to ${tierName}!`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0F1113; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0F1113; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px;">
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <img src="${appUrl}/brand/svg/ta-logo-cyan.svg" alt="totalaud.io" width="48" height="48">
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #F7F8F9;">
                Thanks, ${customerName}!
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px;">
              <p style="margin: 0; font-size: 16px; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">
                Your subscription to <strong style="color: #3AA9BE;">${tierName}</strong> is now active.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; background-color: rgba(255, 255, 255, 0.03); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.06); margin-bottom: 24px;">
              <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.5);">Payment details</p>
              <p style="margin: 8px 0 0 0; font-size: 20px; color: #F7F8F9; font-weight: 600;">
                ${currency}${amount}/${cycleText}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 24px; padding-bottom: 32px;">
              <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.6); line-height: 1.6;">
                You now have full access to all ${tierName} features. Head to your workspace to start creating.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <a href="${appUrl}/workspace" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #3AA9BE 0%, #2D8A9C 100%); color: #0F1113; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 10px;">
                Open Workspace →
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.06);">
              <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.3); text-align: center;">
                Manage your subscription in <a href="${appUrl}/settings/billing" style="color: #3AA9BE;">billing settings</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
      text: `
Thanks, ${customerName}!

Your subscription to ${tierName} is now active.

Payment: ${currency}${amount}/${cycleText}

You now have full access to all ${tierName} features. Head to your workspace to start creating:
${appUrl}/workspace

Manage your subscription: ${appUrl}/settings/billing

The Total Audio Team
      `.trim(),
    })

    if (error) {
      log.error('Failed to send payment confirmation email', error)
      return { success: false, error: error.message }
    }

    log.info('Payment confirmation email sent', { to, tier: tierName, id: result?.id })
    return { success: true, id: result?.id }
  } catch (error) {
    log.error('Error sending payment confirmation email', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

interface PaymentFailedData {
  to: string
  customerName: string
  tierName: string
  portalUrl?: string
}

/**
 * Send email when payment fails (card declined, expired, etc.)
 */
export async function sendPaymentFailedEmail(data: PaymentFailedData): Promise<EmailResult> {
  if (!isEmailConfigured()) {
    log.warn('Skipping payment failed email - Resend not configured')
    return { success: false, error: 'Email not configured' }
  }

  const { to, customerName, tierName, portalUrl } = data
  const appUrl = env.NEXT_PUBLIC_APP_URL || 'https://totalaud.io'
  const billingUrl = portalUrl || `${appUrl}/settings/billing`

  try {
    const resend = getResendClient()

    const { data: result, error } = await resend.emails.send({
      from: 'Audio <info@totalaudiopromo.com>',
      to: [to],
      subject: 'Action needed: Payment failed',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0F1113; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0F1113; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px;">
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <img src="${appUrl}/brand/svg/ta-logo-cyan.svg" alt="totalaud.io" width="48" height="48">
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #F7F8F9;">
                Hey ${customerName},
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px;">
              <p style="margin: 0; font-size: 16px; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">
                We couldn't process your payment for <strong style="color: #3AA9BE;">${tierName}</strong>. This sometimes happens when a card expires or has insufficient funds.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; background-color: rgba(239, 68, 68, 0.1); border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.2); margin-bottom: 24px;">
              <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.7);">
                <strong style="color: #ef4444;">Update your payment method</strong> within the next 7 days to avoid losing access to your ${tierName} features.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 24px; padding-bottom: 32px;">
              <a href="${billingUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #3AA9BE 0%, #2D8A9C 100%); color: #0F1113; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 10px;">
                Update Payment Method →
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px;">
              <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.5); line-height: 1.6;">
                If you're having trouble, just reply to this email and we'll help sort it out.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.06);">
              <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.3); text-align: center;">
                totalaud.io • Built by radio promotion veterans in the UK
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
      text: `
Hey ${customerName},

We couldn't process your payment for ${tierName}. This sometimes happens when a card expires or has insufficient funds.

Update your payment method within the next 7 days to avoid losing access to your ${tierName} features:
${billingUrl}

If you're having trouble, just reply to this email and we'll help sort it out.

The Total Audio Team
      `.trim(),
    })

    if (error) {
      log.error('Failed to send payment failed email', error)
      return { success: false, error: error.message }
    }

    log.info('Payment failed email sent', { to, tier: tierName, id: result?.id })
    return { success: true, id: result?.id }
  } catch (error) {
    log.error('Error sending payment failed email', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

interface CancellationData {
  to: string
  customerName: string
  tierName: string
  accessEndDate: string
}

/**
 * Send email when subscription is cancelled
 */
export async function sendCancellationEmail(data: CancellationData): Promise<EmailResult> {
  if (!isEmailConfigured()) {
    log.warn('Skipping cancellation email - Resend not configured')
    return { success: false, error: 'Email not configured' }
  }

  const { to, customerName, tierName, accessEndDate } = data
  const appUrl = env.NEXT_PUBLIC_APP_URL || 'https://totalaud.io'

  try {
    const resend = getResendClient()

    const { data: result, error } = await resend.emails.send({
      from: 'Audio <info@totalaudiopromo.com>',
      to: [to],
      subject: 'Your subscription has been cancelled',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0F1113; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0F1113; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px;">
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <img src="${appUrl}/brand/svg/ta-logo-cyan.svg" alt="totalaud.io" width="48" height="48">
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #F7F8F9;">
                Hey ${customerName},
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px;">
              <p style="margin: 0; font-size: 16px; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">
                Your <strong style="color: #3AA9BE;">${tierName}</strong> subscription has been cancelled. We're sorry to see you go.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; background-color: rgba(255, 255, 255, 0.03); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.06); margin-bottom: 24px;">
              <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.5);">Your access continues until</p>
              <p style="margin: 8px 0 0 0; font-size: 20px; color: #F7F8F9; font-weight: 600;">
                ${accessEndDate}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 24px; padding-bottom: 24px;">
              <p style="margin: 0; font-size: 14px; color: rgba(255, 255, 255, 0.6); line-height: 1.6;">
                Your ideas, timelines, and pitches will still be there if you decide to come back. We'd love to hear what we could do better – just reply to this email.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <a href="${appUrl}/pricing" style="display: inline-block; padding: 14px 28px; background: transparent; color: #3AA9BE; font-size: 15px; font-weight: 600; text-decoration: none; border-radius: 10px; border: 1px solid #3AA9BE;">
                Resubscribe anytime →
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.06);">
              <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.3); text-align: center;">
                totalaud.io • Built by radio promotion veterans in the UK
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
      text: `
Hey ${customerName},

Your ${tierName} subscription has been cancelled. We're sorry to see you go.

Your access continues until: ${accessEndDate}

Your ideas, timelines, and pitches will still be there if you decide to come back. We'd love to hear what we could do better – just reply to this email.

Resubscribe anytime: ${appUrl}/pricing

The Total Audio Team
      `.trim(),
    })

    if (error) {
      log.error('Failed to send cancellation email', error)
      return { success: false, error: error.message }
    }

    log.info('Cancellation email sent', { to, tier: tierName, id: result?.id })
    return { success: true, id: result?.id }
  } catch (error) {
    log.error('Error sending cancellation email', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================
// Generic Email Function
// ============================================

/**
 * Send a generic transactional email
 */
export async function sendEmail(options: {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
}): Promise<EmailResult> {
  if (!isEmailConfigured()) {
    log.warn('Skipping email - Resend not configured')
    return { success: false, error: 'Email not configured' }
  }

  try {
    const resend = getResendClient()

    const { data: result, error } = await resend.emails.send({
      from: options.from || 'Audio <hello@totalaud.io>',
      to: [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    if (error) {
      log.error('Failed to send email', error)
      return { success: false, error: error.message }
    }

    log.info('Email sent', { to: options.to, subject: options.subject, id: result?.id })
    return { success: true, id: result?.id }
  } catch (error) {
    log.error('Error sending email', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
