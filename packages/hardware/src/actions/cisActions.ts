/**
 * CIS (Creative Intelligence Studio) Actions
 * Wraps CIS parameter control and creative mode triggers
 */

import { HardwareAction } from '../types';
import { logger } from '../utils/logger';

const log = logger.createScope('CISActions');

export interface CISAPI {
  adjustParam(paramName: string, amount: number): Promise<void>;
  adjustEmotion(emotion: string, amount: number): Promise<void>;
  toggleCreativeMode(): Promise<void>;
  triggerInspirationPulse(): Promise<void>;
  saveCreativeSnapshot(): Promise<void>;
  setFocusMode(enabled: boolean): Promise<void>;
}

export class CISActions {
  private cisAPI: CISAPI | null = null;

  /**
   * Set CIS API instance
   */
  setCISAPI(api: CISAPI): void {
    this.cisAPI = api;
    log.info('CIS API configured');
  }

  /**
   * Execute CIS action
   */
  async execute(action: HardwareAction): Promise<void> {
    if (!this.cisAPI) {
      log.warn('CIS API not configured');
      return;
    }

    const { type, param } = action;

    try {
      switch (type) {
        case 'control_param':
        case 'adjust_param':
          await this.adjustParameter(param);
          break;

        case 'toggle_mode':
          await this.toggleMode(param.mode as string);
          break;

        case 'save_snapshot':
          await this.saveSnapshot();
          break;

        case 'trigger_command':
          await this.triggerCommand(param.command as string);
          break;

        default:
          log.warn('Unknown CIS action', { type });
      }
    } catch (error) {
      log.error('Error executing CIS action', error, { type });
      throw error;
    }
  }

  /**
   * Adjust CIS parameter
   */
  private async adjustParameter(param: Record<string, unknown>): Promise<void> {
    if (!this.cisAPI) return;

    const paramName = param.param as string;
    const inputValue = param.inputValue as number;

    // Convert input value to parameter delta
    // Encoders send delta values, pads/faders send absolute values
    let amount = 0;

    if (param.inputType === 'encoder') {
      // Encoder: use delta directly
      amount = inputValue;
    } else if (param.inputType === 'fader' || param.inputType === 'knob') {
      // Fader/knob: map 0-127 to parameter range
      amount = (inputValue - 64) / 64; // -1 to +1
    } else if (param.inputType === 'pad') {
      // Pad: use velocity as intensity
      amount = (inputValue || 0) / 127;
    }

    // Adjust parameter
    if (paramName.includes('emotion')) {
      const emotion = paramName.replace('emotion-', '');
      await this.cisAPI.adjustEmotion(emotion, amount);
      log.info('Emotion adjusted', { emotion, amount });
    } else {
      await this.cisAPI.adjustParam(paramName, amount);
      log.info('Parameter adjusted', { paramName, amount });
    }
  }

  /**
   * Toggle CIS mode
   */
  private async toggleMode(mode: string): Promise<void> {
    if (!this.cisAPI) return;

    switch (mode) {
      case 'creative':
        await this.cisAPI.toggleCreativeMode();
        log.info('Creative mode toggled');
        break;

      case 'focus':
        await this.cisAPI.setFocusMode(true);
        log.info('Focus mode enabled');
        break;

      default:
        log.warn('Unknown CIS mode', { mode });
    }
  }

  /**
   * Save creative snapshot
   */
  private async saveSnapshot(): Promise<void> {
    if (!this.cisAPI) return;

    await this.cisAPI.saveCreativeSnapshot();
    log.info('Creative snapshot saved');
  }

  /**
   * Trigger CIS command
   */
  private async triggerCommand(command: string): Promise<void> {
    if (!this.cisAPI) return;

    switch (command) {
      case 'inspiration':
      case 'inspire':
        await this.cisAPI.triggerInspirationPulse();
        log.info('Inspiration pulse triggered');
        break;

      default:
        log.warn('Unknown CIS command', { command });
    }
  }
}
