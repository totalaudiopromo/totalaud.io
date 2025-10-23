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
import { Plus, Music, Target } from 'lucide-react'
import { EmptyState, Button, Tooltip } from '@/ui'

export function PlanTab() {
  const { releases, campaigns, addRelease, addCampaign, setActiveRelease, activeReleaseId } =
    useWorkspaceStore()

  return (
    <div className="plan-tab container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Plan Your Campaign</h1>
        <p className="text-muted">
          {releases.length === 0 ? (
            <Tooltip content="Start by adding a release, then create campaigns to promote it">
              <span className="border-b border-dashed border-muted cursor-help">
                Define releases and create targeted campaigns
              </span>
            </Tooltip>
          ) : (
            'Define releases and create targeted campaigns'
          )}
        </p>
      </div>

      {/* Releases Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Releases</h2>
          <Button
            variant="primary"
            icon={Plus}
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
            Add Release
          </Button>
        </div>

        {releases.length === 0 ? (
          <EmptyState
            icon={Music}
            title="No releases yet"
            description="Add your first release to get started with campaign planning"
            ctaLabel="Add your first release"
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
            variant="bordered"
          />
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
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => {
                addCampaign({
                  release_id: activeReleaseId,
                  name: 'New Campaign',
                  goal: 'radio',
                  status: 'draft',
                })
              }}
            >
              Create Campaign
            </Button>
          )}
        </div>

        {campaigns.length === 0 ? (
          <EmptyState
            icon={Target}
            title={activeReleaseId ? 'No campaigns yet' : 'Select a release first'}
            description={
              activeReleaseId
                ? 'Create your first campaign for this release'
                : 'Select a release above to start creating campaigns'
            }
            variant="bordered"
          />
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
