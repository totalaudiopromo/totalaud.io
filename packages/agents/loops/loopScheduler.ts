/**
 * Loop Scheduler
 * Manages timing and scheduling for autonomous loops
 */

import type { AgentLoop, LoopInterval, LoopSchedule } from './loopTypes'
import { LOOP_INTERVALS } from './loopTypes'

export class LoopScheduler {
  /**
   * Calculate next run time for a loop
   */
  calculateNextRun(interval: LoopInterval, lastRun: Date | null = null): Date {
    const now = new Date()
    const intervalMs = LOOP_INTERVALS[interval]

    if (!lastRun) {
      // First run - schedule based on interval
      return new Date(now.getTime() + intervalMs)
    }

    // Calculate next run from last run
    const nextRun = new Date(lastRun.getTime() + intervalMs)

    // If next run is in the past, schedule for now + interval
    if (nextRun < now) {
      return new Date(now.getTime() + intervalMs)
    }

    return nextRun
  }

  /**
   * Get schedule information for a loop
   */
  getSchedule(loop: AgentLoop): LoopSchedule {
    const lastRun = loop.lastRun ? new Date(loop.lastRun) : null
    const nextRun = new Date(loop.nextRun)
    const now = new Date()

    return {
      interval: loop.interval,
      lastRun,
      nextRun,
      isOverdue: now > nextRun,
    }
  }

  /**
   * Check if loop is ready to run
   */
  isReadyToRun(loop: AgentLoop): boolean {
    if (loop.status === 'running' || loop.status === 'disabled') {
      return false
    }

    const now = new Date()
    const nextRun = new Date(loop.nextRun)

    return now >= nextRun
  }

  /**
   * Get all loops ready to run
   */
  getReadyLoops(loops: AgentLoop[]): AgentLoop[] {
    return loops.filter((loop) => this.isReadyToRun(loop))
  }

  /**
   * Get next scheduled loop
   */
  getNextScheduledLoop(loops: AgentLoop[]): AgentLoop | null {
    const activeLoops = loops.filter(
      (loop) => loop.status !== 'disabled' && loop.status !== 'running'
    )

    if (activeLoops.length === 0) return null

    return activeLoops.reduce((earliest, current) => {
      const earliestTime = new Date(earliest.nextRun).getTime()
      const currentTime = new Date(current.nextRun).getTime()
      return currentTime < earliestTime ? current : earliest
    })
  }

  /**
   * Calculate time until next run (in milliseconds)
   */
  getTimeUntilNextRun(loop: AgentLoop): number {
    const now = new Date()
    const nextRun = new Date(loop.nextRun)
    const diff = nextRun.getTime() - now.getTime()
    return Math.max(0, diff)
  }

  /**
   * Format time until next run (human-readable)
   */
  formatTimeUntilRun(loop: AgentLoop): string {
    const ms = this.getTimeUntilNextRun(loop)

    if (ms === 0) return 'Ready to run'

    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m`
    return `${seconds}s`
  }

  /**
   * Check rate limits for agent loops
   */
  checkRateLimit(
    agentLoops: AgentLoop[],
    maxLoopsPerHour: number = 3
  ): { allowed: boolean; reason?: string } {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

    const recentRuns = agentLoops.filter((loop) => {
      if (!loop.lastRun) return false
      return new Date(loop.lastRun) > oneHourAgo
    })

    if (recentRuns.length >= maxLoopsPerHour) {
      return {
        allowed: false,
        reason: `Rate limit reached: ${recentRuns.length}/${maxLoopsPerHour} loops in last hour`,
      }
    }

    return { allowed: true }
  }

  /**
   * Get loop execution statistics
   */
  getLoopStats(loops: AgentLoop[], loopEvents: Array<{ loopId: string; createdAt: string }>) {
    const activeLoops = loops.filter((l) => l.status !== 'disabled')
    const runningLoops = loops.filter((l) => l.status === 'running')

    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentEvents = loopEvents.filter((e) => new Date(e.createdAt) > last24h)

    return {
      totalLoops: loops.length,
      activeLoops: activeLoops.length,
      runningLoops: runningLoops.length,
      executionsLast24h: recentEvents.length,
      nextRun: this.getNextScheduledLoop(activeLoops),
    }
  }
}

// Global scheduler instance
export const loopScheduler = new LoopScheduler()
