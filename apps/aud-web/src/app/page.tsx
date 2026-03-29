/**
 * Landing Page
 * totalaud.io - Vision Aligned
 *
 * A calm, opinionated system for independent artists.
 * Authenticated users redirect to /console.
 */

import { LandingPage } from '@/components/landing/LandingPage'
import { JsonLd } from '@/components/seo'
import {
  generateSoftwareApplicationSchema,
  generateWebSiteSchema,
  generateWebPageSchemaWithSpeakable,
} from '@/lib/seo'
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
  alternates: {
    canonical: 'https://totalaud.io',
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

  const softwareSchema = generateSoftwareApplicationSchema()
  const webSiteSchema = generateWebSiteSchema()
  const homePageSchema = generateWebPageSchemaWithSpeakable(
    'totalaud.io - Finish better. Release smarter.',
    'A calm, opinionated system that helps independent artists finish their music, understand what matters, and release with confidence.',
    '/',
    ['h1', 'h2', '[id="how-it-works-heading"]']
  )

  return (
    <>
      <JsonLd schema={[softwareSchema, webSiteSchema, homePageSchema]} id="home-schemas" />
      <LandingPage />
    </>
  )
}
