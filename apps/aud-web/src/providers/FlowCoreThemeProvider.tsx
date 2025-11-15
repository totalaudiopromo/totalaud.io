/**
 * FlowCore Theme Provider
 * Phase 18: Minimal theme-engine integration
 *
 * Provides:
 * - 5 minimal CSS tokens (--fc-bg, --fc-fg, --fc-accent, --fc-border, --fc-overlay)
 * - Reduced-motion detection and handling
 * - Theme-engine registry connection
 * - Legacy flowCore tokens (backwards compatibility)
 */

'use client'

import type { ReactNode } from 'react'
import { getTheme, type ThemeId } from '@total-audio/core-theme-engine'

export const flowCore = {
  colours: {
    bg: '#0F1113',
    fg: '#ECEFF1',
    cyan: '#3AA9BE',
    cyanHover: '#56BFD4',
    border: '#263238',
    success: '#51CF66',
    error: '#FF5252',
    warning: '#F59E0B',
  },
  surfaces: {
    overlayStrong: 'var(--flowcore-overlay-strong)',
    overlaySoft: 'var(--flowcore-overlay-soft)',
    overlayAccent: 'var(--flowcore-overlay-accent)',
  },
  motion: {
    fast: 120,
    normal: 240,
    slow: 400,
  },
  font: {
    body: 'Geist Sans',
    mono: 'Geist Mono',
  },
} as const

interface FlowCoreThemeProviderProps {
  children: ReactNode
  bodyClassName?: string
  themeId?: ThemeId
}

export function FlowCoreThemeProvider({
  children,
  bodyClassName,
  themeId = 'ascii',
}: FlowCoreThemeProviderProps) {
  // Load theme from theme-engine registry
  const theme = getTheme(themeId)

  // Detect reduced motion preference
  const reducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  const composedClassName = [
    'flowcore-theme',
    reducedMotion ? 'reduced-motion' : null,
    bodyClassName,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <body className={composedClassName}>
      <style jsx global>{`
        :root {
          color-scheme: dark;

          /* Theme-engine minimal tokens */
          --fc-bg: ${theme.palette.background};
          --fc-fg: ${theme.palette.foreground};
          --fc-accent: ${theme.palette.accent};
          --fc-border: ${theme.palette.border};
          --fc-overlay: color-mix(in srgb, ${theme.palette.background} 85%, #000000 15%);

          /* Legacy FlowCore tokens (backwards compatibility) */
          --flowcore-colour-bg: ${flowCore.colours.bg};
          --flowcore-colour-fg: ${flowCore.colours.fg};
          --flowcore-colour-accent: ${flowCore.colours.cyan};
          --flowcore-colour-accent-hover: ${flowCore.colours.cyanHover};
          --flowcore-colour-border: ${flowCore.colours.border};
          --flowcore-colour-success: ${flowCore.colours.success};
          --flowcore-colour-error: ${flowCore.colours.error};
          --flowcore-colour-warning: ${flowCore.colours.warning};
          --flowcore-overlay-strong: color-mix(in srgb, var(--flowcore-colour-bg) 88%, #000000 12%);
          --flowcore-overlay-soft: color-mix(in srgb, var(--flowcore-colour-bg) 72%, #000000 28%);
          --flowcore-overlay-accent: color-mix(
            in srgb,
            var(--flowcore-colour-accent) 26%,
            var(--flowcore-colour-bg) 74%
          );
          --flowcore-font-body:
            '${flowCore.font.body}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          --flowcore-font-mono:
            '${flowCore.font.mono}', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            'Liberation Mono', 'Courier New', monospace;
          --flowcore-motion-fast: ${reducedMotion ? 0 : flowCore.motion.fast}ms;
          --flowcore-motion-normal: ${reducedMotion ? 0 : flowCore.motion.normal}ms;
          --flowcore-motion-slow: ${reducedMotion ? 0 : flowCore.motion.slow}ms;
        }

        body.reduced-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }

        html,
        body {
          background-color: var(--flowcore-colour-bg);
          color: var(--flowcore-colour-fg);
          font-family: var(--flowcore-font-body);
          min-height: 100%;
          -webkit-font-smoothing: antialiased;
        }

        body.flowcore-theme {
          margin: 0;
          padding: 0;
        }

        ::selection {
          background-color: var(--flowcore-colour-accent);
          color: var(--flowcore-colour-bg);
        }
      `}</style>
      {children}
    </body>
  )
}
