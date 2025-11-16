/**
 * Director Engine
 * Orchestrates cinematic auto-playback of demo
 */

import type { DirectorAction, DirectorActionKind } from './directorScript'

export interface DirectorState {
  isEnabled: boolean // True only in demo mode & when user hits "Play"
  isPlaying: boolean
  currentIndex: number
  currentActionId: string | null
}

export type DirectorActionExecutor = (action: DirectorAction) => Promise<void>

export interface DirectorCallbacks {
  // OS navigation
  onSetOS?: (osSlug: string) => void

  // ASCII
  onTypeAscii?: (text: string, durationMs: number) => Promise<void>
  onRunAsciiCommand?: () => void

  // Analogue
  onHighlightAnalogueCard?: (title: string, durationMs: number) => void

  // XP
  onFocusXpAgentRun?: () => void

  // LoopOS
  onPanCamera?: (target: string, durationMs: number) => Promise<void>
  onPlayLoopOS?: (durationMs: number) => Promise<void>
  onStopLoopOS?: () => void

  // Aqua
  onOpenAquaAgent?: () => void

  // Ambient
  onSetAmbientIntensity?: (intensity: number) => void

  // UI
  onShowNote?: (text: string) => void

  // TAP Integration (Phase 28C)
  onTriggerTapExport?: (payload: any, durationMs: number) => Promise<void>

  // Audio (Phase 29 Pass 5)
  onPlayEffect?: (effectName: string) => void
}

export class DirectorEngine {
  private state: DirectorState = {
    isEnabled: false,
    isPlaying: false,
    currentIndex: 0,
    currentActionId: null,
  }

  private callbacks: DirectorCallbacks = {}
  private listeners: Set<(state: DirectorState) => void> = new Set()
  private playbackTimeout: number | null = null
  private currentExecutionAbort: AbortController | null = null
  private script: DirectorAction[]

  constructor(script: DirectorAction[], callbacks?: DirectorCallbacks) {
    this.script = script
    if (callbacks) {
      this.callbacks = callbacks
    }
  }

  // ============================================================
  // Public API
  // ============================================================

  getState(): DirectorState {
    return { ...this.state }
  }

