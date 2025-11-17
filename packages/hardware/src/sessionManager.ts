/**
 * Session Manager
 * Manages hardware control sessions and tracks activity
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { HardwareSession, HardwareDeviceType } from './types';
import { logger } from './utils/logger';

const log = logger.createScope('SessionManager');

export class SessionManager {
  private supabase: SupabaseClient;
  private currentSession: HardwareSession | null = null;
  private flowModeStartTime: number | null = null;
  private sessionInterval: NodeJS.Timeout | null = null;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Start new hardware session
   */
  async startSession(
    userId: string,
    deviceType: HardwareDeviceType,
    profileId?: string
  ): Promise<HardwareSession> {
    try {
      const { data, error } = await this.supabase
        .from('hardware_sessions')
        .insert({
          user_id: userId,
          device_type: deviceType,
          profile_id: profileId || null,
          started_at: new Date().toISOString(),
          metadata: {
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
            startedAt: Date.now(),
          },
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      this.currentSession = data as HardwareSession;

      // Start session tracking interval
      this.startSessionTracking();

      log.info('Hardware session started', {
        sessionId: this.currentSession.id,
        deviceType,
      });

      return this.currentSession;
    } catch (error) {
      log.error('Failed to start session', error);
      throw error;
    }
  }

  /**
   * End current hardware session
   */
  async endSession(): Promise<void> {
    if (!this.currentSession) {
      log.warn('No active session to end');
      return;
    }

    try {
      const duration = Date.now() - new Date(this.currentSession.startedAt).getTime();

      const { error } = await this.supabase
        .from('hardware_sessions')
        .update({
          ended_at: new Date().toISOString(),
          duration_ms: duration,
          flow_mode_duration_ms: this.flowModeStartTime
            ? Date.now() - this.flowModeStartTime
            : 0,
        })
        .eq('id', this.currentSession.id);

      if (error) {
        throw error;
      }

      log.info('Hardware session ended', {
        sessionId: this.currentSession.id,
        duration: `${Math.floor(duration / 1000)}s`,
      });

      this.stopSessionTracking();
      this.currentSession = null;
      this.flowModeStartTime = null;
    } catch (error) {
      log.error('Failed to end session', error);
      throw error;
    }
  }

  /**
   * Enable flow mode
   */
  async enableFlowMode(): Promise<void> {
    if (!this.currentSession) {
      log.warn('No active session');
      return;
    }

    this.flowModeStartTime = Date.now();

    try {
      await this.supabase
        .from('hardware_sessions')
        .update({ flow_mode_enabled: true })
        .eq('id', this.currentSession.id);

      log.info('Flow mode enabled', { sessionId: this.currentSession.id });
    } catch (error) {
      log.error('Failed to enable flow mode', error);
    }
  }

  /**
   * Disable flow mode
   */
  async disableFlowMode(): Promise<void> {
    if (!this.currentSession || !this.flowModeStartTime) {
      return;
    }

    const flowModeDuration = Date.now() - this.flowModeStartTime;

    try {
      await this.supabase
        .from('hardware_sessions')
        .update({
          flow_mode_enabled: false,
          flow_mode_duration_ms: flowModeDuration,
        })
        .eq('id', this.currentSession.id);

      log.info('Flow mode disabled', {
        sessionId: this.currentSession.id,
        duration: `${Math.floor(flowModeDuration / 1000)}s`,
      });

      this.flowModeStartTime = null;
    } catch (error) {
      log.error('Failed to disable flow mode', error);
    }
  }

  /**
   * Get current session
   */
  getCurrentSession(): HardwareSession | null {
    return this.currentSession;
  }

  /**
   * Get active session from database
   */
  async getActiveSession(userId: string): Promise<HardwareSession | null> {
    try {
      const { data, error } = await this.supabase
        .from('hardware_sessions')
        .select('*')
        .eq('user_id', userId)
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found
        throw error;
      }

      return data as HardwareSession | null;
    } catch (error) {
      log.error('Failed to get active session', error);
      return null;
    }
  }

  /**
   * Get session history
   */
  async getSessionHistory(userId: string, limit = 10): Promise<HardwareSession[]> {
    try {
      const { data, error } = await this.supabase
        .from('hardware_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return (data as HardwareSession[]) || [];
    } catch (error) {
      log.error('Failed to get session history', error);
      return [];
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats(userId: string): Promise<{
    totalSessions: number;
    totalDuration: number;
    totalActions: number;
    flowModeTime: number;
    averageSessionDuration: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('hardware_sessions')
        .select('duration_ms, total_actions, flow_mode_duration_ms')
        .eq('user_id', userId)
        .not('ended_at', 'is', null);

      if (error) {
        throw error;
      }

      const sessions = data || [];

      const totalSessions = sessions.length;
      const totalDuration = sessions.reduce((sum, s) => sum + (s.duration_ms || 0), 0);
      const totalActions = sessions.reduce((sum, s) => sum + (s.total_actions || 0), 0);
      const flowModeTime = sessions.reduce(
        (sum, s) => sum + (s.flow_mode_duration_ms || 0),
        0
      );
      const averageSessionDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;

      return {
        totalSessions,
        totalDuration,
        totalActions,
        flowModeTime,
        averageSessionDuration,
      };
    } catch (error) {
      log.error('Failed to get session stats', error);
      return {
        totalSessions: 0,
        totalDuration: 0,
        totalActions: 0,
        flowModeTime: 0,
        averageSessionDuration: 0,
      };
    }
  }

  /**
   * Start session tracking interval
   */
  private startSessionTracking(): void {
    // Update session metadata every 30 seconds
    this.sessionInterval = setInterval(() => {
      this.updateSessionMetadata();
    }, 30000);
  }

  /**
   * Stop session tracking interval
   */
  private stopSessionTracking(): void {
    if (this.sessionInterval) {
      clearInterval(this.sessionInterval);
      this.sessionInterval = null;
    }
  }

  /**
   * Update session metadata
   */
  private async updateSessionMetadata(): Promise<void> {
    if (!this.currentSession) {
      return;
    }

    try {
      const duration = Date.now() - new Date(this.currentSession.startedAt).getTime();

      await this.supabase
        .from('hardware_sessions')
        .update({
          metadata: {
            ...this.currentSession.metadata,
            lastActivity: new Date().toISOString(),
            duration,
          },
        })
        .eq('id', this.currentSession.id);
    } catch (error) {
      log.error('Failed to update session metadata', error);
    }
  }

  /**
   * Cleanup on destroy
   */
  async cleanup(): Promise<void> {
    this.stopSessionTracking();

    if (this.currentSession) {
      await this.endSession();
    }
  }
}
