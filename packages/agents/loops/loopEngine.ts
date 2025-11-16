/**
 * Loop Engine
 * Core autonomous loop execution engine
 */

import type { AgentLoop, LoopEvent, LoopExecutionResult, LoopSuggestion, LoopMetrics, AgentName } from './loopTypes'
import { loopScheduler } from './loopScheduler'
import { createLoopContext, loopContextToAgentContext, shouldExecuteLoop } from './loopContext'
import { agentRunner } from '../runtime/agent-runner'
import { agentLogger } from '../runtime/agent-logger'
import { createAgentContext } from '../runtime/agent-context'
import type { CampaignMeta, TimelineState, CardState, ThemeId } from '@totalaud/os-state/campaign'

export class LoopEngine {
  private loops: Map<string, AgentLoop> = new Map()
  private loopEvents: LoopEvent[] = []
  private suggestions: LoopSuggestion[] = []
  private intervalHandles: Map<string, NodeJS.Timeout> = new Map()
  private isRunning: boolean = false

  /**
   * Initialize loop engine with loops from database
   */
  initialize(loops: AgentLoop[]): void {
    this.loops.clear()
    loops.forEach((loop) => {
      this.loops.set(loop.id, loop)
    })

    agentLogger.log('loop-engine', 'info', `Loop Engine initialized with ${loops.length} loops`)
  }

  /**
   * Start the loop engine
   */
  start(): void {
    if (this.isRunning) {
      agentLogger.log('loop-engine', 'warn', 'Loop Engine already running')
      return
    }

    this.isRunning = true

    // Check for ready loops every minute
    const checkInterval = setInterval(() => {
      this.checkAndExecuteLoops()
    }, 60 * 1000)

    this.intervalHandles.set('main', checkInterval)

    // Initial check
    this.checkAndExecuteLoops()

    agentLogger.log('loop-engine', 'info', 'Loop Engine started')
  }

  /**
   * Stop the loop engine
   */
  stop(): void {
    this.intervalHandles.forEach((handle) => clearInterval(handle))
    this.intervalHandles.clear()
    this.isRunning = false

    agentLogger.log('loop-engine', 'info', 'Loop Engine stopped')
  }

  /**
   * Add a new loop
   */
  addLoop(loop: AgentLoop): void {
    this.loops.set(loop.id, loop)
    agentLogger.log('loop-engine', 'info', `Loop added: ${loop.id} (${loop.agent}/${loop.loopType})`)
  }

  /**
   * Remove a loop
   */
  removeLoop(loopId: string): void {
    this.loops.delete(loopId)
    agentLogger.log('loop-engine', 'info', `Loop removed: ${loopId}`)
  }

  /**
   * Update loop status
   */
  updateLoopStatus(loopId: string, status: AgentLoop['status']): void {
    const loop = this.loops.get(loopId)
    if (loop) {
      loop.status = status
      loop.updatedAt = new Date().toISOString()
      this.loops.set(loopId, loop)
    }
  }

  /**
   * Check for ready loops and execute them
   */
  private async checkAndExecuteLoops(): Promise<void> {
    const readyLoops = loopScheduler.getReadyLoops(Array.from(this.loops.values()))

    if (readyLoops.length === 0) return

    agentLogger.log('loop-engine', 'info', `Found ${readyLoops.length} ready loops`)

    for (const loop of readyLoops) {
      // Check rate limits per agent
      const agentLoops = Array.from(this.loops.values()).filter((l) => l.agent === loop.agent)
      const rateLimit = loopScheduler.checkRateLimit(agentLoops, 3)

      if (!rateLimit.allowed) {
        agentLogger.log('loop-engine', 'warn', `Rate limit: ${rateLimit.reason}`, loop.id)
        continue
      }

      // Execute loop
      await this.executeLoop(loop)
    }
  }

