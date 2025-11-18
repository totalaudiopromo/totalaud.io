/**
 * OperatorDesktop
 * Main desktop environment component
 */

'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useOperatorStore } from '../state/operatorStore';
import { useOperatorHotkeys } from '../hooks/useOperatorHotkeys';
import { themes } from '../themes';
import { OperatorWindow } from './OperatorWindow';
import { OperatorDock } from './OperatorDock';
import { OperatorTopBar } from './OperatorTopBar';
import { OperatorCommandPalette } from './OperatorCommandPalette';
import { OperatorNotifications } from './OperatorNotifications';
import { OperatorStatusBar } from './OperatorStatusBar';
import { OperatorLayoutManager } from './OperatorLayoutManager';
import { OperatorPersonaPanel } from './OperatorPersonaPanel';
import { OperatorPersonaSuggestionStrip } from './OperatorPersonaSuggestionStrip';

export interface OperatorDesktopProps {
  userId?: string;
  workspaceId?: string;
}

export function OperatorDesktop({
  userId = 'demo-user',
  workspaceId = 'demo-workspace',
}: OperatorDesktopProps = {}) {
  const { activeTheme, windows, focusedWindowId } = useOperatorStore();
  const [isLayoutManagerOpen, setIsLayoutManagerOpen] = useState(false);

  // Initialize hotkeys with layout manager callback
  useOperatorHotkeys({
    onOpenLayoutSwitcher: () => setIsLayoutManagerOpen(true),
  });

  const theme = themes[activeTheme];

  return (
    <div
      className="fixed inset-0 overflow-hidden font-['Inter']"
      style={{
        background: theme.background,
        transition: 'background 0.5s ease-out',
      }}
      onClick={() => {
        // Click on wallpaper clears selection
        if (focusedWindowId) {
          // Note: This would ideally unfocus all windows, but we'll leave focus management to window clicks
        }
      }}
    >
      {/* Background noise/texture for certain themes */}
      {theme.noise && (
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: theme.noise,
          }}
        />
      )}

      {/* Top Bar */}
      <OperatorTopBar />

      {/* Windows Layer */}
      <div className="absolute inset-0 top-[60px] bottom-[80px]">
        <AnimatePresence>
          {windows
            .filter(w => !w.isMinimised)
            .map(window => (
              <OperatorWindow key={window.id} window={window} />
            ))}
        </AnimatePresence>
      </div>

      {/* Persona Panel - Right Side */}
      <div className="absolute top-[80px] right-4 z-30">
        <OperatorPersonaPanel
          userId={userId}
          workspaceId={workspaceId}
          compact={false}
        />
      </div>

      {/* Persona Suggestion Strip - Bottom Center */}
      <div className="absolute bottom-[100px] left-0 right-0 z-20">
        <OperatorPersonaSuggestionStrip
          onOpenLayoutManager={() => setIsLayoutManagerOpen(true)}
        />
      </div>

      {/* Dock */}
      <OperatorDock userId={userId} workspaceId={workspaceId} />

      {/* Status Bar */}
      <OperatorStatusBar />

      {/* Command Palette */}
      <OperatorCommandPalette />

      {/* Notifications */}
      <OperatorNotifications />

      {/* Layout Manager Modal */}
      <OperatorLayoutManager
        userId={userId}
        workspaceId={workspaceId}
        isOpen={isLayoutManagerOpen}
        onClose={() => setIsLayoutManagerOpen(false)}
      />
    </div>
  );
}
