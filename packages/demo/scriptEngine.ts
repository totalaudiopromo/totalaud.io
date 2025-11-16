/**
 * Demo Script Engine
 * Phase 13E: Hero Demo Mode
 *
 * Declarative API for scripting cinematic demos
 */

export type DemoAction =
  | { type: 'wait'; duration: number }
  | { type: 'caption'; text: string; duration?: number }
  | { type: 'showTimeline'; highlight?: string[] }
  | { type: 'hideTimeline' }
  | { type: 'addClip'; clipData: any; animated?: boolean }
  | { type: 'playClip'; clipId: string }
  | { type: 'showFusion'; focusType?: 'clip' | 'card' | 'campaign'; focusId?: string }
  | { type: 'hideFusion' }
  | { type: 'addCard'; cardData: any; animated?: boolean }
  | { type: 'triggerEvolution'; os: string; eventType: string }
  | { type: 'showEvolutionPanel'; os?: string }
  | { type: 'hideEvolutionPanel' }
  | { type: 'showSocialGraph' }
  | { type: 'hideSocialGraph' }
  | { type: 'chapter'; title: string; subtitle?: string }
  | { type: 'fadeOut'; duration?: number }
  | { type: 'fadeIn'; duration?: number }
  | { type: 'setCameraPosition'; position: 'timeline' | 'cards' | 'fusion' | 'overview' }
  | { type: 'enableLiveFusion' }
  | { type: 'disableLiveFusion' }

export interface DemoChapter {
  id: string
  title: string
  subtitle?: string
  actions: DemoAction[]
}

export interface DemoScript {
  title: string
  description: string
  chapters: DemoChapter[]
}

export type DemoEventListener = (event: {
  type: 'action_start' | 'action_complete' | 'chapter_start' | 'chapter_complete' | 'script_complete'
  action?: DemoAction
  chapter?: DemoChapter
}) => void

/**
 * Demo Script Engine
 *
 * Executes a demo script with timing control
 */
export class DemoScriptEngine {
  private script: DemoScript
  private currentChapterIndex: number = 0
  private currentActionIndex: number = 0
  private isPlaying: boolean = false
  private isPaused: boolean = false
  private playbackSpeed: number = 1.0
  private listeners: DemoEventListener[] = []
  private abortController: AbortController | null = null

  constructor(script: DemoScript) {
    this.script = script
  }

  /**
   * Add event listener
   */
  on(listener: DemoEventListener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private emit(event: Parameters<DemoEventListener>[0]) {
    this.listeners.forEach((listener) => listener(event))
  }

  /**
   * Start playing the demo from the beginning
   */
  async play() {
    if (this.isPlaying) return

    this.isPlaying = true
    this.isPaused = false
    this.currentChapterIndex = 0
    this.currentActionIndex = 0
    this.abortController = new AbortController()

    try {
      for (let i = 0; i < this.script.chapters.length; i++) {
        if (this.abortController.signal.aborted) break

        this.currentChapterIndex = i
        const chapter = this.script.chapters[i]

        this.emit({ type: 'chapter_start', chapter })

        for (let j = 0; j < chapter.actions.length; j++) {
          if (this.abortController.signal.aborted) break

          // Wait if paused
          while (this.isPaused && !this.abortController.signal.aborted) {
            await this.sleep(100)
          }

          this.currentActionIndex = j
          const action = chapter.actions[j]

          this.emit({ type: 'action_start', action, chapter })
          await this.executeAction(action)
          this.emit({ type: 'action_complete', action, chapter })
        }

        this.emit({ type: 'chapter_complete', chapter })
      }

      this.emit({ type: 'script_complete' })
    } finally {
      this.isPlaying = false
      this.isPaused = false
      this.abortController = null
    }
  }

  /**
   * Pause the demo
   */
  pause() {
    this.isPaused = true
  }

  /**
   * Resume the demo
   */
  resume() {
    this.isPaused = false
  }

  /**
   * Stop the demo
   */
  stop() {
    if (this.abortController) {
      this.abortController.abort()
    }
    this.isPlaying = false
    this.isPaused = false
  }

  /**
   * Set playback speed
   */
  setSpeed(speed: number) {
    this.playbackSpeed = Math.max(0.25, Math.min(2.0, speed))
  }

  /**
   * Get current state
   */
  getState() {
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      currentChapterIndex: this.currentChapterIndex,
      currentActionIndex: this.currentActionIndex,
      playbackSpeed: this.playbackSpeed,
      totalChapters: this.script.chapters.length,
      currentChapter: this.script.chapters[this.currentChapterIndex],
    }
  }

  /**
   * Execute a single action
   */
  private async executeAction(action: DemoAction): Promise<void> {
    switch (action.type) {
      case 'wait':
        await this.sleep(action.duration / this.playbackSpeed)
        break

      case 'caption':
        // Caption will be displayed by listener
        await this.sleep((action.duration || 2000) / this.playbackSpeed)
        break

      case 'chapter':
        // Chapter title will be displayed by listener
        await this.sleep(2000 / this.playbackSpeed)
        break

      case 'fadeOut':
      case 'fadeIn':
        await this.sleep((action.duration || 400) / this.playbackSpeed)
        break

      default:
        // Other actions are handled by listeners (state changes)
        await this.sleep(500 / this.playbackSpeed) // Small delay for visual feedback
        break
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const timeout = setTimeout(resolve, ms)
      if (this.abortController) {
        this.abortController.signal.addEventListener('abort', () => {
          clearTimeout(timeout)
          resolve()
        })
      }
    })
  }
}

