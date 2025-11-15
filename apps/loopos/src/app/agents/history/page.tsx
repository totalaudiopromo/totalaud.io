'use client'

import { PageHeader } from '@/components/PageHeader'
import { CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Execution {
  id: string
  skill_id: string
  success: boolean
  duration_ms: number
  created_at: string
  input: Record<string, unknown>
  output: Record<string, unknown> | null
  error: string | null
}

export default function AgentHistoryPage() {
  const [executions, setExecutions] = useState<Execution[]>([])
  const [stats, setStats] = useState({ total: 0, successful: 0, failed: 0, avgDurationMs: 0 })
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/agents/history')
      const data = await response.json()
      setExecutions(data.executions || [])
      setStats(data.stats || { total: 0, successful: 0, failed: 0, avgDurationMs: 0 })
    } catch (error) {
      console.error('Failed to load history:', error)
    }
  }

  return (
    <div className="min-h-screen bg-matte-black">
      <PageHeader
        title="Agent Execution History"
        description="Track and audit all agent skill runs"
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-500">Total Executions</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-500">Successful</span>
            </div>
            <p className="text-2xl font-bold text-green-500">{stats.successful}</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-xs text-gray-500">Failed</span>
            </div>
            <p className="text-2xl font-bold text-red-500">{stats.failed}</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-500">Avg Duration</span>
            </div>
            <p className="text-2xl font-bold text-blue-500">
              {(stats.avgDurationMs / 1000).toFixed(1)}s
            </p>
          </div>
        </div>

        {/* Executions List */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Skill
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {executions.map((execution) => (
                  <tr
                    key={execution.id}
                    className="hover:bg-gray-900/50 transition-colours"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {execution.success ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">{execution.skill_id}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-400">
                        {(execution.duration_ms / 1000).toFixed(2)}s
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-400">
                        {new Date(execution.created_at).toLocaleString('en-GB')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedExecution(execution)}
                        className="text-sm text-slate-cyan hover:text-slate-cyan/80 transition-colours"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {executions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No executions yet. Run a skill to see history!</p>
            </div>
          )}
        </div>

        {/* Execution Detail Modal */}
        {selectedExecution && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedExecution(null)}
          >
            <div
              className="bg-gray-900 border border-gray-800 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">Execution Details</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Skill ID</h4>
                  <p className="text-white">{selectedExecution.skill_id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Input</h4>
                  <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 text-gray-300 text-xs overflow-x-auto">
                    {JSON.stringify(selectedExecution.input, null, 2)}
                  </pre>
                </div>
                {selectedExecution.success && selectedExecution.output && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Output</h4>
                    <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 text-gray-300 text-xs overflow-x-auto">
                      {JSON.stringify(selectedExecution.output, null, 2)}
                    </pre>
                  </div>
                )}
                {!selectedExecution.success && selectedExecution.error && (
                  <div>
                    <h4 className="text-sm font-medium text-red-400 mb-2">Error</h4>
                    <p className="text-red-300 text-sm">{selectedExecution.error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
