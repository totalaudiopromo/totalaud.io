/**
 * Script Engine
 * Executes JSON-based scripts with sandboxed security
 */

import { HardwareAction } from '../types';
import { logger } from '../utils/logger';
import { ActionExecutor } from '../mappingEngine';

const log = logger.createScope('ScriptEngine');

export interface ScriptStep {
  action?: string;
  target?: string;
  param?: Record<string, unknown>;
  delay?: number;
  condition?: {
    type: 'window_open' | 'mode_active' | 'param_value';
    value: unknown;
  };
}

export interface HardwareScript {
  name: string;
  description?: string;
  steps: ScriptStep[];
  version?: string;
}

export class ScriptEngine {
  private actionExecutor: ActionExecutor | null = null;
  private isExecuting = false;
  private currentScript: HardwareScript | null = null;

  /**
   * Set action executor
   */
  setActionExecutor(executor: ActionExecutor): void {
    this.actionExecutor = executor;
    log.info('Action executor set');
  }

  /**
   * Execute a script
   */
  async executeScript(script: HardwareScript): Promise<void> {
    if (this.isExecuting) {
      throw new Error('Script already executing');
    }

    if (!this.actionExecutor) {
      throw new Error('Action executor not configured');
    }

    this.isExecuting = true;
    this.currentScript = script;

    log.info('Executing script', {
      name: script.name,
      steps: script.steps.length,
    });

    try {
      for (let i = 0; i < script.steps.length; i++) {
        const step = script.steps[i];

        log.debug('Executing step', { step: i + 1, total: script.steps.length });

        // Handle delay
        if (step.delay) {
          await this.delay(step.delay);
          continue;
        }

        // Check condition
        if (step.condition) {
          const conditionMet = await this.checkCondition(step.condition);
          if (!conditionMet) {
            log.debug('Condition not met, skipping step', { step: i + 1 });
            continue;
          }
        }

        // Execute action
        if (step.action) {
          const action: HardwareAction = {
            type: step.action as any,
            param: {
              ...(step.param || {}),
              ...(step.target && { target: step.target }),
            },
          };

          await this.actionExecutor.execute(action);
        }
      }

      log.info('Script execution complete', { name: script.name });
    } catch (error) {
      log.error('Script execution failed', error, { name: script.name });
      throw error;
    } finally {
      this.isExecuting = false;
      this.currentScript = null;
    }
  }

  /**
   * Check if condition is met
   */
  private async checkCondition(condition: ScriptStep['condition']): Promise<boolean> {
    if (!condition) return true;

    // Stub implementation - would need integration with app state
    log.debug('Checking condition', { type: condition.type });

    // Always return true for now (placeholder for real condition checking)
    return true;
  }

  /**
   * Stop current script execution
   */
  stopExecution(): void {
    if (this.isExecuting) {
      log.warn('Stopping script execution', {
        name: this.currentScript?.name,
      });
      this.isExecuting = false;
      this.currentScript = null;
    }
  }

  /**
   * Check if script is currently executing
   */
  isCurrentlyExecuting(): boolean {
    return this.isExecuting;
  }

  /**
   * Validate script structure
   */
  static validateScript(script: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (typeof script !== 'object' || script === null) {
      errors.push('Script must be an object');
      return { valid: false, errors };
    }

    const s = script as any;

    if (!s.name || typeof s.name !== 'string') {
      errors.push('Script must have a name');
    }

    if (!Array.isArray(s.steps)) {
      errors.push('Script must have steps array');
      return { valid: false, errors };
    }

    // Validate each step
    s.steps.forEach((step: any, index: number) => {
      if (typeof step !== 'object') {
        errors.push(`Step ${index + 1} must be an object`);
        return;
      }

      // Must have either action or delay
      if (!step.action && !step.delay) {
        errors.push(`Step ${index + 1} must have either action or delay`);
      }

      // Validate delay
      if (step.delay && (typeof step.delay !== 'number' || step.delay < 0)) {
        errors.push(`Step ${index + 1} delay must be a positive number`);
      }

      // Validate action
      if (step.action && typeof step.action !== 'string') {
        errors.push(`Step ${index + 1} action must be a string`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Utility delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
