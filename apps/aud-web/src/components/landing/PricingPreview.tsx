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

const ARTIST_FEATURES = [
  { text: 'Full Workspace Access', description: 'Ideas, Timeline, Pitch, Scout' },
  { text: '100 AI Coach Prompts', description: 'Per month via Claude' },
  { text: 'Scout Opportunity Database', description: 'Playlists, blogs, radio, press' },
  { text: 'Release Planner', description: 'Visual timeline with 5 lanes' },
  { text: 'Export Pitches', description: 'Markdown & text export' },
]

const PRO_FEATURES = [
  { text: 'Everything in Artist', description: 'All core features included' },
  { text: 'Unlimited AI Coach', description: 'No monthly limits' },
  { text: 'Priority Opportunities', description: 'Get alerts for new matches' },
  { text: 'Advanced Analytics', description: 'Track pitch performance' },
  { text: 'Multi-Project Support', description: 'Manage multiple artist profiles' },
]

interface PricingTierProps {
  title: string
  price: string
  priceNote: string
  features: Array<{ text: string; description: string }>
  ctaText: string
  ctaHref: string
  isPro?: boolean
  highlight?: string
}

function PricingTier({
  title,
  price,
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
        flex: '1 1 min(100%, 340px)',
        maxWidth: '400px',
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
        <span
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.4)',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          {priceNote}
        </span>
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
            <div>
              <span
                style={{
                  display: 'block',
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                  marginBottom: '2px',
                }}
              >
                {feature.text}
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.5)',
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
    </motion.div>
  )
}

export function PricingPreview() {
  return (
    <section
      className="px-4 sm:px-6"
      style={{
        paddingTop: '80px',
        paddingBottom: '100px',
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
            maxWidth: '500px',
            margin: '0 auto',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
          }}
        >
          No hidden submission fees. No credit cost per curator.
          <br />
          Just professional tools for independent growth.
        </p>
      </motion.div>

      {/* Pricing tiers */}
      <div
        className="gap-4 sm:gap-6"
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <PricingTier
          title="Artist"
          price="£19"
          priceNote="/month"
          features={ARTIST_FEATURES}
          ctaText="Start 14-Day Free Trial"
          ctaHref="/signup"
        />
        <PricingTier
          title="Pro"
          price="£39"
          priceNote="/month"
          features={PRO_FEATURES}
          ctaText="Start 14-Day Free Trial"
          ctaHref="/signup"
          isPro
          highlight="Most Popular"
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
          lineHeight: 1.6,
        }}
      >
        <strong>100% Money-Back Guarantee.</strong> If you don't love it in the first 30 days, we'll
        refund you.
        <br />
        No questions asked. Cancel anytime.
      </motion.p>
    </section>
  )
}
