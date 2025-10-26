/**
 * DoTab Component
 *
 * Purpose: Execute agent workflows
 * Primary Actions:
 * - Start run (find curators, generate pitch, send emails)
 * - Monitor agent progress
 * - View live logs
 *
 * Phase 10.2: Cinematic Editorial Pass
 * Visual layer refinement with pane-theme tokens
 */

'use client'

import { useWorkspaceStore } from '@aud-web/stores/workspaceStore'
import { Play, Search, FileText, Send, History } from 'lucide-react'
import { motion } from 'framer-motion'
import { extendedMotionTokens, framerEasing } from '@aud-web/tokens/motion'
import '@aud-web/styles/pane-theme.css'

export function DoTab() {
  const { runs, getActiveCampaign, runAction, isLoading } = useWorkspaceStore()

  const activeCampaign = getActiveCampaign()

  const workflows = [
    {
      type: 'find_curators' as const,
      name: 'Find Curators',
      description: 'Search for radio stations, playlists, and blogs matching your genre',
      icon: Search,
    },
    {
      type: 'generate_pitch' as const,
      name: 'Generate Pitch',
      description: 'Create personalized pitch emails using AI',
      icon: FileText,
    },
    {
      type: 'send_outreach' as const,
      name: 'Send Outreach',
      description: 'Send pitch emails to found curators',
      icon: Send,
    },
  ]

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
            <Play className="pane-empty-state-icon" />
            <h3 className="pane-empty-state-title">No active campaign</h3>
            <p className="pane-empty-state-description">
              Select or create a campaign from the Plan tab to start running workflows
            </p>
            <p className="pane-empty-state-tagline">workflows need direction.</p>
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
          <h1 className="pane-heading-xl">Execute workflows.</h1>
          <p className="pane-body">Campaign: {activeCampaign.name}</p>
        </div>

        {/* Workflow Launcher */}
        <section className="pane-section">
          <h2 className="pane-heading-lg" style={{ marginBottom: '1.5rem' }}>
            Available Workflows
          </h2>
          <div className="pane-grid-3">
            {workflows.map((workflow, index) => {
              const Icon = workflow.icon

              return (
                <motion.div
                  key={workflow.type}
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
                    {workflow.name}
                  </h3>
                  <p className="pane-body" style={{ marginBottom: '1.5rem', flexGrow: 1 }}>
                    {workflow.description}
                  </p>
                  <button
                    className="pane-button pane-button-primary"
                    style={{ width: '100%' }}
                    onClick={() => runAction(workflow.type, { campaign_id: activeCampaign.id })}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Running...' : 'Start'}
                  </button>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* Recent Runs */}
        <section className="pane-section">
          <h2 className="pane-heading-lg" style={{ marginBottom: '1.5rem' }}>
            Recent Runs
          </h2>
          {runs.length === 0 ? (
            <motion.div
              className="pane-empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: extendedMotionTokens.editorialFade }}
            >
              <History className="pane-empty-state-icon" />
              <h3 className="pane-empty-state-title">No runs yet</h3>
              <p className="pane-empty-state-description">Start a workflow above to get started</p>
              <p className="pane-empty-state-tagline">execution builds momentum.</p>
            </motion.div>
          ) : (
            <div className="pane-space-y-md">
              {runs
                .slice()
                .reverse()
                .slice(0, 10)
                .map((run, index) => (
                  <motion.div
                    key={run.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.24,
                      delay: index * 0.03,
                      ease: framerEasing.fast,
                    }}
                    className="pane-card"
                  >
                    <div className="pane-flex-between">
                      <div>
                        <h3
                          className="pane-heading-md"
                          style={{ marginBottom: '0.25rem', textTransform: 'capitalize' }}
                        >
                          {run.workflow_type.replace('_', ' ')}
                        </h3>
                        <p className="pane-meta">
                          Started: {new Date(run.started_at).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`pane-badge ${
                          run.status === 'complete'
                            ? 'pane-badge-success'
                            : run.status === 'running'
                              ? 'pane-badge-info'
                              : run.status === 'failed'
                                ? 'pane-badge-error'
                                : 'pane-badge-neutral'
                        }`}
                      >
                        {run.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
            </div>
          )}
        </section>
      </motion.div>
    </>
  )
}
