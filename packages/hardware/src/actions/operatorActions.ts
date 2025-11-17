/**
 * OperatorOS Actions
 * Wraps OperatorOS window management and UI interactions
 */

import { HardwareAction } from '../types';
import { logger } from '../utils/logger';

const log = logger.createScope('OperatorActions');

export interface OperatorOSAPI {
  openWindow(appId: string): Promise<void>;
  focusWindow(appId: string): Promise<void>;
  closeWindow(appId: string): Promise<void>;
  cycleWindow(appId: string): Promise<void>;
  toggleCommandPalette(): Promise<void>;
  switchTheme(theme: string): Promise<void>;
}

export class OperatorActions {
  private operatorAPI: OperatorOSAPI | null = null;

  /**
   * Set OperatorOS API instance
   */
  setOperatorAPI(api: OperatorOSAPI): void {
    this.operatorAPI = api;
    log.info('OperatorOS API configured');
  }

  /**
   * Execute operator action
   */
  async execute(action: HardwareAction): Promise<void> {
    if (!this.operatorAPI) {
      log.warn('OperatorOS API not configured');
      return;
    }

    const { type, param } = action;

    try {
      switch (type) {
        case 'open_window':
          await this.openWindow(param.window as string || param.appId as string);
          break;

        case 'focus_window':
          await this.focusWindow(param.window as string || param.appId as string);
          break;

        case 'close_window':
          await this.closeWindow(param.window as string || param.appId as string);
          break;

        case 'cycle_window':
          await this.cycleWindow(param.window as string || param.appId as string);
          break;

        case 'trigger_command':
          if (param.command === 'palette') {
            await this.operatorAPI.toggleCommandPalette();
          }
          break;

        case 'cycle_theme':
          await this.cycleTheme();
          break;

        default:
          log.warn('Unknown operator action', { type });
      }
    } catch (error) {
      log.error('Error executing operator action', error, { type });
      throw error;
    }
  }

  /**
   * Open OperatorOS window
   */
  private async openWindow(appId: string): Promise<void> {
    if (!this.operatorAPI) return;

    await this.operatorAPI.openWindow(appId);
    log.info('Window opened', { appId });
  }

  /**
   * Focus OperatorOS window
   */
  private async focusWindow(appId: string): Promise<void> {
    if (!this.operatorAPI) return;

    await this.operatorAPI.focusWindow(appId);
    log.info('Window focused', { appId });
  }

  /**
   * Close OperatorOS window
   */
  private async closeWindow(appId: string): Promise<void> {
    if (!this.operatorAPI) return;

    await this.operatorAPI.closeWindow(appId);
    log.info('Window closed', { appId });
  }

  /**
   * Cycle through windows
   */
  private async cycleWindow(appId: string): Promise<void> {
    if (!this.operatorAPI) return;

    await this.operatorAPI.cycleWindow(appId);
    log.info('Window cycled', { appId });
  }

  /**
   * Cycle through available themes
   */
  private async cycleTheme(): Promise<void> {
    if (!this.operatorAPI) return;

    const themes = ['ascii', 'xp', 'aqua', 'daw', 'analogue'];
    const currentTheme = this.getCurrentTheme();
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];

    await this.operatorAPI.switchTheme(nextTheme);
    log.info('Theme cycled', { from: currentTheme, to: nextTheme });
  }

  /**
   * Get current theme (stub - should be implemented via API)
   */
  private getCurrentTheme(): string {
    // TODO: Get from OperatorOS API
    return 'ascii';
  }
}
