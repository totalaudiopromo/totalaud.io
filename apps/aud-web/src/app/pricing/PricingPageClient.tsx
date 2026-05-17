/**
 * Pricing Page Client Component
 * totalaud.io - December 2025
 *
 * Auth-aware pricing page with checkout integration
 */

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'

// Label-pivot pricing (May 2026). Stripe wiring lands in Plan B.
// CTAs route to mailto until then.
const TALK_TO_US = 'mailto:chris@totalaudiopromo.com?subject=totalaud.io%20pricing'

const STUDIO_FEATURES = [
  { text: '1 label, 3 artists', description: '10 releases per year' },
  { text: '2 seats', description: 'For you and one collaborator' },
  { text: 'Brief authoring + asset packs', description: 'Single source of truth per release' },
  { text: 'Partner handoff', description: 'TAP integration for PR campaigns' },
]

const INDIE_FEATURES = [
  { text: 'Everything in Studio', description: 'Plus more capacity' },
  { text: '1 label, 10 artists', description: '40 releases per year' },
  { text: '5 seats', description: 'Full team access' },
  { text: 'Reporting tab', description: 'Track what each partner shipped' },
  { text: 'Partner directory', description: 'Reusable contacts across releases' },
  { text: 'Co-pilot when launched', description: 'Early access included' },
]

const PRO_FEATURES = [
  { text: 'Everything in Indie', description: 'Plus multi-label features' },
  { text: 'Multi-label, unlimited artists', description: 'Unlimited seats' },
  { text: 'White-label partner views', description: 'Your brand on every share link' },
  { text: 'Dedicated onboarding + priority support', description: 'Direct line to our team' },
  { text: 'Distributor CSV import', description: 'Bring your roster across cleanly' },
]

// Legacy tier identifiers preserved for existing-subscription `currentTier` checks.
// New tier names are display-only; checkout routes to mailto until Plan B wires Stripe.
type ValidTier = 'starter' | 'pro' | 'pro_annual' | 'power' | 'power_annual'

interface PricingTierProps {
  title: string
  price: string
  pricePeriod: string
  priceNote?: string
  features: Array<{ text: string; description: string }>
  tier: ValidTier
  isPro?: boolean
  highlight?: string
  isCurrentTier?: boolean
  onCheckout: (tier: ValidTier) => void
  isAuthenticated: boolean
  loading?: boolean
}

