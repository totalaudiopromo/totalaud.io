/**
 * FlowCanvas 2.0
 * Phase 18: Added node duplication, search, and agent debug drawer
 *
 * React Flow powered canvas with Zustand state and Supabase persistence.
 */

'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type NodeProps,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { logger } from '@/lib/logger'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { getNodeByKind } from '@/components/features/flow/node-registry'
import type { NodeKind } from '@/types/console'
import { useFlowCanvasStore, useFlowCanvasStoreFactory } from '@/store/flowCanvasStore'
import { createBrowserSupabaseClient } from '@aud-web/lib/supabase/client'
import { playAssetAttachSound, playAssetDetachSound } from '@/lib/asset-sounds'
import { NodeSearch } from './NodeSearch'
import { AgentDebugDrawer } from './AgentDebugDrawer'

const log = logger.scope('FlowCanvas')

interface FlowNodeData {
  kind: NodeKind
  campaignId?: string
  userId?: string
}

interface FlowCanvasProps {
  campaignId?: string
  userId?: string
  children?: ReactNode
}

type SceneState = {
  nodes: Node<FlowNodeData>[]
  edges: Edge[]
}

function FlowCanvasNode({ data }: NodeProps<FlowNodeData>) {
  const nodeDef = getNodeByKind(data.kind)

  if (!nodeDef) {
    log.warn('Node definition missing', { kind: data.kind })
    return null
  }

  return (
    <div style={{ minWidth: 360 }}>
      {nodeDef.spawn({
        campaignId: data.campaignId,
        userId: data.userId,
      })}
    </div>
  )
}

const nodeTypes = { 'flow-node': FlowCanvasNode } as const
const AUTO_SAVE_INTERVAL_MS = 60_000

let spawnOffset = 0

