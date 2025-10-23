/**
 * ASCII Studio
 *
 * Metaphor: Terminal Desk
 * Layout: Command line + log stream
 * Interaction: Typing and instant feedback
 * Node Visibility: Always visible as data logs
 *
 * The ASCII Studio is for focused producers who think in text.
 * Everything is immediate, direct, and keyboard-driven.
 *
 * Phase 6: OS Studio Refactor
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import ReactFlow, { Background, BackgroundVariant, MiniMap, Controls } from 'reactflow'
import { BaseWorkflow, type WorkflowState, type WorkflowActions } from '../BaseWorkflow'
import { AmbientSound } from '../Ambient/AmbientSound'
import { CRTEffect } from '../CRTEffect'
import type { FlowTemplate } from '@total-audio/core-agent-executor/client'

interface ASCIIStudioProps {
  initialTemplate?: FlowTemplate | null
}

export function ASCIIStudio({ initialTemplate }: ASCIIStudioProps) {
  const [command, setCommand] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleCommand = (cmd: string, actions: WorkflowActions) => {
    if (!cmd.trim()) return

    setCommandHistory((prev) => [...prev, `> ${cmd}`])

    // Parse commands
    const [action, ...args] = cmd.trim().toLowerCase().split(' ')

    switch (action) {
      case 'run':
      case 'execute':
        setCommandHistory((prev) => [...prev, 'signal> executing workflow...'])
        actions.executeFlow()
        break

      case 'stop':
        setCommandHistory((prev) => [...prev, 'signal> stopping execution...'])
        actions.stopExecution()
        break

      case 'reset':
      case 'clear':
        setCommandHistory([])
        actions.resetFlow()
        break

      case 'add':
        const nodeType = args[0] || 'skill'
        actions.addNode(nodeType, { x: Math.random() * 400, y: Math.random() * 300 })
        setCommandHistory((prev) => [...prev, `signal> added ${nodeType} node`])
        break

      case 'help':
        setCommandHistory((prev) => [
          ...prev,
          'Available commands:',
          '  run/execute - Start workflow execution',
          '  stop - Stop execution',
          '  reset/clear - Clear workflow and logs',
          '  add [type] - Add new node',
          '  help - Show this help',
        ])
        break

      default:
        setCommandHistory((prev) => [...prev, `signal> unknown command: ${action}`])
    }

    setCommand('')
  }

  return (
    <BaseWorkflow initialTemplate={initialTemplate}>
      {(state: WorkflowState, actions: WorkflowActions) => (
        <div className="min-h-screen bg-black text-green-400 font-mono relative">
          {/* CRT Effect Overlay */}
          <CRTEffect scanlineOpacity={0.08} glowIntensity={0.25} />

          {/* Ambient sound */}
          <AmbientSound type="theme-ambient" theme="ascii" autoPlay />

          {/* Header */}
          <header className="border-b border-green-900 bg-black/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-green-400 text-2xl">$</span>
                <h1 className="text-xl">totalaud.io/ascii-studio</h1>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-green-600">
                  {state.isExecuting ? '[ running ]' : '[ ready ]'}
                </span>
                <span className="text-green-600">
                  nodes: {state.nodes.length} | edges: {state.edges.length}
                </span>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-4 py-6 grid grid-cols-2 gap-6 h-[calc(100vh-120px)]">
            {/* Left: Flow Canvas */}
            <div className="border border-green-900 rounded bg-black/30">
              <div className="border-b border-green-900 px-4 py-2 bg-black/50">
                <span className="text-green-400">[ workflow.graph ]</span>
              </div>
              <div className="h-[calc(100%-48px)]">
                <ReactFlow
                  nodes={state.nodes}
                  edges={state.edges}
                  onNodesChange={actions.onNodesChange}
                  onEdgesChange={actions.onEdgesChange}
                  onConnect={actions.onConnect}
                  fitView
                  className="bg-black"
                >
                  <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#0a3d0a" />
                  <MiniMap
                    nodeColor="#10b981"
                    maskColor="rgba(0, 0, 0, 0.8)"
                    className="border border-green-900"
                  />
                  <Controls className="border border-green-900" />
                </ReactFlow>
              </div>
            </div>

            {/* Right: Terminal + Logs */}
            <div className="flex flex-col gap-6">
              {/* Command Input */}
              <div className="border border-green-900 rounded bg-black/30">
                <div className="border-b border-green-900 px-4 py-2 bg-black/50">
                  <span className="text-green-400">[ command.input ]</span>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-green-600">$</span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={command}
                      onChange={(e) => setCommand(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCommand(command, actions)
                        }
                      }}
                      placeholder="type command (try 'help')..."
                      className="flex-1 bg-transparent border-none outline-none text-green-400 placeholder-green-900"
                      spellCheck={false}
                    />
                  </div>
                  <div className="text-xs text-green-900 mt-2">
                    commands: run | stop | reset | add [type] | help
                  </div>
                </div>
              </div>

              {/* Log Stream */}
              <div className="border border-green-900 rounded bg-black/30 flex-1 overflow-hidden flex flex-col">
                <div className="border-b border-green-900 px-4 py-2 bg-black/50">
                  <span className="text-green-400">[ execution.log ]</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-1 text-sm font-mono">
                  {commandHistory.length === 0 ? (
                    <div className="text-green-900">
                      signal&gt; awaiting input...
                      <br />
                      signal&gt; type 'help' for available commands
                    </div>
                  ) : (
                    commandHistory.map((log, i) => (
                      <div
                        key={i}
                        className={
                          log.startsWith('signal>')
                            ? 'text-green-600'
                            : log.startsWith('>')
                              ? 'text-green-400'
                              : 'text-green-700'
                        }
                      >
                        {log}
                      </div>
                    ))
                  )}
                  {state.executionLogs.map((log, i) => (
                    <div key={`exec-${i}`} className="text-green-600">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="border-t border-green-900 bg-black/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-2 flex items-center justify-between text-xs text-green-700">
              <div>ascii studio | type. test. repeat.</div>
              <div>session: {state.sessionId.slice(0, 8)}</div>
            </div>
          </footer>
        </div>
      )}
    </BaseWorkflow>
  )
}
