/**
 * Agent Runner - Phase 9
 * Core agent execution orchestrator
 */

import type { TimelineClip, AgentBehaviourResult, AgentType } from '@total-audio/timeline'
import { ClipInterpreter } from '@total-audio/timeline'
import { getEventBus } from '../events/event-bus'
import { getAgentStateManager } from './agent-state'
import { getAgentLogger } from './agent-logger'
import type { AgentRuntimeContext } from './agent-context'

/**
 * Agent Behaviour Interface
 */
export interface AgentBehaviour {
  /**
   * Agent type
   */
  readonly type: AgentType

  /**
   * Execute the agent behaviour
   */
  execute(context: AgentRuntimeContext): Promise<AgentBehaviourResult>

  /**
   * Validate if the agent can execute given context
   */
  canExecute(context: AgentRuntimeContext): boolean

  /**
   * Get agent description
   */
  getDescription(): string
}

/**
 * Registered Agent Behaviours
 */
const registeredBehaviours: Map<AgentType, AgentBehaviour> = new Map()

/**
 * Agent Runner Options
 */
export interface AgentRunnerOptions {
  /**
   * Enable safeguards (timeouts, rate limiting)
   */
  enableSafeguards?: boolean

  /**
   * Maximum execution time in milliseconds
   */
  maxExecutionTime?: number

  /**
   * Enable verbose logging
   */
  verbose?: boolean
}

/**
 * Agent Runner Class
 */
export class AgentRunner {
  private eventBus = getEventBus()
  private stateManager = getAgentStateManager()
  private logger = getAgentLogger()
  private options: Required<AgentRunnerOptions>

  constructor(options: AgentRunnerOptions = {}) {
    this.options = {
      enableSafeguards: options.enableSafeguards ?? true,
      maxExecutionTime: options.maxExecutionTime ?? 60000, // 60 seconds default
      verbose: options.verbose ?? false,
    }

    if (this.options.verbose) {
      this.logger.setLogLevel('debug')
    }
  }

  /**
   * Register an agent behaviour
   */
  registerBehaviour(behaviour: AgentBehaviour): void {
    if (registeredBehaviours.has(behaviour.type)) {
      this.logger.warn(
        behaviour.type,
        'global',
        `Behaviour for agent type "${behaviour.type}" is already registered. Overwriting.`
      )
    }

    registeredBehaviours.set(behaviour.type, behaviour)
    this.logger.info(behaviour.type, 'global', `Registered behaviour: ${behaviour.getDescription()}`)
  }

  /**
   * Unregister an agent behaviour
   */
  unregisterBehaviour(type: AgentType): boolean {
    const removed = registeredBehaviours.delete(type)

    if (removed) {
      this.logger.info(type, 'global', `Unregistered behaviour for agent type "${type}"`)
    }

    return removed
  }

  /**
   * Get registered behaviour for agent type
   */
  private getBehaviour(type: AgentType): AgentBehaviour | null {
    return registeredBehaviours.get(type) || null
  }

