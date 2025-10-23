/**
 * DoTab Component
 *
 * Purpose: Execute agent workflows
 * Primary Actions:
 * - Start run (find curators, generate pitch, send emails)
 * - Monitor agent progress
 * - View live logs
 *
 * Shared Workspace Redesign - Stage 1 (Stub)
 * To be enhanced by Experience Composer in Stage 2
 */

'use client'

import { useWorkspaceStore } from '@aud-web/stores/workspaceStore'
import { Play, Search, FileText, Send, History } from 'lucide-react'
import { EmptyState, Button } from '@/ui'

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
      <div className="do-tab container mx-auto px-4 py-8">
        <EmptyState
          icon={Play}
          title="No Active Campaign"
          description="Select or create a campaign from the Plan tab to start running workflows"
        />
      </div>
    )
  }

  return (
    <div className="do-tab container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Execute Workflows</h1>
        <p className="text-muted">Campaign: {activeCampaign.name}</p>
      </div>

      {/* Workflow Launcher */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Available Workflows</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workflows.map((workflow) => {
            const Icon = workflow.icon

            return (
              <div
                key={workflow.type}
                className="workflow-card p-6 border border-border rounded-lg hover:border-accent/50 transition-colors"
              >
                <Icon className="w-8 h-8 mb-4 text-accent" />
                <h3 className="font-semibold mb-2">{workflow.name}</h3>
                <p className="text-sm text-muted mb-4">{workflow.description}</p>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => runAction(workflow.type, { campaign_id: activeCampaign.id })}
                  disabled={isLoading}
                  isLoading={isLoading}
                >
                  {isLoading ? 'Running...' : 'Start'}
                </Button>
              </div>
            )
          })}
        </div>
      </section>

      {/* Recent Runs */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent Runs</h2>
        {runs.length === 0 ? (
          <EmptyState
            icon={History}
            title="No runs yet"
            description="Start a workflow above to get started"
            variant="bordered"
          />
        ) : (
          <div className="space-y-3">
            {runs.slice().reverse().slice(0, 10).map((run) => (
              <div
                key={run.id}
                className="run-card p-4 border border-border rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium capitalize">
                      {run.workflow_type.replace('_', ' ')}
                    </h3>
                    <p className="text-sm text-muted">
                      Started: {new Date(run.started_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      ${run.status === 'complete' ? 'bg-green-500/20 text-green-600' : ''}
                      ${run.status === 'running' ? 'bg-blue-500/20 text-blue-600' : ''}
                      ${run.status === 'failed' ? 'bg-red-500/20 text-red-600' : ''}
                      ${run.status === 'pending' ? 'bg-gray-500/20 text-gray-600' : ''}
                    `}
                  >
                    {run.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
