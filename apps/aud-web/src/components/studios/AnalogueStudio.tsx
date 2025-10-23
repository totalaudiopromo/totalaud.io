/**
 * Analogue Studio
 *
 * Metaphor: Journal
 * Layout: Scrollable writing surface
 * Interaction: Writing and reflection
 * Node Visibility: Hidden by default ("Insight View" reveals nodes)
 *
 * The Analogue Studio is for human hands and warm reflection.
 * Everything feels tactile, handwritten, and lo-fi.
 *
 * Phase 6: OS Studio Refactor
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { BaseWorkflow, type WorkflowState, type WorkflowActions } from '../layouts/BaseWorkflow'
import { AmbientSound } from '../ui/ambient/AmbientSound'
import { WarmParallaxLighting } from '../ui/effects/WarmParallaxLighting'
import { motion, AnimatePresence } from 'framer-motion'
import { PenTool, Eye, EyeOff, Book, Lightbulb, Send } from 'lucide-react'
import type { FlowTemplate } from '@total-audio/core-agent-executor/client'
import ReactFlow, { Background, BackgroundVariant } from 'reactflow'

interface AnalogueStudioProps {
  initialTemplate?: FlowTemplate | null
}

interface JournalEntry {
  id: string
  timestamp: Date
  text: string
  author: 'user' | 'agent'
}

export function AnalogueStudio({ initialTemplate }: AnalogueStudioProps) {
  const [showInsightView, setShowInsightView] = useState(false)
  const [journalText, setJournalText] = useState('')
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: '1',
      timestamp: new Date(),
      text: 'Welcome to your creative journal. This is a space for reflection, planning, and conversation with your AI agents.',
      author: 'agent',
    },
  ])
  const journalRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when new entries added
  useEffect(() => {
    if (journalRef.current) {
      journalRef.current.scrollTop = journalRef.current.scrollHeight
    }
  }, [entries])

  // Auto-focus textarea
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSubmit = (actions: WorkflowActions) => {
    if (!journalText.trim()) return

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      text: journalText,
      author: 'user',
    }

    setEntries((prev) => [...prev, newEntry])
    setJournalText('')

    // Simulate agent response
    setTimeout(() => {
      const agentResponse: JournalEntry = {
        id: (Date.now() + 1).toString(),
        timestamp: new Date(),
        text: `I understand you're thinking about: "${journalText.slice(0, 50)}${journalText.length > 50 ? '...' : ''}". Let me help you develop this idea further.`,
        author: 'agent',
      }
      setEntries((prev) => [...prev, agentResponse])
    }, 1500)
  }

  return (
    <BaseWorkflow initialTemplate={initialTemplate}>
      {(state: WorkflowState, actions: WorkflowActions) => (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-amber-50 relative">
          {/* Warm Parallax Lighting */}
          <WarmParallaxLighting intensity={0.3} speed={0.8} />

          {/* Ambient sound */}
          <AmbientSound type="theme-ambient" theme="analogue" autoPlay />

          {/* Warm Header */}
          <header className="border-b border-amber-200/60 bg-white/60 backdrop-blur-sm">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/70 to-orange-400/70 flex items-center justify-center shadow-sm">
                    <Book className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-serif font-medium text-amber-900">
                      Creative Journal
                    </h1>
                    <p className="text-sm text-amber-600">touch the signal.</p>
                  </div>
                </div>

                {/* Insight View Toggle */}
                <button
                  onClick={() => setShowInsightView(!showInsightView)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-amber-300 bg-white/70 hover:bg-amber-50 transition-all text-sm font-medium text-amber-800"
                >
                  {showInsightView ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Hide Insights
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Show Insights
                    </>
                  )}
                </button>
              </div>
            </div>
          </header>

          <div className="container mx-auto px-6 py-8 max-w-4xl">
            {/* Journal Entries */}
            <div
              ref={journalRef}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200/60 p-8 mb-6 min-h-[60vh] max-h-[60vh] overflow-y-auto"
              style={{
                backgroundImage: 'linear-gradient(to bottom, transparent 95%, #f59e0b08 100%)',
                backgroundSize: '100% 2rem',
              }}
            >
              <div className="space-y-6">
                {entries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${
                      entry.author === 'user'
                        ? 'text-amber-900 font-serif text-lg leading-relaxed'
                        : 'p-4 rounded-xl bg-amber-50/70 border border-amber-200/50 text-amber-800 italic'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {entry.author === 'agent' && (
                        <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1">
                        <p className="whitespace-pre-wrap">{entry.text}</p>
                        <div className="text-xs text-amber-500/60 mt-2">
                          {entry.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {entries.length === 1 && (
                  <div className="text-center py-12 text-amber-500/60 italic">
                    <PenTool className="w-8 h-8 mx-auto mb-3 opacity-40" />
                    <p>Start writing to begin your creative journey...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200/60 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <textarea
                    ref={textareaRef}
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.metaKey) {
                        handleSubmit(actions)
                      }
                    }}
                    placeholder="Write your thoughts, ideas, or questions here..."
                    className="w-full px-4 py-3 bg-transparent border-none outline-none resize-none font-serif text-lg text-amber-900 placeholder-amber-400/40 min-h-[120px]"
                    style={{
                      backgroundImage:
                        'linear-gradient(to bottom, transparent 95%, #f59e0b08 100%)',
                      backgroundSize: '100% 2rem',
                    }}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-amber-500/60">⌘ + Enter to submit</div>
                    <div className="text-xs text-amber-500/60">{journalText.length} characters</div>
                  </div>
                </div>
                <button
                  onClick={() => handleSubmit(actions)}
                  disabled={!journalText.trim()}
                  className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </div>

            {/* Insight View (Workflow Graph) */}
            <AnimatePresence>
              {showInsightView && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-8 overflow-hidden"
                >
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200/60 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-serif font-medium text-amber-900">
                        Workflow Insights
                      </h3>
                      <div className="text-sm text-amber-600">
                        {state.nodes.length} agents active
                      </div>
                    </div>

                    <div className="h-96 border border-amber-200/60 rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50/30">
                      <ReactFlow
                        nodes={state.nodes}
                        edges={state.edges}
                        onNodesChange={actions.onNodesChange}
                        onEdgesChange={actions.onEdgesChange}
                        onConnect={actions.onConnect}
                        fitView
                        defaultEdgeOptions={{
                          style: { stroke: '#f59e0b', strokeWidth: 2 },
                        }}
                      >
                        <Background
                          variant={BackgroundVariant.Dots}
                          gap={20}
                          size={1}
                          color="#f59e0b"
                          className="opacity-20"
                        />
                      </ReactFlow>
                    </div>

                    <div className="mt-4 p-4 rounded-xl bg-amber-50/50 border border-amber-200/40">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-1" />
                        <div className="text-sm text-amber-800 leading-relaxed">
                          <strong className="font-medium">Insight:</strong> This view reveals the
                          underlying workflow structure. Agents are working behind the scenes to
                          support your creative process.
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <footer className="border-t border-amber-200/60 bg-white/40 backdrop-blur-sm mt-12">
            <div className="container mx-auto px-6 py-4 text-center text-sm text-amber-600/80">
              <p className="font-serif italic">
                Every idea begins with a single thought. Keep writing.
              </p>
            </div>
          </footer>
        </div>
      )}
    </BaseWorkflow>
  )
}
