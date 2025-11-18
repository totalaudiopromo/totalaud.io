/**
 * OperatorStatusBar
 * Bottom status bar with system info
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useOperatorStore } from '../state/operatorStore';
import { themes } from '../themes';

const personaLabels = {
  default: 'Default',
  strategist: 'Strategist',
  producer: 'Producer',
  campaign: 'Campaign',
  dev: 'Developer',
};

export function OperatorStatusBar() {
  const { activeTheme, windows, operatorPersona } = useOperatorStore();
  const theme = themes[activeTheme];
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const timeString = currentTime.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const visibleWindows = windows.filter(w => !w.isMinimised);

  return (
    <div
      className="fixed bottom-20 left-0 right-0 h-8 flex items-center justify-between px-6 text-xs font-['JetBrains_Mono']"
      style={{
        background: `${theme.dock.background}`,
        borderTop: `1px solid ${theme.border}`,
        color: theme.text.muted,
      }}
    >
      {/* Left: Window count */}
      <div>
        {visibleWindows.length} {visibleWindows.length === 1 ? 'window' : 'windows'} open
      </div>

      {/* Center: Persona + Time */}
      <div className="flex items-center gap-4">
        <span>
          Operator: <span style={{ color: theme.accent }}>{personaLabels[operatorPersona]}</span>
        </span>
        <span>•</span>
        <span>{timeString}</span>
      </div>

      {/* Right: Theme name */}
      <div>
        Theme: {theme.name}
      </div>
    </div>
  );
}
