/**
 * Scenes Engine Actions
 * Wraps Scenes navigation and microgenre radar control
 */

import { HardwareAction } from '../types';
import { logger } from '../utils/logger';

const log = logger.createScope('SceneActions');

export interface ScenesAPI {
  switchScene(sceneId: string): Promise<void>;
  triggerScene(sceneId: string): Promise<void>;
  navigateRadar(direction: 'up' | 'down' | 'left' | 'right'): Promise<void>;
  toggleDetailView(): Promise<void>;
  selectCandidate(index: number): Promise<void>;
}

export class SceneActions {
  private scenesAPI: ScenesAPI | null = null;

  /**
   * Set Scenes API instance
   */
  setScenesAPI(api: ScenesAPI): void {
    this.scenesAPI = api;
    log.info('Scenes API configured');
  }

  /**
   * Execute scene action
   */
  async execute(action: HardwareAction): Promise<void> {
    if (!this.scenesAPI) {
      log.warn('Scenes API not configured');
      return;
    }

    const { type, param } = action;

    try {
      switch (type) {
        case 'trigger_scene':
          await this.triggerScene(param.scene as string || param.sceneId as string);
          break;

        case 'switch_scene':
          await this.switchScene(param.scene as string || param.sceneId as string);
          break;

        case 'navigate':
          await this.navigateRadar(param.direction as 'up' | 'down' | 'left' | 'right');
          break;

        default:
          log.warn('Unknown scene action', { type });
      }
    } catch (error) {
      log.error('Error executing scene action', error, { type });
      throw error;
    }
  }

  /**
   * Trigger scene
   */
  private async triggerScene(sceneId: string): Promise<void> {
    if (!this.scenesAPI) return;

    await this.scenesAPI.triggerScene(sceneId);
    log.info('Scene triggered', { sceneId });
  }

  /**
   * Switch to scene
   */
  private async switchScene(sceneId: string): Promise<void> {
    if (!this.scenesAPI) return;

    await this.scenesAPI.switchScene(sceneId);
    log.info('Scene switched', { sceneId });
  }

  /**
   * Navigate microgenre radar
   */
  private async navigateRadar(direction: 'up' | 'down' | 'left' | 'right'): Promise<void> {
    if (!this.scenesAPI) return;

    await this.scenesAPI.navigateRadar(direction);
    log.info('Radar navigated', { direction });
  }
}
