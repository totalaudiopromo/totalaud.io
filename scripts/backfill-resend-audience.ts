/**
 * Set up + backfill the Resend newsletter Audience from Supabase signups.
 *
 * The Unsigned Advantage newsletter moved off Kit. Signups land in Supabase
 * (public.totalaud_io_waitlist) but had no broadcastable home. This one-off:
 *   1. Resolves the newsletter Audience — uses RESEND_AUDIENCE_ID if set,
 *      otherwise finds/creates one named "The Unsigned Advantage" and prints
 *      its UUID for Vercel.
 *   2. Pushes existing waitlist emails into that Audience.
 *
 * TWO SUPABASE PROJECTS EXIST:
 *   - totalaud-io-v2 (qopmwhdermudwufrloqb)  → the app; signups live HERE.
 *   - Total Audio Platform (ucncbighzqudaszewjrv) → TAP CRM; NOT signups.
 * This script must run against the app project. It prints which project it
 * connected to and fails loudly if the waitlist table isn't there, so it can
 * never silently backfill from the wrong database. Point it explicitly with
 * NEWSLETTER_SUPABASE_URL / NEWSLETTER_SUPABASE_SERVICE_ROLE_KEY, or rely on the
 * standard SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fallback.
 *
 * Usage:
 *   RESEND_API_KEY=re_xxx pnpm backfill:audience              # create/find + backfill
 *   RESEND_API_KEY=re_xxx pnpm backfill:audience --dry-run    # show plan, write nothing
 *   RESEND_API_KEY=re_xxx RESEND_AUDIENCE_ID=<uuid> pnpm backfill:audience
 *
 * Safe to re-run: the audience is reused by name, and Resend keys contacts by
 * email within an audience, so repeats are no-ops.
 */

import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const DRY_RUN = process.argv.includes('--dry-run')
const AUDIENCE_NAME = 'The Unsigned Advantage'
const WAITLIST_TABLE = 'totalaud_io_waitlist'
const APP_PROJECT_REF = 'qopmwhdermudwufrloqb' // totalaud-io-v2 — where signups live

const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID

// Prefer explicit newsletter-project creds; fall back to the standard ones.
const SUPABASE_URL =
  process.env.NEWSLETTER_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY =
  process.env.NEWSLETTER_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

function projectRef(url: string): string {
  return url.replace(/^https?:\/\//, '').split('.')[0]
}

async function resolveAudienceId(resend: Resend): Promise<string> {
  if (RESEND_AUDIENCE_ID) {
    console.log(`Using RESEND_AUDIENCE_ID from env: ${RESEND_AUDIENCE_ID}`)
    return RESEND_AUDIENCE_ID
  }
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
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error(
      '❌ Supabase URL + service role key required (NEWSLETTER_SUPABASE_* or SUPABASE_*).'
    )
    process.exit(1)
  }

  const ref = projectRef(SUPABASE_URL)
  console.log(`Supabase project: ${ref}${ref === APP_PROJECT_REF ? ' (totalaud-io-v2 ✓)' : ''}`)
  if (ref !== APP_PROJECT_REF) {
    console.warn(
      `⚠️  Connected to '${ref}', not the app project '${APP_PROJECT_REF}'.\n` +
        `    Newsletter signups live in totalaud-io-v2. If the read below fails,\n` +
        `    set NEWSLETTER_SUPABASE_URL / NEWSLETTER_SUPABASE_SERVICE_ROLE_KEY to it.`
    )
  }

  const resend = new Resend(RESEND_API_KEY)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const audienceId = await resolveAudienceId(resend)

  const { data: rows, error } = await supabase
    .from(WAITLIST_TABLE)
    .select('email')
    .order('created_at', { ascending: true })

  if (error) {
    const missingTable = /could not find the table|does not exist/i.test(error.message)
    if (missingTable) {
      console.error(
        `❌ Table '${WAITLIST_TABLE}' not found in project '${ref}'.\n` +
          `   This is almost certainly the wrong Supabase project. Signups live in\n` +
          `   the app project '${APP_PROJECT_REF}' (totalaud-io-v2). Re-run with\n` +
          `   NEWSLETTER_SUPABASE_URL / NEWSLETTER_SUPABASE_SERVICE_ROLE_KEY pointed at it.`
      )
    } else {
      console.error(`❌ Failed to read ${WAITLIST_TABLE}:`, error.message)
    }
    process.exit(1)
  }

  const emails = Array.from(
    new Set((rows ?? []).map((r) => (r.email as string)?.trim().toLowerCase()).filter(Boolean))
  )

  console.log(`Found ${emails.length} unique email(s) in ${WAITLIST_TABLE}.`)
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
    console.log(
      `\nRemember to set RESEND_AUDIENCE_ID=${audienceId} in Vercel so live signups sync.`
    )
  }
}

main().catch((err) => {
  console.error('❌ Backfill failed:', err)
  process.exit(1)
})
