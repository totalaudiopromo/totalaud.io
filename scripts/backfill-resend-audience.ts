/**
 * Set up + backfill the Resend newsletter Audience from Supabase captures.
 *
 * The Unsigned Advantage newsletter moved off Kit. Signups have been landing in
 * Supabase (totalaud_io_waitlist) without reaching a broadcastable list. This
 * one-off script:
 *   1. Resolves the newsletter Audience — uses RESEND_AUDIENCE_ID if set,
 *      otherwise finds an audience named "The Unsigned Advantage", otherwise
 *      creates one — and prints its UUID for you to set in Vercel.
 *   2. Pushes existing waitlist emails into that Audience so the newsletter can
 *      be sent again.
 *
 * Usage:
 *   RESEND_API_KEY=re_xxx pnpm backfill:audience              # create/find + backfill
 *   RESEND_API_KEY=re_xxx pnpm backfill:audience --dry-run    # show plan, write nothing
 *   RESEND_API_KEY=re_xxx RESEND_AUDIENCE_ID=<uuid> pnpm backfill:audience  # explicit audience
 *
 * Safe to re-run: the audience is reused by name, and Resend keys contacts by
 * email within an audience, so repeats are no-ops.
 */

import { Resend } from 'resend'
import { createAdminClient } from './config'

const DRY_RUN = process.argv.includes('--dry-run')
const AUDIENCE_NAME = 'The Unsigned Advantage'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID

async function resolveAudienceId(resend: Resend): Promise<string> {
  if (RESEND_AUDIENCE_ID) {
    console.log(`Using RESEND_AUDIENCE_ID from env: ${RESEND_AUDIENCE_ID}`)
    return RESEND_AUDIENCE_ID
  }

  // Reuse an existing audience with the same name to avoid duplicates on re-run.
  const { data: list, error: listError } = await resend.audiences.list()
  if (listError) {
    console.error('❌ Failed to list Resend audiences:', listError.message)
    process.exit(1)
  }
  const existing = list?.data?.find((a) => a.name === AUDIENCE_NAME)
  if (existing) {
    console.log(`Found existing audience "${AUDIENCE_NAME}": ${existing.id}`)
    return existing.id
  }

  if (DRY_RUN) {
    console.log(`— dry run — would create audience "${AUDIENCE_NAME}" (none found).`)
    return '<would-be-created>'
  }

  const { data: created, error: createError } = await resend.audiences.create({
    name: AUDIENCE_NAME,
  })
  if (createError || !created) {
    console.error('❌ Failed to create audience:', createError?.message)
    process.exit(1)
  }
  console.log(`Created audience "${AUDIENCE_NAME}": ${created.id}`)
  console.log(`\n👉 Set this in Vercel:  RESEND_AUDIENCE_ID=${created.id}\n`)
  return created.id
}

async function main() {
  if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY must be set.')
    process.exit(1)
  }

  const resend = new Resend(RESEND_API_KEY)
  const supabase = createAdminClient()

  const audienceId = await resolveAudienceId(resend)

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
        audienceId,
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
  if (!RESEND_AUDIENCE_ID) {
    console.log(`\nRemember to set RESEND_AUDIENCE_ID=${audienceId} in Vercel so live signups sync.`)
  }
}

main().catch((err) => {
  console.error('❌ Backfill failed:', err)
  process.exit(1)
})
