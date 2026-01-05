/**
 * Landing Page
 * totalaud.io - Vision Aligned (January 2026)
 *
 * A calm, opinionated system for independent artists
 *
 * NOTE: Coming Soon mode controlled by preview cookie.
 * - Public users see ComingSoonLanding
 * - Preview users (with cookie) see full LandingPage
 */

import { cookies } from 'next/headers'
import { LandingPage } from '@/components/landing/LandingPage'
import { ComingSoonLanding } from '@/components/landing/ComingSoonLanding'

export const metadata = {
  title: 'totalaud.io - Finish better. Release smarter.',
  description:
    'A calm, opinionated system that helps independent artists finish their music, understand what matters, and release with confidence.',
  openGraph: {
    title: 'totalaud.io - Finish better. Release smarter.',
    description: 'Get clear feedback on your music. Plan releases that make sense. Stop guessing.',
    type: 'website',
  },
}

export default async function Page() {
  const cookieStore = await cookies()
  const hasPreviewAccess = cookieStore.get('totalaud_preview_access')?.value === 'true'

  if (hasPreviewAccess) {
    return <LandingPage />
  }

  return <ComingSoonLanding />
}
