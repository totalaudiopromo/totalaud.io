'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
  NodeTypes,
  ReactFlowInstance,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { motion } from 'framer-motion'
import { useFlowStore } from '@aud-web/stores/flowStore'
import { useFlowRealtime } from '@aud-web/hooks/useFlowRealtime'
import { FlowNode } from './FlowNode'
import type { FlowTemplate, AgentStatus, OSTheme } from '@total-audio/core-agent-executor/client'
import {
  useAgentExecution,
  getStatusColor,
  getAgent,
} from '@total-audio/core-agent-executor/client'
import { playAgentSound } from '@total-audio/core-theme-engine'
import { supabase } from '@aud-web/lib/supabase'
import { generateUUID } from '@aud-web/lib/uuid'
import { useUserPrefs } from '@aud-web/hooks/useUserPrefs'
import { useFlowMode } from '@aud-web/hooks/useFlowMode'
import { MissionDashboard, MissionPanel, OnboardingOverlay } from '../../layouts'
import { AmbientSoundLayer } from '../../ui'
import { useTheme } from '../../themes/ThemeResolver'
import { Layers, BarChart3 } from 'lucide-react'
import { logger } from '@total-audio/core-logger'

const log = logger.scope('FlowCanvas')

const nodeTypes: NodeTypes = {
  skill: FlowNode,
  agent: FlowNode,
  decision: FlowNode,
}

const skillNodes = [
  {
    name: 'research-contacts',
    label: 'research contacts',
    color: '#3b82f6',
  },
  {
    name: 'score-contacts',
    label: 'score contacts',
    color: '#f59e0b',
  },
  {
    name: 'generate-pitch',
    label: 'generate pitch',
    color: '#8b5cf6',
  },
]

interface FlowCanvasProps {
  initialTemplate?: FlowTemplate | null
}

