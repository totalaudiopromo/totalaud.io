/**
 * Agent Executor Actions
 * Wraps AgentOS skill execution and agent spawning
 */

import { HardwareAction } from '../types';
import { logger } from '../utils/logger';

const log = logger.createScope('AgentActions');

export interface AgentAPI {
  runAgent(agentId: string, payload: Record<string, unknown>): Promise<void>;
  spawnAgent(agentConfig: Record<string, unknown>): Promise<void>;
  runSkill(skillId: string, payload?: Record<string, unknown>): Promise<void>;
  triggerSequence(sequenceId: string): Promise<void>;
  triggerBoot(): Promise<void>;
}

export class AgentActions {
  private agentAPI: AgentAPI | null = null;

  /**
   * Set Agent API instance
   */
  setAgentAPI(api: AgentAPI): void {
    this.agentAPI = api;
    log.info('Agent API configured');
  }

  /**
   * Execute agent action
   */
  async execute(action: HardwareAction): Promise<void> {
    if (!this.agentAPI) {
      log.warn('Agent API not configured');
      return;
    }

    const { type, param } = action;

    try {
      switch (type) {
        case 'run_agent':
          await this.runAgent(param.agent as string || param.agentId as string, param);
          break;

        case 'spawn_agent':
          await this.spawnAgent(param);
          break;

        case 'run_skill':
          await this.runSkill(param.skill as string || param.skillId as string, param);
          break;

        case 'trigger_boot':
          await this.triggerBoot();
          break;

        default:
          log.warn('Unknown agent action', { type });
      }
    } catch (error) {
      log.error('Error executing agent action', error, { type });
      throw error;
    }
  }

  /**
   * Run agent
   */
  private async runAgent(agentId: string, payload: Record<string, unknown>): Promise<void> {
    if (!this.agentAPI) return;

    await this.agentAPI.runAgent(agentId, payload);
    log.info('Agent executed', { agentId });
  }

  /**
   * Spawn new agent
   */
  private async spawnAgent(config: Record<string, unknown>): Promise<void> {
    if (!this.agentAPI) return;

    await this.agentAPI.spawnAgent(config);
    log.info('Agent spawned', { config });
  }

  /**
   * Run skill
   */
  private async runSkill(skillId: string, payload?: Record<string, unknown>): Promise<void> {
    if (!this.agentAPI) return;

    await this.agentAPI.runSkill(skillId, payload);
    log.info('Skill executed', { skillId });
  }

  /**
   * Trigger boot animation
   */
  private async triggerBoot(): Promise<void> {
    if (!this.agentAPI) return;

    await this.agentAPI.triggerBoot();
    log.info('Boot animation triggered');
  }
}
