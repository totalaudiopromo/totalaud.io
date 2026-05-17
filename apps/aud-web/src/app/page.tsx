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
  title: 'totalaud.io — Run releases like a real label.',
  description:
    'The workspace small independent record labels use to plan releases, package assets, and brief every partner. One pipeline, one brief, one source of truth.',
  openGraph: {
    title: 'totalaud.io — Run releases like a real label.',
    description:
      'Plan every release, package every asset, brief every partner — without the spreadsheets, the lost files, or the 9pm email.',
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
    'totalaud.io — Run releases like a real label.',
    'The workspace small independent record labels use to plan releases, package assets, and brief every partner.',
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
