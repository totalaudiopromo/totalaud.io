/**
 * Read-Only Share Page
 * Phase 14.7: Public scene viewing
 *
 * /share/[sceneId] - displays shared canvas scenes
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  flowCoreColours,
  flowCoreMotion,
  flowCoreTypography,
} from '@aud-web/constants/flowCoreColours'
import { ArrowRight } from 'lucide-react'

interface SceneData {
  scene_state: {
    nodes: any[]
    edges: any[]
    viewport: { x: number; y: number; zoom: number }
  }
  title: string
  artist?: string
  goal?: string
  created_at: string
}

export default function SharePage() {
  const params = useParams()
  const router = useRouter()
  const sceneId = params.sceneId as string

  const [sceneData, setSceneData] = useState<SceneData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchScene() {
      try {
        const response = await fetch(`/api/canvas/public?shareId=${sceneId}`)

        if (!response.ok) {
          throw new Error('scene not found')
        }

        const data = await response.json()
        setSceneData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'failed to load scene')
      } finally {
        setLoading(false)
      }
    }

    fetchScene()
  }, [sceneId])

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: flowCoreColours.matteBlack,
          color: flowCoreColours.textPrimary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            fontSize: flowCoreTypography.fontSize.sm,
            color: flowCoreColours.slateCyan,
            textTransform: 'lowercase',
          }}
        >
          loading signal...
        </motion.div>
      </div>
    )
  }

  if (error || !sceneData) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: flowCoreColours.matteBlack,
          color: flowCoreColours.textPrimary,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: flowCoreMotion.normal / 1000 }}
          style={{
            textAlign: 'center',
            maxWidth: '400px',
          }}
        >
          <div
            style={{
              fontSize: flowCoreTypography.fontSize.xl,
              color: flowCoreColours.error,
              marginBottom: '16px',
              textTransform: 'lowercase',
            }}
          >
            signal not found
          </div>
          <div
            style={{
              fontSize: flowCoreTypography.fontSize.sm,
              color: flowCoreColours.textSecondary,
              marginBottom: '32px',
            }}
          >
            {error || 'this shared signal does not exist or is no longer public'}
          </div>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: flowCoreColours.slateCyan,
              color: flowCoreColours.matteBlack,
              borderRadius: '6px',
              fontSize: flowCoreTypography.fontSize.sm,
              fontWeight: 600,
              textTransform: 'lowercase',
              textDecoration: 'none',
              transition: `all ${flowCoreMotion.fast}ms ease`,
            }}
          >
            back to totalaud.io
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: flowCoreColours.matteBlack,
        color: flowCoreColours.textPrimary,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-geist-sans)',
      }}
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: flowCoreMotion.normal / 1000 }}
        style={{
          padding: '24px',
          borderBottom: `1px solid ${flowCoreColours.borderGrey}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: flowCoreTypography.fontSize.xl,
              fontWeight: 600,
              margin: 0,
              marginBottom: '4px',
            }}
          >
            {sceneData.title}
          </h1>
          <div
            style={{
              fontSize: flowCoreTypography.fontSize.sm,
              color: flowCoreColours.textSecondary,
              fontFamily: 'var(--font-mono)',
              textTransform: 'lowercase',
            }}
          >
            {sceneData.artist && `by ${sceneData.artist} • `}
            {sceneData.goal && `${sceneData.goal} • `}
            shared {new Date(sceneData.created_at).toLocaleDateString()}
          </div>
        </div>

        <Link
          href="/console"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: flowCoreColours.slateCyan,
            color: flowCoreColours.matteBlack,
            borderRadius: '6px',
            fontSize: flowCoreTypography.fontSize.sm,
            fontWeight: 600,
            textTransform: 'lowercase',
            textDecoration: 'none',
            transition: `all ${flowCoreMotion.fast}ms ease`,
          }}
        >
          open in console
          <ArrowRight size={16} />
        </Link>
      </motion.header>

      {/* Canvas Area (Placeholder) */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: flowCoreMotion.slow / 1000, delay: 0.1 }}
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
        }}
      >
        {/* TODO: Integrate FlowCanvas in read-only mode */}
        <div
          style={{
            textAlign: 'center',
            padding: '64px 32px',
            border: `2px dashed ${flowCoreColours.borderGrey}`,
            borderRadius: '12px',
            maxWidth: '600px',
          }}
        >
          <div
            style={{
              fontSize: flowCoreTypography.fontSize.lg,
              color: flowCoreColours.textSecondary,
              marginBottom: '16px',
              fontFamily: 'var(--font-mono)',
              textTransform: 'lowercase',
            }}
          >
            canvas preview
          </div>
          <div
            style={{
              fontSize: flowCoreTypography.fontSize.sm,
              color: flowCoreColours.textTertiary,
            }}
          >
            {sceneData.scene_state.nodes.length} nodes • {sceneData.scene_state.edges.length} edges
          </div>
          <div
            style={{
              fontSize: flowCoreTypography.fontSize.xs,
              color: flowCoreColours.textTertiary,
              marginTop: '24px',
            }}
          >
            FlowCanvas integration pending
          </div>
        </div>

        {/* Watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            right: '24px',
            fontSize: flowCoreTypography.fontSize.xs,
            color: flowCoreColours.textTertiary,
            fontFamily: 'var(--font-mono)',
            textTransform: 'lowercase',
            opacity: 0.6,
          }}
        >
          shared view — totalaud.io
        </div>
      </motion.main>
    </div>
  )
}
