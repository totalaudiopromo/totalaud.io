/**
 * OperatorDock
 * Application launcher dock at bottom of screen
 * Phase 3: Enhanced with app profiles and pinning
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Radio,
  Send,
  Target,
  Sparkles,
  Users,
  Zap,
  Workflow,
  GraduationCap,
  Film,
  Briefcase,
  BarChart3,
  Settings,
  Terminal,
  Pin,
} from 'lucide-react';
import { useOperatorStore } from '../state/operatorStore';
import { themes } from '../themes';
import { dockItemVariants } from '../utils/animations';
import { resolveInitialWindowState } from '../state/appProfiles';
import type { OperatorAppID } from '../types';
import type { AppProfile } from '../state/appProfiles';
import { AppProfilePopover } from './AppProfilePopover';
import { useAppProfiles } from '@total-audio/operator-services';

const appIcons: Record<OperatorAppID, React.ComponentType<{ size?: number }>> = {
  dashboard: LayoutDashboard,
  intel: Radio,
  pitch: Send,
  tracker: Target,
  studio: Sparkles,
  community: Users,
  autopilot: Zap,
  automations: Workflow,
  coach: GraduationCap,
  scenes: Film,
  mig: Briefcase,
  anr: BarChart3,
  settings: Settings,
  terminal: Terminal,
};

export interface OperatorDockProps {
  userId?: string;
  workspaceId?: string;
}

export function OperatorDock({
  userId = 'demo-user',
  workspaceId = 'demo-workspace',
}: OperatorDockProps = {}) {
  const { activeTheme, dockApps, windows, openApp, focusWindow } = useOperatorStore();
  const theme = themes[activeTheme];

  // App profiles hook
  const { isPinned, getProfile, updateProfile } = useAppProfiles(userId, workspaceId);

  // Popover state
  const [popoverState, setPopoverState] = useState<{
    appId: OperatorAppID | null;
    position: { x: number; y: number } | null;
  }>({ appId: null, position: null });

  const handleAppClick = async (appId: OperatorAppID) => {
    // Check if window exists
    const existingWindow = windows.find(w => w.appId === appId);

    if (existingWindow) {
      if (existingWindow.isMinimised) {
        focusWindow(existingWindow.id);
      } else {
        focusWindow(existingWindow.id);
      }
    } else {
      // Get app profile to determine launch behavior
      const profile = await getProfile(appId);
      const initialState = resolveInitialWindowState(profile);

      openApp(appId, undefined, initialState);
    }
  };

  const handleRightClick = (e: React.MouseEvent, appId: OperatorAppID) => {
    e.preventDefault();
    setPopoverState({
      appId,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const handleClosePopover = () => {
    setPopoverState({ appId: null, position: null });
  };

  const handleUpdateProfile = async (updates: Partial<AppProfile>) => {
    if (popoverState.appId) {
      await updateProfile(popoverState.appId, updates);
    }
  };

  // Get unique dock apps (pinned + currently open)
  const pinnedApps = dockApps.filter(appId => isPinned(appId));
  const openApps = windows
    .map(w => w.appId)
    .filter((appId, index, self) => self.indexOf(appId) === index) // unique
    .filter(appId => !isPinned(appId)); // not already pinned

  const allDockApps = [...pinnedApps, ...openApps];

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 h-20 flex items-center justify-center"
        style={{
          background: theme.dock.background,
          borderTop: `1px solid ${theme.dock.border}`,
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-end gap-3 px-6">
          {/* Pinned Apps */}
          {pinnedApps.map((appId) => {
            const Icon = appIcons[appId];
            const isOpen = windows.some(w => w.appId === appId);
            const pinned = isPinned(appId);

            return (
              <motion.button
                key={appId}
                variants={dockItemVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
                onClick={() => handleAppClick(appId)}
                onContextMenu={(e) => handleRightClick(e, appId)}
                className="relative flex flex-col items-center gap-1 p-3 rounded-lg transition-colors"
                style={{
                  color: theme.text.primary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.dock.itemHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Icon size={28} />

                {/* Pin indicator */}
                {pinned && (
                  <div
                    className="absolute top-1 right-1 opacity-50"
                    style={{ color: theme.accent }}
                  >
                    <Pin size={10} fill="currentColor" />
                  </div>
                )}

                {/* Active indicator */}
                {isOpen && (
                  <div
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{
                      background: theme.accent,
                    }}
                  />
                )}
              </motion.button>
            );
          })}

          {/* Separator between pinned and open apps */}
          {pinnedApps.length > 0 && openApps.length > 0 && (
            <div
              className="w-px h-8 mx-2"
              style={{
                background: theme.dock.border,
                opacity: 0.5,
              }}
            />
          )}

          {/* Open (non-pinned) Apps */}
          {openApps.map((appId) => {
            const Icon = appIcons[appId];
            const isOpen = windows.some(w => w.appId === appId);

            return (
              <motion.button
                key={appId}
                variants={dockItemVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
                onClick={() => handleAppClick(appId)}
                onContextMenu={(e) => handleRightClick(e, appId)}
                className="relative flex flex-col items-center gap-1 p-3 rounded-lg transition-colors"
                style={{
                  color: theme.text.primary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.dock.itemHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Icon size={28} />

                {/* Active indicator */}
                {isOpen && (
                  <div
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{
                      background: theme.accent,
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* App Profile Popover */}
      {popoverState.appId && popoverState.position && (
        <AppProfilePopover
          appId={popoverState.appId}
          currentProfile={null} // Will be fetched internally by popover
          onUpdateProfile={handleUpdateProfile}
          onClose={handleClosePopover}
          position={popoverState.position}
        />
      )}
    </>
  );
}