export function FlowCanvas({ campaignId, userId, children }: FlowCanvasProps) {
  // Early return during SSR to prevent hydration issues
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const prefersReducedMotion = useReducedMotion()

  // Use the store hook - ensures client-side only creation
  const {
    nodes,
    edges,
    selectedNodeIds,
    setNodes,
    setEdges,
    setSelectedNodeIds,
    duplicateNode,
    reset,
  } = useFlowCanvasStore((state) => ({
    nodes: state.nodes,
    edges: state.edges,
    selectedNodeIds: state.selectedNodeIds,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
    setSelectedNodeIds: state.setSelectedNodeIds,
    duplicateNode: state.duplicateNode,
    reset: state.reset,
  }))

  // Don't render ReactFlow during SSR
  if (!isMounted) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: '600px',
          position: 'relative',
          backgroundColor: flowCoreColours.matteBlack,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: flowCoreColours.textSecondary,
          fontSize: '13px',
          fontFamily: 'var(--flowcore-font-mono)',
        }}
      >
        loading canvas...
      </div>
    )
  }
  const [sceneId, setSceneId] = useState<string | null>(null)
  const [isHydrating, setIsHydrating] = useState(true)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [debugNodeId, setDebugNodeId] = useState<string | null>(null)

  const pendingSaveRef = useRef(false)
  const skipNextSaveRef = useRef(false)

  useEffect(() => {
    if (!userId) {
      skipNextSaveRef.current = true
      reset()
      setSceneId(null)
      setLastSavedAt(null)
      setIsHydrating(false)
      return
    }

    let cancelled = false

    async function loadScene() {
      setIsHydrating(true)

      try {
        let query = supabase
          .from('canvas_scenes')
          .select('id, scene_state, updated_at')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(1)

        if (campaignId) {
          query = query.eq('campaign_id', campaignId)
        } else {
          query = query.is('campaign_id', null)
        }

        const { data, error } = await query.maybeSingle()

        if (cancelled) return

        if (error) {
          log.warn('Failed to load canvas scene', { error, campaignId, userId })
          skipNextSaveRef.current = true
          reset()
          setSceneId(null)
          setLastSavedAt(null)
          return
        }

        if (data?.scene_state) {
          const scene = data.scene_state as SceneState
          const hydratedNodes: Node<FlowNodeData>[] =
            scene.nodes
              ?.map((node) => {
                const rawData = (node.data as Partial<FlowNodeData> | undefined) ?? {}
                if (!rawData.kind) {
                  log.warn('Skipping node without kind', { nodeId: node.id })
                  return null
                }

                const formatted: Node<FlowNodeData> = {
                  ...node,
                  data: {
                    kind: rawData.kind,
                    campaignId,
                    userId,
                    ...rawData,
                  },
                }

                return formatted
              })
              .filter((node): node is Node<FlowNodeData> => node !== null) ?? []

          skipNextSaveRef.current = true
          setNodes(hydratedNodes)
          setEdges(scene.edges ?? [])
          setSceneId(data.id)
          setLastSavedAt(data.updated_at ?? null)
        } else {
          skipNextSaveRef.current = true
          reset()
          setSceneId(null)
          setLastSavedAt(null)
        }
      } finally {
        if (!cancelled) {
          setIsHydrating(false)
        }
      }
    }

    void loadScene()

    return () => {
      cancelled = true
    }
  }, [campaignId, reset, setEdges, setNodes, supabase, userId])

  useEffect(() => {
    if (!userId) return
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false
      return
    }
    pendingSaveRef.current = true
  }, [edges, nodes, userId])

  const persistScene = useCallback(async () => {
    if (!userId) return false

    const payload: SceneState = {
      nodes,
      edges,
    }

    try {
      if (sceneId) {
        const { data, error } = await supabase
          .from('canvas_scenes')
          .update({ scene_state: payload })
          .eq('id', sceneId)
          .select('updated_at')
          .single()

        if (error) {
          log.error('Failed to update canvas scene', { error, sceneId })
          return false
        }

        setLastSavedAt(data?.updated_at ?? new Date().toISOString())
      } else {
        const { data, error } = await supabase
          .from('canvas_scenes')
          .insert({
            user_id: userId,
            campaign_id: campaignId ?? null,
            title: 'Console Scene',
            scene_state: payload,
          })
          .select('id, updated_at')
          .single()

        if (error) {
          log.error('Failed to create canvas scene', { error })
          return false
        }

        setSceneId(data.id)
        setLastSavedAt(data.updated_at ?? new Date().toISOString())
      }

      pendingSaveRef.current = false
      log.debug('Canvas scene saved', { sceneId: sceneId ?? 'new' })
      return true
    } catch (error) {
      log.error('Unexpected error saving canvas scene', { error })
      return false
    }
  }, [campaignId, edges, nodes, sceneId, supabase, userId])

  useEffect(() => {
    if (!userId) return

    const intervalId = window.setInterval(() => {
      if (pendingSaveRef.current) {
        void persistScene()
      }
    }, AUTO_SAVE_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [persistScene, userId])

  useEffect(() => {
    if (!userId) return

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden' && pendingSaveRef.current) {
        void persistScene()
      }
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (pendingSaveRef.current) {
        void persistScene()
        event.preventDefault()
        event.returnValue = ''
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [persistScene, userId])

  useEffect(
    () => () => {
      if (pendingSaveRef.current) {
        void persistScene()
      }
    },
    [persistScene]
  )

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const currentNodes = store.getState().nodes
      setNodes(applyNodeChanges(changes, currentNodes))
    },
    [setNodes, store]
  )

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const currentEdges = store.getState().edges
      setEdges(applyEdgeChanges(changes, currentEdges))
    },
    [setEdges, store]
  )

  const handleConnect = useCallback(
    (connection: Connection) => {
      const currentEdges = store.getState().edges
      setEdges(addEdge(connection, currentEdges))
    },
    [setEdges, store]
  )

  const handleNodesDelete = useCallback((deleted: Node[]) => {
    if (deleted.length > 0) {
      try {
        playAssetDetachSound()
      } catch (error) {
        log.debug('Failed to play detach sound', { error })
      }
    }
  }, [])

  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[] }) => {
      setSelectedNodeIds(selectedNodes.map((n) => n.id))
    },
    [setSelectedNodeIds]
  )

  // Keyboard shortcuts: ⌘D (duplicate) and ⌘F (search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey

      // ⌘D - Duplicate selected node
      if (isMod && e.key === 'd') {
        e.preventDefault()
        if (selectedNodeIds.length === 1) {
          const duplicated = duplicateNode(selectedNodeIds[0])
          if (duplicated) {
            try {
              playAssetAttachSound()
            } catch (error) {
              log.debug('Failed to play attach sound', { error })
            }
          }
        }
      }

      // ⌘F - Open node search
      if (isMod && e.key === 'f') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNodeIds, duplicateNode])

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '600px',
        position: 'relative',
        backgroundColor: flowCoreColours.matteBlack,
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodesDelete={handleNodesDelete}
        onSelectionChange={handleSelectionChange}
        fitView
        fitViewOptions={{ duration: prefersReducedMotion ? 0 : 240, padding: 0.2 }}
        minZoom={0.25}
        maxZoom={1.6}
        proOptions={{ hideAttribution: true }}
        style={{ background: flowCoreColours.matteBlack }}
      >
        <MiniMap
          style={{ background: flowCoreColours.overlaySoft }}
          nodeStrokeColor={() => flowCoreColours.slateCyan}
          nodeColor={() => flowCoreColours.slateCyan}
          pannable
        />
        <Controls
          showInteractive={false}
          style={{
            background: flowCoreColours.overlayStrong,
            border: `1px solid ${flowCoreColours.borderGrey}`,
            color: flowCoreColours.textSecondary,
          }}
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color={flowCoreColours.overlayAccent}
        />
      </ReactFlow>

      {children}

      {isHydrating && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            backgroundColor: flowCoreColours.overlayStrong,
            color: flowCoreColours.textSecondary,
            fontSize: '13px',
            fontFamily: 'var(--flowcore-font-mono)',
            textTransform: 'lowercase',
          }}
        >
          loading canvas...
        </div>
      )}

      {lastSavedAt && (
        <div
          style={{
            position: 'absolute',
            right: '16px',
            bottom: '16px',
            fontSize: '11px',
            color: flowCoreColours.textTertiary,
            backgroundColor: flowCoreColours.overlayStrong,
            padding: '6px 10px',
            borderRadius: '999px',
            border: `1px solid ${flowCoreColours.borderGrey}`,
            fontFamily: 'var(--flowcore-font-mono)',
            textTransform: 'lowercase',
          }}
        >
          auto-saved {new Date(lastSavedAt).toLocaleTimeString()}
        </div>
      )}

      {/* Node Search Modal (⌘F) */}
      <NodeSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Agent Debug Drawer (read-only) */}
      <AgentDebugDrawer
        nodeId={debugNodeId}
        isOpen={debugNodeId !== null}
        onClose={() => setDebugNodeId(null)}
      />
    </div>
  )
}

export function spawnFlowNode(
  kind: NodeKind,
  options: { campaignId?: string; userId?: string }
): string {
  // Only works on client-side (browser environment)
  if (typeof window === 'undefined') {
    log.warn('spawnFlowNode called during SSR, skipping', { kind })
    return ''
  }

  const id = `${kind}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
  const positionOffset = (spawnOffset++ % 8) * 32

  const node: Node<FlowNodeData> = {
    id,
    type: 'flow-node',
    position: {
      x: 240 + positionOffset,
      y: 160 + positionOffset,
    },
    data: {
      kind,
      campaignId: options.campaignId,
      userId: options.userId,
    },
  }

  // Use store factory for imperative access (client-side only)
  const storeInstance = useFlowCanvasStoreFactory()
  storeInstance.getState().addNode(node)

  try {
    playAssetAttachSound()
  } catch (error) {
    log.debug('Failed to play attach sound', { error })
  }

  return id
}
