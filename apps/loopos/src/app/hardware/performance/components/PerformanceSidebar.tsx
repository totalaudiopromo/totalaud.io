'use client';

import { useState } from 'react';
import { DeviceBadge } from '@/components/hardware/DeviceBadge';
import type { HardwareDeviceType } from '@/components/hardware/DeviceBadge';

export type LayoutType = 'clip_matrix' | 'parameter_matrix' | 'visualization_matrix' | 'custom';

export interface PerformanceLayoutMeta {
  id: string;
  name: string;
  layout_type: LayoutType;
  device_type?: HardwareDeviceType;
  description?: string;
  created_at: string;
}

interface PerformanceSidebarProps {
  currentLayout: PerformanceLayoutMeta | null;
  savedLayouts: PerformanceLayoutMeta[];
  onLoadLayout: (layout: PerformanceLayoutMeta) => void;
  onSaveLayout: (name: string, layoutType: LayoutType, description?: string) => void;
  onClearLayout: () => void;
}

const LAYOUT_TYPE_INFO: Record<LayoutType, { label: string; icon: string; description: string }> = {
  clip_matrix: {
    label: 'Clip Matrix',
    icon: '🎬',
    description: 'Launch clips and scenes',
  },
  parameter_matrix: {
    label: 'Parameter Matrix',
    icon: '🎚️',
    description: 'Control CIS parameters',
  },
  visualization_matrix: {
    label: 'Visualization Matrix',
    icon: '📊',
    description: 'Visual feedback grid',
  },
  custom: {
    label: 'Custom',
    icon: '⚙️',
    description: 'Custom action layout',
  },
};

export function PerformanceSidebar({
  currentLayout,
  savedLayouts,
  onLoadLayout,
  onSaveLayout,
  onClearLayout,
}: PerformanceSidebarProps) {
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveLayoutType, setSaveLayoutType] = useState<LayoutType>('custom');
  const [saveDescription, setSaveDescription] = useState('');

  const handleSave = () => {
    if (!saveName) {
      alert('Please enter a layout name');
      return;
    }

    onSaveLayout(saveName, saveLayoutType, saveDescription || undefined);
    setSaveName('');
    setSaveDescription('');
    setShowSaveForm(false);
  };

  return (
    <div className="bg-[#111418] border border-[#2A2C30] rounded-2xl p-6">
      {/* Current Layout */}
      <div className="mb-6">
        <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">Current Layout</h3>
        {currentLayout ? (
          <div className="px-4 py-3 rounded-xl bg-[#0B0E11] border border-[#2A2C30]">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="text-white font-semibold">{currentLayout.name}</div>
                {currentLayout.description && (
                  <div className="text-sm text-gray-400 mt-1">{currentLayout.description}</div>
                )}
              </div>
              <span className="text-2xl ml-2">
                {LAYOUT_TYPE_INFO[currentLayout.layout_type].icon}
              </span>
            </div>
            <div className="text-xs text-[#3AA9BE] font-mono">
              {LAYOUT_TYPE_INFO[currentLayout.layout_type].label}
            </div>
          </div>
        ) : (
          <div className="px-4 py-3 rounded-xl bg-[#0B0E11] border border-[#2A2C30] text-centre text-gray-500">
            No layout selected
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mb-6 space-y-2">
        <button
          onClick={() => setShowSaveForm(!showSaveForm)}
          className="w-full px-4 py-2 rounded-lg bg-[#3AA9BE] text-black hover:bg-[#3AA9BE]/80 transition-all duration-180 font-medium"
        >
          {showSaveForm ? 'Cancel Save' : 'Save Layout'}
        </button>
        <button
          onClick={onClearLayout}
          className="w-full px-4 py-2 rounded-lg bg-[#1A1C20] text-white hover:bg-[#2A2C30] transition-all duration-180 font-medium"
        >
          Clear Grid
        </button>
      </div>

      {/* Save Form */}
      {showSaveForm && (
        <div className="mb-6 p-4 rounded-xl bg-[#0B0E11] border border-[#2A2C30]">
          <h4 className="text-white font-semibold mb-3">Save Layout</h4>
          <div className="space-y-3">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Layout name"
              className="w-full px-3 py-2 rounded-lg bg-[#111418] border border-[#2A2C30] text-white text-sm placeholder-gray-500 focus:border-[#3AA9BE] focus:outline-none"
            />
            <select
              value={saveLayoutType}
              onChange={(e) => setSaveLayoutType(e.target.value as LayoutType)}
              className="w-full px-3 py-2 rounded-lg bg-[#111418] border border-[#2A2C30] text-white text-sm focus:border-[#3AA9BE] focus:outline-none"
            >
              {Object.entries(LAYOUT_TYPE_INFO).map(([type, info]) => (
                <option key={type} value={type}>
                  {info.icon} {info.label}
                </option>
              ))}
            </select>
            <textarea
              value={saveDescription}
              onChange={(e) => setSaveDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-[#111418] border border-[#2A2C30] text-white text-sm placeholder-gray-500 focus:border-[#3AA9BE] focus:outline-none resize-none"
            />
            <button
              onClick={handleSave}
              className="w-full px-4 py-2 rounded-lg bg-[#3AA9BE] text-black hover:bg-[#3AA9BE]/80 transition-all duration-180 font-medium"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Saved Layouts */}
      <div>
        <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">
          Saved Layouts ({savedLayouts.length})
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {savedLayouts.length === 0 ? (
            <div className="text-centre py-8 text-gray-500 text-sm">
              No saved layouts yet
            </div>
          ) : (
            savedLayouts.map((layout) => (
              <button
                key={layout.id}
                onClick={() => onLoadLayout(layout)}
                className={`w-full px-3 py-3 rounded-lg text-left transition-all duration-180 ${
                  currentLayout?.id === layout.id
                    ? 'bg-[#3AA9BE]/20 border border-[#3AA9BE]'
                    : 'bg-[#0B0E11] border border-[#2A2C30] hover:border-[#3AA9BE]/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">{layout.name}</div>
                    {layout.description && (
                      <div className="text-xs text-gray-400 mt-1">{layout.description}</div>
                    )}
                  </div>
                  <span className="text-lg ml-2">
                    {LAYOUT_TYPE_INFO[layout.layout_type].icon}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2 font-mono">
                  {LAYOUT_TYPE_INFO[layout.layout_type].label}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
