/**
 * Mapping Engine
 * Routes normalized hardware input events to TotalAud.io actions
 */

import { SupabaseClient } from '@supabase/supabase-js';
import {
  NormalizedInputEvent,
  HardwareMapping,
  HardwareAction,
  HardwareProfile,
} from './types';
import { logger } from './utils/logger';

const log = logger.createScope('MappingEngine');

export interface ActionExecutor {
  execute(action: HardwareAction): Promise<void>;
}

export class MappingEngine {
  private supabase: SupabaseClient;
  private profileId: string | null = null;
  private mappings: HardwareMapping[] = [];
  private actionExecutor: ActionExecutor | null = null;
  private contextFilters: string[] = [];

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Load hardware profile and mappings
   */
  async loadProfile(profileId: string): Promise<void> {
    try {
      // Load profile
      const { data: profile, error: profileError } = await this.supabase
        .from('hardware_profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (profileError) {
        throw profileError;
      }

      if (!profile) {
        throw new Error('Profile not found');
      }

      log.info('Profile loaded', { profileId, deviceType: profile.device_type });

      // Load mappings
      const { data: mappings, error: mappingsError } = await this.supabase
        .from('hardware_mappings')
        .select('*')
        .eq('profile_id', profileId)
        .eq('enabled', true);

      if (mappingsError) {
        throw mappingsError;
      }

      this.profileId = profileId;
      this.mappings = (mappings || []) as HardwareMapping[];

      log.info('Mappings loaded', {
        count: this.mappings.length,
        profileId,
      });
    } catch (error) {
      log.error('Failed to load profile', error, { profileId });
      throw error;
    }
  }

  /**
   * Set action executor
   */
  setActionExecutor(executor: ActionExecutor): void {
    this.actionExecutor = executor;
    log.info('Action executor set');
  }

  /**
   * Set context filters (e.g., 'flow_mode', 'studio_open')
   */
  setContext(contexts: string[]): void {
    this.contextFilters = contexts;
    log.debug('Context filters updated', { contexts });
  }

  /**
   * Process input event and execute mapped action
   */
  async processInput(event: NormalizedInputEvent): Promise<void> {
    try {
      // Find matching mapping
      const mapping = this.findMapping(event);

      if (!mapping) {
        log.debug('No mapping found for input', {
          inputType: event.inputType,
          inputId: event.inputId,
        });
        return;
      }

      log.debug('Mapping found', {
        inputId: event.inputId,
        action: mapping.action,
      });

      // Build action
      const action: HardwareAction = {
        type: mapping.action,
        param: {
          ...mapping.param,
          inputValue: event.value,
          velocity: event.velocity,
        },
        context: mapping.context || undefined,
        metadata: event.metadata,
      };

      // Execute action
      if (this.actionExecutor) {
        await this.actionExecutor.execute(action);

        // Log action execution
        await this.logAction(event, mapping, 'success');
      } else {
        log.warn('No action executor configured');
      }
    } catch (error) {
      log.error('Error processing input', error, {
        inputType: event.inputType,
        inputId: event.inputId,
      });

      // Log failed action
      const mapping = this.findMapping(event);
      if (mapping) {
        await this.logAction(event, mapping, 'error', error);
      }
    }
  }

  /**
   * Find matching mapping for input event
   */
  private findMapping(event: NormalizedInputEvent): HardwareMapping | undefined {
    return this.mappings.find((mapping) => {
      // Match input
      if (mapping.inputId !== event.inputId) {
        return false;
      }

      // Match context (if specified)
      if (mapping.context && !this.contextFilters.includes(mapping.context)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Log action execution
   */
  private async logAction(
    event: NormalizedInputEvent,
    mapping: HardwareMapping,
    status: 'success' | 'error',
    error?: unknown
  ): Promise<void> {
    try {
      // Get active session
      const { data: session } = await this.supabase
        .from('hardware_sessions')
        .select('id, user_id')
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (!session) {
        return;
      }

      // Insert action log
      await this.supabase.from('hardware_action_log').insert({
        session_id: session.id,
        user_id: session.user_id,
        profile_id: this.profileId,
        input_type: event.inputType,
        input_id: event.inputId,
        input_value: event.value,
        action: mapping.action,
        param: mapping.param,
        status,
        error_message: error instanceof Error ? error.message : undefined,
        executed_at: new Date().toISOString(),
      });

      // Increment session action count
      await this.supabase.rpc('increment_session_actions', {
        p_session_id: session.id,
      });
    } catch (logError) {
      log.error('Failed to log action', logError);
    }
  }

  /**
   * Get all mappings
   */
  getMappings(): HardwareMapping[] {
    return this.mappings;
  }

  /**
   * Add or update mapping
   */
  async saveMapping(mapping: Partial<HardwareMapping> & { inputId: string; action: string }): Promise<void> {
    try {
      if (!this.profileId) {
        throw new Error('No profile loaded');
      }

      const mappingData = {
        profile_id: this.profileId,
        input_type: mapping.inputType || 'pad',
        input_id: mapping.inputId,
        action: mapping.action,
        param: mapping.param || {},
        feedback: mapping.feedback || null,
        enabled: mapping.enabled !== undefined ? mapping.enabled : true,
        context: mapping.context || null,
      };

      // Upsert mapping
      const { error } = await this.supabase
        .from('hardware_mappings')
        .upsert(mappingData, {
          onConflict: 'profile_id,input_id',
        });

      if (error) {
        throw error;
      }

      // Reload mappings
      await this.loadProfile(this.profileId);

      log.info('Mapping saved', { inputId: mapping.inputId, action: mapping.action });
    } catch (error) {
      log.error('Failed to save mapping', error);
      throw error;
    }
  }

  /**
   * Delete mapping
   */
  async deleteMapping(inputId: string): Promise<void> {
    try {
      if (!this.profileId) {
        throw new Error('No profile loaded');
      }

      const { error } = await this.supabase
        .from('hardware_mappings')
        .delete()
        .eq('profile_id', this.profileId)
        .eq('input_id', inputId);

      if (error) {
        throw error;
      }

      // Remove from local cache
      this.mappings = this.mappings.filter((m) => m.inputId !== inputId);

      log.info('Mapping deleted', { inputId });
    } catch (error) {
      log.error('Failed to delete mapping', error);
      throw error;
    }
  }

  /**
   * Get mapping for input ID
   */
  getMapping(inputId: string): HardwareMapping | undefined {
    return this.mappings.find((m) => m.inputId === inputId);
  }
}
