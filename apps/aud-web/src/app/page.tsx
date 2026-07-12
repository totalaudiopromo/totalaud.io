/**
 * totalaud.io — Waiting List
 *
 * Product is paused (21 May 2026). This page captures interest and
 * back-links to TAP (totalaudiopromo.com). The full app remains live
 * behind auth for existing users.
 *
 * SEO targets: "music PR for labels", "label release management", "indie label tools"
 */

import { WaitlistLanding } from '@/components/landing/WaitlistLanding'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'totalaud.io — Coming soon for indie labels',
  description:
    'A workspace for indie record labels — release management, asset packaging, and campaign briefing. Join the waiting list.',
  openGraph: {
    title: 'totalaud.io — Coming soon for indie labels',
    description:
      'Music PR for labels. Release management, asset packaging, campaign briefing — without the spreadsheets. Join the waiting list.',
    type: 'website',
    url: 'https://totalaud.io',
  },
  keywords: [
    'music PR for labels',
    'label release management',
    'indie label tools',
    'release campaign planning',
    'music campaign briefing',
    'indie label workspace',
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
    redirect('/console')
  }

  return <WaitlistLanding />
}
