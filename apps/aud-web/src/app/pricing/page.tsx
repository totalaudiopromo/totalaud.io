/**
 * Pricing Page
 * totalaud.io - December 2025
 *
 * Standalone pricing page with auth-aware CTAs
 * Handles ?checkout=cancelled from failed Stripe sessions
 */

import { Suspense } from 'react'
import { Metadata } from 'next'
import { PricingPageClient } from './PricingPageClient'

export const metadata: Metadata = {
  title: 'Pricing - totalaud.io',
  description:
    'Simple, honest pricing for your creative workspace. Starter from £5/month, Pro unlimited access for £19/month.',
}

export default function PricingPage() {
  return (
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
  )
}
