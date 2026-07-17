/**
 * totalaud.io — Waiting List
 *
 * Artist-first recommitment (July 2026, see docs/STRATEGY_2026.md).
 * This page captures interest while sign-ups are paused and back-links
 * to TAP (totalaudiopromo.com). The full app remains live behind auth
 * for existing users.
 *
 * SEO targets: "finish your music", "release planning for independent artists",
 * "second opinion before release"
 */

import { WaitlistLanding } from '@/components/landing/WaitlistLanding'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'totalaud.io — A calm second opinion for independent artists',
  description:
    'Finish your music, plan the release, and reach the right people — with your audio never leaving your device. Join the waiting list.',
  openGraph: {
    title: 'totalaud.io — A calm second opinion for independent artists',
    description:
      'Finishing notes, release planning, and relationship memory for independent artists. No scores, no hype — just what matters. Join the waiting list.',
    type: 'website',
    url: 'https://totalaud.io',
  },
  keywords: [
    'finish your music',
    'release planning for independent artists',
    'second opinion before release',
    'music release checklist',
    'independent artist tools',
    'playlist pitching alternative',
  ],
  alternates: {
    canonical: 'https://totalaud.io',
  },
}

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Existing users keep access to the app
  if (session) {
    redirect('/workspace')
  }

  return <WaitlistLanding />
}
