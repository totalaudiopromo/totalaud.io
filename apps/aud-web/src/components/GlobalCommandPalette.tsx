/**
 * GlobalCommandPalette
 *
 * Wrapper that provides commands and integrates CommandPalette into the app.
 * Accessible globally via ⌘K keyboard shortcut.
 */

'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CommandPalette, useCommandPalette, Play, BarChart3, Palette, Focus, VolumeX, Volume2, type CommandAction } from './CommandPalette'
import { useUserPrefs } from '@/hooks/useUserPrefs'

export function GlobalCommandPalette() {
  const router = useRouter()
  const { isOpen, close } = useCommandPalette()
  const { prefs, updatePrefs } = useUserPrefs()

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
      id: 'toggle-theme',
      label: 'switch theme',
      description: 'change your os personality',
      icon: Palette,
      action: () => {
        console.log('[Command] Toggle theme')
        // TODO: Open theme selector
      },
      keywords: ['theme', 'style', 'appearance', 'os'],
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
