/**
 * GlobalCommandPalette
 *
 * Wrapper that provides commands and integrates CommandPalette into the app.
 * Accessible globally via ⌘K keyboard shortcut.
 */

'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CommandPalette, useCommandPalette, Play, BarChart3, Palette, Focus, VolumeX, Volume2, type CommandAction } from './CommandPalette'
import { useUserPrefs } from '@/hooks/useUserPrefs'
import { useTheme } from './themes/ThemeResolver'
import type { OSTheme } from './themes/types'

export function GlobalCommandPalette() {
  const router = useRouter()
  const { isOpen, close } = useCommandPalette()
  const { prefs, updatePrefs } = useUserPrefs()
  const { currentTheme, setTheme } = useTheme()
  const [showThemeSelector, setShowThemeSelector] = useState(false)

  // Define available commands
  const commands: CommandAction[] = [
    {
      id: 'run-campaign',
      label: 'run campaign',
      description: 'start executing your campaign flow',
      icon: Play,
      action: () => {
        console.log('[Command] Run campaign')
        // TODO: Implement campaign execution
      },
      keywords: ['start', 'execute', 'begin'],
    },
    {
      id: 'generate-mixdown',
      label: 'generate mixdown',
      description: 'create campaign report and results',
      icon: BarChart3,
      action: () => {
        console.log('[Command] Generate mixdown')
        // TODO: Implement mixdown generation
      },
      keywords: ['report', 'results', 'summary'],
    },
    {
      id: 'theme-ascii',
      label: 'theme: ascii terminal',
      description: 'minimalist producer — black and white',
      icon: Palette,
      action: async () => {
        console.log('[Command] Switch to ASCII theme')
        await setTheme('ascii')
        close()
      },
      keywords: ['theme', 'ascii', 'terminal', 'minimal'],
    },
    {
      id: 'theme-xp',
      label: 'theme: windows xp',
      description: 'nostalgic optimist — soft gradients',
      icon: Palette,
      action: async () => {
        console.log('[Command] Switch to XP theme')
        await setTheme('xp')
        close()
      },
      keywords: ['theme', 'xp', 'windows', 'nostalgic'],
    },
    {
      id: 'theme-aqua',
      label: 'theme: mac aqua',
      description: 'perfectionist designer — glassy blur',
      icon: Palette,
      action: async () => {
        console.log('[Command] Switch to Aqua theme')
        await setTheme('aqua')
        close()
      },
      keywords: ['theme', 'aqua', 'mac', 'design'],
    },
    {
      id: 'theme-ableton',
      label: 'theme: ableton live',
      description: 'experimental creator — tempo-synced',
      icon: Palette,
      action: async () => {
        console.log('[Command] Switch to Ableton theme')
        await setTheme('ableton')
        close()
      },
      keywords: ['theme', 'ableton', 'producer', 'music'],
    },
    {
      id: 'theme-punk',
      label: 'theme: punk zine',
      description: 'anti-system hustler — glitchy chaos',
      icon: Palette,
      action: async () => {
        console.log('[Command] Switch to Punk theme')
        await setTheme('punk')
        close()
      },
      keywords: ['theme', 'punk', 'zine', 'chaos'],
    },
    {
      id: 'toggle-focus',
      label: 'toggle focus mode',
      description: 'dim ui for deep work',
      icon: Focus,
      action: () => {
        console.log('[Command] Toggle focus mode')
        // TODO: Trigger focus mode (will be handled by useFlowMode in FlowCanvas)
      },
      keywords: ['focus', 'distraction', 'dim'],
    },
    {
      id: 'mute-sounds',
      label: prefs?.mute_sounds ? 'unmute sounds' : 'mute sounds',
      description: 'toggle audio feedback',
      icon: prefs?.mute_sounds ? Volume2 : VolumeX,
      action: async () => {
        console.log('[Command] Toggle mute')
        await updatePrefs({ mute_sounds: !prefs?.mute_sounds })
      },
      keywords: ['audio', 'sound', 'mute', 'volume'],
    },
  ]

  return (
    <CommandPalette
      isOpen={isOpen}
      onClose={close}
      commands={commands}
      theme="dark"
    />
  )
}
