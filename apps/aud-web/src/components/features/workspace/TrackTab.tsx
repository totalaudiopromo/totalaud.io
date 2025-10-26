/**
 * TrackTab Component
 *
 * Purpose: Monitor campaign results
 * Primary Actions:
 * - View campaign metrics (open rate, reply rate, playlist adds)
 * - Browse found curators
 * - Analyze outreach performance
 *
 * Phase 10.2: Cinematic Editorial Pass
 * Visual layer refinement with pane-theme tokens
 */

'use client'

import { useWorkspaceStore } from '@aud-web/stores/workspaceStore'
import { BarChart3, Users, Mail, TrendingUp, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import { extendedMotionTokens, framerEasing } from '@aud-web/tokens/motion'
import '@aud-web/styles/pane-theme.css'

export function TrackTab() {
  const { getActiveCampaign, getTargetsForCampaign, getMetrics } = useWorkspaceStore()

  const activeCampaign = getActiveCampaign()
  const targets = activeCampaign ? getTargetsForCampaign(activeCampaign.id) : []
  const metrics = activeCampaign ? getMetrics(activeCampaign.id) : null

  if (!activeCampaign) {
    return (
      <>
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
          <div className="pane-empty-state">
            <BarChart3 className="pane-empty-state-icon" />
            <h3 className="pane-empty-state-title">No active campaign</h3>
            <p className="pane-empty-state-description">
              Select a campaign from the Plan tab to view its metrics
            </p>
            <p className="pane-empty-state-tagline">data reveals patterns.</p>
          </div>
        </motion.div>
      </>
    )
  }

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
          <h1 className="pane-heading-xl">Track performance.</h1>
          <p className="pane-body">Campaign: {activeCampaign.name}</p>
        </div>

        {/* Metrics Overview */}
        <section className="pane-section">
          <h2 className="pane-heading-lg" style={{ marginBottom: '1.5rem' }}>
            Metrics
          </h2>
          <div className="pane-grid-4">
            {[
              {
                icon: Users,
                label: 'Curators Found',
                value: metrics?.curators_found || 0,
              },
              {
                icon: Mail,
                label: 'Pitches Sent',
                value: metrics?.pitches_sent || 0,
              },
              {
                icon: TrendingUp,
                label: 'Emails Opened',
                value: metrics?.emails_opened || 0,
              },
              {
                icon: BarChart3,
                label: 'Replies Received',
                value: metrics?.replies_received || 0,
              },
            ].map((metric, index) => {
              const Icon = metric.icon
              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.24,
                    delay: index * 0.05,
                    ease: framerEasing.fast,
                  }}
                  className="pane-metric-card"
                >
                  <Icon className="pane-icon pane-icon-lg pane-icon-accent" />
                  <p className="pane-metric-label">{metric.label}</p>
                  <p className="pane-metric-value">{metric.value}</p>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* Targets List */}
        <section className="pane-section">
          <h2 className="pane-heading-lg" style={{ marginBottom: '1.5rem' }}>
            Found Targets ({targets.length})
          </h2>
          {targets.length === 0 ? (
            <motion.div
              className="pane-empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: extendedMotionTokens.editorialFade }}
            >
              <Target className="pane-empty-state-icon" />
              <h3 className="pane-empty-state-title">No targets found yet</h3>
              <p className="pane-empty-state-description">
                Run the "Find Curators" workflow from the Do tab
              </p>
              <p className="pane-empty-state-tagline">discovery takes action.</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="pane-card"
              style={{ overflow: 'hidden' }}
            >
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr className="pane-border-bottom">
                      <th
                        className="pane-heading-md"
                        style={{
                          paddingBottom: '0.75rem',
                          textAlign: 'left',
                          fontWeight: 500,
                        }}
                      >
                        Name
                      </th>
                      <th
                        className="pane-heading-md"
                        style={{
                          paddingBottom: '0.75rem',
                          textAlign: 'left',
                          fontWeight: 500,
                        }}
                      >
                        Type
                      </th>
                      <th
                        className="pane-heading-md"
                        style={{
                          paddingBottom: '0.75rem',
                          textAlign: 'left',
                          fontWeight: 500,
                        }}
                      >
                        Status
                      </th>
                      <th
                        className="pane-heading-md"
                        style={{
                          paddingBottom: '0.75rem',
                          textAlign: 'left',
                          fontWeight: 500,
                        }}
                      >
                        Contact
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {targets.map((target, index) => (
                      <motion.tr
                        key={target.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.24,
                          delay: index * 0.02,
                          ease: framerEasing.fast,
                        }}
                        className="pane-border-bottom"
                        style={{
                          transition: 'background-color 120ms cubic-bezier(0.22, 1, 0.36, 1)',
                        }}
                      >
                        <td
                          className="pane-body"
                          style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
                        >
                          {target.name}
                        </td>
                        <td
                          className="pane-body"
                          style={{
                            paddingTop: '0.75rem',
                            paddingBottom: '0.75rem',
                            textTransform: 'capitalize',
                          }}
                        >
                          {target.type}
                        </td>
                        <td style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>
                          <span
                            className={`pane-badge ${
                              target.status === 'found'
                                ? 'pane-badge-neutral'
                                : target.status === 'pitched'
                                  ? 'pane-badge-info'
                                  : target.status === 'opened'
                                    ? 'pane-badge-warning'
                                    : target.status === 'replied'
                                      ? 'pane-badge-success'
                                      : target.status === 'added'
                                        ? 'pane-badge-success'
                                        : 'pane-badge-neutral'
                            }`}
                          >
                            {target.status}
                          </span>
                        </td>
                        <td
                          className="pane-meta"
                          style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
                        >
                          {target.contact_email || target.contact_url || '—'}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </section>
      </motion.div>
    </>
  )
}
