/**
 * OperatorPersonaPanel
 * Shows current persona with recommended actions and layout suggestions
 * Phase 3 - Desktop Experience Layer
 */

'use client';

import { useState } from 'react';
import { useOperatorStore } from '../state/operatorStore';
import {
  loadLayout,
  saveLayout,
  applyLayoutToStore,
  extractLayoutFromStore,
} from '../state/layoutPersistence';
import { getPersonaPreset, type PersonaPreset } from '@total-audio/operator-services';

interface OperatorPersonaPanelProps {
  userId: string;
  workspaceId: string;
  compact?: boolean;
}

export function OperatorPersonaPanel({
  userId,
  workspaceId,
  compact = false,
}: OperatorPersonaPanelProps) {
  const [loading, setLoading] = useState(false);

  const operatorPersona = useOperatorStore((state) => state.operatorPersona);
  const setOperatorPersona = useOperatorStore((state) => state.setOperatorPersona);
  const setTheme = useOperatorStore((state) => state.setTheme);
  const pushNotification = useOperatorStore((state) => state.pushNotification);

  const preset = getPersonaPreset(operatorPersona);

  const handleApplyRecommendedLayout = async () => {
    try {
      setLoading(true);

      // Try to load the recommended layout
      const layout = await loadLayout(userId, workspaceId, preset.recommendedLayoutName);

      if (layout) {
        // Layout exists, apply it
        applyLayoutToStore(layout, useOperatorStore.setState);

        pushNotification({
          message: `Applied ${preset.displayName} layout`,
          type: 'success',
        });
      } else {
        // Layout doesn't exist, create it from current state
        const currentState = useOperatorStore.getState();
        const newLayout = extractLayoutFromStore(currentState, preset.recommendedLayoutName);

        // Apply recommended theme
        newLayout.theme = preset.recommendedTheme;
        newLayout.persona = preset.persona;

        await saveLayout(userId, workspaceId, newLayout);

        pushNotification({
          message: `Created and applied ${preset.displayName} layout`,
          type: 'success',
        });
      }

      // Apply recommended theme
      setTheme(preset.recommendedTheme);
    } catch (error) {
      console.error('Error applying recommended layout:', error);
      pushNotification({
        message: 'Failed to apply recommended layout',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsPersonaDefault = async () => {
    try {
      setLoading(true);

      const currentState = useOperatorStore.getState();
      const layout = extractLayoutFromStore(currentState, preset.recommendedLayoutName);

      // Ensure persona matches
      layout.persona = preset.persona;

      await saveLayout(userId, workspaceId, layout);

      pushNotification({
        message: `Saved current layout as ${preset.displayName} default`,
        type: 'success',
      });
    } catch (error) {
      console.error('Error saving persona default:', error);
      pushNotification({
        message: 'Failed to save layout',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <div className="p-4 bg-[#10141A] border border-white/6 rounded-xl">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{preset.icon}</span>
          <div className="flex-1">
            <h3 className="font-medium text-white">{preset.displayName}</h3>
            <p className="text-xs text-gray-400">{preset.description}</p>
          </div>
          <button
            onClick={handleApplyRecommendedLayout}
            disabled={loading}
            className="px-3 py-1.5 bg-[#3AA9BE] text-white text-sm rounded-lg hover:bg-[#3AA9BE]/80 disabled:opacity-50 transition-all duration-200"
          >
            {loading ? 'Applying...' : 'Apply Layout'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#10141A] border border-white/6 rounded-2xl">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <span className="text-5xl">{preset.icon}</span>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-white mb-2">{preset.displayName} Persona</h2>
          <p className="text-gray-300 mb-4">{preset.description}</p>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#3AA9BE]/20 text-[#3AA9BE] text-sm rounded-lg border border-[#3AA9BE]/30 font-mono">
              {preset.recommendedTheme} theme
            </span>
            <span className="px-3 py-1 bg-white/5 text-gray-300 text-sm rounded-lg border border-white/10">
              {preset.layoutHints.suggestedArrangement}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Apps */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Primary Apps</h3>
        <div className="flex flex-wrap gap-2">
          {preset.primaryApps.map((appId) => (
            <span
              key={appId}
              className="px-3 py-1.5 bg-[#151A22] border border-white/10 text-white text-sm rounded-lg capitalize"
            >
              {appId}
            </span>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          {preset.quickActions.map((action, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 bg-black/30 border border-white/6 text-gray-300 text-xs rounded"
            >
              {action}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleApplyRecommendedLayout}
          disabled={loading}
          className="px-4 py-2 bg-[#3AA9BE] text-white rounded-lg hover:bg-[#3AA9BE]/80 disabled:opacity-50 transition-all duration-200 font-medium"
        >
          {loading ? 'Applying...' : 'Apply Recommended Layout'}
        </button>

        <button
          onClick={handleSaveAsPersonaDefault}
          disabled={loading}
          className="px-4 py-2 bg-[#151A22] border border-white/10 text-white rounded-lg hover:border-[#3AA9BE]/50 disabled:opacity-50 transition-all duration-200"
        >
          Save Current as {preset.displayName} Default
        </button>
      </div>

      {/* Layout Hint */}
      <div className="mt-4 p-3 bg-black/30 border border-white/6 rounded-lg">
        <div className="text-xs text-gray-400">
          <span className="font-medium text-gray-300">Layout hint:</span> {preset.layoutHints.suggestedArrangement}
          {' · '}
          Typically {preset.layoutHints.defaultWindowCount} {preset.layoutHints.defaultWindowCount === 1 ? 'window' : 'windows'}
        </div>
      </div>
    </div>
  );
}
