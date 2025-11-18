/**
 * AppPreferencesSection
 * Global view of all app profiles and their settings
 * Phase 3 - Desktop Experience Layer
 */

'use client';

import { useState, useEffect } from 'react';
import { getAllApps, useAppProfiles, type OperatorAppID } from '@total-audio/operator-services';
import type { LaunchMode } from '@total-audio/operator-os';

interface AppPreferencesSectionProps {
  userId: string;
  workspaceId: string;
}

export function AppPreferencesSection({
  userId,
  workspaceId,
}: AppPreferencesSectionProps) {
  const allApps = getAllApps();
  const {
    profiles,
    loading,
    updateProfile,
    togglePin,
    isPinned,
    getLaunchMode,
  } = useAppProfiles(userId, workspaceId);

  const handleLaunchModeChange = async (appId: OperatorAppID, mode: LaunchMode) => {
    try {
      await updateProfile(appId, { launch_mode: mode });
    } catch (error) {
      console.error('Error updating launch mode:', error);
    }
  };

  const handlePinToggle = async (appId: OperatorAppID) => {
    try {
      await togglePin(appId);
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading app preferences...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">App Preferences</h2>
        <p className="text-sm text-gray-400 mb-6">
          Configure how each app behaves when launched. Changes apply immediately.
        </p>
      </div>

      {/* Apps Table */}
      <div className="border border-white/6 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#10141A]">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">App</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Category</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-300">Launch Mode</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-gray-300">Pinned</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6">
            {allApps.map((app) => {
              const appIsPinned = isPinned(app.appId);
              const launchMode = getLaunchMode(app.appId);

              return (
                <tr
                  key={app.appId}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-white">{app.name}</div>
                      <div className="text-xs text-gray-400">{app.description}</div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-white/5 text-gray-300 text-xs rounded capitalize">
                      {app.category}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <select
                      value={launchMode}
                      onChange={(e) => handleLaunchModeChange(app.appId, e.target.value as LaunchMode)}
                      className="px-3 py-1.5 bg-[#151A22] border border-white/10 rounded text-white text-sm focus:outline-none focus:border-[#3AA9BE] transition-colors"
                    >
                      <option value="floating">Floating</option>
                      <option value="maximized">Maximized</option>
                      <option value="last_state">Last State</option>
                    </select>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handlePinToggle(app.appId)}
                      className={`relative w-11 h-6 rounded-full transition-all duration-200 ${
                        appIsPinned ? 'bg-[#3AA9BE]' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                          appIsPinned ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Info Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-[#10141A] border border-white/6 rounded-xl">
          <div className="text-sm font-medium text-white mb-1">Floating</div>
          <div className="text-xs text-gray-400">
            Opens at default size and position
          </div>
        </div>

        <div className="p-4 bg-[#10141A] border border-white/6 rounded-xl">
          <div className="text-sm font-medium text-white mb-1">Maximized</div>
          <div className="text-xs text-gray-400">
            Always opens fullscreen
          </div>
        </div>

        <div className="p-4 bg-[#10141A] border border-white/6 rounded-xl">
          <div className="text-sm font-medium text-white mb-1">Last State</div>
          <div className="text-xs text-gray-400">
            Remembers position and size from last session
          </div>
        </div>
      </div>

      {/* Pinning Info */}
      <div className="p-4 bg-[#3AA9BE]/10 border border-[#3AA9BE]/30 rounded-xl">
        <div className="text-sm text-[#3AA9BE]">
          <span className="font-medium">Tip:</span> Pinned apps stay visible in the dock even when closed.
          Right-click any dock icon for quick access to these settings.
        </div>
      </div>
    </div>
  );
}
