/**
 * TrackTab Component
 *
 * Purpose: Monitor campaign results
 * Primary Actions:
 * - View campaign metrics (open rate, reply rate, playlist adds)
 * - Browse found curators
 * - Analyze outreach performance
 *
 * Phase 10.3.5: Connected to CampaignContext
 */

'use client'

import { useWorkspaceStore } from '@aud-web/stores/workspaceStore'
import { useCampaign } from '@/contexts/CampaignContext'
import { BarChart3, Users, Mail, TrendingUp, Target } from 'lucide-react'
import { EmptyState } from '@/ui/index'

export function TrackTab() {
  const { getActiveCampaign, getTargetsForCampaign, getMetrics } = useWorkspaceStore()
  const { activeCampaign } = useCampaign()

  const oldActiveCampaign = getActiveCampaign()
  const targets = activeCampaign ? [] : [] // TODO: Connect to actual campaign data
  const metrics = activeCampaign ? null : null // TODO: Connect to actual campaign data

  if (!activeCampaign) {
    return (
      <div className="track-tab container mx-auto px-4 py-8">
        <EmptyState
          icon={BarChart3}
          title="no active campaign"
          description="create a campaign in plan tab to view metrics"
        />
      </div>
    )
  }

  return (
    <div className="track-tab container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 lowercase">track performance</h1>
        <p className="text-muted lowercase">
          campaign: <span className="text-[#3AA9BE]">{activeCampaign.release}</span> by{' '}
          {activeCampaign.artist}
        </p>
      </div>

      {/* Metrics Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="metric-card p-6 border border-border rounded-lg">
            <Users className="w-8 h-8 mb-2 text-accent" />
            <p className="text-sm text-muted mb-1">Curators Found</p>
            <p className="text-3xl font-bold">{metrics?.curators_found || 0}</p>
          </div>
          <div className="metric-card p-6 border border-border rounded-lg">
            <Mail className="w-8 h-8 mb-2 text-accent" />
            <p className="text-sm text-muted mb-1">Pitches Sent</p>
            <p className="text-3xl font-bold">{metrics?.pitches_sent || 0}</p>
          </div>
          <div className="metric-card p-6 border border-border rounded-lg">
            <TrendingUp className="w-8 h-8 mb-2 text-accent" />
            <p className="text-sm text-muted mb-1">Emails Opened</p>
            <p className="text-3xl font-bold">{metrics?.emails_opened || 0}</p>
          </div>
          <div className="metric-card p-6 border border-border rounded-lg">
            <BarChart3 className="w-8 h-8 mb-2 text-accent" />
            <p className="text-sm text-muted mb-1">Replies Received</p>
            <p className="text-3xl font-bold">{metrics?.replies_received || 0}</p>
          </div>
        </div>
      </section>

      {/* Targets List */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Found Targets ({targets.length})</h2>
        {targets.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No targets found yet"
            description='Run the "Find Curators" workflow from the Do tab'
            variant="bordered"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-semibold">Name</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Contact</th>
                </tr>
              </thead>
              <tbody>
                {targets.map((target) => (
                  <tr key={target.id} className="border-b border-border">
                    <td className="py-3">{target.name}</td>
                    <td className="py-3 capitalize">{target.type}</td>
                    <td className="py-3">
                      <span
                        className={`
                          px-2 py-1 rounded text-xs font-medium
                          ${target.status === 'found' ? 'bg-gray-500/20 text-gray-600' : ''}
                          ${target.status === 'pitched' ? 'bg-blue-500/20 text-blue-600' : ''}
                          ${target.status === 'opened' ? 'bg-purple-500/20 text-purple-600' : ''}
                          ${target.status === 'replied' ? 'bg-green-500/20 text-green-600' : ''}
                          ${target.status === 'added' ? 'bg-emerald-500/20 text-emerald-600' : ''}
                        `}
                      >
                        {target.status}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-muted">
                      {target.contact_email || target.contact_url || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
