/**
 * ASCII Mission Panel
 *
 * Terminal-style mission panel for ASCII theme
 * Uppercase text, green-on-black, box-drawing characters
 */

'use client'

import { useTheme } from './ThemeResolver'

interface AsciiMissionPanelProps {
  campaignName: string
  agentCount: number
  completedCount: number
  opacity?: number
}

export function AsciiMissionPanel({
  campaignName,
  agentCount,
  completedCount,
  opacity = 1.0,
}: AsciiMissionPanelProps) {
  const { themeConfig } = useTheme()

  const progress = agentCount > 0 ? Math.round((completedCount / agentCount) * 100) : 0

  return (
    <div
      className="w-80 h-full border-l p-4 font-mono text-xs"
      style={{
        backgroundColor: themeConfig.colors.bg,
        borderColor: themeConfig.colors.border,
        color: themeConfig.colors.text,
        fontFamily: themeConfig.typography.fontFamily,
        letterSpacing: themeConfig.typography.letterSpacing,
        textTransform: themeConfig.typography.textTransform,
        opacity,
      }}
    >
      {/* Header */}
      <div className="mb-4 pb-2 border-b" style={{ borderColor: themeConfig.colors.border }}>
        <div className="flex items-center gap-2">
          <span style={{ color: themeConfig.colors.accent }}>╔═══════════════════╗</span>
        </div>
        <div className="flex items-center gap-2 pl-2">
          <span style={{ color: themeConfig.colors.accent }}>║ MISSION CONTROL</span>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ color: themeConfig.colors.accent }}>╚═══════════════════╝</span>
        </div>
      </div>

      {/* Campaign Name */}
      <div className="mb-4">
        <div style={{ color: themeConfig.colors.textSecondary }}>
          &gt; CAMPAIGN:
        </div>
        <div className="pl-4" style={{ color: themeConfig.colors.text }}>
          {campaignName.toUpperCase()}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div style={{ color: themeConfig.colors.textSecondary }}>
          &gt; PROGRESS:
        </div>
        <div className="pl-4" style={{ color: themeConfig.colors.text }}>
          {completedCount}/{agentCount} AGENTS [{progress}%]
        </div>
        <div className="pl-4 mt-1">
          <div className="flex" style={{ color: themeConfig.colors.accent }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <span key={i}>{i < progress / 5 ? '█' : '░'}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mb-4">
        <div style={{ color: themeConfig.colors.textSecondary }}>
          &gt; STATUS:
        </div>
        <div className="pl-4" style={{ color: themeConfig.colors.text }}>
          {completedCount === agentCount && agentCount > 0
            ? '[COMPLETE] READY FOR MIXDOWN'
            : agentCount === 0
            ? '[IDLE] AWAITING COMMANDS'
            : '[RUNNING] PROCESSING AGENTS'}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-4 right-4 pt-4 border-t" style={{ borderColor: themeConfig.colors.border }}>
        <div className="flex items-center justify-between text-xs" style={{ color: themeConfig.colors.textSecondary }}>
          <span>⌘K COMMAND</span>
          <span>⌘F FOCUS</span>
        </div>
      </div>
    </div>
  )
}
