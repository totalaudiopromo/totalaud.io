/**
 * OG Image Generation - Landing Page
 *
 * Generates a clean social card image from the hero section
 * Using Slate Cyan accent (#3AA9BE) + tagline
 *
 * Vercel OG Image API: https://vercel.com/docs/functions/og-image-generation
 */

import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0F1113',
            position: 'relative',
          }}
        >
          {/* Subtle pulse background (simulated with opacity) */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '800px',
              height: '800px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(58, 169, 190, 0.08) 0%, transparent 70%)',
              filter: 'blur(120px)',
            }}
          />

          {/* Main content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Logo/Brand */}
            <h1
              style={{
                color: '#3AA9BE',
                fontSize: '96px',
                fontWeight: 300,
                letterSpacing: '-0.02em',
                margin: 0,
                marginBottom: '24px',
              }}
            >
              totalaud.io
            </h1>

            {/* Tagline */}
            <p
              style={{
                color: '#E5E7EB',
                fontSize: '36px',
                fontWeight: 300,
                letterSpacing: '0.02em',
                margin: 0,
              }}
            >
              Creative control for artists.
            </p>

            {/* Micro badge */}
            <p
              style={{
                color: '#6B7280',
                fontSize: '14px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginTop: '48px',
                fontFamily: 'monospace',
              }}
            >
              built by the team behind total audio promo
            </p>
          </div>

          {/* Subtle border accent (bottom right corner) */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '200px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent 0%, #3AA9BE 100%)',
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Failed to generate OG image:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}