export function FlowCanvas({ initialTemplate }: FlowCanvasProps) {
  const {
    nodes: storeNodes,
    edges: storeEdges,
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
    isExecuting,
  } = useFlowStore()

  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges)
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const hasInitialized = useRef(false)
  const previousStatuses = useRef<Record<string, string> & { _key?: string }>({ _key: '' })
  const [showConnectionHint, setShowConnectionHint] = useState(false)
  const [hasSeenConnectionHint, setHasSeenConnectionHint] = useState(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem('flow_seen_connection_hint') === 'true'
  })

  // Generate session ID (in production, this would come from user auth)
  const [sessionId] = useState(() => generateUUID())
  const [sessionCreated, setSessionCreated] = useState(false)

  // User preferences (view state, onboarding, accessibility)
  const { prefs, loading: prefsLoading, dismissOnboarding, updatePrefs } = useUserPrefs()
  const [currentView, setCurrentView] = useState<'flow' | 'dashboard'>('flow')

  // Theme configuration
  const { themeConfig, currentTheme } = useTheme()

  // Flow State: Focus mode (⌘F)
  const flowMode = useFlowMode()

  // Create session in database on mount (only once)
  useEffect(() => {
    let isMounted = true

    const createSession = async () => {
      if (!isMounted) return

      try {
        log.debug('Checking if session exists', { sessionId })

        // Check if session already exists
        const { data: existingSession } = await supabase
          .from('agent_sessions')
          .select('id')
          .eq('id', sessionId)
          .maybeSingle()

        if (existingSession) {
          log.debug('Session already exists, skipping creation')
          if (isMounted) {
            setSessionCreated(true)
          }
          return
        }

        log.debug('Creating new session in database', { sessionId })

        // Get current user (might be null for demo mode)
        const {
          data: { user },
        } = await supabase.auth.getUser()

        const insertData = {
          id: sessionId,
          user_id: user?.id || null,
          session_name: initialTemplate?.name || 'flow session',
          flow_template_id: initialTemplate?.id || null,
          metadata: initialTemplate
            ? {
                template_name: initialTemplate.name,
                template_description: initialTemplate.description,
              }
            : {},
        }

        log.debug('Attempting to insert session', { insertData })

        const { data, error } = await supabase.from('agent_sessions').insert(insertData).select()

        if (error) {
          // Ignore duplicate key errors (race condition on hot reload)
          if (error.code === '23505') {
            log.debug('Session already exists (race condition), continuing')
            if (isMounted) {
              setSessionCreated(true)
            }
            return
          }

          log.error('Failed to create session', error, { errorMessage: error.message })
        } else {
          log.info('Session created successfully', { sessionId: data?.[0]?.id })
          if (isMounted) {
            setSessionCreated(true)
          }
        }
      } catch (err) {
        log.error('Error creating session', err)
      }
    }

    if (!sessionCreated) {
      createSession()
    }

    return () => {
      isMounted = false
    }
  }, [sessionId, sessionCreated, initialTemplate])

  // Sync view with prefs once loaded
  useEffect(() => {
    if (prefs?.preferred_view) {
      setCurrentView(prefs.preferred_view)
    }
  }, [prefs])

  // Toggle view and persist preference
  const toggleView = useCallback(async () => {
    const newView = currentView === 'flow' ? 'dashboard' : 'flow'
    setCurrentView(newView)
    await updatePrefs({ preferred_view: newView })
  }, [currentView, updatePrefs])

  // Agent execution with real-time updates
  const {
    executeNode,
    nodeStatuses,
    updatesByNode,
    isLoading: agentLoading,
    error: agentError,
  } = useAgentExecution({
    supabaseClient: supabase,
    sessionId,
    enableRealtime: true,
  })

  // Initialize from template (only once)
  useEffect(() => {
    if (initialTemplate && !hasInitialized.current) {
      hasInitialized.current = true

      log.info('Initializing from template', { templateName: initialTemplate.name })

      // Convert template steps to ReactFlow nodes
      const templateNodes: Node[] = initialTemplate.steps.map((step) => ({
        id: step.id,
        type: step.type,
        position: step.position || { x: 100, y: 100 },
        data: {
          label: step.label,
          icon: step.icon,
          skillId: step.skillId,
          agentId: step.agentId,
          color: getColorForStepType(step.type),
        },
      }))

      // Create edges connecting nodes in sequence
      const templateEdges: Edge[] = []
      for (let i = 0; i < templateNodes.length - 1; i++) {
        templateEdges.push({
          id: `e${templateNodes[i].id}-${templateNodes[i + 1].id}`,
          source: templateNodes[i].id,
          target: templateNodes[i + 1].id,
          animated: true,
        })
      }

      setNodes(templateNodes)
      setEdges(templateEdges)

      log.debug('Generated flow nodes and edges', {
        nodeCount: templateNodes.length,
        edgeCount: templateEdges.length
      })
    }
  }, [initialTemplate, setNodes, setEdges])

  // Sync with store
  useEffect(() => {
    setStoreNodes(nodes)
  }, [nodes, setStoreNodes])

  useEffect(() => {
    setStoreEdges(edges)
  }, [edges, setStoreEdges])

  // Handle connections
  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds) => addEdge(params, eds))

      // Show connection hint tooltip on first connection
      if (!hasSeenConnectionHint && typeof window !== 'undefined') {
        setShowConnectionHint(true)
        setTimeout(() => {
          setShowConnectionHint(false)
          setHasSeenConnectionHint(true)
          localStorage.setItem('flow_seen_connection_hint', 'true')
        }, 5000) // Show for 5 seconds
      }
    },
    [setEdges, hasSeenConnectionHint]
  )

  // Add skill node on canvas click
  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (!selectedSkill || !reactFlowInstance.current) return

      const skill = skillNodes.find((s) => s.name === selectedSkill)
      if (!skill) return

      // Use React Flow's project() to convert screen coordinates to canvas space
      const position = reactFlowInstance.current.project({
        x: event.clientX,
        y: event.clientY,
      })

      const nodeId = `skill-${Date.now()}`
      const newNode: Node = {
        id: nodeId,
        type: 'skill',
        position,
        data: {
          label: skill.label,
          skillName: skill.name,
          status: 'pending',
          onExecute: () => {
            // Execute with a default agent based on skill name
            const agentName = skill.name.includes('research')
              ? 'scout'
              : skill.name.includes('score')
                ? 'tracker'
                : skill.name.includes('pitch')
                  ? 'coach'
                  : 'broker'
            executeNode(agentName, nodeId, { skillName: skill.name })
          },
        },
      }

      setNodes((nds) => [...nds, newNode])
      setSelectedSkill(null)
    },
    [selectedSkill, setNodes, executeNode]
  )

  // Real-time status updates from agent execution
  useEffect(() => {
    // Create a stable string representation for comparison
    const statusesKey = JSON.stringify(nodeStatuses)
    const previousKey = previousStatuses.current._key

    // Only update if statuses actually changed
    if (statusesKey === previousKey) {
      return
    }

    previousStatuses.current._key = statusesKey

    // Check for status changes and play sounds
    Object.entries(nodeStatuses).forEach(([nodeId, agentStatus]) => {
      const previousStatus = previousStatuses.current[nodeId]
      const currentStatus = agentStatus.status

      // Status changed - play sound cue
      if (previousStatus !== currentStatus) {
        const agent = getAgent(agentStatus.agent_name)

        if (agent) {
          // Play sound based on status transition
          if (currentStatus === 'running') {
            playAgentSound(agent.id as any, 'start')
          } else if (currentStatus === 'complete') {
            playAgentSound(agent.id as any, 'complete')
          } else if (currentStatus === 'error') {
            playAgentSound(agent.id as any, 'error')
          }
        }

        // Update previous status
        previousStatuses.current[nodeId] = currentStatus
      }
    })

    // Update node visual state
    setNodes((nds) =>
      nds
        .filter((node) => node.id && node.id.trim() !== '') // Filter out nodes with empty IDs
        .map((node) => {
          const agentStatus = nodeStatuses[node.id]
          if (agentStatus) {
            const statusColor = getStatusColor(agentStatus.status as AgentStatus)
            return {
              ...node,
              data: {
                ...node.data,
                status: agentStatus.status,
                agentName: agentStatus.agent_name,
                message: agentStatus.message,
                result: agentStatus.result,
                startedAt: agentStatus.started_at,
                completedAt: agentStatus.completed_at,
                onExecute: () => {
                  // Execute the agent for this node
                  executeNode(agentStatus.agent_name, node.id, node.data)
                },
              },
              style: {
                ...node.style,
                borderColor: statusColor,
                borderWidth: '3px',
              },
            }
          }
          // Add execute callback to nodes without status too
          return {
            ...node,
            data: {
              ...node.data,
              onExecute: () => {
                // For nodes without status, try to execute with default agent
                const agentName = node.data.agentName || node.data.skillName || 'broker'
                executeNode(agentName, node.id, node.data)
              },
            },
          }
        })
    )
  }, [nodeStatuses, setNodes, getStatusColor, executeNode])

  // Real-time status updates (legacy)
  const updateNodeStatus = useCallback(
    (nodeId: string, status: string, output?: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            const statusColors = {
              pending: '#6b7280',
              running: '#3b82f6',
              completed: '#10b981',
              failed: '#ef4444',
            }

            return {
              ...node,
              data: {
                ...node.data,
                status,
                output,
              },
              style: {
                ...node.style,
                borderColor: statusColors[status as keyof typeof statusColors] || '#6b7280',
                borderWidth: '3px',
              },
            }
          }
          return node
        })
      )
    },
    [setNodes]
  )

  // Enable real-time updates (legacy)
  useFlowRealtime(updateNodeStatus)

  // Show onboarding overlay if needed
  if (prefs?.show_onboarding_overlay && !prefsLoading) {
    return (
      <OnboardingOverlay
        theme={currentTheme}
        onDismiss={dismissOnboarding}
        reducedMotion={prefs.reduced_motion}
      />
    )
  }

  return (
    <div className="relative h-full w-full flex flow-studio-wrapper">
      {/* Main Content Area */}
      <div className="flex-1 relative">
        {/* View Toggle Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: flowMode.headerOpacity, y: 0 }}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-slate-800/90 backdrop-blur-xl rounded-xl border border-slate-700 shadow-2xl"
        >
          <div className="flex items-center">
            <button
              onClick={() => {
                setCurrentView('flow')
                updatePrefs({ preferred_view: 'flow' })
              }}
              className={`px-4 py-2 rounded-l-xl text-sm font-mono font-semibold flex items-center gap-2 transition-all ${
                currentView === 'flow'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              Flow View
            </button>
            <button
              onClick={() => {
                setCurrentView('dashboard')
                updatePrefs({ preferred_view: 'dashboard' })
              }}
              className={`px-4 py-2 rounded-r-xl text-sm font-mono font-semibold flex items-center gap-2 transition-all ${
                currentView === 'dashboard'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </button>
          </div>
        </motion.div>

        {/* Conditional View Rendering */}
        {currentView === 'dashboard' ? (
          <MissionDashboard
            sessionId={sessionId}
            campaignName="Radio Airplay Campaign"
            theme={currentTheme}
            agentStatuses={nodeStatuses}
            metrics={{}}
            onGenerateMixdown={() => log.debug('Generate mixdown action triggered')}
            onRunAgain={() => log.debug('Run again action triggered')}
            onShareReport={() => log.debug('Share report action triggered')}
            reducedMotion={prefs?.reduced_motion}
            muteSounds={prefs?.mute_sounds}
          />
        ) : (
          <>
            {/* Skill Palette */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-4 left-4 z-10 bg-slate-800/90 backdrop-blur-xl rounded-xl border border-slate-700 p-4 shadow-2xl"
            >
              <h3 className="text-sm font-bold text-white mb-3">Skills Palette</h3>
              <div className="space-y-2">
                {skillNodes.map((skill) => (
                  <button
                    key={skill.name}
                    onClick={() => setSelectedSkill(skill.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedSkill === skill.name
                        ? 'bg-blue-500 text-white ring-2 ring-blue-400'
                        : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    }`}
                  >
                    {skill.label}
                  </button>
                ))}
              </div>
              {selectedSkill && (
                <p className="mt-3 text-xs text-slate-400">Click on canvas to add</p>
              )}
            </motion.div>

            {/* Agent Execution Status */}
            {agentError && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-4 right-4 z-10 bg-red-500/90 backdrop-blur-xl rounded-xl border border-red-400 px-4 py-2 shadow-2xl"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    ⚠️ Agent Error: {agentError.message}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Execution Status */}
            {(isExecuting || agentLoading) && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-4 right-4 z-10 bg-blue-500/90 backdrop-blur-xl rounded-xl border border-blue-400 px-4 py-2 shadow-2xl"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-white">
                    {agentLoading ? 'Loading agents...' : 'Executing workflow...'}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Agent Activity Monitor (dev tool) */}
            {Object.keys(nodeStatuses).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-20 left-4 z-10 bg-slate-800/90 backdrop-blur-xl rounded-xl border border-slate-700 p-4 shadow-2xl max-w-sm"
              >
                <h3 className="text-sm font-bold text-white mb-2">Agent Activity</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {Object.entries(nodeStatuses).map(([nodeId, activity]) => (
                    <div key={nodeId} className="text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: getStatusColor(activity.status as AgentStatus),
                          }}
                        />
                        <span className="font-medium">{activity.agent_name}</span>
                        <span className="text-slate-500">→</span>
                        <span className="truncate">{nodeId}</span>
                      </div>
                      {activity.message && (
                        <div className="ml-4 text-slate-400 truncate">{activity.message}</div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* React Flow Canvas */}
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onPaneClick={onPaneClick}
              onInit={(instance) => {
                reactFlowInstance.current = instance
              }}
              nodeTypes={nodeTypes}
              fitView
              className="flow-studio-canvas"
            >
              <Controls className="bg-slate-800 border-slate-700" />
              <MiniMap
                nodeColor={(node) => {
                  if (node.data.status === 'completed') return '#10b981'
                  if (node.data.status === 'running') return '#3b82f6'
                  if (node.data.status === 'failed') return '#ef4444'
                  return '#6b7280'
                }}
                className="bg-slate-800 border-slate-700"
              />
              <Background
                variant={BackgroundVariant.Dots}
                gap={16}
                size={themeConfig.id === 'ascii' ? 2 : 1}
                color={`${themeConfig.colors.border}40`}
                style={{
                  animation:
                    themeConfig.ambient.gridMotion !== 'none'
                      ? `grid-${themeConfig.ambient.gridMotion} ${themeConfig.ambient.gridSpeed}s ease-in-out infinite`
                      : 'none',
                }}
              />

              {/* Legend Panel */}
              <Panel
                position="bottom-right"
                className="bg-slate-800/90 backdrop-blur-xl rounded-lg border border-slate-700 p-3"
              >
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gray-500" />
                    <span className="text-slate-300">Pending</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-slate-300">Running</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-slate-300">Completed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-slate-300">Failed</span>
                  </div>
                </div>
              </Panel>

              {/* Connection Hint Tooltip (shows on first connection) */}
              {showConnectionHint && (
                <Panel position="top-center">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="bg-indigo-500 text-white px-4 py-3 rounded-lg shadow-2xl max-w-md"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">✓</span>
                      <div>
                        <div className="font-semibold text-sm mb-1">
                          Great! You've connected your first action
                        </div>
                        <div className="text-xs text-indigo-100">
                          Drag from a + port to another node to link actions together. Build complex
                          workflows by chaining multiple steps.
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Panel>
              )}
            </ReactFlow>
          </>
        )}
      </div>

      {/* Ambient Sound Layer */}
      <AmbientSoundLayer volume={flowMode.ambientVolume} />

      {/* Mission Panel (right sidebar) */}
      <MissionPanel
        campaignName="Radio Airplay Campaign"
        agentStatuses={nodeStatuses}
        view={currentView}
        onToggleView={toggleView}
        reducedMotion={prefs?.reduced_motion}
        opacity={flowMode.sidebarOpacity}
      />
    </div>
  )
}

/**
 * Get color for step type
 */
function getColorForStepType(type: string): string {
  switch (type) {
    case 'skill':
      return '#3b82f6' // Blue
    case 'agent':
      return '#10b981' // Green
    case 'decision':
      return '#f59e0b' // Orange
    default:
      return '#8b5cf6' // Purple
  }
}
