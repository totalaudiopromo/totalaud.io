/**
 * Backfill the Resend newsletter Audience from Supabase captures.
 *
 * The Unsigned Advantage newsletter moved off Kit. Signups have been landing in
 * Supabase (totalaud_io_waitlist) without reaching a broadcastable list. This
 * one-off script pushes those existing emails into the Resend Audience so the
 * newsletter can be sent again.
 *
 * Usage:
 *   RESEND_API_KEY=re_xxx RESEND_AUDIENCE_ID=<uuid> pnpm backfill:audience
 *   pnpm backfill:audience --dry-run     # list what would be synced, write nothing
 *
 * Safe to re-run: Resend keys contacts by email within an audience, so repeats
 * are treated as no-ops.
 */

import { Resend } from 'resend'
import { createAdminClient } from './config'

const DRY_RUN = process.argv.includes('--dry-run')

const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID

async function main() {
  if (!RESEND_API_KEY || !RESEND_AUDIENCE_ID) {
    console.error('❌ RESEND_API_KEY and RESEND_AUDIENCE_ID must both be set.')
    process.exit(1)
  }

  const supabase = createAdminClient()
  const resend = new Resend(RESEND_API_KEY)

  const { data: rows, error } = await supabase
    .from('totalaud_io_waitlist')
    .select('email')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('❌ Failed to read waitlist from Supabase:', error.message)
    process.exit(1)
  }

  const emails = Array.from(
    new Set((rows ?? []).map((r) => (r.email as string)?.trim().toLowerCase()).filter(Boolean))
  )

  console.log(`Found ${emails.length} unique email(s) in totalaud_io_waitlist.`)
  if (DRY_RUN) {
    console.log('— dry run — nothing will be written. Emails that would sync:')
    emails.forEach((e) => console.log(`  ${e}`))
    return
  }

  let added = 0
  let skipped = 0
  let failed = 0

  for (const email of emails) {
    try {
      const { error: addError } = await resend.contacts.create({
        email,
        audienceId: RESEND_AUDIENCE_ID,
        unsubscribed: false,
      })
      if (addError) {
        if (/already exists/i.test(addError.message ?? '')) {
          skipped++
        } else {
          failed++
          console.warn(`  ✗ ${email}: ${addError.message}`)
        }
      } else {
        added++
      }
    } catch (err) {
      failed++
      console.warn(`  ✗ ${email}: ${err instanceof Error ? err.message : 'unknown error'}`)
    }
    // Gentle pacing to stay well under Resend rate limits.
    await new Promise((r) => setTimeout(r, 120))
  }

  console.log(`\nDone. added=${added} already-present=${skipped} failed=${failed}`)
}

main().catch((err) => {
  console.error('❌ Backfill failed:', err)
  process.exit(1)
})
