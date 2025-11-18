'use client';

import { useState, useEffect } from 'react';
import { HeatmapGrid, type HeatmapData } from './components/HeatmapGrid';
import { UsageStatsCard } from './components/UsageStatsCard';
import { FlowScoreCard } from './components/FlowScoreCard';

interface AnalyticsData {
  heatmap: HeatmapData[];
  flow_score?: {
    score: number;
    session_id: string;
    breakdown: {
      input_diversity: number;
      gesture_usage: number;
      session_duration: number;
      error_rate: number;
    };
  };
  total_inputs: number;
  unique_inputs: number;
  total_sessions: number;
  avg_session_duration_ms: number;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  useEffect(() => {
    fetchAnalytics();
  }, [selectedSessionId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedSessionId) {
        params.append('session_id', selectedSessionId);
      }

      const response = await fetch(`/api/hardware/analytics?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const usageStats = analytics
    ? [
        {
          label: 'Total Inputs',
          value: analytics.total_inputs || 0,
          trend: 'up' as const,
        },
        {
          label: 'Unique Inputs',
          value: analytics.unique_inputs || 0,
          colour: '#10B981',
        },
        {
          label: 'Total Sessions',
          value: analytics.total_sessions || 0,
          colour: '#F59E0B',
        },
        {
          label: 'Avg Session',
          value: analytics.avg_session_duration_ms
            ? `${Math.round(analytics.avg_session_duration_ms / 1000 / 60)}`
            : '0',
          unit: 'min',
          colour: '#A78BFA',
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#0B0E11] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Hardware Analytics</h1>
              <p className="text-gray-400 text-lg">
                Usage insights, heatmaps, and creative flow metrics
              </p>
            </div>
            <button
              onClick={fetchAnalytics}
              className="px-6 py-3 rounded-xl bg-[#3AA9BE] text-black font-medium hover:bg-[#3AA9BE]/80 transition-all duration-180"
            >
              🔄 Refresh
            </button>
          </div>

          {/* Session Filter */}
          <div className="flex items-centre gap-4">
            <label className="text-sm text-gray-400">Session Filter:</label>
            <select
              value={selectedSessionId || ''}
              onChange={(e) => setSelectedSessionId(e.target.value || undefined)}
              className="px-4 py-2 rounded-lg bg-[#111418] border border-[#2A2C30] text-white text-sm focus:border-[#3AA9BE] focus:outline-none"
            >
              <option value="">All Sessions</option>
              {/* In a real implementation, populate this with actual session IDs */}
            </select>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-900/20 border border-red-600 text-red-400">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-centre justify-centre py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#3AA9BE] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading analytics...</p>
            </div>
          </div>
        ) : analytics ? (
          <div className="space-y-6">
            {/* Usage Stats */}
            <UsageStatsCard title="Usage Statistics" stats={usageStats} />

            {/* Flow Score */}
            {analytics.flow_score && (
              <FlowScoreCard
                flowScore={analytics.flow_score.score}
                breakdown={analytics.flow_score.breakdown}
                sessionId={analytics.flow_score.session_id}
              />
            )}

            {/* Heatmap */}
            <HeatmapGrid heatmapData={analytics.heatmap || []} />

            {/* Empty State */}
            {analytics.heatmap.length === 0 && (
              <div className="bg-[#111418] border border-[#2A2C30] rounded-2xl p-12 text-centre">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Usage Data Yet</h3>
                <p className="text-gray-400">
                  Start using your hardware controller to see analytics and heatmaps.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#111418] border border-[#2A2C30] rounded-2xl p-12 text-centre">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Analytics Available</h3>
            <p className="text-gray-400">Failed to load analytics data.</p>
          </div>
        )}
      </div>
    </div>
  );
}
