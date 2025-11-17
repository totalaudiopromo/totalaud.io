/**
 * Feedback Engine
 * Manages LED feedback and visual responses on hardware controllers
 */

import { LEDFeedback, HardwareMapping } from './types';
import { MIDIRouter } from './midi/midiRouter';
import { logger } from './utils/logger';

const log = logger.createScope('FeedbackEngine');

export interface FeedbackPattern {
  inputIds: string[];
  colour: string;
  intensity: number;
  mode: 'static' | 'pulse' | 'blink' | 'flow';
  duration?: number;
}

export class FeedbackEngine {
  private router: MIDIRouter | null = null;
  private activeFeedback: Map<string, LEDFeedback> = new Map();
  private patterns: Map<string, FeedbackPattern> = new Map();

  /**
   * Set MIDI router
   */
  setRouter(router: MIDIRouter): void {
    this.router = router;
    log.info('MIDI Router set for feedback');
  }

  /**
   * Send feedback to device
   */
  async sendFeedback(feedback: LEDFeedback): Promise<void> {
    if (!this.router) {
      log.warn('No MIDI router configured');
      return;
    }

    try {
      await this.router.sendFeedback(
        feedback.inputId,
        feedback.colour,
        feedback.intensity,
        feedback.mode
      );

      this.activeFeedback.set(feedback.inputId, feedback);

      log.debug('Feedback sent', {
        inputId: feedback.inputId,
        colour: feedback.colour,
        mode: feedback.mode,
      });

      // Auto-clear after duration
      if (feedback.duration) {
        setTimeout(() => {
          this.clearFeedback(feedback.inputId);
        }, feedback.duration);
      }
    } catch (error) {
      log.error('Error sending feedback', error, { inputId: feedback.inputId });
    }
  }

  /**
   * Clear feedback for input
   */
  async clearFeedback(inputId: string): Promise<void> {
    if (!this.router) {
      return;
    }

    try {
      await this.router.sendFeedback(inputId, '#000000', 0, 'static');
      this.activeFeedback.delete(inputId);

      log.debug('Feedback cleared', { inputId });
    } catch (error) {
      log.error('Error clearing feedback', error, { inputId });
    }
  }

  /**
   * Clear all feedback
   */
  async clearAllFeedback(): Promise<void> {
    const inputIds = Array.from(this.activeFeedback.keys());

    for (const inputId of inputIds) {
      await this.clearFeedback(inputId);
    }

    log.info('All feedback cleared');
  }

  /**
   * Apply feedback pattern
   */
  async applyPattern(patternId: string): Promise<void> {
    const pattern = this.patterns.get(patternId);

    if (!pattern) {
      log.warn('Pattern not found', { patternId });
      return;
    }

    for (const inputId of pattern.inputIds) {
      await this.sendFeedback({
        inputId,
        colour: pattern.colour,
        intensity: pattern.intensity,
        mode: pattern.mode,
        duration: pattern.duration,
      });
    }

    log.info('Pattern applied', { patternId, inputCount: pattern.inputIds.length });
  }

  /**
   * Register feedback pattern
   */
  registerPattern(patternId: string, pattern: FeedbackPattern): void {
    this.patterns.set(patternId, pattern);
    log.info('Pattern registered', { patternId });
  }

  /**
   * Apply flow mode pattern
   * Cyan glow on all pads with pulsing effect
   */
  async applyFlowModePattern(): Promise<void> {
    if (!this.router) {
      return;
    }

    const layout = this.router.getLayout() as Record<string, any>;
    const pads = layout.pads;

    if (!pads) {
      log.warn('Device layout has no pads');
      return;
    }

    // Generate pad IDs based on layout
    const padIds: string[] = [];

    if (pads.rows && pads.cols) {
      // Grid layout (Push 2, Launchpad)
      for (let row = 0; row < pads.rows; row++) {
        for (let col = 0; col < pads.cols; col++) {
          padIds.push(`pad-${row}-${col}`);
        }
      }
    } else if (pads.count) {
      // Linear layout (MPK)
      for (let i = 0; i < pads.count; i++) {
        padIds.push(`pad-${i}`);
      }
    }

    // Apply cyan pulse to all pads
    for (const padId of padIds) {
      await this.sendFeedback({
        inputId: padId,
        colour: '#3AA9BE', // Slate Cyan
        intensity: 80,
        mode: 'pulse',
      });
    }

    log.info('Flow mode pattern applied', { padCount: padIds.length });
  }

  /**
   * Apply mapping feedback
   * Lights up pads based on active mappings
   */
  async applyMappingFeedback(mappings: HardwareMapping[]): Promise<void> {
    // Clear existing feedback
    await this.clearAllFeedback();

    // Apply feedback for each mapping
    for (const mapping of mappings) {
      if (!mapping.feedback || !mapping.enabled) {
        continue;
      }

      // Parse feedback string (e.g., "cyan-pulse", "red-static")
      const [colour, mode] = mapping.feedback.split('-');

      await this.sendFeedback({
        inputId: mapping.inputId,
        colour: colour || '#3AA9BE',
        intensity: 60,
        mode: (mode as 'static' | 'pulse' | 'blink') || 'static',
      });
    }

    log.info('Mapping feedback applied', { mappingCount: mappings.length });
  }

  /**
   * Trigger action feedback
   * Visual confirmation when action is triggered
   */
  async triggerActionFeedback(inputId: string, success = true): Promise<void> {
    const colour = success ? '#00FF00' : '#FF0000'; // Green for success, red for error

    await this.sendFeedback({
      inputId,
      colour,
      intensity: 127,
      mode: 'blink',
      duration: 200,
    });
  }

  /**
   * Get active feedback
   */
  getActiveFeedback(): LEDFeedback[] {
    return Array.from(this.activeFeedback.values());
  }
}
