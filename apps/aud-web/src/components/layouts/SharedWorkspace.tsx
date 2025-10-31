/**
 * SharedWorkspace Component
 *
 * Unified workspace replacing per-Studio dashboards
 * 4 tabs: Plan | Do | Track | Learn
 * Visual lenses: ASCII | XP | Aqua | DAW | Analogue
 *
 * Shared Workspace Redesign - Stage 1
 */

'use client'

import { useWorkspaceStore } from '@aud-web/stores/workspaceStore'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Play, BarChart3, Lightbulb } from 'lucide-react'
import {
  OperatorCommandPalette,
  OperatorCommandPaletteTrigger,
  useOperatorCommandPalette,
  SoundToggle,
} from '../ui'

// Tab components (to be implemented in Stage 2)
import { PlanTab } from '../features/workspace/PlanTab'
import { DoTab } from '../features/workspace/DoTab'
import { TrackTab } from '../features/workspace/TrackTab'
import { LearnTab } from '../features/workspace/LearnTab'

export function SharedWorkspace() {
  const { activeTab, switchTab, currentLens } = useWorkspaceStore()
  const commandPalette = useOperatorCommandPalette()

  const tabs = [
    {
      id: 'plan' as const,
      name: 'Plan',
      icon: LayoutDashboard,
      component: PlanTab,
    },
    {
      id: 'do' as const,
      name: 'Do',
      icon: Play,
      component: DoTab,
    },
    {
      id: 'track' as const,
      name: 'Track',
      icon: BarChart3,
      component: TrackTab,
    },
    {
      id: 'learn' as const,
      name: 'Learn',
      icon: Lightbulb,
      component: LearnTab,
    },
  ]

  const activeTabData = tabs.find((t) => t.id === activeTab) || tabs[0]
  const ActiveTabComponent = activeTabData.component

  return (
    <div
      className="shared-workspace h-screen flex flex-col bg-background text-foreground"
      data-lens={currentLens}
    >
      {/* Tab Navigation */}
      <nav className="tab-nav border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = tab.id === activeTab

              return (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  className={`
                    tab-button
                    relative px-6 py-4 font-medium transition-colors
                    ${isActive ? 'text-accent' : 'text-muted hover:text-foreground'}
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Tab Content */}
      <main className="tab-content flex-1 overflow-auto">
        <AnimatePresence mode="sync">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <ActiveTabComponent />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Controls */}
      <OperatorCommandPalette isOpen={commandPalette.isOpen} onClose={commandPalette.close} />
      <OperatorCommandPaletteTrigger onClick={commandPalette.open} />
      <SoundToggle position="bottom-right" />
    </div>
  )
}
