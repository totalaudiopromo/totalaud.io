/**
 * Behaviour Director
 * Phase 20 - Apply CreativeScore to engines
 * Controls multi-OS behaviour based on creative intent
 */

import type {
  CreativeScore,
  BehaviourDirectorEngines,
  BehaviourDirective,
  OSName,
} from './intent.types'

/**
 * Behaviour Director class
 * Manages the application of CreativeScore to various engines
 */
export class BehaviourDirector {
  private score: CreativeScore | null = null
  private engines: BehaviourDirectorEngines
  private activeDirectives: Map<string, NodeJS.Timeout> = new Map()
  private startTime: number = 0
  private isRunning: boolean = false

  constructor(engines: BehaviourDirectorEngines = {}) {
    this.engines = engines
  }

  /**
   * Load a CreativeScore
   */
  loadScore(score: CreativeScore): void {
    this.score = score
  }

  /**
   * Start executing the CreativeScore
   */
  start(): void {
    if (!this.score) {
      throw new Error('No score loaded. Call loadScore() first.')
    }

    if (this.isRunning) {
      throw new Error('Score is already running. Call stop() first.')
    }

    this.isRunning = true
    this.startTime = Date.now()

    // Schedule all directives
    this.scheduleAllDirectives()

    // Schedule scene boundaries
    this.scheduleSceneBoundaries()

    console.log(`[BehaviourDirector] Started score: ${this.score.id}`)
  }

  /**
   * Stop executing the CreativeScore
   */
  stop(): void {
    if (!this.isRunning) {
      return
    }

    // Cancel all scheduled directives
    this.activeDirectives.forEach((timeout) => {
      clearTimeout(timeout)
    })
    this.activeDirectives.clear()

    this.isRunning = false

    console.log(`[BehaviourDirector] Stopped score`)
  }

  /**
   * Get current playback time (seconds)
   */
  getCurrentTime(): number {
    if (!this.isRunning) {
      return 0
    }

    return (Date.now() - this.startTime) / 1000
  }

  /**
   * Get current scene index
   */
  getCurrentSceneIndex(): number {
    if (!this.score) {
      return -1
    }

    const currentTime = this.getCurrentTime()
    return this.score.scenes.findIndex(
      (scene) =>
        currentTime >= scene.startTime &&
        currentTime < scene.startTime + scene.duration
    )
  }

  /**
   * Schedule all behaviour directives
   */
  private scheduleAllDirectives(): void {
    if (!this.score) {
      return
    }

    Object.entries(this.score.behaviourDirectivesByOS).forEach(
      ([osName, directives]) => {
        directives.forEach((directive) => {
          this.scheduleDirective(directive)
        })
      }
    )
  }

  /**
   * Schedule a single behaviour directive
   */
  private scheduleDirective(directive: BehaviourDirective): void {
    const timeoutMs = directive.time * 1000

    const timeout = setTimeout(() => {
      this.executeDirective(directive)
    }, timeoutMs)

    this.activeDirectives.set(directive.id, timeout)
  }

  /**
   * Execute a behaviour directive
   */
  private executeDirective(directive: BehaviourDirective): void {
    console.log(
      `[BehaviourDirector] Executing directive: ${directive.action} for ${directive.targetOS} at ${directive.time}s`
    )

    switch (directive.action) {
      case 'set_activity':
        this.setOSActivity(
          directive.targetOS,
          directive.params.activityState!,
          directive.params.duration
        )
        break

      case 'set_priority':
        this.setOSPriority(
          directive.targetOS,
          directive.params.priority!,
          directive.params.duration
        )
        break

      case 'boost_tension':
        this.adjustTension(
          directive.targetOS,
          directive.params.tensionDelta!,
          directive.params.duration
        )
        break

      case 'reduce_tension':
        this.adjustTension(
          directive.targetOS,
          directive.params.tensionDelta!,
          directive.params.duration
        )
        break

      case 'trigger_evolution':
        this.triggerEvolution(directive.targetOS)
        break

      case 'speak':
        this.triggerSpeak(directive.targetOS, directive.params.message)
        break

      case 'listen':
        this.triggerListen(directive.targetOS)
        break
    }

    // Remove from active directives
    this.activeDirectives.delete(directive.id)
  }

  /**
   * Schedule scene boundary events
   */
  private scheduleSceneBoundaries(): void {
    if (!this.score) {
      return
    }

    this.score.scenes.forEach((scene, i) => {
      const timeout = setTimeout(() => {
        this.onSceneStart(scene.id, i)
      }, scene.startTime * 1000)

      this.activeDirectives.set(`scene_boundary_${i}`, timeout)
    })
  }