  subscribe(listener: (state: DirectorState) => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  setCallbacks(callbacks: DirectorCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  start(): void {
    this.state = {
      isEnabled: true,
      isPlaying: true,
      currentIndex: 0,
      currentActionId: null,
    }
    this.notifyListeners()
    this.scheduleNextAction()
  }

  pause(): void {
    if (!this.state.isEnabled) return

    this.state.isPlaying = false
    this.notifyListeners()

    // Clear timeout immediately
    if (this.playbackTimeout !== null) {
      clearTimeout(this.playbackTimeout)
      this.playbackTimeout = null
    }

    // Abort current execution instantly
    if (this.currentExecutionAbort) {
      this.currentExecutionAbort.abort()
      this.currentExecutionAbort = null
    }
  }

  resume(): void {
    if (!this.state.isEnabled || this.state.isPlaying) return

    this.state.isPlaying = true
    this.notifyListeners()

    // Continue from current index with fresh scheduling
    this.scheduleNextAction()
  }

  stop(): void {
    // Abort current execution and clear timeout
    this.pause()

    // Reset state cleanly
    this.state = {
      isEnabled: false,
      isPlaying: false,
      currentIndex: 0,
      currentActionId: null,
    }
    this.notifyListeners()
  }

  skipToNext(): void {
    if (!this.state.isEnabled) return

    // Cancel current action immediately
    if (this.playbackTimeout !== null) {
      clearTimeout(this.playbackTimeout)
      this.playbackTimeout = null
    }

    // Abort current execution instantly
    if (this.currentExecutionAbort) {
      this.currentExecutionAbort.abort()
      this.currentExecutionAbort = null
    }

    // Move to next action instantly
    if (this.state.currentIndex < this.script.length - 1) {
      this.state.currentIndex++
      this.notifyListeners()

      if (this.state.isPlaying) {
        this.scheduleNextAction()
      }
    } else {
      this.stop()
    }
  }

  skipToPrevious(): void {
    if (!this.state.isEnabled) return

    // Cancel current action immediately
    if (this.playbackTimeout !== null) {
      clearTimeout(this.playbackTimeout)
      this.playbackTimeout = null
    }

    // Abort current execution instantly
    if (this.currentExecutionAbort) {
      this.currentExecutionAbort.abort()
      this.currentExecutionAbort = null
    }

    // Move to previous action
    if (this.state.currentIndex > 0) {
      this.state.currentIndex--
      this.notifyListeners()

      if (this.state.isPlaying) {
        this.scheduleNextAction()
      }
    }
  }

  // ============================================================
  // Internal Playback
  // ============================================================

  private scheduleNextAction(): void {
    if (!this.state.isPlaying) return

    if (this.state.currentIndex >= this.script.length) {
      this.stop()
      return
    }

    const action = this.script[this.state.currentIndex]
    const delayMs = action.delayMs ?? 0

    this.state.currentActionId = action.id
    this.notifyListeners()

    this.playbackTimeout = window.setTimeout(() => {
      this.executeAction(action)
        .then(() => {
          if (!this.state.isPlaying) return

          // Add 100ms buffer after action completes (unless explicitly disabled)
          const bufferMs = 100

          // Move to next action after buffer
          setTimeout(() => {
            if (!this.state.isPlaying) return

            this.state.currentIndex++

            if (this.state.currentIndex >= this.script.length) {
              this.stop()
            } else {
              this.scheduleNextAction()
            }
          }, bufferMs)
        })
        .catch((error) => {
          // Only log non-abort errors
          if (error?.message !== 'Action aborted') {
            console.error('[DirectorEngine] Action execution failed:', error)
          }

          // Continue to next action despite error
          this.state.currentIndex++
          if (this.state.isPlaying) {
            this.scheduleNextAction()
          }
        })
    }, delayMs)
  }

  private async executeAction(action: DirectorAction): Promise<void> {
    // Create AbortController for this action
    const abortController = new AbortController()
    this.currentExecutionAbort = abortController

    try {
      switch (action.kind) {
        case 'WAIT':
          await this.executeWait(abortController.signal)
          break

        case 'SET_OS':
          await this.executeSetOS(action, abortController.signal)
          break

        case 'TYPE_ASCII':
          await this.executeTypeAscii(action, abortController.signal)
          break

        case 'RUN_ASCII_COMMAND':
          await this.executeRunAsciiCommand(action, abortController.signal)
          break

        case 'HIGHLIGHT_ANALOGUE_CARD':
          await this.executeHighlightAnalogueCard(action, abortController.signal)
          break

        case 'FOCUS_XP_AGENT_RUN':
          await this.executeFocusXpAgentRun(action, abortController.signal)
          break

        case 'PAN_CAMERA':
          await this.executePanCamera(action, abortController.signal)
          break

        case 'PLAY_LOOPOS':
          await this.executePlayLoopOS(action, abortController.signal)
          break

        case 'STOP_LOOPOS':
          await this.executeStopLoopOS(action, abortController.signal)
          break

        case 'OPEN_AQUA_AGENT':
          await this.executeOpenAquaAgent(action, abortController.signal)
          break

        case 'SET_AMBIENT_INTENSITY':
          await this.executeSetAmbientIntensity(action, abortController.signal)
          break

        case 'SHOW_NOTE':
          await this.executeShowNote(action, abortController.signal)
          break

        case 'TRIGGER_TAP_EXPORT':
          await this.executeTriggerTapExport(action, abortController.signal)
          break

        default:
          console.warn('[DirectorEngine] Unknown action kind:', (action as any).kind)
      }

      // Check if aborted after execution
      if (abortController.signal.aborted) {
        throw new Error('Action aborted')
      }
    } catch (error) {
      // Re-throw abort errors
      if (abortController.signal.aborted || (error as Error)?.message === 'Action aborted') {
        throw new Error('Action aborted')
      }
      // Re-throw other errors
      throw error
    } finally {
      this.currentExecutionAbort = null
    }
  }

  // ============================================================
  // Action Executors
  // ============================================================

  private async executeWait(signal: AbortSignal): Promise<void> {
    // No-op, delay handled by delayMs
    // Check abort signal
    if (signal.aborted) throw new Error('Action aborted')
  }

  private async executeSetOS(action: DirectorAction, signal: AbortSignal): Promise<void> {
    if (signal.aborted) throw new Error('Action aborted')

    const { osSlug } = action.payload || {}
    if (osSlug && this.callbacks.onSetOS) {
      this.callbacks.onSetOS(osSlug)
    }
  }

  private async executeTypeAscii(action: DirectorAction, signal: AbortSignal): Promise<void> {
    if (signal.aborted) throw new Error('Action aborted')

    const { text } = action.payload || {}
    const durationMs = action.durationMs ?? 1000

    if (text && this.callbacks.onTypeAscii) {
      await this.callbacks.onTypeAscii(text, durationMs)
    }

    if (signal.aborted) throw new Error('Action aborted')
  }

  private async executeRunAsciiCommand(action: DirectorAction, signal: AbortSignal): Promise<void> {
    if (signal.aborted) throw new Error('Action aborted')

    if (this.callbacks.onRunAsciiCommand) {
      this.callbacks.onRunAsciiCommand()
    }
  }

  private async executeHighlightAnalogueCard(
    action: DirectorAction,
    signal: AbortSignal
  ): Promise<void> {
    if (signal.aborted) throw new Error('Action aborted')

    const { title } = action.payload || {}
    const durationMs = action.durationMs ?? 2000

    if (title && this.callbacks.onHighlightAnalogueCard) {
      this.callbacks.onHighlightAnalogueCard(title, durationMs)
    }
  }

  private async executeFocusXpAgentRun(action: DirectorAction, signal: AbortSignal): Promise<void> {
    if (signal.aborted) throw new Error('Action aborted')

    if (this.callbacks.onFocusXpAgentRun) {
      this.callbacks.onFocusXpAgentRun()
    }
  }

  private async executePanCamera(action: DirectorAction, signal: AbortSignal): Promise<void> {
    if (signal.aborted) throw new Error('Action aborted')

    const { target } = action.payload || {}
    const durationMs = action.durationMs ?? 1000

    if (target && this.callbacks.onPanCamera) {
      await this.callbacks.onPanCamera(target, durationMs)
    }

    if (signal.aborted) throw new Error('Action aborted')
  }

  private async executePlayLoopOS(action: DirectorAction, signal: AbortSignal): Promise<void> {
    if (signal.aborted) throw new Error('Action aborted')

    const durationMs = action.durationMs ?? 2000

    if (this.callbacks.onPlayLoopOS) {
      await this.callbacks.onPlayLoopOS(durationMs)
    }

    if (signal.aborted) throw new Error('Action aborted')
  }

  private async executeStopLoopOS(action: DirectorAction, signal: AbortSignal): Promise<void> {
    if (signal.aborted) throw new Error('Action aborted')

    if (this.callbacks.onStopLoopOS) {
      this.callbacks.onStopLoopOS()
    }
  }

  private async executeOpenAquaAgent(action: DirectorAction, signal: AbortSignal): Promise<void> {
    if (signal.aborted) throw new Error('Action aborted')

    if (this.callbacks.onOpenAquaAgent) {
      this.callbacks.onOpenAquaAgent()
    }
  }

  private async executeSetAmbientIntensity(
    action: DirectorAction,
    signal: AbortSignal
  ): Promise<void> {
    if (signal.aborted) throw new Error('Action aborted')

    const { intensity } = action.payload || {}

    if (typeof intensity === 'number' && this.callbacks.onSetAmbientIntensity) {
      this.callbacks.onSetAmbientIntensity(intensity)
    }
  }

  private async executeShowNote(action: DirectorAction, signal: AbortSignal): Promise<void> {
    if (signal.aborted) throw new Error('Action aborted')

    const { text } = action.payload || {}

    if (text && this.callbacks.onShowNote) {
      this.callbacks.onShowNote(text)
    }
  }

  private async executeTriggerTapExport(action: DirectorAction, signal: AbortSignal): Promise<void> {
    if (signal.aborted) throw new Error('Action aborted')

    const payload = action.payload || {}
    const durationMs = action.durationMs ?? 2000

    if (this.callbacks.onTriggerTapExport) {
      await this.callbacks.onTriggerTapExport(payload, durationMs)
    }

    if (signal.aborted) throw new Error('Action aborted')
  }

  // ============================================================
  // Utilities
  // ============================================================

  private notifyListeners(): void {
    const state = this.getState()
    this.listeners.forEach((listener) => {
      try {
        listener(state)
      } catch (error) {
        console.error('[DirectorEngine] Listener error:', error)
      }
    })
  }
}
