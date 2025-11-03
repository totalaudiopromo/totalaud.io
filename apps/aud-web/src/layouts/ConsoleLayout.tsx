/**
 * ConsoleLayout Component
 * Phase 15.3: Connected Console & Orchestration
 *
 * Purpose:
 * - Main console layout with tabs
 * - Integrates useConsoleTabs for state management
 * - Mounts OrchestrationProvider
 * - ARIA-compliant tab navigation
 *
 * @todo: upgrade if legacy component found
 */

'use client'

import { type ReactNode } from 'react'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { useConsoleTabs, useConsoleTabKeyboard } from '@/hooks/useConsoleTabs'
import { OrchestrationProvider } from '@/contexts/OrchestrationContext'
import type { ConsoleTab } from '@/types/console'

export interface ConsoleLayoutProps {
  campaignId?: string
  userId?: string
  children?: ReactNode
  renderTabContent?: (tab: ConsoleTab) => ReactNode
  header?: ReactNode
}

export function ConsoleLayout({
  campaignId,
  userId,
  children,
  renderTabContent,
  header,
}: ConsoleLayoutProps) {
  const { tab, setTab, nextTab, prevTab, tabs } = useConsoleTabs({
    campaignId,
    defaultTab: 'plan',
    persist: true,
  })

  // Enable keyboard shortcuts
  useConsoleTabKeyboard(nextTab, prevTab, true)

  /**
   * Tab labels and descriptions
   */
  const tabConfig: Record<ConsoleTab, { label: string; description: string }> = {
    plan: { label: 'plan', description: 'Strategy and research' },
    do: { label: 'do', description: 'Execute campaigns' },
    track: { label: 'track', description: 'Monitor outcomes' },
    learn: { label: 'learn', description: 'Analyze insights' },
  }

  return (
    <OrchestrationProvider campaignId={campaignId}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          backgroundColor: flowCoreColours.matteBlack,
          color: flowCoreColours.textPrimary,
          fontFamily:
            'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
        }}
      >
        {/* Header */}
        {header && (
          <div
            style={{
              borderBottom: `1px solid ${flowCoreColours.borderGrey}`,
            }}
          >
            {header}
          </div>
        )}

        {/* Console Tabs */}
        <div
          role="tablist"
          aria-label="Console tabs"
          style={{
            display: 'flex',
            gap: '4px',
            padding: '12px 20px',
            backgroundColor: flowCoreColours.darkGrey,
            borderBottom: `1px solid ${flowCoreColours.borderGrey}`,
            overflowX: 'auto',
          }}
        >
          {tabs.map((tabKey) => {
            const isActive = tab === tabKey
            const config = tabConfig[tabKey]

            return (
              <button
                key={tabKey}
                role="tab"
                aria-selected={isActive}
                aria-controls={`console-panel-${tabKey}`}
                onClick={() => setTab(tabKey)}
                style={{
                  flex: '1',
                  minWidth: 'fit-content',
                  padding: '10px 20px',
                  backgroundColor: isActive
                    ? 'rgba(58, 169, 190, 0.15)'
                    : flowCoreColours.matteBlack,
                  border: `1px solid ${
                    isActive ? flowCoreColours.slateCyan : flowCoreColours.borderGrey
                  }`,
                  borderRadius: '6px',
                  color: isActive ? flowCoreColours.iceCyan : flowCoreColours.textSecondary,
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  textTransform: 'lowercase',
                  cursor: 'pointer',
                  transition: 'all 0.24s ease',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(58, 169, 190, 0.05)'
                    e.currentTarget.style.borderColor = flowCoreColours.slateCyan
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = flowCoreColours.matteBlack
                    e.currentTarget.style.borderColor = flowCoreColours.borderGrey
                  }
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = `2px solid ${flowCoreColours.slateCyan}`
                  e.currentTarget.style.outlineOffset = '2px'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none'
                }}
              >
                <div>{config.label}</div>
                <div
                  style={{
                    fontSize: '10px',
                    color: flowCoreColours.textTertiary,
                    marginTop: '2px',
                  }}
                >
                  {config.description}
                </div>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div
          id={`console-panel-${tab}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '20px',
          }}
        >
          {renderTabContent ? renderTabContent(tab) : children}
        </div>

        {/* Keyboard Hint */}
        <div
          style={{
            padding: '8px 20px',
            backgroundColor: flowCoreColours.darkGrey,
            borderTop: `1px solid ${flowCoreColours.borderGrey}`,
            fontSize: '11px',
            color: flowCoreColours.textTertiary,
            textAlign: 'center',
          }}
        >
          <kbd
            style={{
              padding: '2px 6px',
              backgroundColor: flowCoreColours.matteBlack,
              border: `1px solid ${flowCoreColours.borderGrey}`,
              borderRadius: '3px',
              fontFamily: 'inherit',
            }}
          >
            ⌘⌥→
          </kbd>{' '}
          next tab ·{' '}
          <kbd
            style={{
              padding: '2px 6px',
              backgroundColor: flowCoreColours.matteBlack,
              border: `1px solid ${flowCoreColours.borderGrey}`,
              borderRadius: '3px',
              fontFamily: 'inherit',
            }}
          >
            ⌘⌥←
          </kbd>{' '}
          previous tab ·{' '}
          <kbd
            style={{
              padding: '2px 6px',
              backgroundColor: flowCoreColours.matteBlack,
              border: `1px solid ${flowCoreColours.borderGrey}`,
              borderRadius: '3px',
              fontFamily: 'inherit',
            }}
          >
            ⌘K
          </kbd>{' '}
          command palette
        </div>
      </div>
    </OrchestrationProvider>
  )
}
