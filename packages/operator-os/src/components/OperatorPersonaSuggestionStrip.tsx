/**
 * OperatorPersonaSuggestionStrip
 * Small strip showing persona-based suggestions and recommendations
 * Phase 3 - Desktop Experience Layer
 */

'use client';

import { useState, useEffect } from 'react';
import { useOperatorStore } from '../state/operatorStore';
import { getPersonaPreset, suggestPersonaForApps } from '@total-audio/operator-services';
import type { OperatorPersona } from '../types';

interface OperatorPersonaSuggestionStripProps {
  onOpenLayoutManager?: () => void;
}

export function OperatorPersonaSuggestionStrip({
  onOpenLayoutManager,
}: OperatorPersonaSuggestionStripProps) {
  const [suggestedPersona, setSuggestedPersona] = useState<OperatorPersona | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const windows = useOperatorStore((state) => state.windows);
  const operatorPersona = useOperatorStore((state) => state.operatorPersona);
  const setOperatorPersona = useOperatorStore((state) => state.setOperatorPersona);
  const pushNotification = useOperatorStore((state) => state.pushNotification);

  const currentPreset = getPersonaPreset(operatorPersona);

  // Check if we should suggest a different persona based on open apps
  useEffect(() => {
    const openAppIds = windows.map((w) => w.appId);
    const suggested = suggestPersonaForApps(openAppIds);

    if (suggested && suggested !== operatorPersona && !dismissed) {
      setSuggestedPersona(suggested);
    } else {
      setSuggestedPersona(null);
    }
  }, [windows, operatorPersona, dismissed]);

  const handleAcceptSuggestion = () => {
    if (!suggestedPersona) return;

    setOperatorPersona(suggestedPersona);
    setSuggestedPersona(null);
    setDismissed(false);

    const preset = getPersonaPreset(suggestedPersona);
    pushNotification({
      message: `Switched to ${preset.displayName} persona`,
      type: 'success',
    });
  };

  const handleDismissSuggestion = () => {
    setDismissed(true);
    setSuggestedPersona(null);
  };

  // Show suggestion if we have one
  if (suggestedPersona) {
    const suggestedPreset = getPersonaPreset(suggestedPersona);

    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0D12] border-t border-[#3AA9BE]/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{suggestedPreset.icon}</span>
            <div>
              <div className="text-sm font-medium text-white">
                Switch to {suggestedPreset.displayName} persona?
              </div>
              <div className="text-xs text-gray-400">
                Your open apps match this workflow better
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAcceptSuggestion}
              className="px-4 py-1.5 bg-[#3AA9BE] text-white text-sm rounded-lg hover:bg-[#3AA9BE]/80 transition-all duration-200"
            >
              Switch Persona
            </button>
            <button
              onClick={handleDismissSuggestion}
              className="px-4 py-1.5 bg-[#151A22] border border-white/10 text-white text-sm rounded-lg hover:border-white/20 transition-all duration-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show current persona strip with quick actions
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0D12]/80 border-t border-white/6 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentPreset.icon}</span>
            <span className="font-medium text-white">{currentPreset.displayName}</span>
          </div>
          <span className="hidden md:block">·</span>
          <span className="hidden md:block">
            Try: {currentPreset.recommendedLayoutName} layout
          </span>
        </div>

        <div className="flex items-center gap-2">
          {currentPreset.quickActions.slice(0, 2).map((action, idx) => (
            <button
              key={idx}
              className="px-3 py-1 bg-[#151A22] border border-white/6 text-gray-300 text-xs rounded hover:border-[#3AA9BE]/50 hover:text-white transition-all duration-200"
            >
              {action}
            </button>
          ))}

          {onOpenLayoutManager && (
            <button
              onClick={onOpenLayoutManager}
              className="px-3 py-1 bg-[#3AA9BE]/20 border border-[#3AA9BE]/30 text-[#3AA9BE] text-xs rounded hover:bg-[#3AA9BE]/30 transition-all duration-200 font-mono"
            >
              ⌘L Layouts
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
