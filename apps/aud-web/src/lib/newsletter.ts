/**
 * Newsletter configuration for The Unsigned Advantage
 *
 * IMPORTANT: This is a SHARED newsletter across totalaud.io and Total Audio Promo.
 * Single funnel, single voice, single archive. Do not create separate newsletters.
 */

export const newsletter = {
  name: 'The Unsigned Advantage',
  tagline: 'For independent artists who want to understand what actually matters',
  contextLabel: 'Notes from building totalaud.io',

  // Newsletter archive (externally hosted). Signups go through /api/waitlist.
  // Kit/ConvertKit is retired — no default. Set NEXT_PUBLIC_NEWSLETTER_ARCHIVE_URL
  // to a live archive to surface the link; left empty, the link is hidden.
  archiveUrl: process.env.NEXT_PUBLIC_NEWSLETTER_ARCHIVE_URL || '',

  // Shared across both properties
  sharedAcross: [
    { name: 'totalaud.io', url: 'https://totalaud.io' },
    { name: 'Total Audio Promo', url: 'https://totalaudiopromo.com' },
  ],

  copy: {
    formLabel: 'Get notes by email',
    formHelper: 'Occasional. No spam. Unsubscribe anytime.',
    archiveLink: 'Browse the archive',
    sharedNote: 'The same newsletter I send from Total Audio Promo — one list, same notes.',
  },
} as const

export type NewsletterConfig = typeof newsletter
