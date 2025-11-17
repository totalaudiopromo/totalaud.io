/**
 * Gesture Engine
 * Detects complex gestures like double-tap, hold, combos
 */

import { NormalizedInputEvent } from '../types';
import { logger } from '../utils/logger';

const log = logger.createScope('GestureEngine');

export type GestureType = 'double_tap' | 'hold' | 'combo' | 'sequence' | 'velocity_sensitive';

export interface DetectedGesture {
  type: GestureType;
  inputs: string[];
  velocities?: number[];
  timing?: number[];
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface GesturePattern {
  type: GestureType;
  inputs: string[];
  config?: {
    maxInterval?: number; // ms between taps for double-tap
    minHoldDuration?: number; // ms for hold
    velocityThreshold?: number; // 0-127 for velocity-sensitive
  };
}

export class GestureEngine {
  private eventBuffer: Array<{
    event: NormalizedInputEvent;
    timestamp: number;
  }> = [];

  private holdTimers: Map<string, NodeJS.Timeout> = new Map();
  private activeHolds: Set<string> = new Set();

  // Configuration
  private readonly DOUBLE_TAP_MAX_INTERVAL = 200; // ms
  private readonly MIN_HOLD_DURATION = 400; // ms
  private readonly BUFFER_TTL = 500; // ms
  private readonly COMBO_MAX_INTERVAL = 100; // ms

  /**
   * Process input event and detect gestures
   */
  async processEvent(event: NormalizedInputEvent): Promise<DetectedGesture | null> {
    const now = Date.now();

    // Clean old events from buffer
    this.cleanBuffer(now);

    // Add current event to buffer
    this.eventBuffer.push({ event, timestamp: now });

    // Detect gestures
    const gesture = this.detectGesture(event, now);

    if (gesture) {
      log.info('Gesture detected', {
        type: gesture.type,
        inputs: gesture.inputs,
      });
    }

    return gesture;
  }

  /**
   * Detect gesture based on event buffer and current event
   */
  private detectGesture(
    currentEvent: NormalizedInputEvent,
    now: number
  ): DetectedGesture | null {
    // Check for hold start (noteoff/pad release while holding)
    if (currentEvent.value === 0) {
      return this.checkHoldRelease(currentEvent, now);
    }

    // Check for double-tap
    const doubleTap = this.detectDoubleTap(currentEvent, now);
    if (doubleTap) return doubleTap;

    // Check for combo (multiple inputs pressed simultaneously)
    const combo = this.detectCombo(currentEvent, now);
    if (combo) return combo;

    // Check for velocity-sensitive gesture
    const velocitySensitive = this.detectVelocitySensitive(currentEvent);
    if (velocitySensitive) return velocitySensitive;

    // Start hold timer
    this.startHoldTimer(currentEvent, now);

    return null;
  }

  /**
   * Detect double-tap gesture
   */
  private detectDoubleTap(
    currentEvent: NormalizedInputEvent,
    now: number
  ): DetectedGesture | null {
    // Find previous tap of same input within time window
    const previousTaps = this.eventBuffer.filter(
      (buffered) =>
        buffered.event.inputId === currentEvent.inputId &&
        buffered.event.value > 0 &&
        now - buffered.timestamp <= this.DOUBLE_TAP_MAX_INTERVAL &&
        buffered.timestamp !== now // Not the current event
    );

    if (previousTaps.length === 1) {
      const previousTap = previousTaps[0];

      return {
        type: 'double_tap',
        inputs: [currentEvent.inputId],
        velocities: [previousTap.event.velocity || 0, currentEvent.velocity || 0],
        timing: [previousTap.timestamp, now],
        timestamp: now,
        metadata: {
          interval: now - previousTap.timestamp,
        },
      };
    }

    return null;
  }

  /**
   * Detect combo (multiple inputs pressed together)
   */
  private detectCombo(
    currentEvent: NormalizedInputEvent,
    now: number
  ): DetectedGesture | null {
    // Find other inputs pressed within combo window
    const recentInputs = this.eventBuffer.filter(
      (buffered) =>
        buffered.event.inputId !== currentEvent.inputId &&
        buffered.event.value > 0 &&
        now - buffered.timestamp <= this.COMBO_MAX_INTERVAL
    );

    if (recentInputs.length > 0) {
      const allInputs = [
        currentEvent.inputId,
        ...recentInputs.map((r) => r.event.inputId),
      ];

      const allVelocities = [
        currentEvent.velocity || 0,
        ...recentInputs.map((r) => r.event.velocity || 0),
      ];

      return {
        type: 'combo',
        inputs: allInputs,
        velocities: allVelocities,
        timestamp: now,
        metadata: {
          inputCount: allInputs.length,
        },
      };
    }

    return null;
  }

