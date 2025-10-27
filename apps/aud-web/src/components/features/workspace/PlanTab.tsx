/**
 * PlanTab Component
 *
 * Purpose: Define releases and create campaigns
 * Primary Actions:
 * - Add release (artist, title, date)
 * - Create campaign from release
 * - Browse campaign templates
 *
 * Phase 10.3.5: Integrated with CampaignContext and CreateCampaignModal
 */

'use client'

import { useState } from 'react'
import { useWorkspaceStore } from '@aud-web/stores/workspaceStore'
import { useCampaign, type Campaign } from '@/contexts/CampaignContext'
import { CreateCampaignModal } from '@/components/campaign/CreateCampaignModal'
import { Plus, Music, Target } from 'lucide-react'
import { EmptyState, Button, Tooltip } from '@/ui/index'
import { playSound } from '@aud-web/tokens/sounds'

export function PlanTab() {
  const { releases, campaigns, addRelease, addCampaign, setActiveRelease, activeReleaseId } =
    useWorkspaceStore()

  const { addCampaign: addCampaignToContext, campaigns: contextCampaigns } = useCampaign()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCreateCampaign = (campaignData: Omit<Campaign, 'id' | 'createdAt'>) => {
    // Generate ID and timestamp
    const newCampaign: Campaign = {
      ...campaignData,
      id: `campaign-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }

    // Add to context
    addCampaignToContext(newCampaign)

    // Play success sound
    playSound('success-soft', { volume: 0.15 })
  }

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
          <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
            Create Campaign
          </Button>
        </div>

        {contextCampaigns.length === 0 ? (
          <EmptyState
            icon={Target}
            title="no campaigns yet"
            description="start one when you've got a plan"
            ctaLabel="Create Campaign"
            onClick={() => setIsModalOpen(true)}
            variant="bordered"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contextCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="campaign-card p-4 border-2 border-[#2C2F33] hover:border-[#3AA9BE] transition-colors"
                style={{
                  background: '#1A1C1F',
                  borderRadius: 0,
                }}
              >
                <h3 className="font-semibold mb-1 text-[#EAECEE]">{campaign.release}</h3>
                <p className="text-sm text-[#A0A4A8] mb-2">{campaign.artist}</p>
                {campaign.genre && <p className="text-xs text-[#A0A4A8] mb-2">{campaign.genre}</p>}
                <div className="flex items-center justify-between text-xs text-[#A0A4A8]">
                  <span className="capitalize">{campaign.status}</span>
                  <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Campaign Creation Modal */}
      <CreateCampaignModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCampaign}
      />
    </div>
  )
}
