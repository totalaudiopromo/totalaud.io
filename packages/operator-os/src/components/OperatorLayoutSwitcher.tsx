/**
 * OperatorOS Layout Switcher
 * Manage and switch between desktop layouts
 */

'use client';

import { useState, useEffect } from 'react';
import { useOperatorStore } from '../state/operatorStore';
import {
  listLayouts,
  loadLayout,
  saveLayout,
  deleteLayout,
  applyLayoutToStore,
  extractLayoutFromStore,
  type OperatorLayoutSummary,
} from '../state/layoutPersistence';

interface OperatorLayoutSwitcherProps {
  userId: string;
  workspaceId: string;
  onClose?: () => void;
}

export function OperatorLayoutSwitcher({
  userId,
  workspaceId,
  onClose,
}: OperatorLayoutSwitcherProps) {
  const [layouts, setLayouts] = useState<OperatorLayoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const operatorStore = useOperatorStore();

  // Load layouts on mount
  useEffect(() => {
    refreshLayouts();
  }, [userId, workspaceId]);

  const refreshLayouts = async () => {
    try {
      setLoading(true);
      const layoutList = await listLayouts(userId, workspaceId);
      setLayouts(layoutList);
    } catch (error) {
      console.error('Error loading layouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLayout = async (layoutName: string) => {
    try {
      const layout = await loadLayout(userId, workspaceId, layoutName);
      if (!layout) {
        alert('Layout not found');
        return;
      }

      applyLayoutToStore(layout, useOperatorStore.setState);

      operatorStore.pushNotification({
        message: `Layout "${layoutName}" applied`,
        type: 'success',
      });

      if (onClose) onClose();
    } catch (error) {
      console.error('Error applying layout:', error);
      operatorStore.pushNotification({
        message: 'Failed to apply layout',
        type: 'error',
      });
    }
  };

  const handleSaveCurrentAs = async () => {
    if (!newLayoutName.trim()) {
      alert('Please enter a layout name');
      return;
    }

    try {
      setSaving(true);
      const currentState = useOperatorStore.getState();
      const layout = extractLayoutFromStore(currentState, newLayoutName.trim());

      await saveLayout(userId, workspaceId, layout);

      operatorStore.pushNotification({
        message: `Layout "${newLayoutName}" saved`,
        type: 'success',
      });

      setNewLayoutName('');
      setShowSaveDialog(false);
      await refreshLayouts();
    } catch (error) {
      console.error('Error saving layout:', error);
      operatorStore.pushNotification({
        message: 'Failed to save layout',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSetAsDefault = async (layoutName: string) => {
    try {
      // Load the layout
      const layout = await loadLayout(userId, workspaceId, layoutName);
      if (!layout) return;

      // Save it as "default"
      await saveLayout(userId, workspaceId, {
        ...layout,
        layout_name: 'default',
      });

      operatorStore.pushNotification({
        message: `"${layoutName}" set as default`,
        type: 'success',
      });

      await refreshLayouts();
    } catch (error) {
      console.error('Error setting default layout:', error);
      operatorStore.pushNotification({
        message: 'Failed to set default layout',
        type: 'error',
      });
    }
  };

  const handleDeleteLayout = async (layoutName: string) => {
    if (!confirm(`Delete layout "${layoutName}"?`)) {
      return;
    }

    try {
      await deleteLayout(userId, workspaceId, layoutName);

      operatorStore.pushNotification({
        message: `Layout "${layoutName}" deleted`,
        type: 'success',
      });

      await refreshLayouts();
    } catch (error) {
      console.error('Error deleting layout:', error);
      operatorStore.pushNotification({
        message: 'Failed to delete layout',
        type: 'error',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#1a1a1a] border border-[#3AA9BE]/30 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Desktop Layouts</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-240"
          >
            ✕
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setShowSaveDialog(!showSaveDialog)}
            className="px-4 py-2 bg-[#3AA9BE] text-white rounded-lg hover:bg-[#3AA9BE]/80 transition-all duration-240"
          >
            Save Current As...
          </button>
          <button
            onClick={refreshLayouts}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-240"
          >
            Refresh
          </button>
        </div>

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="mb-6 p-4 bg-black/30 rounded-xl border border-[#3AA9BE]/20">
            <label className="block text-sm text-gray-300 mb-2">Layout Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLayoutName}
                onChange={(e) => setNewLayoutName(e.target.value)}
                placeholder="e.g., creative, ops, focus"
                className="flex-1 px-3 py-2 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#3AA9BE]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveCurrentAs();
                  }
                }}
              />
              <button
                onClick={handleSaveCurrentAs}
                disabled={saving}
                className="px-4 py-2 bg-[#3AA9BE] text-white rounded-lg hover:bg-[#3AA9BE]/80 disabled:opacity-50 transition-all duration-240"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {/* Layouts List */}
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading layouts...</div>
        ) : layouts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No saved layouts. Save your current layout to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {layouts.map((layout) => (
              <div
                key={layout.layout_name}
                className="p-4 bg-black/30 rounded-xl border border-gray-700 hover:border-[#3AA9BE]/50 transition-all duration-240"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-white capitalize">
                        {layout.layout_name}
                      </h3>
                      {layout.layout_name === 'default' && (
                        <span className="px-2 py-0.5 bg-[#3AA9BE]/20 text-[#3AA9BE] text-xs rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      {layout.window_count} windows • {layout.theme} theme • {layout.persona} persona
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Updated: {new Date(layout.updated_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleApplyLayout(layout.layout_name)}
                      className="px-3 py-1.5 bg-[#3AA9BE] text-white text-sm rounded-lg hover:bg-[#3AA9BE]/80 transition-all duration-240"
                    >
                      Apply
                    </button>
                    {layout.layout_name !== 'default' && (
                      <>
                        <button
                          onClick={() => handleSetAsDefault(layout.layout_name)}
                          className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-all duration-240"
                        >
                          Set Default
                        </button>
                        <button
                          onClick={() => handleDeleteLayout(layout.layout_name)}
                          className="px-3 py-1.5 bg-red-900/50 text-red-300 text-sm rounded-lg hover:bg-red-900 transition-all duration-240"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
