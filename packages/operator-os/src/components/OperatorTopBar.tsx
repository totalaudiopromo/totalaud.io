/**
 * OperatorTopBar
 * Top bar with OS branding, status, and controls
 */

'use client';

import React from 'react';
import { Search, User, Palette, Bell } from 'lucide-react';
import { useOperatorStore } from '../state/operatorStore';
import { themes } from '../themes';

const personaLabels = {
  default: 'Default',
  strategist: 'Strategist',
  producer: 'Producer',
  campaign: 'Campaign',
  dev: 'Developer',
};

export function OperatorTopBar() {
  const {
    activeTheme,
    operatorPersona,
    openCommandPalette,
    notifications,
    windows,
    focusedWindowId,
  } = useOperatorStore();

  const theme = themes[activeTheme];
  const focusedWindow = windows.find(w => w.id === focusedWindowId);

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[60px] flex items-center justify-between px-6"
      style={{
        background: `${theme.windowChrome.background}`,
        borderBottom: `1px solid ${theme.border}`,
        backdropFilter: 'blur(20px)',
        color: theme.text.primary,
      }}
    >
      {/* Left: Branding + Active App */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-['JetBrains_Mono'] font-bold text-sm"
            style={{
              background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accent}80 100%)`,
              color: '#000',
            }}
          >
            OS
          </div>
          <span className="font-['JetBrains_Mono'] font-semibold text-sm">
            OperatorOS
          </span>
        </div>

        {focusedWindow && (
          <>
            <div
              className="w-px h-6"
              style={{ background: theme.border }}
            />
            <span className="text-sm" style={{ color: theme.text.secondary }}>
              {focusedWindow.title}
            </span>
          </>
        )}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-3">
        {/* Persona */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: theme.dock.itemHover }}>
          <User size={16} style={{ color: theme.accent }} />
          <span className="text-xs font-medium font-['JetBrains_Mono']">
            {personaLabels[operatorPersona]}
          </span>
        </div>

        {/* Theme indicator */}
        <button
          className="p-2 rounded-lg hover:bg-opacity-20 transition-colors"
          style={{ color: theme.text.secondary }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme.dock.itemHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
          title={`Theme: ${theme.name}`}
        >
          <Palette size={18} />
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg hover:bg-opacity-20 transition-colors"
          style={{ color: theme.text.secondary }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme.dock.itemHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <Bell size={18} />
          {notifications.length > 0 && (
            <div
              className="absolute top-1 right-1 w-2 h-2 rounded-full"
              style={{ background: '#ef4444' }}
            />
          )}
        </button>

        {/* Command Palette Trigger */}
        <button
          onClick={openCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-opacity-20 transition-colors"
          style={{
            color: theme.text.secondary,
            border: `1px solid ${theme.border}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme.dock.itemHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <Search size={16} />
          <span className="text-xs font-['JetBrains_Mono']">⌘K</span>
        </button>
      </div>
    </div>
  );
}
