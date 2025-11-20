/**
 * App Profiles Tests
 * Tests for app profile management and window state resolution
 */

import { describe, it, expect } from 'vitest';
import {
  resolveInitialWindowState,
  type AppProfile,
} from '../src/state/appProfiles';
import type { OperatorWindow } from '../src/types';

describe('appProfiles', () => {
  const defaultWindowState: Partial<OperatorWindow> = {
    position: { x: 100, y: 80 },
    size: { width: 1000, height: 700 },
    isMaximised: false,
  };

  describe('resolveInitialWindowState', () => {
    it('should use default state when no profile exists', () => {
      const result = resolveInitialWindowState('intel', null, defaultWindowState);

      expect(result).toMatchObject(defaultWindowState);
    });

    it('should maximize window when launch_mode is maximized', () => {
      const profile: AppProfile = {
        app_id: 'intel',
        launch_mode: 'maximized',
        pinned: false,
        metadata: {},
      };

      const result = resolveInitialWindowState('intel', profile, defaultWindowState);

      expect(result.isMaximised).toBe(true);
      expect(result.position).toEqual(defaultWindowState.position);
      expect(result.size).toEqual(defaultWindowState.size);
    });

    it('should use default state when launch_mode is floating', () => {
      const profile: AppProfile = {
        app_id: 'pitch',
        launch_mode: 'floating',
        pinned: false,
        metadata: {},
      };

      const result = resolveInitialWindowState('pitch', profile, defaultWindowState);

      expect(result).toMatchObject(defaultWindowState);
    });

    it('should use last state when available and launch_mode is last_state', () => {
      const profile: AppProfile = {
        app_id: 'studio',
        launch_mode: 'last_state',
        pinned: true,
        metadata: {
          last_position: { x: 250, y: 150 },
          last_size: { width: 1200, height: 800 },
        },
      };

      const result = resolveInitialWindowState('studio', profile, defaultWindowState);

      expect(result.position).toEqual({ x: 250, y: 150 });
      expect(result.size).toEqual({ width: 1200, height: 800 });
      expect(result.isMaximised).toBe(false);
    });

    it('should fallback to default when launch_mode is last_state but no saved state', () => {
      const profile: AppProfile = {
        app_id: 'tracker',
        launch_mode: 'last_state',
        pinned: false,
        metadata: {}, // No last_position or last_size
      };

      const result = resolveInitialWindowState('tracker', profile, defaultWindowState);

      expect(result).toMatchObject(defaultWindowState);
    });

    it('should handle partial metadata gracefully', () => {
      const profile: AppProfile = {
        app_id: 'autopilot',
        launch_mode: 'last_state',
        pinned: false,
        metadata: {
          last_position: { x: 300, y: 200 },
          // Missing last_size
        },
      };

      const result = resolveInitialWindowState('autopilot', profile, defaultWindowState);

      // Should fallback to defaults when incomplete
      expect(result).toMatchObject(defaultWindowState);
    });

    it('should preserve custom default state properties', () => {
      const customDefaults: Partial<OperatorWindow> = {
        position: { x: 200, y: 150 },
        size: { width: 1100, height: 750 },
        isMaximised: false,
      };

      const result = resolveInitialWindowState('settings', null, customDefaults);

      expect(result.position).toEqual({ x: 200, y: 150 });
      expect(result.size).toEqual({ width: 1100, height: 750 });
    });

    it('should handle pinned property correctly', () => {
      const profile: AppProfile = {
        app_id: 'terminal',
        launch_mode: 'floating',
        pinned: true,
        metadata: {},
      };

      const result = resolveInitialWindowState('terminal', profile, defaultWindowState);

      // Pinning shouldn't affect window state
      expect(result).toMatchObject(defaultWindowState);
    });

    it('should handle metadata with additional custom fields', () => {
      const profile: AppProfile = {
        app_id: 'coach',
        launch_mode: 'last_state',
        pinned: false,
        metadata: {
          last_position: { x: 400, y: 300 },
          last_size: { width: 1000, height: 600 },
          customField: 'should not interfere',
          anotherCustom: 42,
        },
      };

      const result = resolveInitialWindowState('coach', profile, defaultWindowState);

      expect(result.position).toEqual({ x: 400, y: 300 });
      expect(result.size).toEqual({ width: 1000, height: 600 });
    });
  });

  describe('launch mode behavior', () => {
    it('should support all three launch modes', () => {
      const launchModes: Array<'maximized' | 'floating' | 'last_state'> = [
        'maximized',
        'floating',
        'last_state',
      ];

      launchModes.forEach((mode) => {
        const profile: AppProfile = {
          app_id: 'test',
          launch_mode: mode,
          pinned: false,
          metadata: {},
        };

        const result = resolveInitialWindowState('test', profile, defaultWindowState);

        expect(result).toBeDefined();
        expect(result.position).toBeDefined();
        expect(result.size).toBeDefined();
      });
    });
  });
});
