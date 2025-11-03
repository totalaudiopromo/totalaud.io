/**
 * Asset Drop System - Development Testing Page
 * Phase 15.2-A: Core Infrastructure Foundation
 *
 * Purpose:
 * - Temporary page to test Asset Drop System
 * - Full-featured upload → store → list → delete pipeline
 * - FlowCore design system integration
 *
 * Access: /dev/assets
 *
 * NOTE: This is a temporary testing page.
 * Will be integrated into main Console layout in Phase 15.2-B.
 */

'use client'

import { AssetDropZone } from '@/components/console/AssetDropZone'
import { flowCoreColours } from '@aud-web/constants/flowCoreColours'

export default function AssetsDevPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: flowCoreColours.matteBlack,
        color: flowCoreColours.textPrimary,
        padding: '48px 24px',
        fontFamily:
          'var(--font-geist-mono, ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 600,
              color: flowCoreColours.iceCyan,
              textTransform: 'lowercase',
              letterSpacing: '0.3px',
              margin: '0 0 8px 0',
            }}
          >
            asset drop system
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: flowCoreColours.textSecondary,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Phase 15.2-A: Core Infrastructure Foundation
          </p>
          <p
            style={{
              fontSize: '13px',
              color: flowCoreColours.textTertiary,
              margin: '8px 0 0 0',
              lineHeight: 1.6,
            }}
          >
            Upload → Store → List → Delete pipeline testing
          </p>
        </div>

        {/* AssetDropZone Component */}
        <div
          style={{
            backgroundColor: flowCoreColours.darkGrey,
            border: `1px solid ${flowCoreColours.borderGrey}`,
            borderRadius: '8px',
            padding: '32px',
          }}
        >
          <AssetDropZone />
        </div>

        {/* Footer Info */}
        <div
          style={{
            marginTop: '48px',
            padding: '24px',
            backgroundColor: 'rgba(58, 169, 190, 0.1)',
            border: `1px solid ${flowCoreColours.slateCyan}`,
            borderRadius: '8px',
          }}
        >
          <h2
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: flowCoreColours.textPrimary,
              textTransform: 'lowercase',
              margin: '0 0 12px 0',
            }}
          >
            testing checklist
          </h2>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              fontSize: '13px',
              color: flowCoreColours.textSecondary,
              lineHeight: 1.8,
            }}
          >
            <li style={{ paddingLeft: '16px', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: flowCoreColours.slateCyan }}>
                ✓
              </span>
              Drag & drop file upload
            </li>
            <li style={{ paddingLeft: '16px', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: flowCoreColours.slateCyan }}>
                ✓
              </span>
              Click to browse file upload
            </li>
            <li style={{ paddingLeft: '16px', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: flowCoreColours.slateCyan }}>
                ✓
              </span>
              Progress bar during upload
            </li>
            <li style={{ paddingLeft: '16px', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: flowCoreColours.slateCyan }}>
                ✓
              </span>
              Cancel upload mid-progress
            </li>
            <li style={{ paddingLeft: '16px', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: flowCoreColours.slateCyan }}>
                ✓
              </span>
              List uploaded assets
            </li>
            <li style={{ paddingLeft: '16px', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: flowCoreColours.slateCyan }}>
                ✓
              </span>
              Delete assets with confirmation
            </li>
            <li style={{ paddingLeft: '16px', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: flowCoreColours.slateCyan }}>
                ✓
              </span>
              FlowCore toasts on success/error
            </li>
            <li style={{ paddingLeft: '16px', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: flowCoreColours.slateCyan }}>
                ✓
              </span>
              Telemetry event tracking
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
