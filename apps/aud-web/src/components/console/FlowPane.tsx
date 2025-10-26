/**
 * Flow Pane - Visual Workflow Designer for Console "Plan" Mode
 *
 * Refactored from FlowStudio.tsx to integrate seamlessly into Console layout.
 * Uses Slate Cyan colour palette and minimal, professional aesthetic.
 *
 * Phase 1: Core workflow canvas with Slate Cyan theme
 */

'use client'

import { useCallback, useState, useRef, useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
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
import { motion, AnimatePresence } from 'framer-motion'
import { FlowNode } from '../features/flow/FlowNode'
import { useConsoleStore } from '@aud-web/stores/consoleStore'
import { supabase } from '@aud-web/lib/supabaseClient'
import { Save, Play } from 'lucide-react'

const nodeTypes: NodeTypes = {
  research: FlowNode,
  score: FlowNode,
  pitch: FlowNode,
  'follow-up': FlowNode,
  custom: FlowNode,
}

// Initial nodes for demo
const initialNodes: Node[] = [
  {
    id: 'start',
    type: 'research',
    position: { x: 250, y: 100 },
    data: {
      label: 'Research',
      skillName: 'research-contacts',
      status: 'pending',
    },
  },
]

const initialEdges: Edge[] = []

// Skill types for node palette
const skillTypes = [
  { id: 'research', label: 'Research', description: 'Find contacts and opportunities' },
  { id: 'score', label: 'Score', description: 'Analyse and prioritise contacts' },
  { id: 'pitch', label: 'Pitch', description: 'Generate personalised outreach' },
  { id: 'follow-up', label: 'Follow-up', description: 'Track responses and next steps' },
  { id: 'custom', label: 'Custom', description: 'Build your own action' },
]

export function FlowPane() {
  const { activeCampaignId, setWorkflowNodes, setWorkflowEdges } = useConsoleStore()
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('unsaved')
  const [isExecuting, setIsExecuting] = useState(false)

  // Load workflow from database on mount
  useEffect(() => {
    const loadWorkflow = async () => {
      if (!activeCampaignId) return

      const { data, error } = await supabase
        .from('campaign_workflows')
        .select('nodes, edges')
        .eq('campaign_id', activeCampaignId)
        .maybeSingle()

      if (error) {
        console.error('Failed to load workflow:', error)
        return
      }

      if (data) {
        setNodes(data.nodes || initialNodes)
        setEdges(data.edges || initialEdges)
        setSaveStatus('saved')
      }
    }

    loadWorkflow()
  }, [activeCampaignId, setNodes, setEdges])

  // Auto-save workflow on changes (debounced)
  useEffect(() => {
    if (!activeCampaignId) return
    if (nodes.length === 0) return

    const saveTimer = setTimeout(async () => {
      await saveWorkflow()
    }, 2000) // Debounce 2 seconds

    return () => clearTimeout(saveTimer)
  }, [nodes, edges, activeCampaignId])

  // Save workflow to database
  const saveWorkflow = async () => {
    if (!activeCampaignId) return
    if (isSaving) return

    setIsSaving(true)
    setSaveStatus('saving')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('campaign_workflows')
        .upsert({
          campaign_id: activeCampaignId,
          user_id: user.id,
          nodes: nodes as any,
          edges: edges as any,
          name: 'Campaign Workflow',
        })

      if (error) throw error

      // Sync with store
      setWorkflowNodes(nodes as any)
      setWorkflowEdges(edges)
      setSaveStatus('saved')
    } catch (error) {
      console.error('Failed to save workflow:', error)
      setSaveStatus('unsaved')
    } finally {
      setIsSaving(false)
    }
  }

  // Execute workflow
  const executeWorkflow = async () => {
    setIsExecuting(true)

    // Find start node (first node)
    const startNode = nodes[0]
    if (!startNode) {
      alert('Add at least one node to execute')
      setIsExecuting(false)
      return
    }

    // TODO: Implement agent execution
    // For now, just update node status to running
    setNodes((nds) =>
      nds.map((node, idx) => ({
        ...node,
        data: {
          ...node.data,
          status: idx === 0 ? 'running' : 'pending',
        },
      }))
    )

    // Simulate execution completion after 3 seconds
    setTimeout(() => {
      setNodes((nds) =>
        nds.map((node, idx) => ({
          ...node,
          data: {
            ...node.data,
            status: idx === 0 ? 'completed' : 'pending',
          },
        }))
      )
      setIsExecuting(false)
    }, 3000)
  }

  // Handle connections
  const onConnect = useCallback(
    (params: Connection | Edge) => {
      setEdges((eds) => addEdge({ ...params, animated: true }, eds))
    },
    [setEdges]
  )

  // Add node on canvas click when skill selected
  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (!selectedSkill || !reactFlowInstance.current) return

      const skill = skillTypes.find((s) => s.id === selectedSkill)
      if (!skill) return

      // Convert screen coordinates to canvas space
      const position = reactFlowInstance.current.project({
        x: event.clientX,
        y: event.clientY,
      })

      const nodeId = `${selectedSkill}-${Date.now()}`
      const newNode: Node = {
        id: nodeId,
        type: selectedSkill,
        position,
        data: {
          label: skill.label,
          skillName: selectedSkill,
          status: 'pending',
        },
      }

      setNodes((nds) => [...nds, newNode])
      setSelectedSkill(null)
    },
    [selectedSkill, setNodes]
  )

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        background: 'var(--bg)',
        position: 'relative',
      }}
    >
      {/* Context Header */}
      <div
        style={{
          position: 'absolute',
          top: 'var(--space-4)',
          left: 'var(--space-4)',
          right: 'var(--space-4)',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-geist)',
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-1)',
            }}
          >
            Workflow Designer
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-2)',
            }}
          >
            Visualise how your agents collaborate in real-time
          </p>
          <hr
            style={{
              border: 'none',
              borderTop: `1px solid var(--accent)`,
              opacity: 0.3,
            }}
          />
        </motion.div>
      </div>

      {/* Toolbar - Save & Execute */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        style={{
          position: 'absolute',
          top: 'var(--space-4)',
          right: 'var(--space-4)',
          zIndex: 10,
          display: 'flex',
          gap: 'var(--space-2)',
          pointerEvents: 'auto',
        }}
      >
        {/* Save Status Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'centre',
            gap: '6px',
            padding: '6px 12px',
            background: 'var(--surface)',
            border: `1px solid var(--border)`,
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background:
                saveStatus === 'saved'
                  ? 'var(--success)'
                  : saveStatus === 'saving'
                    ? 'var(--accent)'
                    : 'var(--warning)',
            }}
          />
          {saveStatus === 'saved' && 'Saved'}
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'unsaved' && 'Unsaved'}
        </div>

        {/* Manual Save Button */}
        <button
          onClick={saveWorkflow}
          disabled={isSaving || saveStatus === 'saved'}
          style={{
            padding: '6px 12px',
            background: saveStatus === 'saved' ? 'var(--surface)' : 'transparent',
            color: saveStatus === 'saved' ? 'var(--text-secondary)' : 'var(--accent)',
            border: `1px solid ${saveStatus === 'saved' ? 'var(--border)' : 'var(--accent)'}`,
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: 500,
            fontFamily: 'var(--font-inter)',
            cursor: saveStatus === 'saved' ? 'default' : 'pointer',
            transition: 'all var(--motion-fast)',
            display: 'flex',
            alignItems: 'centre',
            gap: '6px',
            opacity: saveStatus === 'saved' ? 0.5 : 1,
          }}
        >
          <Save size={14} />
          Save
        </button>

        {/* Run Workflow Button */}
        <button
          onClick={executeWorkflow}
          disabled={isExecuting || nodes.length === 0}
          style={{
            padding: '6px 12px',
            background: isExecuting ? 'var(--surface)' : 'var(--accent)',
            color: isExecuting ? 'var(--text-secondary)' : '#000',
            border: `1px solid ${isExecuting ? 'var(--border)' : 'var(--accent)'}`,
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: 'var(--font-inter)',
            cursor: isExecuting || nodes.length === 0 ? 'default' : 'pointer',
            transition: 'all var(--motion-fast)',
            display: 'flex',
            alignItems: 'centre',
            gap: '6px',
            boxShadow: isExecuting ? 'none' : 'var(--button-inner-glow)',
            opacity: nodes.length === 0 ? 0.5 : 1,
          }}
        >
          <Play size={14} />
          {isExecuting ? 'Running...' : 'Run Workflow'}
        </button>
      </motion.div>

      {/* Skills Palette */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          top: '140px',
          left: 'var(--space-4)',
          zIndex: 10,
          background: 'var(--surface)',
          border: `1px solid var(--border)`,
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3)',
          minWidth: '200px',
          pointerEvents: 'auto',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-geist)',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-2)',
          }}
        >
          Actions
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {skillTypes.map((skill) => (
            <button
              key={skill.id}
              onClick={() => setSelectedSkill(skill.id)}
              style={{
                padding: 'var(--space-2)',
                background: selectedSkill === skill.id ? 'var(--accent)' : 'transparent',
                color:
                  selectedSkill === skill.id ? '#000' : 'var(--text-primary)',
                border: `1px solid ${selectedSkill === skill.id ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: 500,
                fontFamily: 'var(--font-inter)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all var(--motion-fast)',
                boxShadow: selectedSkill === skill.id ? 'var(--button-inner-glow)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (selectedSkill !== skill.id) {
                  e.currentTarget.style.borderColor = 'var(--accent-alt)'
                  e.currentTarget.style.background = 'rgba(111, 200, 181, 0.05)'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedSkill !== skill.id) {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '2px' }}>{skill.label}</div>
              <div
                style={{
                  fontSize: '11px',
                  color: selectedSkill === skill.id ? '#000' : 'var(--text-secondary)',
                  opacity: 0.8,
                }}
              >
                {skill.description}
              </div>
            </button>
          ))}
        </div>
        {selectedSkill && (
          <p
            style={{
              marginTop: 'var(--space-2)',
              fontSize: '11px',
              color: 'var(--accent)',
              fontStyle: 'italic',
            }}
          >
            Click on canvas to add
          </p>
        )}
      </motion.div>

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
        className="flow-pane-canvas"
        style={{
          background: 'var(--bg)',
        }}
      >
        <Controls
          style={{
            button: {
              background: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            },
          }}
        />
        <MiniMap
          nodeColor={(node) => {
            if (node.data?.status === 'completed') return 'var(--success)'
            if (node.data?.status === 'running') return 'var(--accent)'
            if (node.data?.status === 'failed') return 'var(--error)'
            return 'var(--text-secondary)'
          }}
          style={{
            background: 'var(--surface)',
            border: `1px solid var(--border)`,
          }}
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="rgba(58, 169, 190, 0.1)"
          style={{
            background: 'var(--bg)',
          }}
        />

        {/* Legend Panel */}
        <Panel
          position="bottom-right"
          style={{
            background: 'var(--surface)',
            border: `1px solid var(--border)`,
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-2)',
            fontSize: '11px',
            fontFamily: 'var(--font-inter)',
          }}
        >
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'centre' }}>
            <div style={{ display: 'flex', alignItems: 'centre', gap: '4px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--text-secondary)',
                }}
              />
              <span style={{ color: 'var(--text-secondary)' }}>Pending</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'centre', gap: '4px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--accent)',
                }}
              />
              <span style={{ color: 'var(--text-secondary)' }}>Running</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'centre', gap: '4px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--success)',
                }}
              />
              <span style={{ color: 'var(--text-secondary)' }}>Completed</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'centre', gap: '4px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--error)',
                }}
              />
              <span style={{ color: 'var(--text-secondary)' }}>Failed</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}
