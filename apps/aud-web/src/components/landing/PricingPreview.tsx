/**
 * PricingPreview Component
 * totalaud.io — May 2026 label pivot
 *
 * Pricing: Studio (£79/£758yr), Indie (£199/£1,910yr), Pro (£499/£4,790yr)
 * + Concierge onboarding (£750 one-off). 20% annual discount.
 * All CTAs route to mailto until Stripe is wired in Plan B.
 */

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

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

interface PricingTierProps {
  title: string
  price: string
  pricePeriod: string
  priceNote?: string
  features: Array<{ text: string; description: string }>
  ctaText: string
  ctaHref: string
  isPro?: boolean
  highlight?: string
  isAnnual?: boolean
}

function PricingTier({
  title,
  price,
  pricePeriod,
  priceNote,
  features,
  ctaText,
  ctaHref,
  isPro = false,
  highlight,
}: PricingTierProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="px-5 py-7 sm:p-8"
      style={{
        flex: '1 1 min(100%, 320px)',
        maxWidth: '380px',
        background: isPro
          ? 'linear-gradient(135deg, rgba(58, 169, 190, 0.08) 0%, rgba(58, 169, 190, 0.02) 100%)'
          : 'rgba(255, 255, 255, 0.02)',
        border: '1px solid',
        borderColor: isPro ? 'rgba(58, 169, 190, 0.25)' : 'rgba(255, 255, 255, 0.06)',
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
            background: 'rgba(58, 169, 190, 0.15)',
            borderRadius: '100px',
            fontSize: '11px',
            fontWeight: 500,
            color: '#3AA9BE',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            letterSpacing: '0.02em',
          }}
        >
          {highlight}
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

      {/* Price note (e.g., "Effective £12.40/mo") */}
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
      <Link
        href={ctaHref}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 20px',
          background: isPro
            ? 'linear-gradient(135deg, #3AA9BE 0%, #2D8A9C 100%)'
            : 'rgba(255, 255, 255, 0.08)',
          border: isPro ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 500,
          color: isPro ? '#0A0B0C' : '#F7F8F9',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          textDecoration: 'none',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (isPro) {
            e.currentTarget.style.opacity = '0.9'
          } else {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
          }
        }}
        onMouseLeave={(e) => {
          if (isPro) {
            e.currentTarget.style.opacity = '1'
          } else {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        {ctaText}
      </Link>
    </motion.div>
  )
}

export function PricingPreview() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly')

  return (
    <section
      id="pricing"
      className="px-4 sm:px-6"
      style={{
        paddingTop: '100px',
        paddingBottom: '100px',
        maxWidth: '1000px',
        margin: '0 auto',
      }}
    >
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          textAlign: 'center',
          marginBottom: '48px',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 600,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '16px',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            color: '#F7F8F9',
          }}
        >
          Pricing for small labels
        </h2>
        <p
          style={{
            fontSize: '16px',
            lineHeight: 1.6,
            color: 'rgba(255, 255, 255, 0.5)',
            maxWidth: '480px',
            margin: '0 auto 32px',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          14-day trial of Studio with card required. No free tier.
          <br />
          One workspace for the whole release.
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
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: billingPeriod === 'monthly' ? 'rgba(58, 169, 190, 0.15)' : 'transparent',
              color: billingPeriod === 'monthly' ? '#3AA9BE' : 'rgba(255, 255, 255, 0.5)',
              fontSize: '13px',
              fontWeight: 500,
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('annual')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: billingPeriod === 'annual' ? 'rgba(58, 169, 190, 0.15)' : 'transparent',
              color: billingPeriod === 'annual' ? '#3AA9BE' : 'rgba(255, 255, 255, 0.5)',
              fontSize: '13px',
              fontWeight: 500,
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
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
          ctaText="Talk to us"
          ctaHref={TALK_TO_US}
        />
        <PricingTier
          title="Indie"
          price={billingPeriod === 'annual' ? '£1,910' : '£199'}
          pricePeriod={billingPeriod === 'annual' ? '/year' : '/month'}
          priceNote={billingPeriod === 'annual' ? 'Effective £159.17/month — save 20%' : undefined}
          features={INDIE_FEATURES}
          ctaText="Talk to us"
          ctaHref={TALK_TO_US}
          isPro
          highlight="Most Popular"
        />
        <PricingTier
          title="Pro"
          price={billingPeriod === 'annual' ? '£4,790' : '£499'}
          pricePeriod={billingPeriod === 'annual' ? '/year' : '/month'}
          priceNote={billingPeriod === 'annual' ? 'Effective £399.17/month — save 20%' : undefined}
          features={PRO_FEATURES}
          ctaText="Talk to us"
          ctaHref={TALK_TO_US}
          highlight="Multi-label"
        />
      </div>

      {/* Concierge add-on */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          textAlign: 'center',
          marginTop: '48px',
          padding: '28px 24px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        <p
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.6)',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
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
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            lineHeight: 1.6,
            marginBottom: '12px',
          }}
        >
          Founder runs onboarding: imports your roster, sets up label templates, drafts your first
          three release briefs alongside you. Bolt-on for any tier.
        </p>
        <Link
          href={TALK_TO_US}
          style={{
            display: 'inline-block',
            fontSize: '13px',
            color: '#3AA9BE',
            textDecoration: 'none',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          Talk to us →
        </Link>
      </motion.div>

      {/* Bottom note */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{
          textAlign: 'center',
          marginTop: '32px',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.3)',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          lineHeight: 1.6,
        }}
      >
        14-day trial of Studio with card required. No free tier. Annual saves 20%.
      </motion.p>
    </section>
  )
}
