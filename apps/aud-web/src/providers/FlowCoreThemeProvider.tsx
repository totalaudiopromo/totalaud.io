'use client'

import type { ReactNode } from 'react'

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
}

export function FlowCoreThemeProvider({ children, bodyClassName }: FlowCoreThemeProviderProps) {
  const composedClassName = ['flowcore-theme', bodyClassName].filter(Boolean).join(' ')

  return (
    <body className={composedClassName}>
      <style jsx global>{`
        :root {
          color-scheme: dark;
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
            var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          --flowcore-font-mono:
            var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            'Liberation Mono', 'Courier New', monospace;
          --flowcore-motion-fast: ${flowCore.motion.fast}ms;
          --flowcore-motion-normal: ${flowCore.motion.normal}ms;
          --flowcore-motion-slow: ${flowCore.motion.slow}ms;
        }

        @media (prefers-reduced-motion: reduce) {
          :root {
            --flowcore-motion-fast: 0ms;
            --flowcore-motion-normal: 0ms;
            --flowcore-motion-slow: 0ms;
          }
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
