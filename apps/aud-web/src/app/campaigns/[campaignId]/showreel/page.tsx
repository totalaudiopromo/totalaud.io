/**
 * Campaign Showreel Page
 * Phase 17: Campaign Performance Playback
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CampaignShowreelCanvas } from '@aud-web/components/showreel'
import { buildShowreelScript, type ShowreelContext, type ShowreelScript } from '@totalaud/showreel'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'

export default function CampaignShowreelPage() {
  const params = useParams()
  const campaignId = params?.campaignId as string

  const [script, setScript] = useState<ShowreelScript | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!campaignId) return

    // Fetch showreel context and build script
    async function fetchAndBuildScript() {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch context from API
        const response = await fetch(`/api/showreel/context?campaignId=${campaignId}`)

        if (!response.ok) {
          throw new Error('Failed to fetch campaign data')
        }

        const context: ShowreelContext = await response.json()

        // Build script from context
        const generatedScript = buildShowreelScript(context)

        setScript(generatedScript)
      } catch (err) {
        console.error('Failed to build showreel:', err)
        setError(err instanceof Error ? err.message : 'Failed to load showreel')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAndBuildScript()
  }, [campaignId])

  // Loading state
  if (isLoading) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: flowCoreColours.matteBlack,
          color: flowCoreColours.textPrimary,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 600,
              marginBottom: '16px',
              color: flowCoreColours.slateCyan,
            }}
          >
            Loading Campaign Showreel...
          </div>
          <div
            style={{
              fontSize: '14px',
              color: flowCoreColours.textSecondary,
            }}
          >
            Preparing your campaign performance
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !script) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: flowCoreColours.matteBlack,
          color: flowCoreColours.textPrimary,
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 600,
              marginBottom: '16px',
              color: '#ff4444',
            }}
          >
            Failed to Load Showreel
          </div>
          <div
            style={{
              fontSize: '14px',
              color: flowCoreColours.textSecondary,
              marginBottom: '24px',
            }}
          >
            {error || 'Unable to generate campaign showreel'}
          </div>
          <button
            onClick={() => (window.location.href = `/campaigns/${campaignId}`)}
            style={{
              padding: '12px 24px',
              backgroundColor: flowCoreColours.slateCyan,
              color: flowCoreColours.matteBlack,
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Return to Campaign
          </button>
        </div>
      </div>
    )
  }

  // Render showreel
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <CampaignShowreelCanvas script={script} />
    </div>
  )
}
