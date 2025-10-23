/**
 * XP Studio
 *
 * Metaphor: Guided Assistant
 * Layout: Step-by-step wizard cards
 * Interaction: Clicking through friendly prompts
 * Node Visibility: Hidden by default (advanced toggle available)
 *
 * The XP Studio is for users who want guidance and approachability.
 * Friendly, nostalgic, and reassuring like Windows XP wizards.
 *
 * Phase 6: OS Studio Refactor
 */

'use client'

import { useState } from 'react'
import { BaseWorkflow, type WorkflowState, type WorkflowActions } from '../BaseWorkflow'
import { AmbientSound } from '../Ambient/AmbientSound'
import { Confetti } from '../Confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Sparkles, CheckCircle2, Settings } from 'lucide-react'
import type { FlowTemplate } from '@total-audio/core-agent-executor/client'
import ReactFlow, { Background, BackgroundVariant } from 'reactflow'

interface XPStudioProps {
  initialTemplate?: FlowTemplate | null
}

type WizardStep = 'welcome' | 'configure' | 'review' | 'execute' | 'complete'

export function XPStudio({ initialTemplate }: XPStudioProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [campaignName, setCampaignName] = useState('')
  const [campaignGoal, setCampaignGoal] = useState('')

  const steps: WizardStep[] = ['welcome', 'configure', 'review', 'execute', 'complete']
  const currentStepIndex = steps.indexOf(currentStep)

  const nextStep = () => {
    const nextIndex = Math.min(currentStepIndex + 1, steps.length - 1)
    setCurrentStep(steps[nextIndex])
  }

  const prevStep = () => {
    const prevIndex = Math.max(currentStepIndex - 1, 0)
    setCurrentStep(steps[prevIndex])
  }

  return (
    <BaseWorkflow initialTemplate={initialTemplate}>
      {(state: WorkflowState, actions: WorkflowActions) => (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
          {/* Ambient sound */}
          <AmbientSound type="theme-ambient" theme="xp" autoPlay />

          {/* Header */}
          <header className="bg-white border-b border-blue-200 shadow-sm">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-800">Campaign Wizard</h1>
                  <p className="text-xs text-gray-500">Let's make your music heard!</p>
                </div>
              </div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Settings className="w-4 h-4" />
                {showAdvanced ? 'Hide' : 'Show'} Advanced
              </button>
            </div>
          </header>

          <div className="container mx-auto px-6 py-8">
            {/* Progress Bar */}
            <div className="max-w-3xl mx-auto mb-8">
              <div className="flex items-center justify-between mb-2">
                {steps.map((step, index) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                        index <= currentStepIndex
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {index < currentStepIndex ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-1 w-24 mx-2 transition-all ${
                          index < currentStepIndex ? 'bg-blue-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center text-sm text-gray-500 capitalize">
                Step {currentStepIndex + 1} of {steps.length}: {currentStep}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-3xl mx-auto">
              <AnimatePresence mode="wait">
                {/* Welcome Step */}
                {currentStep === 'welcome' && (
                  <motion.div
                    key="welcome"
                    initial={{ opacity: 0, y: 40, rotateX: -15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -40, rotateX: 15, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
                    className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100"
                  >
                    <div className="text-center space-y-6">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center">
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-800">
                        Welcome to your Campaign Wizard!
                      </h2>
                      <p className="text-gray-600 max-w-xl mx-auto">
                        We'll guide you through creating a professional music marketing campaign,
                        step by step. No technical knowledge required!
                      </p>
                      <div className="grid grid-cols-3 gap-4 pt-6">
                        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                          <div className="text-2xl mb-2">🎯</div>
                          <div className="text-sm font-medium text-gray-700">Set Goals</div>
                        </div>
                        <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                          <div className="text-2xl mb-2">🤖</div>
                          <div className="text-sm font-medium text-gray-700">AI Agents</div>
                        </div>
                        <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                          <div className="text-2xl mb-2">📊</div>
                          <div className="text-sm font-medium text-gray-700">Track Results</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Configure Step */}
                {currentStep === 'configure' && (
                  <motion.div
                    key="configure"
                    initial={{ opacity: 0, y: 40, rotateX: -15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -40, rotateX: 15, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
                    className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                      Tell us about your campaign
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Campaign Name
                        </label>
                        <input
                          type="text"
                          value={campaignName}
                          onChange={(e) => setCampaignName(e.target.value)}
                          placeholder="e.g., Summer Single Release"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          What's your goal?
                        </label>
                        <select
                          value={campaignGoal}
                          onChange={(e) => setCampaignGoal(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        >
                          <option value="">Select a goal...</option>
                          <option value="radio">Get Radio Airplay</option>
                          <option value="playlist">Playlist Placement</option>
                          <option value="press">Media Coverage</option>
                          <option value="streaming">Boost Streaming</option>
                        </select>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-gray-700">
                            <strong className="font-medium">Tip:</strong> Our AI agents will
                            automatically configure the best workflow based on your goal!
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Review Step */}
                {currentStep === 'review' && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, y: 40, rotateX: -15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -40, rotateX: 15, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
                    className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Review your campaign</h2>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="text-sm text-gray-500 mb-1">Campaign Name</div>
                        <div className="font-medium text-gray-800">{campaignName || 'Not set'}</div>
                      </div>
                      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="text-sm text-gray-500 mb-1">Goal</div>
                        <div className="font-medium text-gray-800">{campaignGoal || 'Not set'}</div>
                      </div>
                      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="text-sm text-gray-500 mb-1">Agents Configured</div>
                        <div className="font-medium text-gray-800">{state.nodes.length} agents</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Execute Step */}
                {currentStep === 'execute' && (
                  <motion.div
                    key="execute"
                    initial={{ opacity: 0, y: 40, rotateX: -15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -40, rotateX: 15, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
                    className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                      {state.isExecuting ? 'Campaign Running...' : 'Ready to Launch'}
                    </h2>
                    {state.isExecuting ? (
                      <div className="space-y-4">
                        <div className="text-center py-8">
                          <div className="w-16 h-16 mx-auto mb-4 relative">
                            <div className="absolute inset-0 border-4 border-blue-200 rounded-full" />
                            <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
                          </div>
                          <p className="text-gray-600">AI agents are working on your campaign...</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                          {state.executionLogs.map((log, i) => (
                            <div key={i} className="text-sm text-gray-600 mb-1">
                              {log}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-6">
                        <p className="text-gray-600">
                          Everything looks good! Click the button below to start your campaign.
                        </p>
                        <button
                          onClick={() => {
                            actions.executeFlow()
                            setTimeout(() => nextStep(), 2000)
                          }}
                          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-green-600 transition-all shadow-lg hover:shadow-xl"
                        >
                          Launch Campaign 🚀
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Complete Step */}
                {currentStep === 'complete' && (
                  <>
                    <Confetti active={true} count={60} duration={4000} />
                    <motion.div
                      key="complete"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-2xl shadow-lg p-8 border border-green-100"
                    >
                      <div className="text-center space-y-6">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center">
                          <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800">All Done!</h2>
                        <p className="text-gray-600 max-w-xl mx-auto">
                          Your campaign is now running. We'll notify you as agents complete their
                          tasks and discover opportunities.
                        </p>
                        <button
                          onClick={() => setCurrentStep('welcome')}
                          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Start Another Campaign
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              {currentStep !== 'complete' && (
                <div className="flex items-center justify-between mt-8">
                  <button
                    onClick={prevStep}
                    disabled={currentStepIndex === 0}
                    className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    disabled={currentStepIndex === steps.length - 1}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Advanced View (Flow Canvas) */}
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-8 overflow-hidden"
                  >
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Advanced: Workflow View
                      </h3>
                      <div className="h-96 border border-gray-200 rounded-lg overflow-hidden">
                        <ReactFlow
                          nodes={state.nodes}
                          edges={state.edges}
                          onNodesChange={actions.onNodesChange}
                          onEdgesChange={actions.onEdgesChange}
                          onConnect={actions.onConnect}
                          fitView
                        >
                          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
                        </ReactFlow>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </BaseWorkflow>
  )
}
