/**
 * AppProfilePopover
 * Popover for managing app profile settings (launch mode, pinning, layout)
 * Phase 3 - Desktop Experience Layer
 */

'use client';

import { useState, useEffect } from 'react';
import type { OperatorAppID } from '../types';
import type { LaunchMode, AppProfile } from '../state/appProfiles';
import { getAppMetadata } from '@total-audio/operator-services';

interface AppProfilePopoverProps {
  appId: OperatorAppID;
  currentProfile: AppProfile | null;
  onUpdateProfile: (updates: Partial<AppProfile>) => Promise<void>;
  onClose: () => void;
  position: { x: number; y: number };
}

export function AppProfilePopover({
  appId,
  currentProfile,
  onUpdateProfile,
  onClose,
  position,
}: AppProfilePopoverProps) {
  const [launchMode, setLaunchMode] = useState<LaunchMode>(
    currentProfile?.launch_mode || 'floating'
  );
  const [pinned, setPinned] = useState(currentProfile?.pinned || false);
  const [saving, setSaving] = useState(false);

  const appMetadata = getAppMetadata(appId);

  useEffect(() => {
    setLaunchMode(currentProfile?.launch_mode || 'floating');
    setPinned(currentProfile?.pinned || false);
  }, [currentProfile]);

  const handleLaunchModeChange = async (mode: LaunchMode) => {
    try {
      setSaving(true);
      setLaunchMode(mode);
      await onUpdateProfile({ launch_mode: mode });
    } catch (error) {
      console.error('Error updating launch mode:', error);
      // Revert on error
      setLaunchMode(currentProfile?.launch_mode || 'floating');
    } finally {
      setSaving(false);
    }
  };

  const handlePinnedToggle = async () => {
    try {
      setSaving(true);
      const newPinnedState = !pinned;
      setPinned(newPinnedState);
      await onUpdateProfile({ pinned: newPinnedState });
    } catch (error) {
      console.error('Error toggling pin:', error);
      // Revert on error
      setPinned(currentProfile?.pinned || false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        onClick={onClose}
      />

      {/* Popover */}
      <div
        className="fixed z-50 w-72 bg-[#0A0D12] border border-[#3AA9BE]/30 rounded-xl shadow-2xl overflow-hidden"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/6 bg-[#10141A]">
          <h3 className="font-medium text-white capitalize">{appMetadata.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{appMetadata.description}</p>
        </div>

        {/* Launch Mode */}
        <div className="p-4 border-b border-white/6">
          <label className="block text-sm font-medium text-gray-300 mb-3">Launch Mode</label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
              <input
                type="radio"
                name="launchMode"
                checked={launchMode === 'floating'}
                onChange={() => handleLaunchModeChange('floating')}
                disabled={saving}
                className="text-[#3AA9BE]"
              />
              <div>
                <div className="text-sm text-white">Floating</div>
                <div className="text-xs text-gray-400">Default size and position</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
              <input
                type="radio"
                name="launchMode"
                checked={launchMode === 'maximized'}
                onChange={() => handleLaunchModeChange('maximized')}
                disabled={saving}
                className="text-[#3AA9BE]"
              />
              <div>
                <div className="text-sm text-white">Maximized</div>
                <div className="text-xs text-gray-400">Always open fullscreen</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
              <input
                type="radio"
                name="launchMode"
                checked={launchMode === 'last_state'}
                onChange={() => handleLaunchModeChange('last_state')}
                disabled={saving}
                className="text-[#3AA9BE]"
              />
              <div>
                <div className="text-sm text-white">Last State</div>
                <div className="text-xs text-gray-400">Remember position and size</div>
              </div>
            </label>
          </div>
        </div>

        {/* Pinning */}
        <div className="p-4">
          <label className="flex items-center justify-between cursor-pointer group">
            <div>
              <div className="text-sm font-medium text-white group-hover:text-[#3AA9BE] transition-colors">
                Pin to Dock
              </div>
              <div className="text-xs text-gray-400">Keep in dock when closed</div>
            </div>
            <button
              onClick={handlePinnedToggle}
              disabled={saving}
              className={`relative w-11 h-6 rounded-full transition-all duration-200 ${
                pinned ? 'bg-[#3AA9BE]' : 'bg-gray-600'
              } ${saving ? 'opacity-50' : ''}`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  pinned ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </label>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-black/30 border-t border-white/6">
          <div className="text-xs text-gray-400">
            Category: <span className="text-gray-300 capitalize">{appMetadata.category}</span>
          </div>
        </div>
      </div>
    </>
  );
}
