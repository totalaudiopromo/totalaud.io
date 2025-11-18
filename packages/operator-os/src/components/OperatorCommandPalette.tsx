/**
 * OperatorCommandPalette
 * Command palette with fuzzy search (⌘K)
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { useOperatorStore } from '../state/operatorStore';
import { themes } from '../themes';
import { commandPaletteVariants } from '../utils/animations';
import type { OperatorCommand, OperatorAppID, OperatorOSTheme, OperatorPersona } from '../types';

const appLabels: Record<OperatorAppID, string> = {
  dashboard: 'Dashboard',
  intel: 'Audio Intel',
  pitch: 'Pitch Generator',
  tracker: 'Campaign Tracker',
  studio: 'Creative Studio',
  community: 'Community',
  autopilot: 'Autopilot',
  automations: 'Automations',
  coach: 'CoachOS',
  scenes: 'Scenes Engine',
  mig: 'Mission Intelligence Graph',
  anr: 'Analytics & Reports',
  settings: 'Settings',
  terminal: 'Terminal',
};

const themeLabels: Record<OperatorOSTheme, string> = {
  xp: 'Windows XP',
  aqua: 'Aqua',
  daw: 'DAW',
  ascii: 'ASCII',
  analogue: 'Analogue',
};

const personaLabels: Record<OperatorPersona, string> = {
  default: 'Default',
  strategist: 'Strategist',
  producer: 'Producer',
  campaign: 'Campaign',
  dev: 'Developer',
};

export function OperatorCommandPalette() {
  const {
    activeTheme,
    isCommandPaletteOpen,
    closeCommandPalette,
    openApp,
    setTheme,
    setOperatorPersona,
    pushNotification,
    addToHistory,
  } = useOperatorStore();

  const theme = themes[activeTheme];
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate commands
  const commands: OperatorCommand[] = [
    // Open apps
    ...(Object.keys(appLabels) as OperatorAppID[]).map(appId => ({
      id: `open-${appId}`,
      label: `Open ${appLabels[appId]}`,
      description: `Launch ${appLabels[appId]}`,
      keywords: ['open', 'launch', appLabels[appId].toLowerCase()],
      handler: () => {
        openApp(appId);
        addToHistory(`Open ${appLabels[appId]}`);
        pushNotification({ message: `Opened ${appLabels[appId]}`, type: 'info' });
      },
    })),

    // Change theme
    ...(Object.keys(themeLabels) as OperatorOSTheme[]).map(themeId => ({
      id: `theme-${themeId}`,
      label: `Change theme to ${themeLabels[themeId]}`,
      description: `Switch to ${themeLabels[themeId]} theme`,
      keywords: ['theme', 'change', themeLabels[themeId].toLowerCase()],
      handler: () => {
        setTheme(themeId);
        addToHistory(`Change theme to ${themeLabels[themeId]}`);
        pushNotification({ message: `Theme changed to ${themeLabels[themeId]}`, type: 'success' });
      },
    })),

    // Change persona
    ...(Object.keys(personaLabels) as OperatorPersona[]).map(persona => ({
      id: `persona-${persona}`,
      label: `Switch to ${personaLabels[persona]} persona`,
      description: `Change operator persona to ${personaLabels[persona]}`,
      keywords: ['persona', 'switch', personaLabels[persona].toLowerCase()],
      handler: () => {
        setOperatorPersona(persona);
        addToHistory(`Switch to ${personaLabels[persona]} persona`);
        pushNotification({ message: `Persona changed to ${personaLabels[persona]}`, type: 'success' });
      },
    })),
  ];

  // Filter commands based on search
  const filteredCommands = search
    ? commands.filter(cmd => {
        const searchLower = search.toLowerCase();
        return (
          cmd.label.toLowerCase().includes(searchLower) ||
          cmd.description?.toLowerCase().includes(searchLower) ||
          cmd.keywords?.some(kw => kw.includes(searchLower))
        );
      })
    : commands;

  // Reset selection when filtered commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Focus input when palette opens
  useEffect(() => {
    if (isCommandPaletteOpen) {
      inputRef.current?.focus();
      setSearch('');
    }
  }, [isCommandPaletteOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isCommandPaletteOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].handler();
          closeCommandPalette();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, filteredCommands, selectedIndex, closeCommandPalette]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-32">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeCommandPalette}
      />

      {/* Palette */}
      <AnimatePresence>
        <motion.div
          variants={commandPaletteVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-2xl rounded-xl overflow-hidden"
          style={{
            background: theme.windowChrome.background,
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadow,
          }}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: theme.border }}>
            <Search size={20} style={{ color: theme.accent }} />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search commands..."
              className="flex-1 bg-transparent outline-none text-sm font-['Inter']"
              style={{ color: theme.text.primary }}
            />
            <span className="text-xs font-['JetBrains_Mono']" style={{ color: theme.text.muted }}>
              ESC
            </span>
          </div>

          {/* Command List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center" style={{ color: theme.text.muted }}>
                No commands found
              </div>
            ) : (
              filteredCommands.map((cmd, index) => (
                <button
                  key={cmd.id}
                  onClick={() => {
                    cmd.handler();
                    closeCommandPalette();
                  }}
                  className="w-full flex flex-col items-start gap-1 p-4 transition-colors text-left"
                  style={{
                    background: index === selectedIndex ? theme.dock.itemHover : 'transparent',
                    borderBottom: `1px solid ${theme.border}20`,
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="font-medium text-sm" style={{ color: theme.text.primary }}>
                    {cmd.label}
                  </div>
                  {cmd.description && (
                    <div className="text-xs" style={{ color: theme.text.muted }}>
                      {cmd.description}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between p-3 text-xs font-['JetBrains_Mono'] border-t"
            style={{
              borderColor: theme.border,
              color: theme.text.muted,
            }}
          >
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
