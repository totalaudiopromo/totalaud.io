/**
 * OperatorOS App Profiles
 * Manage app-specific preferences (launch mode, pinning, etc.)
 */

import type { OperatorAppID, OperatorWindow } from '../types';

export type LaunchMode = 'maximized' | 'floating' | 'last_state';

export interface AppProfile {
  id?: string;
  user_id?: string;
  workspace_id?: string;
  app_id: string;
  preferred_layout_name?: string;
  launch_mode: LaunchMode;
  pinned: boolean;
  metadata: {
    last_position?: { x: number; y: number };
    last_size?: { width: number; height: number };
    [key: string]: any;
  };
  created_at?: string;
  updated_at?: string;
}

/**
 * Get app profile from database
 */
export async function getAppProfile(
  userId: string,
  workspaceId: string,
  appId: OperatorAppID
): Promise<AppProfile | null> {
  try {
    const response = await fetch(`/api/operator/app-profiles?appId=${appId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to get app profile: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.ok || !data.data) {
      return null;
    }

    return data.data as AppProfile;
  } catch (error) {
    console.error('Error getting app profile:', error);
    return null;
  }
}

/**
 * Set/update app profile in database
 */
export async function setAppProfile(
  userId: string,
  workspaceId: string,
  appId: OperatorAppID,
  profilePartial: Partial<AppProfile>
): Promise<void> {
  try {
    const response = await fetch('/api/operator/app-profiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: appId,
        ...profilePartial,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to set app profile: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.ok) {
      throw new Error(data.error || 'Failed to set app profile');
    }
  } catch (error) {
    console.error('Error setting app profile:', error);
    throw error;
  }
}

/**
 * Get all pinned apps
 */
export async function getPinnedApps(
  userId: string,
  workspaceId: string
): Promise<AppProfile[]> {
  try {
    const response = await fetch('/api/operator/app-profiles?pinned=true', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get pinned apps: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.ok || !data.data) {
      return [];
    }

    return data.data as AppProfile[];
  } catch (error) {
    console.error('Error getting pinned apps:', error);
    return [];
  }
}

/**
 * Resolve initial window state based on app profile
 * This determines position, size, and state when opening an app
 */
export function resolveInitialWindowState(
  appId: OperatorAppID,
  profile: AppProfile | null,
  defaultState: Partial<OperatorWindow>
): Partial<OperatorWindow> {
  // Default window configuration
  const defaults = {
    position: { x: 100, y: 80 },
    size: { width: 1000, height: 700 },
    isMaximised: false,
    ...defaultState,
  };

  // No profile = use defaults
  if (!profile) {
    return defaults;
  }

  // Handle launch mode
  switch (profile.launch_mode) {
    case 'maximized':
      return {
        ...defaults,
        isMaximised: true,
      };

    case 'last_state':
      // Use last known position/size if available
      if (profile.metadata?.last_position && profile.metadata?.last_size) {
        return {
          ...defaults,
          position: profile.metadata.last_position,
          size: profile.metadata.last_size,
        };
      }
      return defaults;

    case 'floating':
    default:
      return defaults;
  }
}

/**
 * Update app profile with last window state
 * Call this when a window is closed or moved/resized
 */
export async function updateAppProfileWithWindowState(
  userId: string,
  workspaceId: string,
  window: OperatorWindow
): Promise<void> {
  try {
    const profile = await getAppProfile(userId, workspaceId, window.appId);

    await setAppProfile(userId, workspaceId, window.appId, {
      launch_mode: profile?.launch_mode || 'last_state',
      pinned: profile?.pinned || false,
      metadata: {
        ...profile?.metadata,
        last_position: window.position,
        last_size: window.size,
      },
    });
  } catch (error) {
    console.error('Error updating app profile with window state:', error);
    // Don't throw - this is a non-critical background operation
  }
}

/**
 * Toggle app pinning
 */
export async function toggleAppPinning(
  userId: string,
  workspaceId: string,
  appId: OperatorAppID
): Promise<boolean> {
  try {
    const profile = await getAppProfile(userId, workspaceId, appId);
    const newPinnedState = !profile?.pinned;

    await setAppProfile(userId, workspaceId, appId, {
      launch_mode: profile?.launch_mode || 'floating',
      pinned: newPinnedState,
      metadata: profile?.metadata || {},
    });

    return newPinnedState;
  } catch (error) {
    console.error('Error toggling app pinning:', error);
    throw error;
  }
}