function PricingTier({
  title,
  price,
  pricePeriod,
  priceNote,
  features,
  tier,
  isPro = false,
  highlight,
  isCurrentTier = false,
  onCheckout,
  isAuthenticated,
  loading = false,
}: PricingTierProps) {
  const ctaText = isCurrentTier ? 'Current Plan' : 'Talk to us'

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="px-5 py-7 sm:p-8"
      style={{
        flex: '1 1 min(100%, 320px)',
        maxWidth: '380px',
        background: isPro
          ? 'linear-gradient(135deg, rgba(58, 169, 190, 0.08) 0%, rgba(58, 169, 190, 0.02) 100%)'
          : 'rgba(255, 255, 255, 0.02)',
        border: '1px solid',
        borderColor: isCurrentTier
          ? 'rgba(73, 163, 108, 0.5)'
          : isPro
            ? 'rgba(58, 169, 190, 0.25)'
            : 'rgba(255, 255, 255, 0.06)',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Highlight badge */}
      {highlight && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            padding: '4px 10px',
            background: isCurrentTier ? 'rgba(73, 163, 108, 0.15)' : 'rgba(58, 169, 190, 0.15)',
            borderRadius: '100px',
            fontSize: '11px',
            fontWeight: 500,
            color: isCurrentTier ? '#49a36c' : '#3AA9BE',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            letterSpacing: '0.02em',
          }}
        >
          {isCurrentTier ? 'Current' : highlight}
        </div>
      )}

      {/* Tier name */}
      <h3
        style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#F7F8F9',
          marginBottom: '8px',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h3>

      {/* Price */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '4px',
          marginBottom: '6px',
        }}
      >
        <span
          style={{
            fontSize: '36px',
            fontWeight: 600,
            color: '#F7F8F9',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            letterSpacing: '-0.02em',
          }}
        >
          {price}
        </span>
        <span
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.4)',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          {pricePeriod}
        </span>
      </div>

      {/* Price note */}
      {priceNote && (
        <p
          style={{
            fontSize: '12px',
            color: 'rgba(58, 169, 190, 0.8)',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            marginBottom: '20px',
          }}
        >
          {priceNote}
        </p>
      )}

      {!priceNote && <div style={{ marginBottom: '20px' }} />}

      {/* Divider */}
      <div
        style={{
          height: '1px',
          background: 'rgba(255, 255, 255, 0.06)',
          marginBottom: '20px',
        }}
      />

      {/* Features list */}
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          marginBottom: '28px',
        }}
      >
        {features.map((feature) => (
          <li
            key={feature.text}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              marginBottom: '12px',
            }}
          >
            <span
              style={{
                flexShrink: 0,
                marginTop: '2px',
                fontSize: '13px',
                color: isPro ? '#3AA9BE' : 'rgba(73, 163, 108, 0.9)',
              }}
            >
              ✓
            </span>
            <div>
              <span
                style={{
                  display: 'block',
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  marginBottom: '1px',
                }}
              >
                {feature.text}
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.45)',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                {feature.description}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* CTA button */}
      <button
        onClick={() => !isCurrentTier && !loading && onCheckout(tier)}
        disabled={isCurrentTier || loading}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 20px',
          background: isCurrentTier
            ? 'rgba(73, 163, 108, 0.15)'
            : isPro
              ? 'linear-gradient(135deg, #3AA9BE 0%, #2D8A9C 100%)'
              : 'rgba(255, 255, 255, 0.08)',
          border: isCurrentTier
            ? '1px solid rgba(73, 163, 108, 0.3)'
            : isPro
              ? 'none'
              : '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 500,
          color: isCurrentTier ? '#49a36c' : isPro ? '#0A0B0C' : '#F7F8F9',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          cursor: isCurrentTier || loading ? 'default' : 'pointer',
          transition: 'all 0.2s ease',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Loading...' : ctaText}
      </button>
    </motion.div>
  )
}

