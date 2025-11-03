/**
 * Agent UI Test Page
 * Phase 15.2-D: Full Agent UI Integration
 *
 * Purpose:
 * - Dev page to test all three agent nodes
 * - PitchAgentNode, IntelAgentNode, TrackerAgentNode
 * - Visual QA and interaction testing
 *
 * Route: /dev/agents-ui
 */

'use client'

import { useState } from 'react'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'
import { PitchAgentNode } from '@/components/agents/PitchAgentNode'
import { IntelAgentNode } from '@/components/agents/IntelAgentNode'
import { TrackerAgentNode } from '@/components/agents/TrackerAgentNode'

type AgentTab = 'pitch' | 'intel' | 'tracker'

export default function AgentsUITestPage() {
  const [activeTab, setActiveTab] = useState<AgentTab>('pitch')

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: flowCoreColours.matteBlack,
        color: flowCoreColours.textPrimary,
        padding: '40px 24px',
        fontFamily:
          'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
      }}
    >
      {/* Header */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto 40px',
        }}
      >
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: flowCoreColours.iceCyan,
            marginBottom: '8px',
          }}
        >
          Agent UI Integration Test
        </h1>
        <p
          style={{
            fontSize: '14px',
            color: flowCoreColours.textSecondary,
            marginBottom: '24px',
          }}
        >
          Phase 15.2-D — Testing PitchAgentNode, IntelAgentNode, and TrackerAgentNode
        </p>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: `1px solid ${flowCoreColours.borderGrey}`,
          }}
        >
          {(['pitch', 'intel', 'tracker'] as AgentTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 24px',
                backgroundColor: activeTab === tab ? flowCoreColours.darkGrey : 'transparent',
                border: 'none',
                borderBottom:
                  activeTab === tab
                    ? `2px solid ${flowCoreColours.slateCyan}`
                    : '2px solid transparent',
                color: activeTab === tab ? flowCoreColours.iceCyan : flowCoreColours.textSecondary,
                fontSize: '14px',
                fontWeight: activeTab === tab ? 600 : 500,
                cursor: 'pointer',
                textTransform: 'lowercase',
                transition: 'all 0.24s ease',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.color = flowCoreColours.textPrimary
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.color = flowCoreColours.textSecondary
                }
              }}
            >
              {tab} agent
            </button>
          ))}
        </div>
      </div>

      {/* Agent Content */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {activeTab === 'pitch' && (
          <div>
            <div
              style={{
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: `${flowCoreColours.slateCyan}10`,
                border: `1px solid ${flowCoreColours.slateCyan}40`,
                borderRadius: '8px',
                fontSize: '13px',
                color: flowCoreColours.textSecondary,
              }}
            >
              <strong style={{ color: flowCoreColours.slateCyan }}>Test Instructions:</strong>
              <br />
              1. Enter a goal (e.g., "Get radio play on BBC Radio 1")
              <br />
              2. Click "attach assets" to open asset modal
              <br />
              3. Select up to 8 assets (max enforcement test)
              <br />
              4. Test privacy filtering (select private assets and check console)
              <br />
              5. Click "generate pitch" to test API integration
              <br />
              6. Verify sound feedback on attach/detach
            </div>
            <PitchAgentNode
              campaignId="test-campaign-123"
              userId="test-user-456"
              initialGoal="Get radio play on BBC Radio 1"
              onPitchGenerated={(pitch) => {
                console.log('✅ Pitch generated:', pitch)
              }}
            />
          </div>
        )}

        {activeTab === 'intel' && (
          <div>
            <div
              style={{
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: `${flowCoreColours.slateCyan}10`,
                border: `1px solid ${flowCoreColours.slateCyan}40`,
                borderRadius: '8px',
                fontSize: '13px',
                color: flowCoreColours.textSecondary,
              }}
            >
              <strong style={{ color: flowCoreColours.slateCyan }}>Test Instructions:</strong>
              <br />
              1. Enter a research query (e.g., "Fred again..")
              <br />
              2. Check that document assets auto-load
              <br />
              3. Verify all docs are auto-selected by default
              <br />
              4. Toggle document selection (checkboxes)
              <br />
              5. Click "run intel" to test enrichment
              <br />
              6. Verify telemetry events in console
            </div>
            <IntelAgentNode
              campaignId="test-campaign-123"
              userId="test-user-456"
              query="Fred again.."
              onIntelGenerated={(research, assets) => {
                console.log('✅ Intel generated:', research)
                console.log('✅ Assets used:', assets)
              }}
            />
          </div>
        )}

        {activeTab === 'tracker' && (
          <div>
            <div
              style={{
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: `${flowCoreColours.slateCyan}10`,
                border: `1px solid ${flowCoreColours.slateCyan}40`,
                borderRadius: '8px',
                fontSize: '13px',
                color: flowCoreColours.textSecondary,
              }}
            >
              <strong style={{ color: flowCoreColours.slateCyan }}>Test Instructions:</strong>
              <br />
              1. Check that outreach logs load (mock data)
              <br />
              2. Verify table displays contact, message, asset icon, sent date, status
              <br />
              3. Click asset icon (🎵📄📦) to open AssetViewModal
              <br />
              4. Test modal keyboard navigation (Esc to close)
              <br />
              5. Verify telemetry event on asset view
              <br />
              6. Click "refresh" to reload logs
            </div>
            <TrackerAgentNode campaignId="test-campaign-123" userId="test-user-456" />
          </div>
        )}
      </div>

      {/* Debug Console */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '40px auto 0',
          padding: '16px',
          backgroundColor: flowCoreColours.darkGrey,
          border: `1px solid ${flowCoreColours.borderGrey}`,
          borderRadius: '8px',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: flowCoreColours.slateCyan,
            marginBottom: '12px',
            textTransform: 'lowercase',
          }}
        >
          debug console
        </div>
        <div
          style={{
            fontSize: '11px',
            color: flowCoreColours.textTertiary,
            lineHeight: 1.6,
          }}
        >
          Open browser DevTools console (F12) to view:
          <br />• Telemetry events (asset_attach_to_pitch, asset_used_for_intel,
          asset_view_from_tracker)
          <br />• API request/response logs
          <br />• Sound feedback triggers
          <br />• Component state changes
        </div>
      </div>

      {/* Feature Checklist */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '24px auto 0',
          padding: '24px',
          backgroundColor: flowCoreColours.darkGrey,
          border: `1px solid ${flowCoreColours.borderGrey}`,
          borderRadius: '8px',
        }}
      >
        <div
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: flowCoreColours.iceCyan,
            marginBottom: '16px',
          }}
        >
          Phase 15.2-D Feature Checklist
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px',
            fontSize: '12px',
          }}
        >
          {/* Pitch Agent */}
          <div>
            <div
              style={{
                fontWeight: 600,
                color: flowCoreColours.slateCyan,
                marginBottom: '8px',
              }}
            >
              ✅ PitchAgentNode
            </div>
            <div
              style={{
                color: flowCoreColours.textSecondary,
                lineHeight: 1.6,
              }}
            >
              • Goal + context inputs
              <br />• Asset attachment (max 8)
              <br />• Privacy filtering
              <br />• Sound feedback
              <br />• Keyboard shortcuts
              <br />• Telemetry tracking
            </div>
          </div>

          {/* Intel Agent */}
          <div>
            <div
              style={{
                fontWeight: 600,
                color: flowCoreColours.slateCyan,
                marginBottom: '8px',
              }}
            >
              ✅ IntelAgentNode
            </div>
            <div
              style={{
                color: flowCoreColours.textSecondary,
                lineHeight: 1.6,
              }}
            >
              • Research query input
              <br />• Auto-load documents
              <br />• Toggle per doc
              <br />• Auto-select all
              <br />• Document previews
              <br />• Telemetry tracking
            </div>
          </div>

          {/* Tracker Agent */}
          <div>
            <div
              style={{
                fontWeight: 600,
                color: flowCoreColours.slateCyan,
                marginBottom: '8px',
              }}
            >
              ✅ TrackerAgentNode
            </div>
            <div
              style={{
                color: flowCoreColours.textSecondary,
                lineHeight: 1.6,
              }}
            >
              • Outreach logs table
              <br />• Asset icon links
              <br />• AssetViewModal integration
              <br />• Status badges
              <br />• Refresh functionality
              <br />• Telemetry tracking
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
