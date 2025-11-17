/**
 * Learn Mode Engine
 * Auto-detects hardware input and creates mappings
 */

import { NormalizedInputEvent, HardwareMapping } from '../types';
import { logger } from '../utils/logger';

const log = logger.createScope('LearnModeEngine');

export type LearnModeCallback = (event: NormalizedInputEvent) => void;

export class LearnModeEngine {
  private isActive = false;
  private pendingInput: NormalizedInputEvent | null = null;
  private callbacks: LearnModeCallback[] = [];

  /**
   * Activate learn mode
   */
  activate(): void {
    this.isActive = true;
    this.pendingInput = null;

    log.info('Learn mode activated');
  }

  /**
   * Deactivate learn mode
   */
  deactivate(): void {
    this.isActive = false;
    this.pendingInput = null;

    log.info('Learn mode deactivated');
  }

  /**
   * Process input event in learn mode
   */
  processInput(event: NormalizedInputEvent): boolean {
    if (!this.isActive) {
      return false;
    }

    // Ignore release events
    if (event.value === 0) {
      return false;
    }

    this.pendingInput = event;

    log.info('Input detected in learn mode', {
      inputType: event.inputType,
      inputId: event.inputId,
    });

    // Notify callbacks
    this.callbacks.forEach((callback) => callback(event));

    return true;
  }

  /**
   * Get pending input
   */
  getPendingInput(): NormalizedInputEvent | null {
    return this.pendingInput;
  }

  /**
   * Clear pending input
   */
  clearPendingInput(): void {
    this.pendingInput = null;
  }

  /**
   * Create mapping from pending input
   */
  createMapping(
    action: string,
    param: Record<string, unknown>,
    feedback?: string
  ): Partial<HardwareMapping> | null {
    if (!this.pendingInput) {
      return null;
    }

    const mapping: Partial<HardwareMapping> = {
      inputType: this.pendingInput.inputType,
      inputId: this.pendingInput.inputId,
      action: action as any,
      param,
      feedback: feedback || null,
      enabled: true,
    };

    log.info('Mapping created from learn mode', {
      inputId: mapping.inputId,
      action: mapping.action,
    });

    // Clear pending input
    this.pendingInput = null;

    return mapping;
  }

  /**
   * Add callback for input detection
   */
  onInputDetected(callback: LearnModeCallback): () => void {
    this.callbacks.push(callback);

    // Return unsubscribe function
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Check if learn mode is active
   */
  isLearnModeActive(): boolean {
    return this.isActive;
  }
}