export function PricingPageClient() {
  const searchParams = useSearchParams()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { tier: currentTier, checkout, loading: subLoading } = useSubscription()
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  // Check for cancelled checkout
  const checkoutStatus = searchParams.get('checkout')

  // Show cancelled message
  useEffect(() => {
    if (checkoutStatus === 'cancelled') {
      setCheckoutError('Checkout was cancelled. Feel free to try again when ready.')
    }
  }, [checkoutStatus])

  const handleCheckout = async (_tier: ValidTier) => {
    // Plan A Part 2 (May 2026): Stripe checkout for the new Studio/Indie/Pro
    // label tiers is parked until Plan B Week 1. Until then every CTA routes
    // to the founder mailto so we can talk to the label first.
    setCheckoutError(null)
    window.location.href = TALK_TO_US
  }
  // Touch the subscription checkout reference to keep the import live while
  // the Stripe flow is parked.
  void checkout

  const loading = authLoading || subLoading

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0F1113',
        color: '#F7F8F9',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <Link href="/">
          <Image
            src="/brand/svg/ta-logo-cyan.svg"
            alt="totalaud.io"
            width={40}
            height={40}
            style={{ opacity: 0.9 }}
          />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isAuthenticated ? (
            <Link
              href="/workspace"
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                color: '#3AA9BE',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Go to Workspace
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  textDecoration: 'none',
                }}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  color: '#0F1113',
                  backgroundColor: '#3AA9BE',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main content */}
      <main
        className="px-4 sm:px-6"
        style={{
          paddingTop: '60px',
          paddingBottom: '100px',
          maxWidth: '1000px',
          margin: '0 auto',
        }}
      >
        {/* Error/cancelled message */}
        {checkoutError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '12px 16px',
              marginBottom: '32px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#EF4444',
              textAlign: 'center',
            }}
          >
            {checkoutError}
          </motion.div>
        )}

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            textAlign: 'center',
            marginBottom: '48px',
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 600,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: '16px',
              color: '#F7F8F9',
            }}
          >
            Simple, honest pricing
          </h1>
          <p
            style={{
              fontSize: '16px',
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.5)',
              maxWidth: '480px',
              margin: '0 auto 32px',
            }}
          >
            No per-pitch fees. No credit systems.
            <br />
            Just one workspace for everything that matters.
          </p>

          {/* Billing toggle */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <button
              onClick={() => setBillingPeriod('monthly')}
              style={{
                padding: '12px 20px',
                minHeight: 44,
                borderRadius: '6px',
                border: 'none',
                background:
                  billingPeriod === 'monthly' ? 'rgba(58, 169, 190, 0.15)' : 'transparent',
                color: billingPeriod === 'monthly' ? '#3AA9BE' : 'rgba(255, 255, 255, 0.5)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              style={{
                padding: '12px 20px',
                minHeight: 44,
                borderRadius: '6px',
                border: 'none',
                background: billingPeriod === 'annual' ? 'rgba(58, 169, 190, 0.15)' : 'transparent',
                color: billingPeriod === 'annual' ? '#3AA9BE' : 'rgba(255, 255, 255, 0.5)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              Annual
              <span
                style={{
                  padding: '2px 6px',
                  background: 'rgba(58, 169, 190, 0.2)',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: '#3AA9BE',
                }}
              >
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing tiers */}
        <div
          className="gap-4 sm:gap-5"
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <PricingTier
            title="Studio"
            price={billingPeriod === 'annual' ? '£758' : '£79'}
            pricePeriod={billingPeriod === 'annual' ? '/year' : '/month'}
            priceNote={
              billingPeriod === 'annual'
                ? 'Effective £63.17/month — save 20%'
                : '14-day trial with card'
            }
            features={STUDIO_FEATURES}
            tier="starter"
            isCurrentTier={currentTier === 'starter'}
            onCheckout={handleCheckout}
            isAuthenticated={isAuthenticated}
            loading={loading}
          />
          <PricingTier
            title="Indie"
            price={billingPeriod === 'annual' ? '£1,910' : '£199'}
            pricePeriod={billingPeriod === 'annual' ? '/year' : '/month'}
            priceNote={
              billingPeriod === 'annual' ? 'Effective £159.17/month — save 20%' : undefined
            }
            features={INDIE_FEATURES}
            tier={billingPeriod === 'annual' ? 'pro_annual' : 'pro'}
            isPro
            highlight="Most Popular"
            isCurrentTier={currentTier === 'pro' || currentTier === 'pro_annual'}
            onCheckout={handleCheckout}
            isAuthenticated={isAuthenticated}
            loading={loading}
          />
          <PricingTier
            title="Pro"
            price={billingPeriod === 'annual' ? '£4,790' : '£499'}
            pricePeriod={billingPeriod === 'annual' ? '/year' : '/month'}
            priceNote={
              billingPeriod === 'annual' ? 'Effective £399.17/month — save 20%' : undefined
            }
            features={PRO_FEATURES}
            tier={billingPeriod === 'annual' ? 'power_annual' : 'power'}
            highlight="Multi-label"
            isCurrentTier={currentTier === 'power' || currentTier === 'power_annual'}
            onCheckout={handleCheckout}
            isAuthenticated={isAuthenticated}
            loading={loading}
          />
        </div>

        {/* Value comparison */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            textAlign: 'center',
            marginTop: '48px',
            padding: '24px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.04)',
          }}
        >
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: 1.7,
              marginBottom: '8px',
            }}
          >
            <strong style={{ color: '#F7F8F9' }}>Concierge onboarding · £750 one-off</strong>
          </p>
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.55)',
              lineHeight: 1.6,
            }}
          >
            Founder runs onboarding: imports your roster, sets up label templates, drafts your first
            three release briefs alongside you. Bolt-on for any tier.
          </p>
        </motion.div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            textAlign: 'center',
            marginTop: '32px',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.3)',
            lineHeight: 1.6,
          }}
        >
          14-day trial of Studio with card required. No free tier. Annual saves 20%.
        </motion.p>
      </main>
    </div>
  )
}