  /**
   * Execute a single loop
   */
  async executeLoop(loop: AgentLoop, context?: {
    campaign: CampaignMeta
    timeline: TimelineState
    cards: CardState
    currentOS: ThemeId
  }): Promise<LoopExecutionResult> {
    const startTime = Date.now()

    // Update loop status
    this.updateLoopStatus(loop.id, 'running')

    agentLogger.log(loop.agent, 'info', `[LOOP] Executing ${loop.loopType} loop`, loop.id)

    try {
      // Create execution context
      const loopHistory = {
        totalExecutions: this.getLoopExecutionCount(loop.id),
        successRate: this.getLoopSuccessRate(loop.id),
        lastSuccessfulRun: this.getLastSuccessfulRun(loop.id),
      }

      // If context provided, use it; otherwise create minimal context
      const agentContext = context
        ? createAgentContext(
            context.campaign,
            context.timeline,
            context.cards,
            context.currentOS,
            `loop-${loop.id}`,
            { executionMode: 'auto' }
          )
        : this.createMinimalContext(loop)

      const loopContext = createLoopContext(agentContext, loop, loopHistory)

      // Check if should execute
      const shouldRun = shouldExecuteLoop(loop, loopContext)
      if (!shouldRun.shouldExecute) {
        agentLogger.log(loop.agent, 'warn', `[LOOP] Skipped: ${shouldRun.reason}`, loop.id)

        this.updateLoopStatus(loop.id, 'idle')
        return {
          success: false,
          message: shouldRun.reason || 'Loop execution skipped',
        }
      }

      // Execute loop using appropriate behaviour
      const result = await this.executeLoopBehaviour(loop, loopContextToAgentContext(loopContext))

      // Update loop timing
      const nextRun = loopScheduler.calculateNextRun(loop.interval, new Date())
      loop.lastRun = new Date().toISOString()
      loop.nextRun = nextRun.toISOString()
      loop.status = 'idle'
      loop.updatedAt = new Date().toISOString()
      this.loops.set(loop.id, loop)

      // Log event
      const event: LoopEvent = {
        id: crypto.randomUUID(),
        loopId: loop.id,
        agent: loop.agent,
        result: {
          ...result,
          executionTimeMs: Date.now() - startTime,
        },
        createdAt: new Date().toISOString(),
      }
      this.loopEvents.push(event)

      agentLogger.log(
        loop.agent,
        'info',
        `[LOOP] Completed: ${result.message}`,
        loop.id,
        { executionTime: event.result.executionTimeMs }
      )

      return result
    } catch (error) {
      this.updateLoopStatus(loop.id, 'error')

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      agentLogger.log(loop.agent, 'error', `[LOOP] Failed: ${errorMessage}`, loop.id)

      return {
        success: false,
        message: `Loop execution failed: ${errorMessage}`,
        error: errorMessage,
        executionTimeMs: Date.now() - startTime,
      }
    }
  }

