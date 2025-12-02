/**
 * Landing Page
 * totalaud.io - 2025 Pivot
 *
 * Aesthetic: Cinematic Editorial
 * A24 film credits meets Bloomberg design meets Ableton's restraint
 */

import { LandingPage } from '@/components/landing/LandingPage'

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

export default function Page() {
  return <LandingPage />
}
