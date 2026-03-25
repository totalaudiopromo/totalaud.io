/**
 * Landing Page
 * totalaud.io - Vision Aligned
 *
 * A calm, opinionated system for independent artists.
 * Authenticated users redirect to /console.
 */

import { LandingPage } from '@/components/landing/LandingPage'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
  const supabase = await createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect('/console')
  }

  return <LandingPage />
}
