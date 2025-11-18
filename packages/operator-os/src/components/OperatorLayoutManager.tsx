/**
 * OperatorLayoutManager
 * Full-screen modal for comprehensive layout management
 * Phase 3 - Desktop Experience Layer
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
  exportLayoutToJson,
  importLayoutFromJson,
  type OperatorLayoutSummary,
  type OperatorLayout,
} from '../state/layoutPersistence';

interface OperatorLayoutManagerProps {
  userId: string;
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function OperatorLayoutManager({
  userId,
  workspaceId,
  isOpen,
  onClose,
}: OperatorLayoutManagerProps) {
  const [layouts, setLayouts] = useState<OperatorLayoutSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createMode, setCreateMode] = useState<'current' | 'blank' | 'persona'>('current');
  const [newLayoutName, setNewLayoutName] = useState('');
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const operatorStore = useOperatorStore();

  useEffect(() => {
    if (isOpen) {
      refreshLayouts();
    }
  }, [isOpen, userId, workspaceId]);

  const refreshLayouts = async () => {
    try {
      setLoading(true);
      const layoutList = await listLayouts(userId, workspaceId);
      setLayouts(layoutList);
    } catch (error) {
      console.error('Error loading layouts:', error);
      operatorStore.pushNotification({
        message: 'Failed to load layouts',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLayout = async (layoutName: string) => {
    try {
      const layout = await loadLayout(userId, workspaceId, layoutName);
      if (!layout) {
        operatorStore.pushNotification({
          message: 'Layout not found',
          type: 'error',
        });
        return;
      }

      applyLayoutToStore(layout, useOperatorStore.setState);

      operatorStore.pushNotification({
        message: `Applied "${layoutName}" layout`,
        type: 'success',
      });

      onClose();
    } catch (error) {
      console.error('Error applying layout:', error);
      operatorStore.pushNotification({
        message: 'Failed to apply layout',
        type: 'error',
      });
    }
  };

  const handleDuplicateLayout = async (layoutName: string) => {
    try {
      const layout = await loadLayout(userId, workspaceId, layoutName);
      if (!layout) return;

      const copyName = `${layoutName} (copy)`;
      await saveLayout(userId, workspaceId, {
        ...layout,
        layout_name: copyName,
      });

      operatorStore.pushNotification({
        message: `Duplicated as "${copyName}"`,
        type: 'success',
      });

      await refreshLayouts();
    } catch (error) {
      console.error('Error duplicating layout:', error);
      operatorStore.pushNotification({
        message: 'Failed to duplicate layout',
        type: 'error',
      });
    }
  };

  const handleDeleteLayout = async (layoutName: string) => {
    if (!confirm(`Delete layout "${layoutName}"?`)) return;

    try {
      await deleteLayout(userId, workspaceId, layoutName);

      operatorStore.pushNotification({
        message: `Deleted "${layoutName}"`,
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

  const handleRenameLayout = async (oldName: string, newName: string) => {
    if (!newName.trim() || newName === oldName) {
      setRenaming(null);
      return;
    }

    try {
      const layout = await loadLayout(userId, workspaceId, oldName);
      if (!layout) return;

      // Save with new name
      await saveLayout(userId, workspaceId, {
        ...layout,
        layout_name: newName,
      });

      // Delete old (unless it's default)
      if (oldName !== 'default') {
        await deleteLayout(userId, workspaceId, oldName);
      }

      operatorStore.pushNotification({
        message: `Renamed to "${newName}"`,
        type: 'success',
      });

      setRenaming(null);
      await refreshLayouts();
    } catch (error) {
      console.error('Error renaming layout:', error);
      operatorStore.pushNotification({
        message: 'Failed to rename layout',
        type: 'error',
      });
    }
  };

  const handleCreateLayout = async () => {
    if (!newLayoutName.trim()) {
      alert('Please enter a layout name');
      return;
    }

    try {
      const currentState = useOperatorStore.getState();
      let layout: OperatorLayout;

      if (createMode === 'current') {
        layout = extractLayoutFromStore(currentState, newLayoutName.trim());
      } else if (createMode === 'blank') {
        layout = {
          layout_name: newLayoutName.trim(),
          windows: [],
          theme: currentState.activeTheme,
          persona: currentState.operatorPersona,
        };
      } else {
        // persona mode - will be implemented with persona presets
        layout = extractLayoutFromStore(currentState, newLayoutName.trim());
      }

      await saveLayout(userId, workspaceId, layout);

      operatorStore.pushNotification({
        message: `Created "${newLayoutName}"`,
        type: 'success',
      });

      setNewLayoutName('');
      setShowCreateDialog(false);
      await refreshLayouts();
    } catch (error) {
      console.error('Error creating layout:', error);
      operatorStore.pushNotification({
        message: 'Failed to create layout',
        type: 'error',
      });
    }
  };

  const handleExportLayout = async (layoutName: string) => {
    try {
      const layout = await loadLayout(userId, workspaceId, layoutName);
      if (!layout) return;

      const json = exportLayoutToJson(layout);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${layoutName}.operator-layout.json`;
      a.click();
      URL.revokeObjectURL(url);

      operatorStore.pushNotification({
        message: `Exported "${layoutName}"`,
        type: 'success',
      });
    } catch (error) {
      console.error('Error exporting layout:', error);
      operatorStore.pushNotification({
        message: 'Failed to export layout',
        type: 'error',
      });
    }
  };

  const handleImportLayout = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const layout = importLayoutFromJson(text);

      await saveLayout(userId, workspaceId, layout);

      operatorStore.pushNotification({
        message: `Imported "${layout.layout_name}"`,
        type: 'success',
      });

      await refreshLayouts();
      event.target.value = '';
    } catch (error: any) {
      console.error('Error importing layout:', error);
      operatorStore.pushNotification({
        message: error.message || 'Failed to import layout',
        type: 'error',
      });
      event.target.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05070A]/95 backdrop-blur-sm">
      <div className="w-full h-full max-w-7xl max-h-[90vh] m-8 bg-[#0A0D12] border border-white/6 rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/6">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-1">Layout Manager</h1>
            <p className="text-sm text-gray-400">Manage your desktop layouts and configurations</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 p-4 border-b border-white/6 bg-[#10141A]/50">
          <button
            onClick={() => setShowCreateDialog(true)}
            className="px-4 py-2 bg-[#3AA9BE] text-white rounded-lg hover:bg-[#3AA9BE]/80 transition-all duration-200 font-medium"
          >
            + New Layout
          </button>

          <div className="flex-1" />

          <label className="px-4 py-2 bg-[#151A22] border border-white/6 text-white rounded-lg hover:border-[#3AA9BE]/50 transition-all duration-200 cursor-pointer font-medium">
            Import JSON
            <input
              type="file"
              accept=".json"
              onChange={handleImportLayout}
              className="hidden"
            />
          </label>

          <button
            onClick={refreshLayouts}
            className="px-4 py-2 bg-[#151A22] border border-white/6 text-white rounded-lg hover:border-[#3AA9BE]/50 transition-all duration-200 font-medium"
          >
            Refresh
          </button>
        </div>

        {/* Layout Gallery */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-400">Loading layouts...</div>
            </div>
          ) : layouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-4xl mb-4">📐</div>
              <h3 className="text-lg font-medium text-white mb-2">No layouts yet</h3>
              <p className="text-sm text-gray-400 mb-4">Create your first layout to get started</p>
              <button
                onClick={() => setShowCreateDialog(true)}
                className="px-4 py-2 bg-[#3AA9BE] text-white rounded-lg hover:bg-[#3AA9BE]/80 transition-all duration-200"
              >
                Create Layout
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {layouts.map((layout) => (
                <div
                  key={layout.layout_name}
                  className={`group relative p-5 bg-[#10141A] border rounded-2xl transition-all duration-200 ${
                    selectedLayout === layout.layout_name
                      ? 'border-[#3AA9BE] shadow-lg shadow-[#3AA9BE]/10'
                      : 'border-white/6 hover:border-[#3AA9BE]/50'
                  }`}
                  onClick={() => setSelectedLayout(layout.layout_name)}
                >
                  {/* Layout Info */}
                  <div className="mb-4">
                    {renaming === layout.layout_name ? (
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => handleRenameLayout(layout.layout_name, renameValue)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleRenameLayout(layout.layout_name, renameValue);
                          } else if (e.key === 'Escape') {
                            setRenaming(null);
                          }
                        }}
                        autoFocus
                        className="w-full px-2 py-1 bg-black/50 border border-[#3AA9BE] rounded text-white font-mono text-sm focus:outline-none"
                      />
                    ) : (
                      <h3
                        className="text-lg font-semibold text-white mb-2 capitalize font-mono"
                        onDoubleClick={() => {
                          if (layout.layout_name !== 'default') {
                            setRenaming(layout.layout_name);
                            setRenameValue(layout.layout_name);
                          }
                        }}
                      >
                        {layout.layout_name}
                      </h3>
                    )}

                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-[#3AA9BE]/20 text-[#3AA9BE] text-xs rounded border border-[#3AA9BE]/30 font-mono">
                        {layout.persona}
                      </span>
                      <span className="px-2 py-0.5 bg-white/5 text-gray-300 text-xs rounded border border-white/10 font-mono">
                        {layout.theme}
                      </span>
                      {layout.layout_name === 'default' && (
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 text-xs rounded border border-yellow-500/30">
                          Default
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-gray-400">
                      {layout.window_count} {layout.window_count === 1 ? 'window' : 'windows'} ·{' '}
                      {new Date(layout.updated_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyLayout(layout.layout_name);
                      }}
                      className="px-3 py-1.5 bg-[#3AA9BE] text-white text-sm rounded-lg hover:bg-[#3AA9BE]/80 transition-all duration-200 font-medium"
                    >
                      Apply
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportLayout(layout.layout_name);
                      }}
                      className="px-3 py-1.5 bg-[#151A22] border border-white/10 text-gray-300 text-sm rounded-lg hover:border-[#3AA9BE]/50 hover:text-white transition-all duration-200"
                    >
                      Export
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateLayout(layout.layout_name);
                      }}
                      className="px-3 py-1.5 bg-[#151A22] border border-white/10 text-gray-300 text-sm rounded-lg hover:border-[#3AA9BE]/50 hover:text-white transition-all duration-200"
                    >
                      Duplicate
                    </button>

                    {layout.layout_name !== 'default' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLayout(layout.layout_name);
                        }}
                        className="px-3 py-1.5 bg-red-900/20 border border-red-500/30 text-red-300 text-sm rounded-lg hover:bg-red-900/40 transition-all duration-200"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Dialog */}
        {showCreateDialog && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md mx-4 bg-[#0A0D12] border border-[#3AA9BE]/30 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Create New Layout</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Layout Name</label>
                  <input
                    type="text"
                    value={newLayoutName}
                    onChange={(e) => setNewLayoutName(e.target.value)}
                    placeholder="e.g., creative, ops, focus"
                    className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#3AA9BE] font-mono"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateLayout();
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Starting Point</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 bg-[#10141A] border border-white/10 rounded-lg cursor-pointer hover:border-[#3AA9BE]/50 transition-all">
                      <input
                        type="radio"
                        name="createMode"
                        checked={createMode === 'current'}
                        onChange={() => setCreateMode('current')}
                        className="text-[#3AA9BE]"
                      />
                      <div>
                        <div className="text-sm font-medium text-white">Current Desktop</div>
                        <div className="text-xs text-gray-400">Save your current window layout</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-[#10141A] border border-white/10 rounded-lg cursor-pointer hover:border-[#3AA9BE]/50 transition-all">
                      <input
                        type="radio"
                        name="createMode"
                        checked={createMode === 'blank'}
                        onChange={() => setCreateMode('blank')}
                        className="text-[#3AA9BE]"
                      />
                      <div>
                        <div className="text-sm font-medium text-white">Blank Layout</div>
                        <div className="text-xs text-gray-400">Start with an empty desktop</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-[#10141A] border border-white/10 rounded-lg cursor-pointer hover:border-[#3AA9BE]/50 transition-all">
                      <input
                        type="radio"
                        name="createMode"
                        checked={createMode === 'persona'}
                        onChange={() => setCreateMode('persona')}
                        className="text-[#3AA9BE]"
                      />
                      <div>
                        <div className="text-sm font-medium text-white">Persona Template</div>
                        <div className="text-xs text-gray-400">Use current persona's recommended setup</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleCreateLayout}
                    className="flex-1 px-4 py-2 bg-[#3AA9BE] text-white rounded-lg hover:bg-[#3AA9BE]/80 transition-all duration-200 font-medium"
                  >
                    Create Layout
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateDialog(false);
                      setNewLayoutName('');
                    }}
                    className="px-4 py-2 bg-[#151A22] border border-white/10 text-white rounded-lg hover:border-white/20 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer - Hotkey Help */}
        <div className="p-4 border-t border-white/6 bg-[#10141A]/30">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <span className="font-mono">⌘L</span>
              <span>Open Layout Manager</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Double-click layout name to rename</span>
              <span>·</span>
              <span>{layouts.length} {layouts.length === 1 ? 'layout' : 'layouts'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
