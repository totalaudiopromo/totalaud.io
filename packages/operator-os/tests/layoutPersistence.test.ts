/**
 * Layout Persistence Tests
 * Tests for save/load/import/export of layouts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  extractLayoutFromStore,
  exportLayoutToJson,
  importLayoutFromJson,
  type OperatorLayout,
} from '../src/state/layoutPersistence';

describe('layoutPersistence', () => {
  const mockState = {
    activeTheme: 'daw' as const,
    operatorPersona: 'strategist' as const,
    windows: [
      {
        id: 'window-1',
        appId: 'intel' as const,
        title: 'Audio Intel',
        position: { x: 100, y: 80 },
        size: { width: 1000, height: 700 },
        isFocused: true,
        isMinimised: false,
        isMaximised: false,
        zIndex: 1,
      },
      {
        id: 'window-2',
        appId: 'pitch' as const,
        title: 'Pitch Generator',
        position: { x: 150, y: 120 },
        size: { width: 900, height: 650 },
        isFocused: false,
        isMinimised: false,
        isMaximised: true,
        zIndex: 2,
      },
    ],
    dockApps: [],
    commandHistory: [],
    notifications: [],
    isCommandPaletteOpen: false,
    focusedWindowId: 'window-1',
  };

  describe('extractLayoutFromStore', () => {
    it('should extract layout from store state', () => {
      const layout = extractLayoutFromStore(mockState, 'test-layout');

      expect(layout).toMatchObject({
        layout_name: 'test-layout',
        theme: 'daw',
        persona: 'strategist',
      });

      expect(layout.windows).toHaveLength(2);
      expect(layout.windows[0]).toMatchObject({
        appId: 'intel',
        x: 100,
        y: 80,
        width: 1000,
        height: 700,
        zIndex: 1,
        isMinimised: false,
        isMaximised: false,
      });
    });

    it('should preserve window maximized state', () => {
      const layout = extractLayoutFromStore(mockState, 'test');

      expect(layout.windows[1].isMaximised).toBe(true);
    });
  });

  describe('exportLayoutToJson', () => {
    it('should export layout as JSON string', () => {
      const layout: OperatorLayout = {
        layout_name: 'creative',
        windows: [
          {
            appId: 'studio',
            x: 100,
            y: 100,
            width: 1200,
            height: 800,
            zIndex: 1,
            isMinimised: false,
          },
        ],
        theme: 'aqua',
        persona: 'producer',
      };

      const json = exportLayoutToJson(layout);
      const parsed = JSON.parse(json);

      expect(parsed.layout_name).toBe('creative');
      expect(parsed.theme).toBe('aqua');
      expect(parsed.persona).toBe('producer');
      expect(parsed.windows).toHaveLength(1);
      expect(parsed.exported_at).toBeDefined();
    });

    it('should produce valid JSON', () => {
      const layout: OperatorLayout = {
        layout_name: 'ops',
        windows: [],
        theme: 'daw',
        persona: 'default',
      };

      const json = exportLayoutToJson(layout);

      expect(() => JSON.parse(json)).not.toThrow();
    });
  });

  describe('importLayoutFromJson', () => {
    it('should import layout from JSON string', () => {
      const jsonData = {
        layout_name: 'imported',
        windows: [
          {
            appId: 'intel',
            x: 200,
            y: 150,
            width: 1000,
            height: 700,
            zIndex: 1,
            isMinimised: false,
          },
        ],
        theme: 'xp',
        persona: 'campaign',
        exported_at: '2025-11-18T00:00:00.000Z',
      };

      const layout = importLayoutFromJson(JSON.stringify(jsonData));

      expect(layout.layout_name).toBe('imported');
      expect(layout.theme).toBe('xp');
      expect(layout.persona).toBe('campaign');
      expect(layout.windows).toHaveLength(1);
    });

    it('should throw error for invalid JSON', () => {
      expect(() => importLayoutFromJson('not valid json')).toThrow();
    });

    it('should throw error for missing required fields', () => {
      const invalidLayout = {
        layout_name: 'test',
        theme: 'daw',
        // Missing windows and persona
      };

      expect(() => importLayoutFromJson(JSON.stringify(invalidLayout))).toThrow(
        'missing required fields'
      );
    });

    it('should throw error for invalid theme', () => {
      const invalidLayout = {
        layout_name: 'test',
        windows: [],
        theme: 'invalid-theme',
        persona: 'default',
      };

      expect(() => importLayoutFromJson(JSON.stringify(invalidLayout))).toThrow(
        'Invalid theme'
      );
    });

    it('should throw error for invalid persona', () => {
      const invalidLayout = {
        layout_name: 'test',
        windows: [],
        theme: 'daw',
        persona: 'invalid-persona',
      };

      expect(() => importLayoutFromJson(JSON.stringify(invalidLayout))).toThrow(
        'Invalid persona'
      );
    });
  });

  describe('save/load roundtrip', () => {
    it('should preserve layout through export and import', () => {
      const originalLayout: OperatorLayout = {
        layout_name: 'roundtrip-test',
        windows: [
          {
            appId: 'intel',
            x: 100,
            y: 200,
            width: 1000,
            height: 700,
            zIndex: 1,
            isMinimised: false,
            isMaximised: true,
          },
          {
            appId: 'pitch',
            x: 150,
            y: 250,
            width: 900,
            height: 650,
            zIndex: 2,
            isMinimised: true,
            isMaximised: false,
          },
        ],
        theme: 'analogue',
        persona: 'dev',
      };

      const json = exportLayoutToJson(originalLayout);
      const importedLayout = importLayoutFromJson(json);

      expect(importedLayout.layout_name).toBe(originalLayout.layout_name);
      expect(importedLayout.theme).toBe(originalLayout.theme);
      expect(importedLayout.persona).toBe(originalLayout.persona);
      expect(importedLayout.windows).toHaveLength(originalLayout.windows.length);
      expect(importedLayout.windows[0]).toMatchObject(originalLayout.windows[0]);
      expect(importedLayout.windows[1]).toMatchObject(originalLayout.windows[1]);
    });
  });
});
