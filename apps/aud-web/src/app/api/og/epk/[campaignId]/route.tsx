/**
 * OG Image Route for EPK
 * Phase 18: Consistency pass
 *
 * PUBLIC ROUTE - No authentication required
 *
 * Purpose:
 * - Generate Open Graph images for EPK social sharing
 * - 1200×630 PNG format
 * - FlowCore branding
 *
 * Route: /api/og/epk/[campaignId]
 *
 * Note: Runs on Edge runtime, uses console.error for logging (not logger)
 * Note: Uses service role via getEpkCampaign() for public EPK data
 */

import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { getEpkCampaign } from '@/lib/epk/getEpkCampaign'

export const runtime = 'edge'

const flowCoreColours = {
  matteBlack: '#0F1113',
  darkGrey: '#1A1D1F',
  iceCyan: '#89DFF3',
  slateCyan: '#3AA9BE',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  borderGrey: '#2A2D2F',
}

export async function GET(req: NextRequest, context: { params: Promise<{ campaignId: string }> }) {
  const params = await context.params
  const { campaignId } = params

  try {
    const campaign = await getEpkCampaign(campaignId)

    const campaignName = campaign?.name ?? 'Electronic Press Kit'
    const artistName = campaign?.artistName ?? 'Independent Artist'
    const tagline =
      campaign?.tagline ??
      campaign?.description ??
      'Share your latest campaign assets with the industry.'
    const genre = campaign?.genre ?? 'music promotion'

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
            backgroundColor: flowCoreColours.matteBlack,
            backgroundImage: `linear-gradient(45deg, ${flowCoreColours.matteBlack} 0%, ${flowCoreColours.darkGrey} 100%)`,
            fontFamily: 'monospace',
            position: 'relative',
          }}
        >
          {/* Background Grid Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                linear-gradient(${flowCoreColours.borderGrey} 1px, transparent 1px),
                linear-gradient(90deg, ${flowCoreColours.borderGrey} 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              opacity: 0.3,
            }}
          />

          {/* Content Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px',
              textAlign: 'center',
              zIndex: 1,
            }}
          >
            {/* Campaign Name */}
            <div
              style={{
                fontSize: '72px',
                fontWeight: 700,
                color: flowCoreColours.iceCyan,
                marginBottom: '16px',
                letterSpacing: '-0.02em',
                textShadow: `0 0 40px ${flowCoreColours.iceCyan}40`,
              }}
            >
              {campaignName}
            </div>

            {/* Artist Name */}
            <div
              style={{
                fontSize: '36px',
                fontWeight: 500,
                color: flowCoreColours.textSecondary,
                marginBottom: '24px',
              }}
            >
              {artistName}
            </div>

            {/* Tagline */}
            <div
              style={{
                fontSize: '24px',
                color: flowCoreColours.textSecondary,
                marginBottom: '32px',
                fontStyle: 'italic',
                maxWidth: '800px',
              }}
            >
              {tagline}
            </div>

            {/* Genre Badge */}
            <div
              style={{
                display: 'inline-flex',
                padding: '12px 24px',
                backgroundColor: `${flowCoreColours.slateCyan}20`,
                border: `2px solid ${flowCoreColours.slateCyan}`,
                borderRadius: '8px',
                fontSize: '20px',
                color: flowCoreColours.slateCyan,
                fontWeight: 600,
                textTransform: 'lowercase',
                letterSpacing: '0.05em',
              }}
            >
              {genre}
            </div>
          </div>

          {/* Footer Brand */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              right: 40,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '18px',
              color: flowCoreColours.textSecondary,
            }}
          >
            <span
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: flowCoreColours.slateCyan,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: flowCoreColours.matteBlack,
              }}
            >
              TA
            </span>
            <span>totalaud.io/epk</span>
          </div>

          {/* Campaign ID Badge */}
          <div
            style={{
              position: 'absolute',
              top: 40,
              left: 40,
              padding: '8px 16px',
              backgroundColor: `${flowCoreColours.darkGrey}CC`,
              border: `1px solid ${flowCoreColours.borderGrey}`,
              borderRadius: '6px',
              fontSize: '14px',
              color: flowCoreColours.textSecondary,
              fontFamily: 'monospace',
            }}
          >
            {campaignId}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('OG Image generation failed:', error)

    // Return fallback image on error
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: flowCoreColours.matteBlack,
            color: flowCoreColours.textPrimary,
            fontSize: '40px',
            fontFamily: 'monospace',
          }}
        >
          totalaud.io — electronic press kit
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  }
}
