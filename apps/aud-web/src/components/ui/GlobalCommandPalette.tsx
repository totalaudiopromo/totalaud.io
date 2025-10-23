/**
 * GlobalCommandPalette
 *
 * Wrapper that provides commands and integrates CommandPalette into the app.
 * Accessible globally via ⌘K keyboard shortcut.
 */

'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Play,
  BarChart3,
  Palette,
  Focus,
  VolumeX,
  Volume2,
  Users,
  List,
  Trash2,
  Layout,
  Terminal,
  Sparkles,
  Layers,
  Music,
  BookOpen,
} from 'lucide-react'
import { CommandPalette, useCommandPalette, type CommandAction } from './CommandPalette'
import { useUserPrefs } from '@aud-web/hooks/useUserPrefs'
import { useTheme } from '../themes/ThemeResolver'
import { OSTheme } from '../themes/types'
import { AgentSpawnModal } from '../features/agents/AgentSpawnModal'
import { useAgentSpawner, type AgentRole } from '@aud-web/hooks/useAgentSpawner'
import { logger } from '@total-audio/core-logger'

const log = logger.scope('GlobalCommandPalette')

export function GlobalCommandPalette() {
  const { isOpen, close } = useCommandPalette()
  const { prefs, updatePrefs } = useUserPrefs()
  const { currentTheme, setTheme } = useTheme()
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const [showSpawnModal, setShowSpawnModal] = useState(false)
  const [spawnRole, setSpawnRole] = useState<AgentRole>('scout')
  const { list: listAgents, remove: removeAgent } = useAgentSpawner()
  const router = useRouter()

  // Handle agent spawn confirmation
  const handleAgentSpawned = useCallback((agentName: string) => {
    log.info('Agent deployed', { agentName })
  }, [])

  // Define available commands
  const commands: CommandAction[] = [
    {
      id: 'run-campaign',
      label: 'run campaign',
      description: 'start executing your campaign flow',
      icon: Play,
      action: () => {
        log.debug('Command: Run campaign')
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
        log.debug('Command: Generate mixdown')
        // TODO: Implement mixdown generation
      },
      keywords: ['report', 'results', 'summary'],
    },
    // Agent Spawning Commands
    {
      id: 'spawn-agent-scout',
      label: 'spawn agent scout',
      description: 'create new scout agent for contact discovery',
      icon: Users,
      action: () => {
        setSpawnRole('scout')
        setShowSpawnModal(true)
        close()
      },
      keywords: ['spawn', 'agent', 'scout', 'create', 'new', 'contacts'],
    },
    {
      id: 'spawn-agent-coach',
      label: 'spawn agent coach',
      description: 'create new coach agent for content creation',
      icon: Users,
      action: () => {
        setSpawnRole('coach')
        setShowSpawnModal(true)
        close()
      },
      keywords: ['spawn', 'agent', 'coach', 'create', 'new', 'content'],
    },
    {
      id: 'spawn-agent-tracker',
      label: 'spawn agent tracker',
      description: 'create new tracker agent for campaign monitoring',
      icon: Users,
      action: () => {
        setSpawnRole('tracker')
        setShowSpawnModal(true)
        close()
      },
      keywords: ['spawn', 'agent', 'tracker', 'create', 'new', 'monitor'],
    },
    {
      id: 'spawn-agent-insight',
      label: 'spawn agent insight',
      description: 'create new insight agent for data analysis',
      icon: Users,
      action: () => {
        setSpawnRole('insight')
        setShowSpawnModal(true)
        close()
      },
      keywords: ['spawn', 'agent', 'insight', 'create', 'new', 'analysis'],
    },
    {
      id: 'spawn-agent-custom',
      label: 'spawn agent --custom',
      description: 'create custom agent with your own configuration',
      icon: Users,
      action: () => {
        setSpawnRole('custom')
        setShowSpawnModal(true)
        close()
      },
      keywords: ['spawn', 'agent', 'custom', 'create', 'new', 'build'],
    },
    {
      id: 'list-agents',
      label: 'list agents',
      description: 'show all spawned agent manifests',
      icon: List,
      action: async () => {
        const agents = await listAgents()
        log.info('Active agents listed', { count: agents.length })
        // TODO: Show agents in a list view
      },
      keywords: ['list', 'agents', 'show', 'all', 'manifests'],
    },
    {
      id: 'theme-ascii',
      label: 'theme: ascii terminal',
      description: 'minimalist producer — black and white',
      icon: Palette,
      action: async () => {
        log.debug('Switching theme to ASCII')
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
        log.debug('Switching theme to XP')
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
        log.debug('Switching theme to Aqua')
        await setTheme('aqua')
        close()
      },
      keywords: ['theme', 'aqua', 'mac', 'design'],
    },
    {
      id: 'theme-daw',
      label: 'theme: daw workstation',
      description: 'experimental creator — tempo-synced precision',
      icon: Palette,
      action: async () => {
        log.debug('Switching theme to DAW')
        await setTheme('daw')
        close()
      },
      keywords: ['theme', 'daw', 'producer', 'music', 'workstation'],
    },
    {
      id: 'theme-analogue',
      label: 'theme: analogue studio',
      description: 'human hands, warm signal — textured and confident',
      icon: Palette,
      action: async () => {
        log.debug('Switching theme to Analogue')
        await setTheme('analogue')
        close()
      },
      keywords: ['theme', 'analogue', 'analog', 'studio', 'warm', 'tape'],
    },
    // Studio Navigation Commands
    {
      id: 'studio-ascii',
      label: 'open ascii studio',
      description: 'terminal desk — type, test, repeat',
      icon: Terminal,
      action: () => {
        router.push('/studio/ascii')
        close()
      },
      keywords: ['studio', 'ascii', 'terminal', 'command', 'minimal'],
    },
    {
      id: 'studio-xp',
      label: 'open xp studio',
      description: 'guided assistant — click, bounce, smile',
      icon: Sparkles,
      action: () => {
        router.push('/studio/xp')
        close()
      },
      keywords: ['studio', 'xp', 'wizard', 'guided', 'friendly'],
    },
    {
      id: 'studio-aqua',
      label: 'open aqua studio',
      description: 'visual map — craft with clarity',
      icon: Layers,
      action: () => {
        router.push('/studio/aqua')
        close()
      },
      keywords: ['studio', 'aqua', 'canvas', 'visual', 'map', 'design'],
    },
    {
      id: 'studio-daw',
      label: 'open daw studio',
      description: 'timeline — sync, sequence, create',
      icon: Music,
      action: () => {
        router.push('/studio/daw')
        close()
      },
      keywords: ['studio', 'daw', 'timeline', 'sequencer', 'tempo'],
    },
    {
      id: 'studio-analogue',
      label: 'open analogue studio',
      description: 'journal — touch the signal',
      icon: BookOpen,
      action: () => {
        router.push('/studio/analogue')
        close()
      },
      keywords: ['studio', 'analogue', 'analog', 'journal', 'writing', 'reflection'],
    },
    {
      id: 'toggle-focus',
      label: 'toggle focus mode',
      description: 'dim ui for deep work',
      icon: Focus,
      action: () => {
        log.debug('Command: Toggle focus mode')
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
        log.debug('Toggling sound mute', { currentlyMuted: prefs?.mute_sounds })
        await updatePrefs({ mute_sounds: !prefs?.mute_sounds })
      },
      keywords: ['audio', 'sound', 'mute', 'volume'],
    },
  ]

  return (
    <>
      <CommandPalette isOpen={isOpen} onClose={close} commands={commands} theme="dark" />
      <AgentSpawnModal
        isOpen={showSpawnModal}
        onClose={() => setShowSpawnModal(false)}
        onSpawn={handleAgentSpawned}
        initialRole={spawnRole}
      />
    </>
  )
}