/**
 * Demo Script Builder
 *
 * Fluent API for building demo scripts
 */
export class DemoScriptBuilder {
  private script: DemoScript
  private currentChapter: DemoChapter | null = null

  constructor(title: string, description: string) {
    this.script = {
      title,
      description,
      chapters: [],
    }
  }

  /**
   * Add a new chapter
   */
  chapter(title: string, subtitle?: string): this {
    this.currentChapter = {
      id: `chapter-${this.script.chapters.length + 1}`,
      title,
      subtitle,
      actions: [],
    }
    this.script.chapters.push(this.currentChapter)
    return this
  }

  /**
   * Add a wait action
   */
  wait(duration: number): this {
    if (!this.currentChapter) throw new Error('No chapter active')
    this.currentChapter.actions.push({ type: 'wait', duration })
    return this
  }

  /**
   * Add a caption action
   */
  caption(text: string, duration?: number): this {
    if (!this.currentChapter) throw new Error('No chapter active')
    this.currentChapter.actions.push({ type: 'caption', text, duration })
    return this
  }

  /**
   * Show timeline
   */
  showTimeline(highlight?: string[]): this {
    if (!this.currentChapter) throw new Error('No chapter active')
    this.currentChapter.actions.push({ type: 'showTimeline', highlight })
    return this
  }

  /**
   * Hide timeline
   */
  hideTimeline(): this {
    if (!this.currentChapter) throw new Error('No chapter active')
    this.currentChapter.actions.push({ type: 'hideTimeline' })
    return this
  }

  /**
   * Add a clip
   */
  addClip(clipData: any, animated: boolean = true): this {
    if (!this.currentChapter) throw new Error('No chapter active')
    this.currentChapter.actions.push({ type: 'addClip', clipData, animated })
    return this
  }

  /**
   * Play a clip
   */
  playClip(clipId: string): this {
    if (!this.currentChapter) throw new Error('No chapter active')
    this.currentChapter.actions.push({ type: 'playClip', clipId })
    return this
  }

  /**
   * Show fusion mode
   */
  showFusion(focusType?: 'clip' | 'card' | 'campaign', focusId?: string): this {
    if (!this.currentChapter) throw new Error('No chapter active')
    this.currentChapter.actions.push({ type: 'showFusion', focusType, focusId })
    return this
  }

  /**
   * Hide fusion mode
   */
  hideFusion(): this {
    if (!this.currentChapter) throw new Error('No chapter active')
    this.currentChapter.actions.push({ type: 'hideFusion' })
    return this
  }

  /**
   * Add a card
   */
  addCard(cardData: any, animated: boolean = true): this {
    if (!this.currentChapter) throw new Error('No chapter active')
    this.currentChapter.actions.push({ type: 'addCard', cardData, animated })
    return this
  }

  /**
   * Trigger evolution
   */
  triggerEvolution(os: string, eventType: string): this {
    if (!this.currentChapter) throw new Error('No chapter active')
    this.currentChapter.actions.push({ type: 'triggerEvolution', os, eventType })
    return this
  }

  /**
   * Show evolution panel
   */
  showEvolutionPanel(os?: string): this {
    if (!this.currentChapter) throw new Error('No chapter active')
    this.currentChapter.actions.push({ type: 'showEvolutionPanel', os })
    return this
  }

  /**
   * Hide evolution panel
   */
  hideEvolutionPanel(): this {
    if (!this.currentChapter) throw new Error('No chapter active')
    this.currentChapter.actions.push({ type: 'hideEvolutionPanel' })
    return this
  }

  /**
   * Show social graph / Creative Intelligence Board
   */
  showSocialGraph(): this {
    if (!this.currentChapter) throw new Error('No chapter active')
    this.currentChapter.actions.push({ type: 'showSocialGraph' })
    return this
  }

  /**
   * Hide social graph / Creative Intelligence Board
   */
  hideSocialGraph(): this {
    if (!this.currentChapter) throw new Error('No chapter active')
    this.currentChapter.actions.push({ type: 'hideSocialGraph' })
    return this
  }

  /**
   * Set camera position
   */
  setCameraPosition(position: 'timeline' | 'cards' | 'fusion' | 'overview'): this {
    if (!this.currentChapter) throw new Error('No chapter active')
    this.currentChapter.actions.push({ type: 'setCameraPosition', position })
    return this
  }

  /**
   * Enable live fusion
   */
  enableLiveFusion(): this {
    if (!this.currentChapter) throw new Error('No chapter active')
    this.currentChapter.actions.push({ type: 'enableLiveFusion' })
    return this
  }

  /**
   * Disable live fusion
   */
  disableLiveFusion(): this {
    if (!this.currentChapter) throw new Error('No chapter active')
    this.currentChapter.actions.push({ type: 'disableLiveFusion' })
    return this
  }

  /**
   * Fade out
   */
  fadeOut(duration?: number): this {
    if (!this.currentChapter) throw new Error('No chapter active')
    this.currentChapter.actions.push({ type: 'fadeOut', duration })
    return this
  }

  /**
   * Fade in
   */
  fadeIn(duration?: number): this {
    if (!this.currentChapter) throw new Error('No chapter active')
    this.currentChapter.actions.push({ type: 'fadeIn', duration })
    return this
  }

  /**
   * Build the script
   */
  build(): DemoScript {
    return this.script
  }
}
