/**
 * Aqua Studio
 *
 * Metaphor: Visual Map
 * Layout: Drag canvas + connectors
 * Interaction: Dragging nodes, visual overview
 * Node Visibility: Always visible
 *
 * The Aqua Studio is for designers and visual thinkers.
 * Calm, clear, and focused on spatial relationships.
 *
 * Phase 6: OS Studio Refactor
 */

'use client'

import { useState } from 'react'
import ReactFlow, { Background, BackgroundVariant, MiniMap, Controls, Panel } from 'reactflow'
import { BaseWorkflow, type WorkflowState, type WorkflowActions } from '../layouts/BaseWorkflow'
import { AmbientSound } from '../ui/ambient/AmbientSound'
import { ParallaxBackground } from '../ui/effects/ParallaxBackground'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Layers, Sparkles, Grid3x3 } from 'lucide-react'
import type { FlowTemplate } from '@total-audio/core-agent-executor/client'

interface AquaStudioProps {
  initialTemplate?: FlowTemplate | null
}

export function AquaStudio({ initialTemplate }: AquaStudioProps) {
  const [showMinimap, setShowMinimap] = useState(true)
  const [showGrid, setShowGrid] = useState(true)

  return (
    <BaseWorkflow initialTemplate={initialTemplate}>
      {(state: WorkflowState, actions: WorkflowActions) => (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 relative">
          {/* Parallax Background */}
          <ParallaxBackground baseColor="#60a5fa" accentColor="#3b82f6" />

          {/* Ambient sound */}
          <AmbientSound type="theme-ambient" theme="aqua" autoPlay />

          {/* Glassy Header */}
          <header className="border-b border-slate-200/50 bg-white/70 backdrop-blur-xl shadow-sm">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400/80 to-cyan-400/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <Layers className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
                      Flow Canvas
                    </h1>
                    <p className="text-sm text-slate-500">craft with clarity.</p>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-sm">
                    <div
                      className={`w-2 h-2 rounded-full ${state.isExecuting ? 'bg-green-400 animate-pulse' : 'bg-slate-300'}`}
                    />
                    <span className="text-slate-600">
                      {state.isExecuting ? 'Running' : 'Ready'}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-slate-200" />
                  <div className="text-sm text-slate-600">
                    {state.nodes.length} nodes • {state.edges.length} connections
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Canvas */}
          <div className="relative h-[calc(100vh-80px)]">
            <ReactFlow
              nodes={state.nodes}
              edges={state.edges}
              onNodesChange={actions.onNodesChange}
              onEdgesChange={actions.onEdgesChange}
              onConnect={actions.onConnect}
              fitView
              className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50"
              defaultEdgeOptions={{
                animated: true,
                style: { stroke: '#60a5fa', strokeWidth: 2 },
              }}
            >
              {showGrid && (
                <Background
                  variant={BackgroundVariant.Dots}
                  gap={24}
                  size={1.5}
                  color="#cbd5e1"
                  className="opacity-40"
                />
              )}

              {showMinimap && (
                <MiniMap
                  nodeColor="#60a5fa"
                  maskColor="rgba(255, 255, 255, 0.8)"
                  className="!bg-white/80 backdrop-blur-xl !border-slate-200/50 !rounded-2xl !shadow-lg"
                  position="bottom-left"
                />
              )}

              <Controls
                className="!bg-white/80 backdrop-blur-xl !border-slate-200/50 !rounded-2xl !shadow-lg [&>button]:!border-slate-200 [&>button]:!bg-white/50 [&>button:hover]:!bg-blue-50"
                position="bottom-right"
              />

              {/* Floating Action Panel */}
              <Panel position="top-right" className="space-y-3">
                {/* Control Panel */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-lg p-4 space-y-3"
                >
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                    Controls
                  </div>

                  {/* Execute Button */}
                  <button
                    onClick={state.isExecuting ? actions.stopExecution : actions.executeFlow}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                      state.isExecuting
                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                    }`}
                  >
                    {state.isExecuting ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Execute
                      </>
                    )}
                  </button>

                  {/* Reset Button */}
                  <button
                    onClick={actions.resetFlow}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                </motion.div>

                {/* View Options */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-lg p-4 space-y-3"
                >
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                    View
                  </div>

                  {/* Toggle Minimap */}
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm text-slate-700 group-hover:text-blue-600 transition-colors">
                      Minimap
                    </span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={showMinimap}
                        onChange={(e) => setShowMinimap(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500" />
                    </div>
                  </label>

                  {/* Toggle Grid */}
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm text-slate-700 group-hover:text-blue-600 transition-colors">
                      Grid
                    </span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={showGrid}
                        onChange={(e) => setShowGrid(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500" />
                    </div>
                  </label>
                </motion.div>

                {/* Agent Status */}
                {state.nodes.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-lg p-4"
                  >
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                      Agents
                    </div>
                    <div className="space-y-2">
                      {state.nodes.slice(0, 4).map((node, i) => (
                        <div key={node.id} className="flex items-center justify-between text-sm">
                          <span className="text-slate-700 truncate">{node.data.label}</span>
                          <div
                            className={`w-2 h-2 rounded-full ${
                              state.isExecuting ? 'bg-green-400 animate-pulse' : 'bg-slate-300'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </Panel>

              {/* Welcome Message (if no nodes) */}
              {state.nodes.length === 0 && (
                <Panel position="top-center">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-lg p-6 max-w-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400/80 to-cyan-400/80 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-slate-800">Welcome to Aqua Studio</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          Start by dragging nodes onto the canvas or use the command palette (⌘K) to
                          create your workflow visually.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </Panel>
              )}
            </ReactFlow>
          </div>

          {/* Execution Log (bottom drawer) */}
          {state.executionLogs.length > 0 && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200/50 shadow-2xl"
            >
              <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-slate-700">Execution Log</div>
                  <button
                    onClick={() => actions.stopExecution()}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Clear
                  </button>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {state.executionLogs.map((log, i) => (
                    <div key={i} className="text-xs text-slate-600 font-mono">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </BaseWorkflow>
  )
}
