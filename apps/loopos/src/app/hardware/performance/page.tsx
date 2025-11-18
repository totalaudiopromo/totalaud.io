'use client';

import { useState, useEffect } from 'react';
import { PerformanceGrid, type PerformanceLayout } from './components/PerformanceGrid';
import { PerformanceSidebar, type PerformanceLayoutMeta, type LayoutType } from './components/PerformanceSidebar';
import { ActionPicker } from './components/ActionPicker';
import type { CellAction } from './components/PerformanceCell';

interface SavedLayout {
  id: string;
  user_id: string;
  name: string;
  layout_type: LayoutType;
  device_type?: string;
  grid_layout: PerformanceLayout;
  description?: string;
  created_at: string;
  updated_at: string;
}

export default function PerformancePage() {
  const [currentLayout, setCurrentLayout] = useState<PerformanceLayout>({});
  const [currentLayoutMeta, setCurrentLayoutMeta] = useState<PerformanceLayoutMeta | null>(null);
  const [savedLayouts, setSavedLayouts] = useState<SavedLayout[]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [showActionPicker, setShowActionPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch saved layouts
  useEffect(() => {
    fetchLayouts();
  }, []);

  const fetchLayouts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/hardware/performance');
      if (!response.ok) {
        throw new Error(`Failed to fetch layouts: ${response.statusText}`);
      }
      const data = await response.json();
      setSavedLayouts(data.layouts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch layouts');
      console.error('Error fetching layouts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col });
    setShowActionPicker(true);
  };

  // Assign action to cell
  const handleAssignAction = (row: number, col: number, action: CellAction) => {
    const cellKey = `${row}-${col}`;
    setCurrentLayout({
      ...currentLayout,
      [cellKey]: action,
    });
    setShowActionPicker(false);
    setSelectedCell(null);
  };

  // Load layout
  const handleLoadLayout = (layout: SavedLayout) => {
    setCurrentLayout(layout.grid_layout || {});
    setCurrentLayoutMeta({
      id: layout.id,
      name: layout.name,
      layout_type: layout.layout_type,
      device_type: layout.device_type as any,
      description: layout.description,
      created_at: layout.created_at,
    });
  };

  // Save layout
  const handleSaveLayout = async (name: string, layoutType: LayoutType, description?: string) => {
    try {
      setError(null);
      const response = await fetch('/api/hardware/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          layout_type: layoutType,
          grid_layout: currentLayout,
          description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to save layout: ${response.statusText}`);
      }

      const data = await response.json();
      setSavedLayouts([data.layout, ...savedLayouts]);
      setCurrentLayoutMeta({
        id: data.layout.id,
        name: data.layout.name,
        layout_type: data.layout.layout_type,
        device_type: data.layout.device_type,
        description: data.layout.description,
        created_at: data.layout.created_at,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save layout');
      console.error('Error saving layout:', err);
    }
  };

  // Clear layout
  const handleClearLayout = () => {
    if (confirm('Are you sure you want to clear the current layout?')) {
      setCurrentLayout({});
      setCurrentLayoutMeta(null);
    }
  };

  const layoutMetas: PerformanceLayoutMeta[] = savedLayouts.map((layout) => ({
    id: layout.id,
    name: layout.name,
    layout_type: layout.layout_type,
    device_type: layout.device_type as any,
    description: layout.description,
    created_at: layout.created_at,
  }));

  return (
    <div className="min-h-screen bg-[#0B0E11] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Performance Mode</h1>
          <p className="text-gray-400 text-lg">
            Design 8×8 grid layouts for live hardware control
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-900/20 border border-red-600 text-red-400">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Main Content */}
        {loading ? (
          <div className="flex items-centre justify-centre py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#3AA9BE] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading layouts...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* Grid */}
            <div>
              <PerformanceGrid
                layout={currentLayout}
                selectedCell={selectedCell}
                onCellClick={handleCellClick}
              />
            </div>

            {/* Sidebar */}
            <div>
              <PerformanceSidebar
                currentLayout={currentLayoutMeta}
                savedLayouts={layoutMetas}
                onLoadLayout={(meta) => {
                  const fullLayout = savedLayouts.find((l) => l.id === meta.id);
                  if (fullLayout) handleLoadLayout(fullLayout);
                }}
                onSaveLayout={handleSaveLayout}
                onClearLayout={handleClearLayout}
              />
            </div>
          </div>
        )}

        {/* Action Picker Modal */}
        <ActionPicker
          isOpen={showActionPicker}
          cellPosition={selectedCell}
          onAssign={handleAssignAction}
          onCancel={() => {
            setShowActionPicker(false);
            setSelectedCell(null);
          }}
        />
      </div>
    </div>
  );
}
