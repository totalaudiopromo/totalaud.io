/**
 * Twitter Card Image Generator
 *
 * Generates a 1200x630 image for Twitter cards.
 * Uses the same design as OG image for consistency.
 */

import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'totalaud.io - Helping indie artists get heard'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0F1113',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle grid pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              linear-gradient(rgba(58, 169, 190, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(58, 169, 190, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Ambient glow behind logo */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(58, 169, 190, 0.12) 0%, transparent 70%)',
          }}
        />

        {/* Logo mark - stylised audio waveform */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '32px',
          }}
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 100 100"
            fill="none"
            style={{ opacity: 0.95 }}
          >
            {/* Abstract audio waveform logo */}
            <circle cx="50" cy="50" r="45" stroke="#3AA9BE" strokeWidth="2" fill="none" opacity="0.3" />
            <circle cx="50" cy="50" r="35" stroke="#3AA9BE" strokeWidth="2" fill="none" opacity="0.5" />
            <circle cx="50" cy="50" r="25" stroke="#3AA9BE" strokeWidth="2" fill="none" opacity="0.7" />
            {/* Centre dot */}
            <circle cx="50" cy="50" r="8" fill="#3AA9BE" />
            {/* Audio bars */}
            <rect x="20" y="40" width="4" height="20" rx="2" fill="#3AA9BE" opacity="0.8" />
            <rect x="30" y="30" width="4" height="40" rx="2" fill="#3AA9BE" opacity="0.9" />
            <rect x="66" y="35" width="4" height="30" rx="2" fill="#3AA9BE" opacity="0.9" />
            <rect x="76" y="42" width="4" height="16" rx="2" fill="#3AA9BE" opacity="0.8" />
          </svg>
        </div>

        {/* Brand name */}
        <div
          style={{
            display: 'flex',
            fontSize: '72px',
            fontWeight: 600,
            color: '#F7F8F9',
            letterSpacing: '-0.03em',
            marginBottom: '16px',
          }}
        >
          totalaud.io
        </div>

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            fontSize: '28px',
            fontWeight: 400,
            color: 'rgba(247, 248, 249, 0.6)',
            letterSpacing: '0.02em',
            marginBottom: '48px',
          }}
        >
          Helping indie artists get heard
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
          }}
        >
          {['Scout', 'Ideas', 'Timeline', 'Pitch'].map((feature) => (
            <div
              key={feature}
              style={{
                display: 'flex',
                padding: '12px 24px',
                backgroundColor: 'rgba(58, 169, 190, 0.1)',
                border: '1px solid rgba(58, 169, 190, 0.3)',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 500,
                color: '#3AA9BE',
              }}
            >
              {feature}
            </div>
          ))}
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #3AA9BE, transparent)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
