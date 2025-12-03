/**
 * PricingPreview Component
 *
 * Phase 6.2: Landing Page Polish
 *
 * A calm, editorial pricing block showing Free vs Pro tiers.
 * Design: Non-salesy, transparent, honest.
 */

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const FREE_FEATURES = [
  { text: 'Ideas Mode', description: 'Capture and organise creative concepts' },
  { text: 'Timeline Mode', description: 'Plan releases across five lanes' },
  { text: 'Scout Mode', description: 'Browse opportunities database' },
  { text: 'Pitch Coach', description: 'Craft your artist narrative' },
  { text: 'Local workspace', description: 'Your data, stored locally' },
]

const PRO_FEATURES = [
  { text: 'Everything in Free', description: 'All core features included' },
  { text: 'Validate contacts', description: 'TAP Intel enrichment' },
  { text: 'Generate pitches', description: 'AI-powered pitch writing' },
  { text: 'Log to Tracker', description: 'Sync with TAP campaigns' },
  { text: 'Unlimited Scout', description: 'No daily search limits' },
]

interface PricingTierProps {
  title: string
  price?: string
  priceNote?: string
  features: Array<{ text: string; description: string }>
  ctaText: string
  ctaHref: string
  isPro?: boolean
  isComingSoon?: boolean
}

function PricingTier({
  title,
  price,
  priceNote,
  features,
  ctaText,
  ctaHref,
  isPro = false,
  isComingSoon = false,
}: PricingTierProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        flex: '1 1 340px',
        maxWidth: '400px',
        padding: '32px',
        background: isPro
          ? 'linear-gradient(135deg, rgba(58, 169, 190, 0.08) 0%, rgba(58, 169, 190, 0.02) 100%)'
          : 'rgba(255, 255, 255, 0.02)',
        border: '1px solid',
        borderColor: isPro ? 'rgba(58, 169, 190, 0.2)' : 'rgba(255, 255, 255, 0.06)',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Coming soon badge for Pro */}
      {isComingSoon && (
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
          Coming soon
        </div>
      )}

      {/* Tier name */}
      <h3
        style={{
          fontSize: '20px',
          fontWeight: 600,
          color: '#F7F8F9',
          marginBottom: '8px',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          letterSpacing: '-0.02em',
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
          marginBottom: '24px',
        }}
      >
        {price ? (
          <>
            <span
              style={{
                fontSize: '32px',
                fontWeight: 600,
                color: '#F7F8F9',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                letterSpacing: '-0.02em',
              }}
            >
              {price}
            </span>
            {priceNote && (
              <span
                style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                }}
              >
                {priceNote}
              </span>
            )}
          </>
        ) : (
          <span
            style={{
              fontSize: '32px',
              fontWeight: 600,
              color: '#F7F8F9',
              fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
              letterSpacing: '-0.02em',
            }}
          >
            Free
          </span>
        )}
      </div>

      {/* Divider */}
      <div
        style={{
          height: '1px',
          background: 'rgba(255, 255, 255, 0.06)',
          marginBottom: '24px',
        }}
      />

      {/* Features list */}
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          marginBottom: '32px',
        }}
      >
        {features.map((feature, index) => (
          <li
            key={index}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              marginBottom: '14px',
            }}
          >
            <span
              style={{
                flexShrink: 0,
                marginTop: '2px',
                fontSize: '14px',
                color: isPro ? '#3AA9BE' : 'rgba(73, 163, 108, 0.9)',
              }}
            >
              ✓
            </span>
            <span
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                lineHeight: 1.5,
              }}
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA button */}
      {isComingSoon ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '14px 24px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.4)',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            cursor: 'not-allowed',
          }}
        >
          {ctaText}
        </div>
      ) : (
        <Link
          href={ctaHref}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '14px 24px',
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
            if (!isPro) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isPro) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          {ctaText}
        </Link>
      )}
    </motion.div>
  )
}

export function PricingPreview() {
  return (
    <section
      style={{
        padding: '100px 24px 120px',
        maxWidth: '900px',
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
          marginBottom: '56px',
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
          Simple, fair pricing
        </h2>
        <p
          style={{
            fontSize: '16px',
            lineHeight: 1.6,
            color: 'rgba(255, 255, 255, 0.5)',
            maxWidth: '420px',
            margin: '0 auto',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          Start free. Upgrade when you need TAP integration.
        </p>
      </motion.div>

      {/* Pricing tiers */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <PricingTier title="Free" features={FREE_FEATURES} ctaText="Start free" ctaHref="/signup" />
        <PricingTier
          title="Pro"
          price="£39"
          priceNote="/month (or £299/year)"
          features={PRO_FEATURES}
          ctaText="Coming soon"
          ctaHref="/signup"
          isPro
          isComingSoon
        />
      </div>

      {/* Bottom note */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          textAlign: 'center',
          marginTop: '40px',
          fontSize: '13px',
          color: 'rgba(255, 255, 255, 0.35)',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
      >
        No credit card required · Cancel anytime
      </motion.p>
    </section>
  )
}
