/**
 * LearnTab Component
 *
 * Purpose: Surface insights and recommendations
 * Primary Actions:
 * - View AI-generated insights
 * - Browse successful pitch examples
 * - Analyze campaign patterns
 *
 * Phase 10.2: Cinematic Editorial Pass
 * Visual layer refinement with pane-theme tokens
 */

'use client'

import { useWorkspaceStore } from '@aud-web/stores/workspaceStore'
import { Lightbulb, TrendingUp, Target, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { extendedMotionTokens, framerEasing } from '@aud-web/tokens/motion'
import '@aud-web/styles/pane-theme.css'

export function LearnTab() {
  const { insights } = useWorkspaceStore()

  // Demo insights for initial experience
  const demoInsights =
    insights.length === 0
      ? [
          {
            id: 'demo-1',
            type: 'recommendation' as const,
            title: 'Best time to send pitches',
            description:
              'Your open rates are 2.3x higher when sending between 9-11am on Tuesday or Wednesday.',
            relevance_score: 0.95,
            created_at: new Date().toISOString(),
          },
          {
            id: 'demo-2',
            type: 'pattern' as const,
            title: 'Genre-specific curator preferences',
            description:
              'Radio DJs in your genre respond better to track history mentions than streaming numbers.',
            relevance_score: 0.87,
            created_at: new Date().toISOString(),
          },
        ]
      : insights

  return (
    <>
      {/* Ambient background glow */}
      <div className="pane-ambient-glow" />

      <motion.div
        className="pane-container"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: extendedMotionTokens.editorialFade,
          ease: framerEasing.fast,
        }}
      >
        <div className="pane-section">
          <h1 className="pane-heading-xl">Learn & improve.</h1>
          <p className="pane-body">AI-powered insights from your campaign data in flow.</p>
        </div>

        {/* Insights Feed */}
        <section className="pane-section">
          <h2 className="pane-heading-lg" style={{ marginBottom: '1.5rem' }}>
            Insights
          </h2>
          <div className="pane-space-y-md">
            {demoInsights.map((insight, index) => {
              const Icon =
                insight.type === 'recommendation'
                  ? Lightbulb
                  : insight.type === 'pattern'
                    ? TrendingUp
                    : Target

              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.24,
                    delay: index * 0.05,
                    ease: framerEasing.fast,
                  }}
                  className="pane-card"
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div
                      style={{
                        flexShrink: 0,
                        padding: '0.75rem',
                        background: 'rgba(58, 169, 190, 0.1)',
                        borderRadius: 0,
                      }}
                    >
                      <Icon className="pane-icon pane-icon-accent" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="pane-flex-between" style={{ marginBottom: '0.5rem' }}>
                        <h3 className="pane-heading-md">{insight.title}</h3>
                        <span
                          className={`pane-badge ${
                            insight.type === 'recommendation'
                              ? 'pane-badge-info'
                              : insight.type === 'pattern'
                                ? 'pane-badge-warning'
                                : 'pane-badge-success'
                          }`}
                        >
                          {insight.type}
                        </span>
                      </div>
                      <p className="pane-body" style={{ marginBottom: '0.75rem' }}>
                        {insight.description}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span className="pane-meta">
                          Relevance: {Math.round(insight.relevance_score * 100)}%
                        </span>
                        <span className="pane-meta">
                          {new Date(insight.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="pane-section">
          <h2 className="pane-heading-lg" style={{ marginBottom: '1.5rem' }}>
            Recommended Actions
          </h2>
          <div className="pane-grid-2">
            {[
              {
                icon: Sparkles,
                title: 'Optimize pitch timing',
                description: 'Adjust your sending schedule based on insights to improve open rates',
                action: 'Apply Recommendations',
              },
              {
                icon: Target,
                title: 'Refine targeting',
                description: 'Use pattern analysis to find more curators likely to respond',
                action: 'Explore Patterns',
              },
            ].map((action, index) => {
              const Icon = action.icon
              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.24,
                    delay: index * 0.05,
                    ease: framerEasing.fast,
                  }}
                  className="pane-card"
                  style={{ display: 'flex', flexDirection: 'column' }}
                >
                  <Icon
                    className="pane-icon pane-icon-lg pane-icon-accent"
                    style={{ marginBottom: '1rem' }}
                  />
                  <h3 className="pane-heading-md" style={{ marginBottom: '0.5rem' }}>
                    {action.title}
                  </h3>
                  <p className="pane-body" style={{ marginBottom: '1.5rem', flexGrow: 1 }}>
                    {action.description}
                  </p>
                  <button className="pane-button pane-button-primary" style={{ width: '100%' }}>
                    {action.action}
                  </button>
                </motion.div>
              )
            })}
          </div>
        </section>
      </motion.div>
    </>
  )
}