  /**
   * Execute a clip
   */
  async executeClip(clip: TimelineClip, context: AgentRuntimeContext): Promise<AgentBehaviourResult> {
    const clipId = clip.id
    const agentType = clip.agentType

    // Interpret the clip
    const interpretation = ClipInterpreter.interpret(clip)

    if (!interpretation.isValid) {
      const errorMessage = `Invalid clip: ${interpretation.errors.join(', ')}`
      this.logger.error(agentType, clipId, errorMessage)

      await this.eventBus.emit({
        type: 'onClipRejected',
        clip,
        reason: errorMessage,
        timestamp: new Date().toISOString(),
      })

      return {
        success: false,
        clipId,
        agentType,
        behaviourType: clip.behaviourType,
        message: errorMessage,
        errors: interpretation.errors,
      }
    }

    // Get behaviour for agent type
    const behaviour = this.getBehaviour(agentType)

    if (!behaviour) {
      const errorMessage = `No behaviour registered for agent type "${agentType}"`
      this.logger.error(agentType, clipId, errorMessage)

      await this.eventBus.emit({
        type: 'onAgentError',
        agentType,
        clipId,
        error: new Error(errorMessage),
        timestamp: new Date().toISOString(),
      })

      return {
        success: false,
        clipId,
        agentType,
        behaviourType: clip.behaviourType,
        message: errorMessage,
        errors: [errorMessage],
      }
    }

    // Check if behaviour can execute
    if (!behaviour.canExecute(context)) {
      const errorMessage = 'Agent behaviour cannot execute in current context'
      this.logger.warn(agentType, clipId, errorMessage)

      await this.eventBus.emit({
        type: 'onClipRejected',
        clip,
        reason: errorMessage,
        timestamp: new Date().toISOString(),
      })

      return {
        success: false,
        clipId,
        agentType,
        behaviourType: clip.behaviourType,
        message: errorMessage,
        errors: [errorMessage],
      }
    }

    // Register state
    this.stateManager.register(clipId, agentType)

    // Emit started event
    await this.eventBus.emit({
      type: 'onAgentStarted',
      agentType,
      clipId,
      timestamp: new Date().toISOString(),
    })

    // Emit clip activated event
    await this.eventBus.emit({
      type: 'onClipActivated',
      clip,
      playheadPosition: context.timeline.playhead.position,
      timestamp: new Date().toISOString(),
    })

    this.logger.info(agentType, clipId, `Executing clip: ${clip.title}`)
    this.stateManager.setRunning(clipId)

    const startTime = Date.now()
    let result: AgentBehaviourResult

    try {
      // Execute with timeout if safeguards enabled
      if (this.options.enableSafeguards) {
        result = await this.executeWithTimeout(behaviour, context, this.options.maxExecutionTime)
      } else {
        result = await behaviour.execute(context)
      }

      const duration = Date.now() - startTime

      // Update state to completed
      this.stateManager.setCompleted(clipId, result.output)

      this.logger.info(agentType, clipId, `Execution completed in ${duration}ms`)

      // Emit completed event
      await this.eventBus.emit({
        type: 'onClipCompleted',
        clip,
        result,
        duration,
        timestamp: new Date().toISOString(),
      })

      // Emit output event if there is output
      if (result.output) {
        await this.eventBus.emit({
          type: 'onAgentOutput',
          agentType,
          clipId,
          output: result.output,
          timestamp: new Date().toISOString(),
        })
      }

      // Emit stopped event
      await this.eventBus.emit({
        type: 'onAgentStopped',
        agentType,
        clipId,
        reason: 'completed',
        timestamp: new Date().toISOString(),
      })

      return result
    } catch (error) {
      const duration = Date.now() - startTime
      const errorObj = error instanceof Error ? error : new Error(String(error))

      // Update state to failed
      this.stateManager.setFailed(clipId, errorObj)

      this.logger.error(agentType, clipId, `Execution failed after ${duration}ms: ${errorObj.message}`)

      // Emit error event
      await this.eventBus.emit({
        type: 'onAgentError',
        agentType,
        clipId,
        error: errorObj,
        timestamp: new Date().toISOString(),
      })

      // Emit stopped event
      await this.eventBus.emit({
        type: 'onAgentStopped',
        agentType,
        clipId,
        reason: 'error',
        timestamp: new Date().toISOString(),
      })

      return {
        success: false,
        clipId,
        agentType,
        behaviourType: clip.behaviourType,
        message: `Execution failed: ${errorObj.message}`,
        errors: [errorObj.message],
      }
    }
  }

  /**
   * Execute behaviour with timeout
   */
  private async executeWithTimeout(
    behaviour: AgentBehaviour,
    context: AgentRuntimeContext,
    timeout: number
  ): Promise<AgentBehaviourResult> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Agent execution timed out after ${timeout}ms`))
      }, timeout)

      behaviour
        .execute(context)
        .then((result) => {
          clearTimeout(timer)
          resolve(result)
        })
        .catch((error) => {
          clearTimeout(timer)
          reject(error)
        })
    })
  }

  /**
   * Get all registered agent types
   */
  getRegisteredAgentTypes(): AgentType[] {
    return Array.from(registeredBehaviours.keys())
  }

  /**
   * Check if agent type is registered
   */
  isAgentRegistered(type: AgentType): boolean {
    return registeredBehaviours.has(type)
  }

  /**
   * Get execution statistics
   */
  getStats(): {
    totalRegistered: number
    activeExecutions: number
    completedExecutions: number
    failedExecutions: number
  } {
    return {
      totalRegistered: registeredBehaviours.size,
      activeExecutions: this.stateManager.getCountByState('running'),
      completedExecutions: this.stateManager.getCountByState('completed'),
      failedExecutions: this.stateManager.getCountByState('failed'),
    }
  }
}

/**
 * Global runner instance
 */
let globalRunner: AgentRunner | null = null

/**
 * Get or create the global agent runner
 */
export function getAgentRunner(options?: AgentRunnerOptions): AgentRunner {
  if (!globalRunner) {
    globalRunner = new AgentRunner(options)
  }
  return globalRunner
}

/**
 * Reset the global runner (useful for testing)
 */
export function resetAgentRunner(): void {
  globalRunner = null
}
