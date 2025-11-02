/**
 * Open Graph Preview Card Generator
 * Phase 14.7: Dynamic OG images for shared scenes
 *
 * GET /api/og/scene/[sceneId]
 * Returns 1200×630 PNG preview card
 */

import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: { sceneId: string } }
) {
  try {
    const { sceneId } = params
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://totalaud.io'

    // Fetch scene data
    const response = await fetch(`${baseUrl}/api/canvas/public?shareId=${sceneId}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Scene not found')
    }

    const data = await response.json()
    const title = data.title || 'untitled signal'
    const artist = data.artist || ''
    const goal = data.goal || ''
    const createdAt = data.created_at
      ? new Date(data.created_at).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : ''

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0F1113', // Matte Black
            color: '#FFFFFF',
            fontFamily: 'monospace',
            padding: '64px',
            position: 'relative',
          }}
        >
          {/* Cyan grid overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.08,
              backgroundImage:
                'linear-gradient(#3AA9BE 1px, transparent 1px), linear-gradient(90deg, #3AA9BE 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          {/* Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Top section */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {/* Tagline */}
              <div
                style={{
                  fontSize: '24px',
                  color: '#3AA9BE', // Slate Cyan
                  textTransform: 'lowercase',
                  letterSpacing: '0.5px',
                }}
              >
                shared signal from totalaud.io
              </div>

              {/* Title */}
              <div
                style={{
                  fontSize: '72px',
                  fontWeight: 700,
                  lineHeight: 1.1,
                  maxWidth: '900px',
                  wordWrap: 'break-word',
                }}
              >
                {title}
              </div>

              {/* Metadata */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '28px',
                  color: '#B0BEC5', // Text Secondary
                  textTransform: 'lowercase',
                }}
              >
                {artist && <div>by {artist}</div>}
                {goal && <div>goal: {goal}</div>}
                {createdAt && <div>shared {createdAt}</div>}
              </div>
            </div>

            {/* Bottom section - Accent line */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '32px',
                borderTop: '2px solid #3AA9BE',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  color: '#78909C', // Text Tertiary
                  textTransform: 'lowercase',
                }}
              >
                totalaud.io/share/{sceneId.slice(0, 8)}...
              </div>
              <div
                style={{
                  fontSize: '24px',
                  color: '#89DFF3', // Ice Cyan
                  textTransform: 'lowercase',
                }}
              >
                view signal →
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('[OG Image] Error:', error)

    // Fallback image
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
            color: '#3AA9BE',
            fontFamily: 'monospace',
            fontSize: '48px',
            textTransform: 'lowercase',
          }}
        >
          totalaud.io
          <div style={{ fontSize: '24px', color: '#B0BEC5', marginTop: '16px' }}>
            shared signal
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  }
}
