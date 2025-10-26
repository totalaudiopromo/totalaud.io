/**
 * PlanTab Component
 *
 * Purpose: Define releases and create campaigns
 * Primary Actions:
 * - Add release (artist, title, date)
 * - Create campaign from release
 * - Browse campaign templates
 *
 * Phase 10.2: Cinematic Editorial Pass
 * Visual layer refinement with pane-theme tokens
 */

'use client'

import { useWorkspaceStore } from '@aud-web/stores/workspaceStore'
import { Plus, Music, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import { extendedMotionTokens, framerEasing } from '@aud-web/tokens/motion'
import '@aud-web/styles/pane-theme.css'

export function PlanTab() {
  const { releases, campaigns, addRelease, addCampaign, setActiveRelease, activeReleaseId } =
    useWorkspaceStore()

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
          <h1 className="pane-heading-xl">Plan your campaign.</h1>
          <p className="pane-body">Define releases and create targeted campaigns in flow.</p>
        </div>

        {/* Releases Section */}
        <section className="pane-section">
          <div className="pane-flex-between" style={{ marginBottom: '1.5rem' }}>
            <h2 className="pane-heading-lg">Releases</h2>
            <button
              className="pane-button pane-button-primary"
              onClick={() => {
                // TODO: Open release creation modal
                const id = addRelease({
                  artist: 'Sample Artist',
                  title: 'Sample Release',
                  release_date: new Date().toISOString().split('T')[0],
                  genre: ['electronic'],
                  links: {},
                })
                setActiveRelease(id)
              }}
            >
              <Plus className="pane-icon" />
              Add Release
            </button>
          </div>

          {releases.length === 0 ? (
            <motion.div
              className="pane-empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: extendedMotionTokens.editorialFade }}
            >
              <Music className="pane-empty-state-icon" />
              <h3 className="pane-empty-state-title">No releases yet</h3>
              <p className="pane-empty-state-description">
                Add your first release to get started with campaign planning
              </p>
              <p className="pane-empty-state-tagline">every campaign starts with a song.</p>
              <button
                className="pane-button pane-button-primary"
                style={{ marginTop: '1.5rem' }}
                onClick={() => {
                  const id = addRelease({
                    artist: 'Your Artist Name',
                    title: 'Your Release Title',
                    release_date: new Date().toISOString().split('T')[0],
                    genre: [],
                    links: {},
                  })
                  setActiveRelease(id)
                }}
              >
                <Plus className="pane-icon" />
                Add your first release
              </button>
            </motion.div>
          ) : (
            <div className="pane-grid-3">
              {releases.map((release, index) => (
                <motion.div
                  key={release.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.24,
                    delay: index * 0.05,
                    ease: framerEasing.fast,
                  }}
                  onClick={() => setActiveRelease(release.id)}
                  className={`pane-card pane-card-clickable ${
                    activeReleaseId === release.id ? 'pane-card-active' : ''
                  }`}
                >
                  <h3 className="pane-heading-md" style={{ marginBottom: '0.25rem' }}>
                    {release.title}
                  </h3>
                  <p className="pane-body" style={{ marginBottom: '0.5rem' }}>
                    {release.artist}
                  </p>
                  <p className="pane-meta">{release.release_date}</p>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Campaigns Section */}
        <section className="pane-section">
          <div className="pane-flex-between" style={{ marginBottom: '1.5rem' }}>
            <h2 className="pane-heading-lg">Campaigns</h2>
            {activeReleaseId && (
              <button
                className="pane-button pane-button-primary"
                onClick={() => {
                  addCampaign({
                    release_id: activeReleaseId,
                    name: 'New Campaign',
                    goal: 'radio',
                    status: 'draft',
                  })
                }}
              >
                <Plus className="pane-icon" />
                Create Campaign
              </button>
            )}
          </div>

          {campaigns.length === 0 ? (
            <motion.div
              className="pane-empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: extendedMotionTokens.editorialFade }}
            >
              <Target className="pane-empty-state-icon" />
              <h3 className="pane-empty-state-title">
                {activeReleaseId ? 'No campaigns yet' : 'Select a release first'}
              </h3>
              <p className="pane-empty-state-description">
                {activeReleaseId
                  ? 'Create your first campaign for this release'
                  : 'Select a release above to start creating campaigns'}
              </p>
            </motion.div>
          ) : (
            <div className="pane-grid-3">
              {campaigns.map((campaign, index) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.24,
                    delay: index * 0.05,
                    ease: framerEasing.fast,
                  }}
                  className="pane-card"
                >
                  <h3 className="pane-heading-md" style={{ marginBottom: '0.25rem' }}>
                    {campaign.name}
                  </h3>
                  <p
                    className="pane-body"
                    style={{ marginBottom: '0.5rem', textTransform: 'capitalize' }}
                  >
                    {campaign.goal}
                  </p>
                  <div className="pane-flex-between">
                    <span
                      className="pane-badge pane-badge-primary"
                      style={{ textTransform: 'capitalize' }}
                    >
                      {campaign.status}
                    </span>
                    <span className="pane-meta">{campaign.targets_count} targets</span>
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
