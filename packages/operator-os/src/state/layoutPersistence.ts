/**
 * OperatorOS Layout Persistence
 * Save and load desktop layouts (window positions, theme, persona)
 */

import type { OperatorWindow, OperatorOSTheme, OperatorPersona } from '../types';
import { debounce } from '../utils/debounce';

export interface OperatorLayout {
  id?: string;
  user_id?: string;
  workspace_id?: string;
  layout_name: string;
  windows: OperatorLayoutWindow[];
  theme: OperatorOSTheme;
  persona: OperatorPersona;
  created_at?: string;
  updated_at?: string;
}

export interface OperatorLayoutWindow {
  appId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimised: boolean;
  isMaximised?: boolean;
}

export interface OperatorLayoutSummary {
  layout_name: string;
  theme: OperatorOSTheme;
  persona: OperatorPersona;
  window_count: number;
  updated_at: string;
}

/**
 * Load a layout from the database
 */
export async function loadLayout(
  userId: string,
  workspaceId: string,
  layoutName?: string
): Promise<OperatorLayout | null> {
  try {
    const params = new URLSearchParams();
    if (layoutName) {
      params.set('name', layoutName);
    }

    const response = await fetch(
      `/api/operator/layouts${layoutName ? `/${layoutName}` : '?default=true'}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to load layout: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.ok || !data.data) {
      return null;
    }

    return data.data as OperatorLayout;
  } catch (error) {
    console.error('Error loading layout:', error);
    return null;
  }
}

/**
 * Save a layout to the database
 */
export async function saveLayout(
  userId: string,
  workspaceId: string,
  layout: OperatorLayout
): Promise<void> {
  try {
    const response = await fetch('/api/operator/layouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        layout_name: layout.layout_name,
        windows: layout.windows,
        theme: layout.theme,
        persona: layout.persona,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save layout: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.ok) {
      throw new Error(data.error || 'Failed to save layout');
    }
  } catch (error) {
    console.error('Error saving layout:', error);
    throw error;
  }
}

/**
 * List all layouts for the current user
 */
export async function listLayouts(
  userId: string,
  workspaceId: string
): Promise<OperatorLayoutSummary[]> {
  try {
    const response = await fetch('/api/operator/layouts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to list layouts: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.ok || !data.data) {
      return [];
    }

    return data.data as OperatorLayoutSummary[];
  } catch (error) {
    console.error('Error listing layouts:', error);
    return [];
  }
}

/**
 * Delete a layout
 */
export async function deleteLayout(
  userId: string,
  workspaceId: string,
  layoutName: string
): Promise<void> {
  try {
    const response = await fetch(`/api/operator/layouts/${layoutName}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete layout: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.ok) {
      throw new Error(data.error || 'Failed to delete layout');
    }
  } catch (error) {
    console.error('Error deleting layout:', error);
    throw error;
  }
}

/**
 * Apply a layout to the Zustand store
 * This function should be called with the Zustand store's set function
 */
export function applyLayoutToStore(
  layout: OperatorLayout,
  setStore: (updater: (state: any) => any) => void
): void {
  setStore((state: any) => ({
    ...state,
    activeTheme: layout.theme,
    operatorPersona: layout.persona,
    windows: layout.windows.map((w, idx) => ({
      id: `window-${Date.now()}-${idx}`,
      appId: w.appId as any,
      title: w.appId.charAt(0).toUpperCase() + w.appId.slice(1),
      position: { x: w.x, y: w.y },
      size: { width: w.width, height: w.height },
      isFocused: idx === 0,
      isMinimised: w.isMinimised,
      isMaximised: w.isMaximised || false,
      zIndex: w.zIndex,
    })),
    focusedWindowId: layout.windows.length > 0 ? `window-${Date.now()}-0` : null,
  }));
}

/**
 * Extract current layout from Zustand store
 */
export function extractLayoutFromStore(
  state: any,
  layoutName: string
): OperatorLayout {
  return {
    layout_name: layoutName,
    windows: state.windows.map((w: OperatorWindow) => ({
      appId: w.appId,
      x: w.position.x,
      y: w.position.y,
      width: w.size.width,
      height: w.size.height,
      zIndex: w.zIndex,
      isMinimised: w.isMinimised,
      isMaximised: w.isMaximised,
    })),
    theme: state.activeTheme,
    persona: state.operatorPersona,
  };
}

/**
 * Export layout to JSON for backup/sharing
 */
export function exportLayoutToJson(layout: OperatorLayout): string {
  const exportData = {
    layout_name: layout.layout_name,
    windows: layout.windows,
    theme: layout.theme,
    persona: layout.persona,
    exported_at: new Date().toISOString(),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Import layout from JSON
 */
export function importLayoutFromJson(json: string): OperatorLayout {
  try {
    const parsed = JSON.parse(json);

    // Validate required fields
    if (!parsed.layout_name || !parsed.windows || !parsed.theme || !parsed.persona) {
      throw new Error('Invalid layout JSON: missing required fields');
    }

    // Validate theme
    const validThemes: OperatorOSTheme[] = ['xp', 'aqua', 'daw', 'ascii', 'analogue'];
    if (!validThemes.includes(parsed.theme)) {
      throw new Error(`Invalid theme: ${parsed.theme}`);
    }

    // Validate persona
    const validPersonas: OperatorPersona[] = ['default', 'strategist', 'producer', 'campaign', 'dev'];
    if (!validPersonas.includes(parsed.persona)) {
      throw new Error(`Invalid persona: ${parsed.persona}`);
    }

    return {
      layout_name: parsed.layout_name,
      windows: parsed.windows,
      theme: parsed.theme,
      persona: parsed.persona,
    };
  } catch (error) {
    console.error('Error importing layout from JSON:', error);
    throw error;
  }
}

/**
 * Create a debounced save function for auto-saving layouts
 * Useful for saving layout as windows move/resize
 */
export const createDebouncedLayoutSave = (
  userId: string,
  workspaceId: string,
  layoutName: string,
  delay: number = 2000
) => {
  return debounce((getState: () => any) => {
    const state = getState();
    const layout = extractLayoutFromStore(state, layoutName);
    saveLayout(userId, workspaceId, layout).catch(err => {
      console.error('Auto-save layout failed:', err);
    });
  }, delay);
};