  /**
   * Detect velocity-sensitive gesture
   */
  private detectVelocitySensitive(
    currentEvent: NormalizedInputEvent
  ): DetectedGesture | null {
    const velocity = currentEvent.velocity || 0;

    // High velocity hit
    if (velocity > 100) {
      return {
        type: 'velocity_sensitive',
        inputs: [currentEvent.inputId],
        velocities: [velocity],
        timestamp: Date.now(),
        metadata: {
          intensity: 'high',
          velocity,
        },
      };
    }

    // Low velocity hit
    if (velocity > 0 && velocity < 30) {
      return {
        type: 'velocity_sensitive',
        inputs: [currentEvent.inputId],
        velocities: [velocity],
        timestamp: Date.now(),
        metadata: {
          intensity: 'low',
          velocity,
        },
      };
    }

    return null;
  }

  /**
   * Start hold timer for input
   */
  private startHoldTimer(event: NormalizedInputEvent, now: number): void {
    const inputId = event.inputId;

    // Clear existing timer
    const existingTimer = this.holdTimers.get(inputId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Start new timer
    const timer = setTimeout(() => {
      this.activeHolds.add(inputId);
      log.debug('Hold detected', { inputId });
    }, this.MIN_HOLD_DURATION);

    this.holdTimers.set(inputId, timer);
  }

  /**
   * Check if hold was released
   */
  private checkHoldRelease(
    currentEvent: NormalizedInputEvent,
    now: number
  ): DetectedGesture | null {
    const inputId = currentEvent.inputId;

    // Clear timer
    const timer = this.holdTimers.get(inputId);
    if (timer) {
      clearTimeout(timer);
      this.holdTimers.delete(inputId);
    }

    // Check if this was an active hold
    if (this.activeHolds.has(inputId)) {
      this.activeHolds.delete(inputId);

      // Find the press event
      const pressEvent = this.eventBuffer.find(
        (buffered) =>
          buffered.event.inputId === inputId && buffered.event.value > 0
      );

      if (pressEvent) {
        const duration = now - pressEvent.timestamp;

        return {
          type: 'hold',
          inputs: [inputId],
          timestamp: now,
          metadata: {
            duration,
            pressVelocity: pressEvent.event.velocity || 0,
          },
        };
      }
    }

    return null;
  }

  /**
   * Clean old events from buffer
   */
  private cleanBuffer(now: number): void {
    this.eventBuffer = this.eventBuffer.filter(
      (buffered) => now - buffered.timestamp <= this.BUFFER_TTL
    );
  }

  /**
   * Check if gesture matches a pattern
   */
  matchesPattern(gesture: DetectedGesture, pattern: GesturePattern): boolean {
    if (gesture.type !== pattern.type) {
      return false;
    }

    // Check inputs
    if (pattern.inputs.length !== gesture.inputs.length) {
      return false;
    }

    // Check if all pattern inputs are in gesture inputs
    const allMatch = pattern.inputs.every((input) =>
      gesture.inputs.includes(input)
    );

    if (!allMatch) {
      return false;
    }

    // Check type-specific config
    if (pattern.config) {
      if (pattern.type === 'double_tap' && pattern.config.maxInterval) {
        const interval = gesture.metadata?.interval as number;
        if (interval > pattern.config.maxInterval) {
          return false;
        }
      }

      if (pattern.type === 'hold' && pattern.config.minHoldDuration) {
        const duration = gesture.metadata?.duration as number;
        if (duration < pattern.config.minHoldDuration) {
          return false;
        }
      }

      if (pattern.type === 'velocity_sensitive' && pattern.config.velocityThreshold) {
        const velocity = gesture.velocities?.[0] || 0;
        if (velocity < pattern.config.velocityThreshold) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Reset gesture engine
   */
  reset(): void {
    this.eventBuffer = [];

    // Clear all hold timers
    for (const timer of this.holdTimers.values()) {
      clearTimeout(timer);
    }

    this.holdTimers.clear();
    this.activeHolds.clear();

    log.info('Gesture engine reset');
  }
}
