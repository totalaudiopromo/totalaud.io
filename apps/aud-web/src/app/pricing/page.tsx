/**
 * Pricing Page
 * totalaud.io - December 2025
 *
 * Standalone pricing page with auth-aware CTAs
 * Handles ?checkout=cancelled from failed Stripe sessions
 */

import { Suspense } from 'react'
import { Metadata } from 'next'
import { JsonLd } from '@/components/seo'
import {
  generateSoftwareApplicationSchema,
  generateWebPageSchemaWithSpeakable,
  generateBreadcrumbSchema,
} from '@/lib/seo'
import { PricingPageClient } from './PricingPageClient'

export const metadata: Metadata = {
  title: 'Pricing - totalaud.io',
  description:
    'Simple, honest pricing for your creative workspace. Starter from £5/month, Pro unlimited access for £19/month.',
  alternates: {
    canonical: 'https://totalaud.io/pricing',
  },
}

export default function PricingPage() {
  const softwareSchema = generateSoftwareApplicationSchema()
  const pageSchema = generateWebPageSchemaWithSpeakable(
    'Pricing - totalaud.io',
    'Simple, honest pricing for your creative workspace. Starter from £5/month, Pro unlimited access for £19/month.',
    '/pricing',
    ['h1', 'h2', 'main p']
  )
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Pricing', url: '/pricing' },
  ])

  return (
    <>
      <JsonLd schema={[softwareSchema, pageSchema, breadcrumbSchema]} id="pricing-schemas" />
      <Suspense
        fallback={
          <div
            style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0F1113',
            }}
          >
            <div style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Loading...</div>
          </div>
        }
      >
        <PricingPageClient />
      </Suspense>
    </>
  )
}
