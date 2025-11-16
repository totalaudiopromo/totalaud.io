'use client'

import { useEffect, useState } from 'react'
import { AuthGuard } from '@/components/AuthGuard'
import { useWorkspace } from '@/hooks/useWorkspace'
import {
  Network,
  Activity,
  Filter,
  Search,
  ChevronRight,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'
import type { MemoryNode, MemoryNodeKind } from '@total-audio/loopos-db'

export default function MemoryInspectorPage() {
  return (
    <AuthGuard>
      <MemoryInspectorContent />
    </AuthGuard>
  )
}

function MemoryInspectorContent() {
  const { currentWorkspace } = useWorkspace()
  const [nodes, setNodes] = useState<MemoryNode[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedKind, setSelectedKind] = useState<MemoryNodeKind | 'all'>('all')
  const [expandedNode, setExpandedNode] = useState<string | null>(null)
  const [nodeDetails, setNodeDetails] = useState<any>(null)

  const nodeKinds: Array<MemoryNodeKind | 'all'> = [
    'all',
    'theme',
    'tone',
    'visual_motif',
    'audience',
    'value',
    'skill',
    'goal',
    'collaborator',
    'genre',
    'instrument',
    'technique',
  ]

  useEffect(() => {
    if (!currentWorkspace) return
    loadNodes()
  }, [currentWorkspace, selectedKind])

  const loadNodes = async () => {
    if (!currentWorkspace) return

    try {
      setLoading(true)
      const kindParam = selectedKind === 'all' ? '' : `&kind=${selectedKind}`
      const res = await fetch(
        `/api/memory/nodes?workspaceId=${currentWorkspace.id}${kindParam}&limit=200`
      )
      const data = await res.json()

      if (data.success) {
        setNodes(data.nodes)
      }
    } catch (error) {
      console.error('Failed to load memory nodes:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadNodeDetails = async (nodeId: string) => {
    try {
      const res = await fetch(`/api/memory/nodes/${nodeId}`)
      const data = await res.json()

      if (data.success) {
        setNodeDetails(data)
      }
    } catch (error) {
      console.error('Failed to load node details:', error)
    }
  }

  const handleNodeClick = (nodeId: string) => {
    if (expandedNode === nodeId) {
      setExpandedNode(null)
      setNodeDetails(null)
    } else {
      setExpandedNode(nodeId)
      loadNodeDetails(nodeId)
    }
  }

  if (!currentWorkspace) {
    return <div className="p-8">No workspace selected</div>
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-centre gap-3 mb-2">
            <Network className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold">Memory Inspector</h1>
          </div>
          <p className="text-foreground/60">Debug and explore the semantic memory graph</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-centre gap-3">
          <Filter className="w-4 h-4 text-foreground/60" />
          <select
            value={selectedKind}
            onChange={(e) => setSelectedKind(e.target.value as MemoryNodeKind | 'all')}
            className="px-3 py-2 bg-background border border-border rounded text-sm hover:border-accent/50 transition-colours"
          >
            {nodeKinds.map((kind) => (
              <option key={kind} value={kind}>
                {kind === 'all' ? 'All Kinds' : kind.replace('_', ' ')}
              </option>
            ))}
          </select>
          <span className="text-sm text-foreground/60">
            {nodes.length} {nodes.length === 1 ? 'node' : 'nodes'}
          </span>
        </div>

        {/* Nodes List */}
        {loading ? (
          <div className="flex items-centre justify-centre py-12">
            <Activity className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : nodes.length === 0 ? (
          <div className="border border-border rounded-lg p-12 text-centre">
            <Search className="w-16 h-16 text-accent mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-bold mb-2">No memory nodes found</h2>
            <p className="text-foreground/60">
              Memory will be extracted as you create content in LoopOS
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {nodes.map((node) => (
              <div key={node.id} className="border border-border rounded-lg overflow-hidden">
                {/* Node Header */}
                <button
                  onClick={() => handleNodeClick(node.id)}
                  className="w-full px-4 py-3 flex items-centre justify-between hover:bg-accent/5 transition-colours"
                >
                  <div className="flex items-centre gap-3">
                    {expandedNode === node.id ? (
                      <ChevronDown className="w-4 h-4 text-foreground/60" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-foreground/60" />
                    )}
                    <div className="text-left">
                      <div className="font-medium">{node.label}</div>
                      <div className="text-xs text-foreground/60 flex items-centre gap-2">
                        <span className="px-2 py-0.5 bg-accent/20 rounded">
                          {node.kind.replace('_', ' ')}
                        </span>
                        <span>
                          {Math.round(node.confidence * 100)}% confidence • {node.occurrences}{' '}
                          {node.occurrences === 1 ? 'occurrence' : 'occurrences'}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Node Details (Expanded) */}
                {expandedNode === node.id && nodeDetails && (
                  <div className="px-4 pb-4 border-t border-border bg-background/50">
                    {/* Summary */}
                    {node.summary && (
                      <div className="mt-3 mb-3">
                        <div className="text-xs font-medium text-foreground/60 mb-1">Summary</div>
                        <div className="text-sm">{node.summary}</div>
                      </div>
                    )}

                    {/* Graph Connections */}
                    {nodeDetails.graph && nodeDetails.graph.length > 0 && (
                      <div className="mt-3 mb-3">
                        <div className="text-xs font-medium text-foreground/60 mb-2">
                          Connections ({nodeDetails.graph.length})
                        </div>
                        <div className="space-y-1">
                          {nodeDetails.graph.slice(0, 5).map((edge: any, i: number) => (
                            <div
                              key={i}
                              className="text-sm px-2 py-1 bg-background border border-border/50 rounded"
                            >
                              <span className="text-foreground/60">{edge.relation}</span>{' '}
                              <span className="font-medium">{edge.connected_node_label}</span>
                              {edge.strength && (
                                <span className="text-xs text-foreground/60 ml-2">
                                  ({Math.round(edge.strength * 100)}%)
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sources */}
                    {nodeDetails.sources && nodeDetails.sources.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-medium text-foreground/60 mb-2">
                          Sources ({nodeDetails.sources.length})
                        </div>
                        <div className="space-y-1">
                          {nodeDetails.sources.slice(0, 3).map((source: any) => (
                            <div
                              key={source.id}
                              className="text-xs px-2 py-1 bg-background border border-border/50 rounded flex items-centre justify-between"
                            >
                              <span>
                                <span className="font-medium">{source.source_type}</span>
                                {source.excerpt && (
                                  <span className="text-foreground/60 ml-2">
                                    "{source.excerpt.slice(0, 60)}..."
                                  </span>
                                )}
                              </span>
                              <ExternalLink className="w-3 h-3 text-foreground/40" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="mt-3 pt-3 border-t border-border/50 text-xs text-foreground/60">
                      <div>
                        ID: <code className="font-mono">{node.id}</code>
                      </div>
                      <div>
                        First seen: {new Date(node.first_seen_at).toLocaleDateString()} • Last
                        seen: {new Date(node.last_seen_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
