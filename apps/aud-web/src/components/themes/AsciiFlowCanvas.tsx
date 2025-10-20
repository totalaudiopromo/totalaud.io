/**
 * ASCII Flow Canvas
 *
 * Terminal-style flow canvas with scan-line overlay
 * Black and white aesthetic, monospace typography, instant transitions
 */

'use client'

import { ReactNode } from 'react'
import { useTheme } from './ThemeResolver'

interface AsciiFlowCanvasProps {
  children: ReactNode
}

export function AsciiFlowCanvas({ children }: AsciiFlowCanvasProps) {
  const { themeConfig } = useTheme()

  return (
    <div
      className="relative w-full h-full"
      style={{
        backgroundColor: themeConfig.colors.bg,
        color: themeConfig.colors.text,
        fontFamily: themeConfig.typography.fontFamily,
      }}
    >
      {/* Scan-line overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-50"
        style={{
          backgroundImage: themeConfig.effects.overlay,
          opacity: 0.5,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
