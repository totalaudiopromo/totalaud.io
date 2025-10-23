/**
 * PlanTab Component
 *
 * Purpose: Define releases and create campaigns
 * Primary Actions:
 * - Add release (artist, title, date)
 * - Create campaign from release
 * - Browse campaign templates
 *
 * Shared Workspace Redesign - Stage 1 (Stub)
 * To be enhanced by Experience Composer in Stage 2
 */

'use client'

import { useWorkspaceStore } from '@aud-web/stores/workspaceStore'
import { Plus, Music } from 'lucide-react'

export function PlanTab() {
  const { releases, campaigns, addRelease, addCampaign, setActiveRelease, activeReleaseId } =
    useWorkspaceStore()

  return (
    <div className="plan-tab container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Plan Your Campaign</h1>
        <p className="text-muted">Define releases and create targeted campaigns</p>
      </div>

      {/* Releases Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Releases</h2>
          <button
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
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Release
          </button>
        </div>

        {releases.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
            <Music className="w-12 h-12 mx-auto mb-4 text-muted" />
            <p className="text-muted mb-4">No releases yet</p>
            <button
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
              className="text-accent hover:underline"
            >
              Add your first release →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {releases.map((release) => (
              <div
                key={release.id}
                onClick={() => setActiveRelease(release.id)}
                className={`
                  release-card p-4 border rounded-lg cursor-pointer transition-all
                  ${
                    activeReleaseId === release.id
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-accent/50'
                  }
                `}
              >
                <h3 className="font-semibold mb-1">{release.title}</h3>
                <p className="text-sm text-muted mb-2">{release.artist}</p>
                <p className="text-xs text-muted">{release.release_date}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Campaigns Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Campaigns</h2>
          {activeReleaseId && (
            <button
              onClick={() => {
                addCampaign({
                  release_id: activeReleaseId,
                  name: 'New Campaign',
                  goal: 'radio',
                  status: 'draft',
                })
              }}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Create Campaign
            </button>
          )}
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
            <p className="text-muted">
              {activeReleaseId
                ? 'Create your first campaign for this release'
                : 'Select a release to create a campaign'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="campaign-card p-4 border border-border rounded-lg hover:border-accent/50 transition-colors"
              >
                <h3 className="font-semibold mb-1">{campaign.name}</h3>
                <p className="text-sm text-muted mb-2 capitalize">{campaign.goal}</p>
                <div className="flex items-center justify-between text-xs text-muted">
                  <span className="capitalize">{campaign.status}</span>
                  <span>{campaign.targets_count} targets</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
