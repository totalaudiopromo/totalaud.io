/**
 * Agent Runner
 * Core runtime for executing agent behaviours on timeline clips
 */

import type { TimelineClip } from '@totalaud/os-state/campaign'
import type { AgentContext, AgentCapabilities } from './agent-context'
import type {
  AgentEvent,
  AgentEventType,
  AgentEventListener,
  AgentEventMap,
} from './agent-events'
import { agentStateManager } from './agent-state'
import { agentLogger } from './agent-logger'

export interface AgentBehaviour {
  name: string
  description: string
  supportedClipTypes: string[]
  capabilities: AgentCapabilities

  /**
   * Execute the behaviour
   */
  execute(clip: TimelineClip, context: AgentContext): Promise<AgentBehaviourOutput>

  /**
   * Validate if this behaviour can execute on the given clip
   */
  canExecute(clip: TimelineClip, context: AgentContext): boolean
}

export interface AgentBehaviourOutput {
  success: boolean
  message: string
  data?: unknown
  clipsToCreate?: Array<Partial<TimelineClip>>
  cardsToCreate?: Array<{
    type: string
    content: string
    linkedClipId?: string
  }>
  requiresUserInput?: boolean
  userInputPrompt?: string
}

export class AgentRunner {
  private behaviours: Map<string, AgentBehaviour> = new Map()
  private eventListeners: Map<AgentEventType, Set<AgentEventListener<any>>> = new Map()
  private activeClips: Set<string> = new Set()

  /**
   * Register an agent behaviour
   */
  registerBehaviour(behaviour: AgentBehaviour): void {
    this.behaviours.set(behaviour.name, behaviour)
    agentStateManager.registerAgent(behaviour.name)
    agentLogger.info(behaviour.name, `Behaviour registered: ${behaviour.description}`)
  }

  /**
   * Subscribe to agent events
   */
  on<T extends AgentEventType>(
    eventType: T,
    listener: AgentEventListener<T>
  ): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set())
    }

    const listeners = this.eventListeners.get(eventType)!
    listeners.add(listener as AgentEventListener<any>)

    // Return unsubscribe function
    return () => {
      listeners.delete(listener as AgentEventListener<any>)
    }
  }

  /**
   * Emit an event
   */
  private emit<T extends AgentEventType>(event: AgentEventMap[T]): void {
    const listeners = this.eventListeners.get(event.type)
    if (!listeners) return

    listeners.forEach((listener) => {
      try {
        listener(event)
      } catch (error) {
        agentLogger.error(
          'EventBus',
          `Error in event listener for ${event.type}`,
          undefined,
          { error }
        )
      }
    })
  }

  /**
   * Execute a clip's behaviour
   */
  async executeClip(
    clip: TimelineClip,
    context: AgentContext
  ): Promise<AgentBehaviourOutput | null> {
    const agentName = clip.agentSource
    if (!agentName) {
      agentLogger.warn('AgentRunner', 'Clip has no assigned agent', clip.id)
      return null
    }

    const behaviour = this.behaviours.get(agentName)
    if (!behaviour) {
      agentLogger.error('AgentRunner', `Behaviour not found: ${agentName}`, clip.id)
      return null
    }

    // Check if can execute
    if (!behaviour.canExecute(clip, context)) {
      agentLogger.warn(
        agentName,
        'Behaviour cannot execute on this clip',
        clip.id,
        { clipName: clip.name }
      )
      this.emit({
        type: 'clip_rejected',
        timestamp: new Date(),
        clipId: clip.id,
        reason: 'Behaviour validation failed',
      })
      return null
    }

    // Check rate limiting
    if (!agentStateManager.canExecute(agentName)) {
      agentLogger.warn(agentName, 'Rate limit exceeded', clip.id)
      return null
    }

    // Start execution
    agentStateManager.startExecution(agentName, clip.id)
    agentStateManager.recordExecution(agentName)
    this.activeClips.add(clip.id)

    agentLogger.info(agentName, `Starting execution: ${clip.name}`, clip.id)
    this.emit({
      type: 'agent_started',
      timestamp: new Date(),
      agentName,
      clipId: clip.id,
      data: { behaviour: behaviour.name },
    })

    try {
      // Execute behaviour
      const output = await behaviour.execute(clip, context)

      // Complete execution
      agentStateManager.completeExecution(agentName, output)
      this.activeClips.delete(clip.id)

      agentLogger.info(
        agentName,
        `Completed: ${output.message}`,
        clip.id,
        { success: output.success }
      )

      this.emit({
        type: 'agent_finished',
        timestamp: new Date(),
        agentName,
        clipId: clip.id,
        data: { success: output.success, output },
      })

      this.emit({
        type: 'agent_output',
        timestamp: new Date(),
        agentName,
        clipId: clip.id,
        data: output,
      })

      // Handle user input requests
      if (output.requiresUserInput && output.userInputPrompt) {
        this.emit({
          type: 'agent_request_input',
          timestamp: new Date(),
          agentName,
          data: {
            message: output.userInputPrompt,
            context: { clipId: clip.id },
          },
        })
      }

      return output
    } catch (error) {
      // Handle errors
      const errorMessage = error instanceof Error ? error.message : String(error)
      agentStateManager.failExecution(agentName, errorMessage)
      this.activeClips.delete(clip.id)

      agentLogger.error(agentName, `Execution failed: ${errorMessage}`, clip.id, {
        error,
      })

      this.emit({
        type: 'agent_error',
        timestamp: new Date(),
        agentName,
        clipId: clip.id,
        data: { error },
      })

      return {
        success: false,
        message: `Error: ${errorMessage}`,
      }
    }
  }

  /**
   * Handle clip activation (when playhead reaches it)
   */
  async onClipActivated(
    clip: TimelineClip,
    playheadPosition: number,
    context: AgentContext
  ): Promise<void> {
    agentLogger.debug('AgentRunner', `Clip activated: ${clip.name}`, clip.id, {
      playheadPosition,
    })

    this.emit({
      type: 'clip_activated',
      timestamp: new Date(),
      clipId: clip.id,
      data: { clip, playheadPosition },
    })

    // Auto-execute if in auto mode
    if (context.executionMode === 'auto' && context.userPreferences.allowAutoExecution) {
      await this.executeClip(clip, context)
    }
  }

  /**
   * Handle clip completion (when playhead leaves it)
   */
  onClipCompleted(clip: TimelineClip): void {
    agentLogger.debug('AgentRunner', `Clip completed: ${clip.name}`, clip.id)

    this.emit({
      type: 'clip_completed',
      timestamp: new Date(),
      clipId: clip.id,
      data: { clip },
    })

    this.activeClips.delete(clip.id)
  }

  /**
   * Check if clip is currently active
   */
  isClipActive(clipId: string): boolean {
    return this.activeClips.has(clipId)
  }

  /**
   * Get all registered behaviours
   */
  getBehaviours(): AgentBehaviour[] {
    return Array.from(this.behaviours.values())
  }

  /**
   * Get behaviour by name
   */
  getBehaviour(name: string): AgentBehaviour | undefined {
    return this.behaviours.get(name)
  }
}

// Global agent runner instance
export const agentRunner = new AgentRunner()