  /**
   * Execute loop behaviour using agent runner
   */
  private async executeLoopBehaviour(
    loop: AgentLoop,
    context: ReturnType<typeof loopContextToAgentContext>
  ): Promise<LoopExecutionResult> {
    // Map loop types to behaviour types
    const behaviourTypeMap: Record<string, string> = {
      exploration: 'research',
      improvement: 'planning',
      healthcheck: 'analysis',
      emotion: 'story',
      prediction: 'analysis',
    }

    const behaviourType = behaviourTypeMap[loop.loopType] || 'custom'

    // Create a synthetic clip for loop execution
    const syntheticClip = {
      id: `loop-${loop.id}`,
      trackId: 'loop-track',
      name: `${loop.agent} ${loop.loopType} loop`,
      startTime: 0,
      duration: 60,
      colour: this.getAgentColour(loop.agent),
      agentSource: loop.agent,
      cardLinks: [],
      metadata: {
        behaviourType,
        executionMode: 'auto' as const,
        payload: loop.payload,
        isLoop: true,
        loopId: loop.id,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Execute using agent runner
    const output = await agentRunner.executeClip(syntheticClip, context)

    if (!output) {
      return {
        success: false,
        message: 'No output from agent',
      }
    }

    return {
      success: output.success,
      message: output.message,
      data: output.data,
      clipsCreated: output.clipsToCreate?.length || 0,
      cardsCreated: output.cardsToCreate?.length || 0,
    }
  }

  /**
   * Get agent colour
   */
  private getAgentColour(agent: AgentName): string {
    const colours: Record<AgentName, string> = {
      scout: '#51CF66',
      coach: '#8B5CF6',
      tracker: '#3AA9BE',
      insight: '#F59E0B',
    }
    return colours[agent]
  }

  /**
   * Create minimal context for testing/background execution
   */
  private createMinimalContext(loop: AgentLoop): ReturnType<typeof createAgentContext> {
    return createAgentContext(
      {
        id: 'minimal',
        userId: loop.userId,
        name: 'Background Loop',
        goal: 'Autonomous execution',
        currentTheme: 'daw' as ThemeId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        clips: [],
        tracks: [],
        isPlaying: false,
        playheadPosition: 0,
        zoom: 1,
        viewportStart: 0,
        viewportEnd: 100,
      },
      {
        cards: [],
        selectedCards: [],
        filterByType: undefined,
        sortBy: 'timestamp' as const,
      },
      'daw' as ThemeId,
      `loop-${loop.id}`,
      { executionMode: 'auto' }
    )
  }

  /**
   * Get loop execution count
   */
  private getLoopExecutionCount(loopId: string): number {
    return this.loopEvents.filter((e) => e.loopId === loopId).length
  }

  /**
   * Get loop success rate
   */
  private getLoopSuccessRate(loopId: string): number {
    const events = this.loopEvents.filter((e) => e.loopId === loopId)
    if (events.length === 0) return 1

    const successful = events.filter((e) => e.result.success).length
    return successful / events.length
  }

  /**
   * Get last successful run
   */
  private getLastSuccessfulRun(loopId: string): Date | null {
    const successfulEvents = this.loopEvents
      .filter((e) => e.loopId === loopId && e.result.success)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return successfulEvents.length > 0 ? new Date(successfulEvents[0].createdAt) : null
  }

  /**
   * Get loop metrics
   */
  getMetrics(): LoopMetrics {
    const loops = Array.from(this.loops.values())
    const activeLoops = loops.filter((l) => l.status !== 'disabled')

    const agentBreakdown: LoopMetrics['agentBreakdown'] = {
      scout: { loopCount: 0, lastRun: null, successRate: 0 },
      coach: { loopCount: 0, lastRun: null, successRate: 0 },
      tracker: { loopCount: 0, lastRun: null, successRate: 0 },
      insight: { loopCount: 0, lastRun: null, successRate: 0 },
    }

    loops.forEach((loop) => {
      agentBreakdown[loop.agent].loopCount++
      agentBreakdown[loop.agent].successRate = this.getLoopSuccessRate(loop.id)
      const lastRun = loop.lastRun
      if (lastRun && (!agentBreakdown[loop.agent].lastRun || lastRun > agentBreakdown[loop.agent].lastRun!)) {
        agentBreakdown[loop.agent].lastRun = lastRun
      }
    })

    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const loopsExecutedLast24h = this.loopEvents.filter(
      (e) => new Date(e.createdAt) > last24h
    ).length

    const nextLoop = loopScheduler.getNextScheduledLoop(activeLoops)

    // Calculate health score (0-100)
    const healthScore = this.calculateLoopHealthScore(loops, this.loopEvents)

    return {
      totalLoops: loops.length,
      activeLoops: activeLoops.length,
      loopsExecutedLast24h,
      loopHealthScore: healthScore,
      nextLoopRun: nextLoop ? nextLoop.nextRun : null,
      agentBreakdown,
    }
  }

  /**
   * Calculate loop health score (0-100)
   */
  private calculateLoopHealthScore(loops: AgentLoop[], events: LoopEvent[]): number {
    if (loops.length === 0) return 100

    const activeLoops = loops.filter((l) => l.status !== 'disabled')
    if (activeLoops.length === 0) return 50

    const recentEvents = events.filter(
      (e) => new Date(e.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    )

    const successRate =
      recentEvents.length > 0
        ? recentEvents.filter((e) => e.result.success).length / recentEvents.length
        : 1

    const executionRate = Math.min(recentEvents.length / activeLoops.length, 1)

    const healthScore = (successRate * 0.7 + executionRate * 0.3) * 100

    return Math.round(healthScore)
  }

  /**
   * Get all loops
   */
  getLoops(): AgentLoop[] {
    return Array.from(this.loops.values())
  }

  /**
   * Get loop events
   */
  getLoopEvents(): LoopEvent[] {
    return this.loopEvents
  }

  /**
   * Get suggestions
   */
  getSuggestions(): LoopSuggestion[] {
    return this.suggestions
  }

  /**
   * Add suggestion
   */
  addSuggestion(suggestion: LoopSuggestion): void {
    this.suggestions.push(suggestion)
  }

  /**
   * Remove suggestion
   */
  removeSuggestion(suggestionId: string): void {
    this.suggestions = this.suggestions.filter((s) => s.id !== suggestionId)
  }
}

// Global loop engine instance
export const loopEngine = new LoopEngine()
