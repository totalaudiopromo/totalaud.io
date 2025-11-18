/**
 * OperatorOS Persona Indicator
 * Display and change operator persona with optional layout suggestions
 */

'use client';

import { useState } from 'react';
import { useOperatorStore } from '../state/operatorStore';
import type { OperatorPersona } from '../types';
import { loadLayout, applyLayoutToStore } from '../state/layoutPersistence';

interface OperatorPersonaIndicatorProps {
  userId?: string;
  workspaceId?: string;
  compact?: boolean;
}

const personaInfo: Record<OperatorPersona, { label: string; icon: string; description: string; suggestedLayout?: string }> = {
  default: {
    label: 'Default',
    icon: '⚡',
    description: 'Balanced workflow for general tasks',
  },
  strategist: {
    label: 'Strategist',
    icon: '🎯',
    description: 'Intelligence-focused ops and planning',
    suggestedLayout: 'ops',
  },
  producer: {
    label: 'Producer',
    icon: '🎨',
    description: 'Creative studio and production tools',
    suggestedLayout: 'creative',
  },
  campaign: {
    label: 'Campaign',
    icon: '📊',
    description: 'Campaign execution and tracking',
    suggestedLayout: 'ops',
  },
  dev: {
    label: 'Developer',
    icon: '⌨️',
    description: 'System tools and terminal access',
  },
};

export function OperatorPersonaIndicator({
  userId,
  workspaceId,
  compact = false,
}: OperatorPersonaIndicatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLayoutSuggestion, setShowLayoutSuggestion] = useState(false);
  const [suggestedLayout, setSuggestedLayout] = useState<string | null>(null);

  const operatorPersona = useOperatorStore((state) => state.operatorPersona);
  const setOperatorPersona = useOperatorStore((state) => state.setOperatorPersona);
  const pushNotification = useOperatorStore((state) => state.pushNotification);

  const currentPersonaInfo = personaInfo[operatorPersona];

  const handlePersonaChange = (newPersona: OperatorPersona) => {
    setOperatorPersona(newPersona);

    pushNotification({
      message: `Switched to ${personaInfo[newPersona].label} persona`,
      type: 'success',
    });

    // Check if there's a suggested layout
    const suggested = personaInfo[newPersona].suggestedLayout;
    if (suggested && userId && workspaceId) {
      setSuggestedLayout(suggested);
      setShowLayoutSuggestion(true);

      // Auto-hide suggestion after 10 seconds
      setTimeout(() => {
        setShowLayoutSuggestion(false);
      }, 10000);
    }

    setIsOpen(false);
  };

  const handleApplySuggestedLayout = async () => {
    if (!suggestedLayout || !userId || !workspaceId) return;

    try {
      const layout = await loadLayout(userId, workspaceId, suggestedLayout);
      if (!layout) {
        pushNotification({
          message: `Layout "${suggestedLayout}" not found`,
          type: 'warning',
        });
        return;
      }

      applyLayoutToStore(layout, useOperatorStore.setState);

      pushNotification({
        message: `Applied recommended ${suggestedLayout} layout`,
        type: 'success',
      });

      setShowLayoutSuggestion(false);
    } catch (error) {
      console.error('Error applying suggested layout:', error);
      pushNotification({
        message: 'Failed to apply layout',
        type: 'error',
      });
    }
  };

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-1.5 bg-black/30 border border-gray-700 rounded-lg hover:border-[#3AA9BE] transition-all duration-240 flex items-center gap-2"
          title={currentPersonaInfo.description}
        >
          <span>{currentPersonaInfo.icon}</span>
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-[#1a1a1a] border border-[#3AA9BE]/30 rounded-xl shadow-xl z-50 overflow-hidden">
            {Object.entries(personaInfo).map(([key, info]) => (
              <button
                key={key}
                onClick={() => handlePersonaChange(key as OperatorPersona)}
                className={`w-full px-4 py-3 text-left hover:bg-[#3AA9BE]/10 transition-colors duration-240 ${
                  operatorPersona === key ? 'bg-[#3AA9BE]/20' : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>{info.icon}</span>
                  <span className="font-medium text-white">{info.label}</span>
                </div>
                <div className="text-xs text-gray-400">{info.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Current Persona Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-black/30 border border-gray-700 rounded-xl hover:border-[#3AA9BE] transition-all duration-240 flex items-center gap-3"
      >
        <span className="text-2xl">{currentPersonaInfo.icon}</span>
        <div className="text-left">
          <div className="text-sm font-medium text-white">{currentPersonaInfo.label}</div>
          <div className="text-xs text-gray-400">{currentPersonaInfo.description}</div>
        </div>
        <span className="text-gray-500 ml-2">▼</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[300px] bg-[#1a1a1a] border border-[#3AA9BE]/30 rounded-xl shadow-xl z-50 overflow-hidden">
          {Object.entries(personaInfo).map(([key, info]) => (
            <button
              key={key}
              onClick={() => handlePersonaChange(key as OperatorPersona)}
              className={`w-full px-4 py-3 text-left hover:bg-[#3AA9BE]/10 transition-colors duration-240 ${
                operatorPersona === key ? 'bg-[#3AA9BE]/20' : ''
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xl">{info.icon}</span>
                <span className="font-medium text-white">{info.label}</span>
                {info.suggestedLayout && (
                  <span className="text-xs text-[#3AA9BE] ml-auto">
                    → {info.suggestedLayout} layout
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400 ml-8">{info.description}</div>
            </button>
          ))}
        </div>
      )}

      {/* Layout Suggestion Toast */}
      {showLayoutSuggestion && suggestedLayout && (
        <div className="fixed bottom-6 right-6 bg-[#1a1a1a] border border-[#3AA9BE] rounded-xl p-4 shadow-xl z-50 max-w-sm">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <div className="font-medium text-white mb-1">Apply recommended layout?</div>
              <div className="text-sm text-gray-400 mb-3">
                The "{suggestedLayout}" layout is optimized for this persona
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleApplySuggestedLayout}
                  className="px-3 py-1.5 bg-[#3AA9BE] text-white text-sm rounded-lg hover:bg-[#3AA9BE]/80 transition-all duration-240"
                >
                  Apply Layout
                </button>
                <button
                  onClick={() => setShowLayoutSuggestion(false)}
                  className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-all duration-240"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click Outside Handler */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
