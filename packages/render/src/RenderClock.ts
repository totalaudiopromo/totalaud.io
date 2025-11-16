/**
 * RenderClock
 * Deterministic clock for fixed-FPS offline rendering
 * Provides exact frame timing without RAF drift
 */

export class RenderClock {
  private fps: number;
  private stepMs: number;

  constructor(fps: number) {
    this.fps = fps;
    this.stepMs = 1000 / fps;
  }

  /**
   * Get the time delta for one frame step
   * Returns milliseconds per frame
   */
  nextDeltaMs(): number {
    return this.stepMs;
  }

  /**
   * Get the time delta for one frame step in seconds
   */
  nextDeltaSeconds(): number {
    return this.stepMs / 1000;
  }

  /**
   * Calculate total frames for a given duration
   */
  framesTotalForDuration(durationSeconds: number): number {
    return Math.ceil(durationSeconds * this.fps);
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.fps;
  }
}
