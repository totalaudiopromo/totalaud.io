'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { FlowCanvas } from './FlowCanvas'
import { AmbientSound } from '../../ui/ambient/AmbientSound'
import { deserializeFlowTemplate } from '@total-audio/core-agent-executor/client'
import type { FlowTemplate } from '@total-audio/core-agent-executor/client'

/**
 * FlowStudio - Premium cinematic workspace
 *
 * Design Principles:
 * - Slate Cyan (#3AA9BE) accent (brand colour)
 * - Matte Black (#0F1113) background
 * - Sharp 2px borders, minimal rounded corners
 * - Matches onboarding aesthetic quality
 * - No rainbow gradients, no cheap effects
 */
export function FlowStudio() {
  const searchParams = useSearchParams()
  const [theme, setTheme] = useState<string>('operator')
  const flowParam = searchParams.get('flow')
  const welcomeParam = searchParams.get('welcome')
  const prefersReducedMotion = useReducedMotion()

  // Get theme from localStorage (set during onboarding)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('selected_theme')
      if (savedTheme) {
        setTheme(savedTheme)
      }
    }
  }, [])

  // Deserialize flow template if provided
  let flowTemplate: FlowTemplate | null = null
  if (flowParam) {
    flowTemplate = deserializeFlowTemplate(flowParam)
  }

  return (
    <main
      className="min-h-screen text-white relative"
      style={{
        background: '#0F1113', // Matte Black
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Ambient background glow (subtle Slate Cyan radial) */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(58, 169, 190, 0.04) 0%, transparent 60%)',
          zIndex: 0,
        }}
      />

      {/* Theme ambient sound */}
      <AmbientSound type="theme-ambient" theme={theme} autoPlay />

      <div className="relative z-10 container mx-auto px-6 py-12 space-y-12">
        {/* Header - Clean and minimal */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <h1
            className="text-2xl font-normal tracking-wide lowercase"
            style={{
              color: '#3AA9BE', // Slate Cyan
              letterSpacing: '0.5px',
            }}
          >
            flow studio
          </h1>
          <p
            className="text-sm max-w-2xl lowercase"
            style={{
              color: 'rgba(255, 255, 255, 0.5)',
              letterSpacing: '0.3px',
            }}
          >
            orchestrate your creative agents — build workflows, watch them collaborate
          </p>
        </motion.div>

        {/* Welcome Message (if coming from Broker) */}
        {welcomeParam === 'true' && flowTemplate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="p-4"
            style={{
              background: 'rgba(58, 169, 190, 0.04)',
              border: '2px solid rgba(58, 169, 190, 0.2)',
            }}
          >
            <div
              className="font-medium lowercase mb-1 text-sm"
              style={{ color: '#3AA9BE', letterSpacing: '0.4px' }}
            >
              {flowTemplate.name}
            </div>
            <div className="text-xs lowercase" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              {flowTemplate.description}
            </div>
          </motion.div>
        )}

        {/* Flow Canvas - Premium container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="relative"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '2px solid rgba(58, 169, 190, 0.15)',
            minHeight: '600px',
          }}
        >
          {/* Canvas header */}
          <div
            className="px-6 py-3 border-b-2"
            style={{
              borderColor: 'rgba(58, 169, 190, 0.15)',
              background: 'rgba(255, 255, 255, 0.01)',
            }}
          >
            <span
              className="text-xs uppercase tracking-wider"
              style={{
                color: 'rgba(255, 255, 255, 0.4)',
                letterSpacing: '1px',
              }}
            >
              Workspace
            </span>
          </div>

          {/* Flow Canvas */}
          <div className="h-[600px]">
            <FlowCanvas initialTemplate={flowTemplate} />
          </div>
        </motion.div>

        {/* Status Footer - Minimal info bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex items-center justify-between px-6 py-4 text-xs"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '2px solid rgba(58, 169, 190, 0.1)',
            color: 'rgba(255, 255, 255, 0.4)',
            letterSpacing: '0.3px',
          }}
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5"
                style={{
                  background: '#3AA9BE',
                  boxShadow: '0 0 8px rgba(58, 169, 190, 0.4)',
                }}
              />
              <span className="lowercase">session active</span>
            </div>
            <div className="lowercase">theme: {theme}</div>
          </div>
          <div className="lowercase">
            {new Date().toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </motion.div>
      </div>
    </main>
  )
}
