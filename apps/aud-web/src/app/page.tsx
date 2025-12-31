/**
 * Landing Page
 * totalaud.io - 2025 Pivot
 *
 * Aesthetic: Cinematic Editorial
 * A24 film credits meets Bloomberg design meets Ableton's restraint
 *
 * NOTE: Coming Soon mode controlled by preview cookie.
 * - Public users see ComingSoonLanding
 * - Preview users (with cookie) see full LandingPage
 */

import { cookies } from 'next/headers'
import { LandingPage } from '@/components/landing/LandingPage'
import { ComingSoonLanding } from '@/components/landing/ComingSoonLanding'

export const metadata = {
  title: 'totalaud.io - Your music deserves to be heard',
  description:
    'Scout contacts. Capture ideas. Plan releases. Craft pitches. One workspace for independent artists who are ready to be heard.',
  openGraph: {
    title: 'totalaud.io - Your music deserves to be heard',
    description: 'One workspace for independent artists who are ready to be heard.',
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
