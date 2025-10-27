/**
 * LearnTab Component
 *
 * Purpose: Surface insights and recommendations
 * Primary Actions:
 * - View AI-generated insights
 * - Browse successful pitch examples
 * - Analyze campaign patterns
 *
 * Phase 10.3.5: Connected to CampaignContext
 */

'use client'

import { useWorkspaceStore } from '@aud-web/stores/workspaceStore'
import { useCampaign } from '@/contexts/CampaignContext'
import { Lightbulb, TrendingUp, Target, Sparkles } from 'lucide-react'
import { Button } from '@/ui/index'

export function LearnTab() {
  const { insights, addInsight } = useWorkspaceStore()
  const { activeCampaign } = useCampaign()

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
    <div className="learn-tab container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 lowercase">learn & improve</h1>
        <p className="text-muted lowercase">
          {activeCampaign
            ? `insights for ${activeCampaign.release} by ${activeCampaign.artist}`
            : 'ai-powered insights from your campaign data'}
        </p>
      </div>

      {/* Insights Feed */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Insights</h2>
        <div className="space-y-4">
          {demoInsights.map((insight) => {
            const Icon =
              insight.type === 'recommendation'
                ? Lightbulb
                : insight.type === 'pattern'
                  ? TrendingUp
                  : Target

            return (
              <div
                key={insight.id}
                className="insight-card p-6 border border-border rounded-lg hover:border-accent/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-3 bg-accent/10 rounded-lg">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{insight.title}</h3>
                      <span
                        className={`
                          px-2 py-1 rounded text-xs font-medium
                          ${insight.type === 'recommendation' ? 'bg-blue-500/20 text-blue-600' : ''}
                          ${insight.type === 'pattern' ? 'bg-purple-500/20 text-purple-600' : ''}
                          ${insight.type === 'opportunity' ? 'bg-green-500/20 text-green-600' : ''}
                        `}
                      >
                        {insight.type}
                      </span>
                    </div>
                    <p className="text-muted mb-3">{insight.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted">
                      <span>Relevance: {Math.round(insight.relevance_score * 100)}%</span>
                      <span>{new Date(insight.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recommended Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="action-card p-6 border border-border rounded-lg">
            <Sparkles className="w-8 h-8 mb-4 text-accent" />
            <h3 className="font-semibold mb-2">Optimize pitch timing</h3>
            <p className="text-sm text-muted mb-4">
              Adjust your sending schedule based on insights to improve open rates
            </p>
            <Button variant="primary">Apply Recommendations</Button>
          </div>
          <div className="action-card p-6 border border-border rounded-lg">
            <Target className="w-8 h-8 mb-4 text-accent" />
            <h3 className="font-semibold mb-2">Refine targeting</h3>
            <p className="text-sm text-muted mb-4">
              Use pattern analysis to find more curators likely to respond
            </p>
            <Button variant="primary">Explore Patterns</Button>
          </div>
        </div>
      </section>
    </div>
  )
}
