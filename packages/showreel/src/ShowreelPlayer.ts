/**
 * ShowreelPlayer
 * Manages showreel playback with deterministic time stepping
 * Supports both real-time and manual tick modes (for rendering)
 */

import type {
  ShowreelScript,
  ShowreelScene,
  ShowreelPlayerState,
  ShowreelPlayer as IShowreelPlayer,
} from './showreelTypes';

export class ShowreelPlayer implements IShowreelPlayer {
  readonly script: ShowreelScript;

  private _state: ShowreelPlayerState;
  private _isPlaying: boolean = false;
  private _rafId: number | null = null;
  private _lastTickTime: number = 0;
  private _subscribers: Set<(state: ShowreelPlayerState) => void> = new Set();
  private _manualMode: boolean = false;

  constructor(script: ShowreelScript) {
    this.script = script;
    this._state = {
      currentSceneIndex: 0,
      sceneElapsedSeconds: 0,
      totalElapsedSeconds: 0,
      isComplete: false,
    };
  }

  get state(): ShowreelPlayerState {
    return this._state;
  }

  /**
   * Enable manual tick mode (for rendering)
   * When enabled, player only advances via tick() calls
   */
  setManualMode(enabled: boolean): void {
    this._manualMode = enabled;
    if (enabled && this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  start(): void {
    if (this._isPlaying) return;

    this._isPlaying = true;
    this._lastTickTime = performance.now();

    if (!this._manualMode) {
      this._scheduleNextTick();
    }
  }

  pause(): void {
    this._isPlaying = false;
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  resume(): void {
    if (this._isPlaying) return;

    this._isPlaying = true;
    this._lastTickTime = performance.now();

    if (!this._manualMode) {
      this._scheduleNextTick();
    }
  }

  stop(): void {
    this.pause();
  }

  reset(): void {
    this.stop();
    this._state = {
      currentSceneIndex: 0,
      sceneElapsedSeconds: 0,
      totalElapsedSeconds: 0,
      isComplete: false,
    };
    this._notifySubscribers();
  }

  seekToScene(sceneIndex: number): void {
    if (sceneIndex < 0 || sceneIndex >= this.script.scenes.length) {
      return;
    }

    // Calculate total elapsed time up to this scene
    let totalElapsed = 0;
    for (let i = 0; i < sceneIndex; i++) {
      totalElapsed += this.script.scenes[i].durationSeconds;
    }

    this._state = {
      ...this._state,
      currentSceneIndex: sceneIndex,
      sceneElapsedSeconds: 0,
      totalElapsedSeconds: totalElapsed,
      isComplete: false,
    };

    this._updateCurrentCaption();
    this._notifySubscribers();
  }

  seekToTime(seconds: number): void {
    if (seconds < 0 || seconds > this.script.totalDurationSeconds) {
      return;
    }

    let elapsed = 0;
    let sceneIndex = 0;

    for (let i = 0; i < this.script.scenes.length; i++) {
      const scene = this.script.scenes[i];
      if (elapsed + scene.durationSeconds > seconds) {
        sceneIndex = i;
        break;
      }
      elapsed += scene.durationSeconds;
    }

    const sceneElapsed = seconds - elapsed;

    this._state = {
      ...this._state,
      currentSceneIndex: sceneIndex,
      sceneElapsedSeconds: sceneElapsed,
      totalElapsedSeconds: seconds,
      isComplete: false,
    };

    this._updateCurrentCaption();
    this._notifySubscribers();
  }

  getCurrentScene(): ShowreelScene | null {
    if (
      this._state.currentSceneIndex < 0 ||
      this._state.currentSceneIndex >= this.script.scenes.length
    ) {
      return null;
    }
    return this.script.scenes[this._state.currentSceneIndex];
  }

  subscribe(callback: (state: ShowreelPlayerState) => void): () => void {
    this._subscribers.add(callback);
    return () => {
      this._subscribers.delete(callback);
    };
  }

  /**
   * Manual tick - for deterministic rendering
   * Only works when manualMode is enabled
   */
  tick(deltaSeconds: number): void {
    if (!this._manualMode) {
      console.warn('tick() called but manual mode is not enabled');
      return;
    }

    if (!this._isPlaying || this._state.isComplete) return;

    this._advanceTime(deltaSeconds);
  }

  private _scheduleNextTick(): void {
    if (this._manualMode) return;

    this._rafId = requestAnimationFrame((now) => {
      if (!this._isPlaying || this._state.isComplete) return;

      const deltaMs = now - this._lastTickTime;
      this._lastTickTime = now;
      const deltaSeconds = deltaMs / 1000;

      this._advanceTime(deltaSeconds);
      this._scheduleNextTick();
    });
  }

  private _advanceTime(deltaSeconds: number): void {
    const currentScene = this.getCurrentScene();
    if (!currentScene) {
      this._state.isComplete = true;
      this._notifySubscribers();
      return;
    }

    let newSceneElapsed = this._state.sceneElapsedSeconds + deltaSeconds;
    let newTotalElapsed = this._state.totalElapsedSeconds + deltaSeconds;
    let newSceneIndex = this._state.currentSceneIndex;

    // Check if we've exceeded the current scene duration
    while (newSceneElapsed >= currentScene.durationSeconds) {
      const overflow = newSceneElapsed - currentScene.durationSeconds;
      newSceneIndex++;

      // Check if we've completed all scenes
      if (newSceneIndex >= this.script.scenes.length) {
        this._state = {
          ...this._state,
          currentSceneIndex: this.script.scenes.length - 1,
          sceneElapsedSeconds: currentScene.durationSeconds,
          totalElapsedSeconds: this.script.totalDurationSeconds,
          isComplete: true,
        };
        this._notifySubscribers();
        return;
      }

      newSceneElapsed = overflow;
      const nextScene = this.script.scenes[newSceneIndex];
      if (newSceneElapsed >= nextScene.durationSeconds) {
        // Continue to next scene
        continue;
      } else {
        break;
      }
    }

    this._state = {
      ...this._state,
      currentSceneIndex: newSceneIndex,
      sceneElapsedSeconds: newSceneElapsed,
      totalElapsedSeconds: newTotalElapsed,
    };

    this._updateCurrentCaption();
    this._notifySubscribers();
  }

  private _updateCurrentCaption(): void {
    const scene = this.getCurrentScene();
    if (!scene || !scene.captions) {
      this._state.currentCaption = undefined;
      return;
    }

    const elapsed = this._state.sceneElapsedSeconds;
    const activeCaption = scene.captions.find((caption) => {
      const captionEnd = caption.startTime + caption.durationSeconds;
      return elapsed >= caption.startTime && elapsed < captionEnd;
    });

    this._state.currentCaption = activeCaption?.text;
  }

  private _notifySubscribers(): void {
    this._subscribers.forEach((callback) => {
      callback(this._state);
    });
  }

  destroy(): void {
    this.stop();
    this._subscribers.clear();
  }
}
