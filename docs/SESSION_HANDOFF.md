# Session handoff — newsletter / marketing (2026-07-20)

Context for the next session. Most of this shipped in PR #144.

## Done
- **`/weekly-marketing` skill** added (`.claude/skills/` + `.agents/skills/`): chains
  topic brief → quality-gated asset → founder social thread. Runs key-free; delegates
  to `ericosiu/ai-marketing-skills` (`seo-ops`, `content-ops`, `x-longform-post`) if installed.
- **Kit/ConvertKit retired**: dead `theadvantage.kit.com` archive link removed; `/notes`
  archive link now only renders when `NEXT_PUBLIC_NEWSLETTER_ARCHIVE_URL` is set. Unused
  Railway scripts deleted; stale Railway comments corrected to Vercel.
- **Resend newsletter send-path**: signups sync into a Resend Audience.
  - Audience **"The Unsigned Advantage"** created — `RESEND_AUDIENCE_ID = ccec8988-e22f-4ebc-b45a-9d2c0f036e0b`.
  - The one existing signup was backfilled into it.
  - Vercel env vars `RESEND_API_KEY` + `RESEND_AUDIENCE_ID` set on Production/Preview/Development.
  - `pnpm backfill:audience` creates/finds the audience and backfills; guards against the
    wrong Supabase project.

## Outstanding — pick up here
1. **Rotate the Resend key.** A TAP Resend key was shared in-session and set as totalaud.io's
   `RESEND_API_KEY`. Roll it in Resend → API Keys and update the Vercel var to the new value.
   Better: mint a dedicated **"totalaud.io"** key (same Resend team as the audience) so the app
   and TAP don't share one key.
2. **Verify sending domains.** Transactional email (welcome/confirmation) now sends via that
   Resend team — confirm `totalaudiopromo.com` / `totalaud.io` are **verified** in Resend → Domains,
   or those sends won't deliver. (Audience sync is unaffected by domain status.)
3. **Send an issue.** With the audience live, send The Unsigned Advantage as a Resend **Broadcast**
   against `ccec8988-…`. `/weekly-marketing` can draft it.

## Gotchas worth remembering
- **Two Supabase projects**: `totalaud-io-v2` (`qopmwhdermudwufrloqb`) holds app signups;
  `Total Audio Platform` (`ucncbighzqudaszewjrv`) is the TAP CRM (`contacts` = press/curators,
  **not** newsletter subscribers — keep them out of the audience). This session's env vars pointed
  at the TAP project, not the app — worth aligning the session/env config.
- Newsletter list is currently tiny (1 signup) — it went dormant; nothing accumulated.

## Marketing gaps (candidate future skills)
The `ericosiu` toolkit is B2B-SaaS shaped; the music-PR layer is uncovered:
release-to-outlet matching, 1:1 personalised pitch generation, placement tracking + follow-up.
