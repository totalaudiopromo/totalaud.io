/**
 * Command Service
 *
 * Orchestrates command execution by routing to workspace store actions
 * Provides unified interface for Command Palette and other operator controls
 *
 * Operator Command Palette - Flow Architect
 */

import { useWorkspaceStore } from '@aud-web/stores/workspaceStore'
import { getCommandById, type Command } from './commands'
import type { WorkspaceTab } from '@aud-web/stores/workspaceStore'

export interface CommandExecutionResult {
  success: boolean
  message: string
  error?: string
  data?: any
}

export interface CommandExecutionContext {
  campaignId?: string | null
  releaseId?: string | null
  currentTab?: WorkspaceTab
}

/**
 * CommandService
 *
 * Stateless service for executing operator commands
 * All state is managed by workspace store
 */
export class CommandService {
  /**
   * Execute a command by ID
   */
  static async execute(
    commandId: string,
    context: CommandExecutionContext = {}
  ): Promise<CommandExecutionResult> {
    const command = getCommandById(commandId)

    if (!command) {
      return {
        success: false,
        message: `Command not found: ${commandId}`,
        error: 'COMMAND_NOT_FOUND',
      }
    }

    // Validate requirements
    const validation = this.validateCommand(command, context)
    if (!validation.success) {
      return validation
    }

    // Route to appropriate handler
    try {
      if (command.category === 'workflow') {
        return await this.executeWorkflow(command, context)
      } else if (command.category === 'navigation') {
        return this.executeNavigation(command, context)
      } else {
        return {
          success: false,
          message: `Unsupported command category: ${command.category}`,
          error: 'UNSUPPORTED_CATEGORY',
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Command execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'EXECUTION_ERROR',
      }
    }
  }

  /**
   * Validate command prerequisites
   */
  private static validateCommand(
    command: Command,
    context: CommandExecutionContext
  ): CommandExecutionResult {
    // Check if command requires active campaign
    if (command.requiresCampaign && !context.campaignId) {
      return {
        success: false,
        message:
          'This command requires an active campaign. Please select or create a campaign first.',
        error: 'NO_ACTIVE_CAMPAIGN',
      }
    }

    return {
      success: true,
      message: 'Validation passed',
    }
  }

  /**
   * Execute workflow command
   */
  private static async executeWorkflow(
    command: Command,
    context: CommandExecutionContext
  ): Promise<CommandExecutionResult> {
    if (!command.workflowType) {
      return {
        success: false,
        message: 'Workflow type not defined for this command',
        error: 'NO_WORKFLOW_TYPE',
      }
    }

    if (!context.campaignId) {
      return {
        success: false,
        message: 'Campaign ID is required for workflow execution',
        error: 'NO_CAMPAIGN_ID',
      }
    }

    const store = useWorkspaceStore.getState()

    try {
      await store.runAction(command.workflowType, {
        campaign_id: context.campaignId,
        ...(command.params || {}),
      })

      return {
        success: true,
        message: `${command.label} completed successfully`,
        data: {
          commandId: command.id,
          workflowType: command.workflowType,
          campaignId: context.campaignId,
        },
      }
    } catch (error) {
      return {
        success: false,
        message: `${command.label} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: 'WORKFLOW_EXECUTION_FAILED',
      }
    }
  }

  /**
   * Execute navigation command
   */
  private static executeNavigation(
    command: Command,
    context: CommandExecutionContext
  ): CommandExecutionResult {
    const store = useWorkspaceStore.getState()

    if (command.action === 'switchTab' && command.params?.tab) {
      const tab = command.params.tab as WorkspaceTab
      store.switchTab(tab)

      return {
        success: true,
        message: `Switched to ${tab} tab`,
        data: {
          commandId: command.id,
          tab,
        },
      }
    }

    return {
      success: false,
      message: `Unknown navigation action: ${command.action}`,
      error: 'UNKNOWN_NAVIGATION_ACTION',
    }
  }

  /**
   * Get current execution context from workspace store
   */
  static getContext(): CommandExecutionContext {
    const store = useWorkspaceStore.getState()

    return {
      campaignId: store.activeCampaignId,
      releaseId: store.activeReleaseId,
      currentTab: store.activeTab,
    }
  }

  /**
   * Dry-run command validation without execution
   */
  static canExecute(
    commandId: string,
    context?: CommandExecutionContext
  ): {
    canExecute: boolean
    reason?: string
  } {
    const command = getCommandById(commandId)

    if (!command) {
      return {
        canExecute: false,
        reason: 'Command not found',
      }
    }

    const ctx = context || this.getContext()
    const validation = this.validateCommand(command, ctx)

    return {
      canExecute: validation.success,
      reason: validation.error,
    }
  }
}

/**
 * React hook for command execution
 */
export function useCommandService() {
  const store = useWorkspaceStore()

  const execute = async (commandId: string) => {
    const context: CommandExecutionContext = {
      campaignId: store.activeCampaignId,
      releaseId: store.activeReleaseId,
      currentTab: store.activeTab,
    }

    return await CommandService.execute(commandId, context)
  }

  const canExecute = (commandId: string) => {
    const context: CommandExecutionContext = {
      campaignId: store.activeCampaignId,
      releaseId: store.activeReleaseId,
      currentTab: store.activeTab,
    }

    return CommandService.canExecute(commandId, context)
  }

  return {
    execute,
    canExecute,
    context: {
      campaignId: store.activeCampaignId,
      releaseId: store.activeReleaseId,
      currentTab: store.activeTab,
    },
  }
}
