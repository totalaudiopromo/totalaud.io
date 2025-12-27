/**
 * ScoutPreview Component
 *
 * Displays blurred preview opportunities for unauthenticated users.
 * Shows the value of Scout mode without revealing real contact details.
 * Includes a CTA overlay to encourage sign-up.
 */

'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { PREVIEW_OPPORTUNITIES } from '@/data/scout-preview'
import { useScoutStore } from '@/stores/useScoutStore'
import {
  TYPE_ICONS,
  TYPE_LABELS,
  TYPE_COLOURS,
  AUDIENCE_SIZE_LABELS,
  AUDIENCE_SIZE_COLOURS,
  type Opportunity,
} from '@/types/scout'

export function ScoutPreview() {
  // Get current type filter to show relevant previews
  const typeFilter = useScoutStore((state) => state.filters.type)

  // Filter preview opportunities by type (if filter is active)
  const filteredPreviews = useMemo(() => {
    if (!typeFilter) return PREVIEW_OPPORTUNITIES
    return PREVIEW_OPPORTUNITIES.filter((opp) => opp.type === typeFilter)
  }, [typeFilter])

  // If all filtered out, show all
  const displayOpportunities =
    filteredPreviews.length > 0 ? filteredPreviews : PREVIEW_OPPORTUNITIES

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {/* Blurred preview grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
          padding: 16,
          filter: 'blur(6px)',
          opacity: 0.5,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {displayOpportunities.map((opportunity, index) => (
          <PreviewCard key={opportunity.id} opportunity={opportunity} index={index} />
        ))}
      </div>

      {/* CTA Overlay */}
      <div
        data-testid="auth-prompt"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'radial-gradient(ellipse at center, rgba(15, 17, 19, 0.7) 0%, rgba(15, 17, 19, 0.95) 70%)',
          zIndex: 10,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: 32,
            maxWidth: 400,
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 64,
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(58, 169, 190, 0.1)',
              border: '1px solid rgba(58, 169, 190, 0.2)',
              borderRadius: 16,
              marginBottom: 20,
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3AA9BE"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          {/* Heading */}
          <h3
            style={{
              margin: 0,
              marginBottom: 8,
              fontSize: 20,
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.95)',
              fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
            }}
          >
            Unlock 50+ opportunities
          </h3>

          {/* Description */}
          <p
            style={{
              margin: 0,
              marginBottom: 24,
              fontSize: 14,
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.5)',
              fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
            }}
          >
            Radio stations, playlist curators, music blogs, and press contacts — all researched and
            ready to pitch.
          </p>

          {/* CTA Button */}
          <Link
            href="/signup"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 28px',
              fontSize: 15,
              fontWeight: 600,
              color: '#0F1113',
              backgroundColor: '#3AA9BE',
              borderRadius: 10,
              textDecoration: 'none',
              transition: 'all 0.12s ease',
              boxShadow: '0 0 30px rgba(58, 169, 190, 0.3)',
            }}
          >
            Sign up free
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path
                d="M6.5 3.5L11 8l-4.5 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          </Link>

          {/* Secondary link */}
          <p
            style={{
              margin: 0,
              marginTop: 16,
              fontSize: 13,
              color: 'rgba(255, 255, 255, 0.4)',
              fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
            }}
          >
            Already have an account?{' '}
            <Link
              href="/login"
              style={{
                color: '#3AA9BE',
                textDecoration: 'none',
              }}
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

/**
 * Preview card - simplified version of OpportunityCard
 * Shows structure without real interactivity
 */
function PreviewCard({ opportunity, index }: { opportunity: Opportunity; index: number }) {
  const typeColours = TYPE_COLOURS[opportunity.type]
  const audienceSizeColour = AUDIENCE_SIZE_COLOURS[opportunity.audienceSize]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: 10,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Type badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            fontSize: 12,
            fontWeight: 500,
            color: typeColours.text,
            backgroundColor: typeColours.bg,
            border: `1px solid ${typeColours.border}`,
            borderRadius: 6,
            fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
          }}
        >
          <span style={{ fontSize: 10 }}>{TYPE_ICONS[opportunity.type]}</span>
          {TYPE_LABELS[opportunity.type]}
        </span>

        {/* Audience size */}
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: audienceSizeColour,
            fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
          }}
        >
          {AUDIENCE_SIZE_LABELS[opportunity.audienceSize]}
        </span>
      </div>

      {/* Name */}
      <h4
        style={{
          margin: 0,
          fontSize: 15,
          fontWeight: 600,
          color: 'rgba(255, 255, 255, 0.9)',
          fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {opportunity.name}
      </h4>

      {/* Description */}
      <p
        style={{
          margin: 0,
          fontSize: 13,
          lineHeight: 1.5,
          color: 'rgba(255, 255, 255, 0.5)',
          fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {opportunity.description}
      </p>

      {/* Genre pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {opportunity.genres.slice(0, 3).map((genre) => (
          <span
            key={genre}
            style={{
              padding: '3px 8px',
              fontSize: 11,
              color: 'rgba(255, 255, 255, 0.5)',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderRadius: 4,
              fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)',
            }}
          >
            {genre}
          </span>
        ))}
      </div>
    </motion.div>
  )
}