  /**
   * Scene start handler
   */
  private onSceneStart(sceneId: string, sceneIndex: number): void {
    if (!this.score) {
      return
    }

    const scene = this.score.scenes[sceneIndex]

    console.log(
      `[BehaviourDirector] Scene ${sceneIndex} started: ${scene.description}`
    )

    // Set tempo if PerformanceClock available
    if (this.engines.performanceEngine) {
      // Placeholder: this.engines.performanceEngine.setTempo(scene.tempo)
      console.log(`[BehaviourDirector] Setting tempo to ${scene.tempo} BPM`)
    }

    // Adjust visual profile if VisualEngine available
    if (this.engines.visualEngine) {
      // Placeholder: this.engines.visualEngine.applyProfile(this.score.visualProfile)
      console.log(
        `[BehaviourDirector] Applying visual profile: ${this.score.visualProfile.palette}`
      )
    }

    // Adjust sonic profile if AudioEngine available
    if (this.engines.audioEngine) {
      // Placeholder: this.engines.audioEngine.applyProfile(this.score.sonicProfile)
      console.log(
        `[BehaviourDirector] Applying sonic profile: ${this.score.sonicProfile.style}`
      )
    }
  }

  /**
   * Set OS activity state
   */
  private setOSActivity(
    os: OSName,
    state: string,
    duration?: number
  ): void {
    console.log(
      `[BehaviourDirector] Setting ${os} activity to ${state}${duration ? ` for ${duration}s` : ''}`
    )

    // Placeholder for actual engine integration
    // this.engines.performanceEngine?.setOSActivity(os, state)

    // If duration specified, schedule reset
    if (duration) {
      setTimeout(() => {
        console.log(`[BehaviourDirector] Resetting ${os} activity to idle`)
        // this.engines.performanceEngine?.setOSActivity(os, 'idle')
      }, duration * 1000)
    }
  }

  /**
   * Set OS speaking priority
   */
  private setOSPriority(os: OSName, priority: number, duration?: number): void {
    console.log(
      `[BehaviourDirector] Setting ${os} priority to ${priority}${duration ? ` for ${duration}s` : ''}`
    )

    // Placeholder for actual engine integration
    // this.engines.socialGraphEngine?.setOSPriority(os, priority)

    // If duration specified, schedule reset
    if (duration) {
      setTimeout(() => {
        console.log(`[BehaviourDirector] Resetting ${os} priority to 0.5`)
        // this.engines.socialGraphEngine?.setOSPriority(os, 0.5)
      }, duration * 1000)
    }
  }

  /**
   * Adjust tension for an OS
   */
  private adjustTension(os: OSName, delta: number, duration?: number): void {
    console.log(
      `[BehaviourDirector] Adjusting ${os} tension by ${delta}${duration ? ` over ${duration}s` : ''}`
    )

    // Placeholder for actual engine integration
    // this.engines.socialGraphEngine?.adjustTension(os, delta, duration)
  }

  /**
   * Trigger evolution event for an OS
   */
  private triggerEvolution(os: OSName): void {
    console.log(`[BehaviourDirector] Triggering evolution for ${os}`)

    // Placeholder for actual engine integration
    // this.engines.evolutionEngine?.triggerEvolution(os)
  }

  /**
   * Trigger speak action for an OS
   */
  private triggerSpeak(os: OSName, message?: string): void {
    console.log(`[BehaviourDirector] ${os} speaking${message ? `: ${message}` : ''}`)

    // Placeholder for actual engine integration
    // this.engines.performanceEngine?.triggerSpeak(os, message)
  }

  /**
   * Trigger listen action for an OS
   */
  private triggerListen(os: OSName): void {
    console.log(`[BehaviourDirector] ${os} listening`)

    // Placeholder for actual engine integration
    // this.engines.performanceEngine?.triggerListen(os)
  }

  /**
   * Update engines reference
   */
  setEngines(engines: BehaviourDirectorEngines): void {
    this.engines = engines
  }

  /**
   * Get current score
   */
  getScore(): CreativeScore | null {
    return this.score
  }

  /**
   * Get running status
   */
  isActive(): boolean {
    return this.isRunning
  }
}

/**
 * Standalone function to apply CreativeScore to engines
 * For one-shot execution without maintaining state
 */
export function applyCreativeScoreToEngines(
  score: CreativeScore,
  engines: BehaviourDirectorEngines
): BehaviourDirector {
  const director = new BehaviourDirector(engines)
  director.loadScore(score)
  director.start()
  return director
}

/**
 * Get all directives for a specific OS from a score
 */
export function getDirectivesForOS(
  score: CreativeScore,
  os: OSName
): BehaviourDirective[] {
  return score.behaviourDirectivesByOS[os] || []
}

/**
 * Get all directives at a specific time (±tolerance)
 */
export function getDirectivesAtTime(
  score: CreativeScore,
  time: number,
  tolerance: number = 0.1
): BehaviourDirective[] {
  const allDirectives: BehaviourDirective[] = []

  Object.values(score.behaviourDirectivesByOS).forEach((directives) => {
    directives.forEach((directive) => {
      if (Math.abs(directive.time - time) <= tolerance) {
        allDirectives.push(directive)
      }
    })
  })

  return allDirectives.sort((a, b) => a.time - b.time)
}
