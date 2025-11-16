/**
 * Director Engine
 * Orchestrates cinematic auto-playback of demo
 */

import { DIRECTOR_SCRIPT, type DirectorAction, type DirectorActionKind } from './directorScript'

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
  private currentExecutionAbort: (() => void) | null = null

  constructor(callbacks?: DirectorCallbacks) {
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

    if (this.playbackTimeout !== null) {
      clearTimeout(this.playbackTimeout)
      this.playbackTimeout = null
    }

    if (this.currentExecutionAbort) {
      this.currentExecutionAbort()
      this.currentExecutionAbort = null
    }
  }

  resume(): void {
    if (!this.state.isEnabled || this.state.isPlaying) return

    this.state.isPlaying = true
    this.notifyListeners()
    this.scheduleNextAction()
  }

  stop(): void {
    this.pause()

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

    // Cancel current action
    if (this.playbackTimeout !== null) {
      clearTimeout(this.playbackTimeout)
      this.playbackTimeout = null
    }

    if (this.currentExecutionAbort) {
      this.currentExecutionAbort()
      this.currentExecutionAbort = null
    }

    // Move to next
    if (this.state.currentIndex < DIRECTOR_SCRIPT.length - 1) {
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

    // Cancel current action
    if (this.playbackTimeout !== null) {
      clearTimeout(this.playbackTimeout)
      this.playbackTimeout = null
    }

    if (this.currentExecutionAbort) {
      this.currentExecutionAbort()
      this.currentExecutionAbort = null
    }

    // Move to previous
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

    if (this.state.currentIndex >= DIRECTOR_SCRIPT.length) {
      this.stop()
      return
    }

    const action = DIRECTOR_SCRIPT[this.state.currentIndex]
    const delayMs = action.delayMs ?? 0

    this.state.currentActionId = action.id
    this.notifyListeners()

    this.playbackTimeout = window.setTimeout(() => {
      this.executeAction(action)
        .then(() => {
          if (!this.state.isPlaying) return

          // Move to next action
          this.state.currentIndex++

          if (this.state.currentIndex >= DIRECTOR_SCRIPT.length) {
            this.stop()
          } else {
            this.scheduleNextAction()
          }
        })
        .catch((error) => {
          console.error('[DirectorEngine] Action execution failed:', error)
          // Continue to next action despite error
          this.state.currentIndex++
          if (this.state.isPlaying) {
            this.scheduleNextAction()
          }
        })
    }, delayMs)
  }

  private async executeAction(action: DirectorAction): Promise<void> {
    let aborted = false
    this.currentExecutionAbort = () => {
      aborted = true
    }

    try {
      switch (action.kind) {
        case 'WAIT':
          await this.executeWait()
          break

        case 'SET_OS':
          await this.executeSetOS(action)
          break

        case 'TYPE_ASCII':
          await this.executeTypeAscii(action)
          break

        case 'RUN_ASCII_COMMAND':
          await this.executeRunAsciiCommand(action)
          break

        case 'HIGHLIGHT_ANALOGUE_CARD':
          await this.executeHighlightAnalogueCard(action)
          break

        case 'FOCUS_XP_AGENT_RUN':
          await this.executeFocusXpAgentRun(action)
          break

        case 'PAN_CAMERA':
          await this.executePanCamera(action)
          break

        case 'PLAY_LOOPOS':
          await this.executePlayLoopOS(action)
          break

        case 'STOP_LOOPOS':
          await this.executeStopLoopOS(action)
          break

        case 'OPEN_AQUA_AGENT':
          await this.executeOpenAquaAgent(action)
          break

        case 'SET_AMBIENT_INTENSITY':
          await this.executeSetAmbientIntensity(action)
          break

        case 'SHOW_NOTE':
          await this.executeShowNote(action)
          break

        default:
          console.warn('[DirectorEngine] Unknown action kind:', (action as any).kind)
      }
    } finally {
      this.currentExecutionAbort = null
    }

    if (aborted) {
      throw new Error('Action aborted')
    }
  }

  // ============================================================
  // Action Executors
  // ============================================================

  private async executeWait(): Promise<void> {
    // No-op, delay handled by delayMs
  }

  private async executeSetOS(action: DirectorAction): Promise<void> {
    const { osSlug } = action.payload || {}
    if (osSlug && this.callbacks.onSetOS) {
      this.callbacks.onSetOS(osSlug)
    }
  }

  private async executeTypeAscii(action: DirectorAction): Promise<void> {
    const { text } = action.payload || {}
    const durationMs = action.durationMs ?? 1000

    if (text && this.callbacks.onTypeAscii) {
      await this.callbacks.onTypeAscii(text, durationMs)
    }
  }

  private async executeRunAsciiCommand(action: DirectorAction): Promise<void> {
    if (this.callbacks.onRunAsciiCommand) {
      this.callbacks.onRunAsciiCommand()
    }
  }

  private async executeHighlightAnalogueCard(action: DirectorAction): Promise<void> {
    const { title } = action.payload || {}
    const durationMs = action.durationMs ?? 2000

    if (title && this.callbacks.onHighlightAnalogueCard) {
      this.callbacks.onHighlightAnalogueCard(title, durationMs)
    }
  }

  private async executeFocusXpAgentRun(action: DirectorAction): Promise<void> {
    if (this.callbacks.onFocusXpAgentRun) {
      this.callbacks.onFocusXpAgentRun()
    }
  }

  private async executePanCamera(action: DirectorAction): Promise<void> {
    const { target } = action.payload || {}
    const durationMs = action.durationMs ?? 1000

    if (target && this.callbacks.onPanCamera) {
      await this.callbacks.onPanCamera(target, durationMs)
    }
  }

  private async executePlayLoopOS(action: DirectorAction): Promise<void> {
    const durationMs = action.durationMs ?? 2000

    if (this.callbacks.onPlayLoopOS) {
      await this.callbacks.onPlayLoopOS(durationMs)
    }
  }

  private async executeStopLoopOS(action: DirectorAction): Promise<void> {
    if (this.callbacks.onStopLoopOS) {
      this.callbacks.onStopLoopOS()
    }
  }

  private async executeOpenAquaAgent(action: DirectorAction): Promise<void> {
    if (this.callbacks.onOpenAquaAgent) {
      this.callbacks.onOpenAquaAgent()
    }
  }

  private async executeSetAmbientIntensity(action: DirectorAction): Promise<void> {
    const { intensity } = action.payload || {}

    if (typeof intensity === 'number' && this.callbacks.onSetAmbientIntensity) {
      this.callbacks.onSetAmbientIntensity(intensity)
    }
  }

  private async executeShowNote(action: DirectorAction): Promise<void> {
    const { text } = action.payload || {}

    if (text && this.callbacks.onShowNote) {
      this.callbacks.onShowNote(text)
    }
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
