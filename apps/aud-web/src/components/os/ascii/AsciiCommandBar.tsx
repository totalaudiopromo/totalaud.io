/**
 * ASCII Command Bar
 * Bottom command prompt with working input + visible log
 *
 * Features:
 * - Global keydown listener (works anywhere on the page)
 * - Character input with visual feedback
 * - Backspace support
 * - Enter executes commands
 * - Simple command router with log output
 * - Sound feedback on keypress / success
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { useThemeAudio } from '@/hooks/useThemeAudio'
import type { OSSlug } from '@/components/os/navigation/OSMetadata'
import { consumeOSBridges, queueOSBridge } from '@/components/os/navigation/OSBridges'
import { useAgentKernel } from '@/components/agents/useAgentKernel'
import { useOptionalDemo } from '@/components/demo/DemoOrchestrator'
import { registerAsciiController } from '@/components/demo/director/DirectorEngine'
import { useAgentTeams } from '@/components/agents/teams/AgentTeamOrchestrator'
import type { AgentTeamId } from '@/components/agents/teams/agentTeamPresets'
import {
  useOptionalNarrative,
  type NarrativeFlags,
} from '@/components/narrative/useNarrative'
import { usePersona } from '@/components/persona/usePersona'
import { PERSONA_PRESETS, type PersonaId } from '@/components/persona/personaPresets'
import { useCompanion } from '@/components/companion/useCompanion'
import { useOptionalMood } from '@/components/mood/useMood'
import { useProjectEngine } from '@/components/projects/useProjectEngine'

type LogKind = 'system' | 'command' | 'note' | 'info' | 'error'

type LogEntry = {
  id: number
  text: string
  kind: LogKind
  timestamp: string
}

type NoteEntry = {
  id: number
  text: string
  createdAt: string
}

let logIdCounter = 0
let noteIdCounter = 0

interface AsciiCommandBarProps {
  onSetOS?: (slug: OSSlug) => void
}

function buildLanaCoachCommand(flags: NarrativeFlags | null): string {
  if (flags?.creativeFocus) {
    return `agent run coach "Suggest 3 creative moves for how Lana Glass should announce the 'Midnight Signals' EP."`
  }
  if (flags?.campaignFocus) {
    return `agent run coach "Suggest 3 campaign steps to launch Lana Glass's 'Midnight Signals' EP."`
  }
  return `agent run coach "Suggest how to announce Lana Glass's 'Midnight Signals' EP."`
}

function isValidOSSlug(slug: string): slug is OSSlug {
  return (
    slug === 'ascii' ||
    slug === 'xp' ||
    slug === 'aqua' ||
    slug === 'daw' ||
    slug === 'analogue' ||
    slug === 'core' ||
    slug === 'studio'
  )
}

export function AsciiCommandBar({ onSetOS }: AsciiCommandBarProps) {
  const [input, setInput] = useState('')
  const [log, setLog] = useState<LogEntry[]>([])
  const [notes, setNotes] = useState<NoteEntry[]>([])
  const { play } = useThemeAudio()
  const logRef = useRef<HTMLDivElement | null>(null)
  const { runs, spawnAgentRun } = useAgentKernel()
  const { runTeam } = useAgentTeams()
  const demo = useOptionalDemo()
  const narrative = useOptionalNarrative()
  const isDemoMode =
    demo?.isDemoMode ||
    (typeof window !== 'undefined' && (window as any).__TA_DEMO__ === true)

  const inputRef = useRef('')
  const persona = usePersona()
  const mood = useOptionalMood()
  const { currentProject, projects, createProject, setProject } = useProjectEngine()
  const companion = useCompanion()

  const appendLog = useCallback(
    (lines: string | string[], kind: LogKind = 'system') => {
      const arr = Array.isArray(lines) ? lines : [lines]
      const timestamp = new Date().toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })

      setLog((prev) => [
        ...prev,
        ...arr.map((text) => ({
          id: logIdCounter++,
          text,
          kind,
          timestamp,
        })),
      ])
    },
    [],
  )

  const handleCreateNote = useCallback(
    (rawText: string) => {
      const text = rawText.trim()
      if (!text) {
        appendLog('Cannot create an empty note.', 'error')
        return
      }

      const createdAt = new Date().toISOString()
      const id = ++noteIdCounter

      setNotes((prev) => [...prev, { id, text, createdAt }])
      appendLog(`Captured note #${id}.`, 'note')
    },
    [appendLog],
  )

  const runCommand = useCallback(
    (raw: string) => {
      const cmd = raw.trim()
      if (!cmd) return

      // Echo the command
      appendLog(`> ${cmd}`, 'command')

      if (cmd === 'help') {
        appendLog([
          'Available commands:',
          '• help                     - show this help',
          '• clear                    - clear the screen',
          '• os                       - list OS modes + quick-switch hint',
          '• os <slug>                - jump directly to an OS (ascii, xp, aqua, daw, analogue)',
          '• projects list            - list projects in this browser',
          '• projects use <id>        - switch active project by id',
          '• projects new "<name>"    - create a new project',
          '• note <text>              - capture a quick note in this session',
          '• export                   - log export of notes to Analogue (stub)',
          '• sendnote <text> aqua|daw - send note into Aqua story or DAW sequence',
          '• logxp <text>             - append a line to XP clipboard',
          '• agent run <role> "<msg>" - spawn an agent (scout, coach, tracker, insight)',
          '• agent team <id> "<msg>"  - run a team (creative_team, promo_team, analysis_team, loopos_team)',
          '• agent status             - show a summary of agent runs',
          '• agent last               - print last completed agent output',
          '• loop suggest             - ask Coach for next steps on the current loop',
          '• companion                - show companion help + current tone',
          '• companion list           - list available companions',
          '• companion use <id>       - switch active companion',
        ])
        return
      }

      if (cmd === 'clear') {
        setLog([])
        return
      }

      if (cmd === 'os') {
        appendLog(
          [
            'Loaded OS surfaces:',
            '- core     → core mission control',
            '- studio   → loop studio overview',
            '- ascii    → command console',
            '- xp       → utility desk',
            '- aqua     → epk / pitch workbench',
            '- daw      → sequence sketcher',
            '- analogue → journal',
            '',
            'Tip: press ⌘⇧O from anywhere to open the OS launcher and jump.',
            'Or type: os <slug> (e.g. os aqua)',
          ],
          'info',
        )
        return
      }

      if (cmd === 'projects') {
        appendLog(
          [
            'Project commands:',
            '- projects list',
            '- projects use <id>',
            '- projects new "<name>"',
          ],
          'info',
        )
        return
      }

      if (cmd === 'companion') {
        const active = companion.activeCompanion
        const lines: string[] = [
          'Companion commands:',
          '- companion                → show this help',
          '- companion list           → list available companions',
          '- companion use <id>       → switch active companion',
        ]

        if (active) {
          lines.push(
            '',
            `Current companion: ${active.name} (${active.id})`,
            `Tone: ${active.tone}`,
            `Traits: ${active.traits.join(', ')}`,
          )
        } else {
          lines.push('', 'Current companion: none (using default agent tone).')
        }

        appendLog(lines, 'info')
        return
      }

      if (cmd === 'companion list') {
        const companions = companion.companions
        if (!companions.length) {
          appendLog('No companions available in this session.', 'info')
          return
        }

        appendLog(
          [
            'Available companions:',
            ...companions.map((preset) => `- ${preset.id} → ${preset.name}`),
            '',
            'Usage: companion use <id>',
          ],
          'info',
        )
        return
      }

      if (cmd.startsWith('companion use ')) {
        const id = cmd.slice('companion use '.length).trim()
        if (!id) {
          appendLog('Usage: companion use <id>', 'info')
          return
        }

        const target = companion.companions.find((preset) => preset.id === id)
        if (!target) {
          appendLog(`Unknown companion id: ${id}`, 'error')
          return
        }

        companion.setCompanion(target.id)
        appendLog(
          [
            `Companion set to ${target.name} (${target.id}).`,
            `Tone: ${target.tone}`,
            `Traits: ${target.traits.join(', ')}`,
          ],
          'system',
        )
        return
      }

      if (cmd.startsWith('projects ')) {
        if (isDemoMode) {
          appendLog(
            'Project management is disabled in demo mode. This session uses the Lana Glass demo project only.',
            'info',
          )
          return
        }

        const sub = cmd.slice('projects '.length).trim()

        if (sub === 'list') {
          if (!projects.length) {
            appendLog(
              currentProject
                ? [
                    `Current project: ${currentProject.name} (not yet saved in this browser).`,
                    'Run onboarding again or use projects new "<name>" to seed a saved project.',
                  ]
                : 'No projects yet. Complete onboarding or run: projects new "<name>".',
              'info',
            )
            return
          }

          const lines = [
            'Projects (local to this browser):',
            ...projects.map((project) => `- ${project.id} → ${project.name}`),
          ]
          appendLog(lines, 'info')
          return
        }

        if (sub.startsWith('use ')) {
          const id = sub.slice('use '.length).trim()
          if (!id) {
            appendLog('Usage: projects use <id>', 'info')
            return
          }

          const target = projects.find((project) => project.id === id)
          if (!target) {
            appendLog(`Unknown project id: ${id}`, 'error')
            return
          }

          setProject(id)
          appendLog(`Switched active project to: ${target.name}`, 'system')
          return
        }

        if (sub.startsWith('new ')) {
          const rawName = sub.slice('new '.length).trim()
          const name =
            rawName.startsWith('"') && rawName.endsWith('"') && rawName.length > 1
              ? rawName.slice(1, -1)
              : rawName

          if (!name) {
            appendLog('Usage: projects new "<name>"', 'info')
            return
          }

          const project = createProject(name)
          appendLog(
            [
              `Created project: ${project.name}`,
              `Id: ${project.id}`,
              'Tip: use projects use <id> to switch context later.',
            ],
            'system',
          )
          return
        }

        appendLog('Unknown projects subcommand. Try: projects list | use <id> | new "<name>"', 'error')
        return
      }

      if (cmd.startsWith('os ')) {
        const slug = cmd.slice(3).trim()
        if (!isValidOSSlug(slug)) {
          appendLog(`Unknown OS slug: ${slug}`, 'error')
          return
        }
        if (!onSetOS) {
          appendLog('OS navigation is not available in this context.', 'error')
          return
        }

        appendLog(`Switching to ${slug} OS…`, 'info')
        onSetOS(slug)
        return
      }

      if (cmd.startsWith('note ')) {
        const noteText = cmd.slice(5)
        handleCreateNote(noteText)
        return
      }

      if (cmd === 'note') {
        appendLog('Usage: note <idea, todo, or lyric fragment>', 'info')
        return
      }

      if (cmd === 'export loop summary') {
        appendLog(
          [
            'Loop summary export lives in LoopOS inspector.',
            'Open LoopOS and use the Export loop summary actions to send artifacts into Aqua, Analogue, and XP.',
          ],
          'info',
        )
        return
      }

      if (cmd === 'export') {
        const count = notes.length
        appendLog(
          count === 0
            ? 'No notes to export yet. Capture something with: note <your idea>'
            : `Exported ${count} note${count === 1 ? '' : 's'} to Analogue (stub).`,
          'info',
        )
        return
      }

      if (cmd.startsWith('sendnote ')) {
        const withoutPrefix = cmd.slice('sendnote '.length).trim()
        const parts = withoutPrefix.split(' ')
        const target = parts[parts.length - 1]
        const text = withoutPrefix.slice(0, withoutPrefix.length - target.length).trim()

        if (!text) {
          appendLog('Usage: sendnote <text> aqua|daw', 'info')
          return
        }

        if (target === 'aqua') {
          queueOSBridge('aqua', {
            kind: 'ascii-sendnote-aqua',
            story: text,
          })
          appendLog('Routing note into Aqua story field…', 'info')
          onSetOS?.('aqua')
          return
        }

        if (target === 'daw') {
          queueOSBridge('daw', {
            kind: 'ascii-sendnote-daw',
            name: text,
            lane: 'creative',
          })
          appendLog('Creating creative lane clip in DAW…', 'info')
          onSetOS?.('daw')
          return
        }

        appendLog('Usage: sendnote <text> aqua|daw', 'info')
        return
      }

      if (cmd.startsWith('logxp ')) {
        const text = cmd.slice('logxp '.length).trim()
        if (!text) {
          appendLog('Usage: logxp <text>', 'info')
          return
        }

        queueOSBridge('xp', {
          kind: 'ascii-logxp',
          text,
        })
        appendLog('Appending line to XP clipboard…', 'info')
        onSetOS?.('xp')
        return
      }

      if (cmd === 'persona') {
        const ids = Object.keys(PERSONA_PRESETS) as PersonaId[]
        appendLog(
          [
            'Available personas:',
            ...ids.map((id) => {
              const preset = PERSONA_PRESETS[id]
              return `- ${id} → ${preset.name}`
            }),
            '',
            'Usage: persona <id>',
          ],
          'info',
        )
        return
      }

      if (cmd.startsWith('persona ')) {
        const id = cmd.slice('persona '.length).trim() as PersonaId
        const preset = PERSONA_PRESETS[id]
        if (!preset) {
          appendLog(`Unknown persona id: ${id}`, 'error')
          return
        }

        persona.setPersona(id)
        appendLog(
          [
            `Persona set to ${preset.name}.`,
            `Tone: ${preset.tone}`,
            `Traits: ${preset.traits.join(', ')}`,
          ],
          'system',
        )
        return
      }

      if (cmd.startsWith('agent ')) {
        const sub = cmd.slice('agent '.length).trim()

        if (sub === 'status') {
          const total = runs.length
          const running = runs.filter((run) => run.status === 'queued' || run.status === 'running')
            .length
          const done = runs.filter((run) => run.status === 'done').length
          const errored = runs.filter((run) => run.status === 'error').length

          appendLog(
            `Agent kernel: ${total} run${total === 1 ? '' : 's'} · ${running} running · ${done} done · ${errored} error${errored === 1 ? '' : 's'}.`,
            'info',
          )
          return
        }

        if (sub === 'last') {
          const lastDone = [...runs].reverse().find((run) => run.status === 'done')
          if (!lastDone) {
            appendLog('No completed agent runs yet.', 'info')
            return
          }

          const preview =
            lastDone.output && lastDone.output.length > 400
              ? `${lastDone.output.slice(0, 397).trimEnd()}…`
              : lastDone.output || '(no output)'

          appendLog(
            [
              `Last completed agent [${lastDone.role} from ${lastDone.originOS}]:`,
              preview,
            ],
            'info',
          )
          return
        }

        if (sub.startsWith('team ')) {
          const withoutTeam = sub.slice('team '.length).trim()
          const firstSpaceIndex = withoutTeam.indexOf(' ')
          if (firstSpaceIndex === -1) {
            appendLog(
              'Usage: agent team <id> "<instruction>" (ids: creative_team, promo_team, analysis_team, loopos_team)',
              'info',
            )
            return
          }

          const teamIdToken = withoutTeam.slice(0, firstSpaceIndex).trim()
          const instructionRaw = withoutTeam.slice(firstSpaceIndex + 1).trim()

          const validTeamIds: AgentTeamId[] = [
            'creative_team',
            'promo_team',
            'analysis_team',
            'loopos_team',
          ]

          if (!validTeamIds.includes(teamIdToken as AgentTeamId)) {
            appendLog(
              'Unknown team id. Use one of: creative_team, promo_team, analysis_team, loopos_team.',
              'error',
            )
            return
          }

          const instruction =
            instructionRaw.startsWith('"') && instructionRaw.endsWith('"') && instructionRaw.length > 1
              ? instructionRaw.slice(1, -1)
              : instructionRaw

          if (!instruction) {
            appendLog(
              'Usage: agent team <id> "<instruction>" (ids: creative_team, promo_team, analysis_team, loopos_team)',
              'info',
            )
            return
          }

          runTeam({
            teamId: teamIdToken as AgentTeamId,
            originOS: 'ascii',
            instruction,
          }).catch(() => {
            appendLog('Failed to run agent team from ASCII.', 'error')
          })

          const preview =
            instruction.length > 80
              ? `${instruction.slice(0, 77).trimEnd()}…`
              : instruction
          appendLog(`Spawned agent team [${teamIdToken}]: ${preview}`, 'system')
          return
        }

        if (sub.startsWith('run ')) {
          const withoutRun = sub.slice('run '.length).trim()
          const firstSpaceIndex = withoutRun.indexOf(' ')
          if (firstSpaceIndex === -1) {
            appendLog(
              'Usage: agent run <role> "<instruction>" (roles: scout, coach, tracker, insight)',
              'info',
            )
            return
          }

          const roleToken = withoutRun.slice(0, firstSpaceIndex).trim()
          const instructionRaw = withoutRun.slice(firstSpaceIndex + 1).trim()

          if (
            roleToken !== 'scout' &&
            roleToken !== 'coach' &&
            roleToken !== 'tracker' &&
            roleToken !== 'insight'
          ) {
            appendLog(
              'Unknown agent role. Use one of: scout, coach, tracker, insight.',
              'error',
            )
            return
          }

          const instruction =
            instructionRaw.startsWith('"') && instructionRaw.endsWith('"') && instructionRaw.length > 1
              ? instructionRaw.slice(1, -1)
              : instructionRaw

          if (!instruction) {
            appendLog(
              'Usage: agent run <role> "<instruction>" (roles: scout, coach, tracker, insight)',
              'info',
            )
            return
          }

          spawnAgentRun({
            role: roleToken,
            originOS: 'ascii',
            input: instruction,
          }).catch(() => {
            appendLog('Failed to spawn agent run from ASCII.', 'error')
          })

          const preview =
            instruction.length > 80
              ? `${instruction.slice(0, 77).trimEnd()}…`
              : instruction
          appendLog(`Spawned ${roleToken} agent: ${preview}`, 'system')
          return
        }

        appendLog(
          [
            'Agent commands:',
            '- agent run <role> "<instruction>"',
            '- agent status',
            '- agent last',
          ],
          'info',
        )
        return
      }

      if (cmd === 'loop suggest') {
        const instruction =
          'Look at the current promotion loop and suggest the next few clips or actions to keep momentum going.'

        spawnAgentRun({
          role: 'coach',
          originOS: 'ascii',
          input: instruction,
        }).catch(() => {
          appendLog('Failed to spawn loop suggestion agent.', 'error')
        })

        appendLog('Spawned coach agent to suggest next steps for the loop.', 'system')
        return
      }

      appendLog(`Unknown command: ${cmd}`, 'error')
    },
    [
      appendLog,
      createProject,
      currentProject,
      handleCreateNote,
      isDemoMode,
      notes.length,
      onSetOS,
      persona,
      projects,
      runs,
      setProject,
      spawnAgentRun,
    ],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore modifier combos
      if (e.metaKey || e.ctrlKey || e.altKey) return

      // ENTER submits command
      if (e.key === 'Enter') {
        if (input.trim()) {
          play('success')
          runCommand(input)
          setInput('')
        }
        return
      }

      // BACKSPACE deletes last character
      if (e.key === 'Backspace') {
        setInput((prev) => prev.slice(0, -1))
        play('click')
        return
      }

      // Ignore non-printable keys
      if (e.key.length !== 1) return

      // Append printable character
      setInput((prev) => prev + e.key)
      play('click')
    },
    [input, play, runCommand]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    const payloads = consumeOSBridges('ascii')
    if (!payloads.length) return

    payloads.forEach((payload) => {
      if (payload.kind === 'analogue-to-ascii') {
        appendLog(payload.message, 'info')
      }
    })
  }, [appendLog])

  useEffect(() => {
    if (!isDemoMode) return

    const coachCommand = buildLanaCoachCommand(narrative?.flags ?? null)

    appendLog(
      ['Welcome to the LANA GLASS demo session.', `Try: ${coachCommand}`],
      'system',
    )
  }, [appendLog, isDemoMode, narrative?.flags])

  useEffect(() => {
    inputRef.current = input
  }, [input])

  useEffect(() => {
    if (!isDemoMode) {
      registerAsciiController(null)
      return
    }

    registerAsciiController({
      typeCommand: (textFromDirector) => {
        const coachCommand = buildLanaCoachCommand(narrative?.flags ?? null)
        const nextValue = narrative ? coachCommand : textFromDirector
        setInput(nextValue)
        inputRef.current = nextValue
      },
      submitCommand: () => {
        const value = inputRef.current.trim()
        if (!value) return
        play('success')
        runCommand(value)
        setInput('')
        inputRef.current = ''
      },
    })

    return () => {
      registerAsciiController(null)
    }
  }, [isDemoMode, narrative, play, runCommand])

  useEffect(() => {
    if (!logRef.current) return
    logRef.current.scrollTop = logRef.current.scrollHeight
  }, [log])

  const lastNote = notes[notes.length - 1]
  const notePreview =
    lastNote && lastNote.text.length > 64
      ? `${lastNote.text.slice(0, 61).trimEnd()}…`
      : lastNote?.text

  return (
    <div className="pt-4 text-[#00ff99] font-mono">
      {/* Notes summary */}
      <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[#00ff99]/70">
        <span>
          notes: {notes.length.toString().padStart(2, '0')}{' '}
          {notes.length === 0 ? '(empty)' : ''}
        </span>
        {notePreview && (
          <span className="max-w-[60%] truncate text-[10px] normal-case tracking-normal text-[#00ff99]/80">
            last: {notePreview}
          </span>
        )}
      </div>

      {/* Log area */}
      <div
        id="ascii-log"
        ref={logRef}
        className="mb-3 min-h-[140px] max-h-[220px] space-y-1 overflow-y-auto pr-1 text-sm"
      >
        {log.map((entry) => (
          <div key={entry.id} className="flex gap-2 text-[11px] leading-relaxed">
            <span className="shrink-0 text-[#00ff99]/50">[{entry.timestamp}]</span>
            <span>{entry.text}</span>
          </div>
        ))}
      </div>

      {/* Prompt line */}
      <div className="flex items-center text-lg">
        <span className="mr-2">{'>'}</span>
        <span>{input}</span>

        {/* Blinking cursor */}
        <motion.span
          className="inline-block w-3 h-5 bg-[#00ff99] ml-1"
          animate={{ opacity: [0, 1] }}
          transition={{
            duration:
              mood?.mood === 'charged' || mood?.mood === 'chaotic'
                ? 0.35
                : mood?.mood === 'idle'
                  ? 0.75
                  : 0.5,
            repeat: Infinity,
          }}
        />
      </div>
    </div>
  )
}
