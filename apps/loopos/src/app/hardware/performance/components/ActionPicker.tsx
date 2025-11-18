'use client';

import { useState } from 'react';
import { ActionSelector, type HardwareActionType } from '@/components/hardware/ActionSelector';
import type { CellAction } from './PerformanceCell';

interface ActionPickerProps {
  isOpen: boolean;
  cellPosition: { row: number; col: number } | null;
  onAssign: (row: number, col: number, action: CellAction) => void;
  onCancel: () => void;
}

const PRESET_COLOURS = [
  '#3AA9BE', // Cyan
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#A78BFA', // Purple
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#06B6D4', // Teal
];

export function ActionPicker({ isOpen, cellPosition, onAssign, onCancel }: ActionPickerProps) {
  const [actionType, setActionType] = useState<HardwareActionType>('open_window');
  const [label, setLabel] = useState('');
  const [colour, setColour] = useState('#3AA9BE');
  const [paramKey, setParamKey] = useState('');
  const [paramValue, setParamValue] = useState('');

  if (!isOpen || !cellPosition) return null;

  const handleAssign = () => {
    const params: Record<string, unknown> = {};
    if (paramKey && paramValue) {
      try {
        params[paramKey] = JSON.parse(paramValue);
      } catch {
        params[paramKey] = paramValue;
      }
    }

    onAssign(cellPosition.row, cellPosition.col, {
      action_type: actionType,
      action_params: params,
      label: label || undefined,
      colour,
    });

    // Reset form
    setLabel('');
    setParamKey('');
    setParamValue('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-centre justify-centre bg-black/80 p-4">
      <div className="bg-[#111418] border border-[#2A2C30] rounded-2xl max-w-lg w-full p-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          Assign Action to Cell ({cellPosition.row}, {cellPosition.col})
        </h3>

        {/* Action Type */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Action Type</label>
          <ActionSelector value={actionType} onChange={setActionType} />
        </div>

        {/* Label */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Label (optional)</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g., Open Chat"
            className="w-full px-4 py-3 rounded-xl bg-[#0B0E11] border border-[#2A2C30] text-white placeholder-gray-500 focus:border-[#3AA9BE] focus:outline-none transition-all duration-180"
          />
        </div>

        {/* Colour */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Colour</label>
          <div className="flex gap-2 mb-2">
            {PRESET_COLOURS.map((presetColour) => (
              <button
                key={presetColour}
                type="button"
                onClick={() => setColour(presetColour)}
                className={`w-10 h-10 rounded-lg transition-all duration-180 ${
                  colour === presetColour ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111418]' : ''
                }`}
                style={{ backgroundColor: presetColour }}
              />
            ))}
          </div>
          <input
            type="color"
            value={colour}
            onChange={(e) => setColour(e.target.value)}
            className="w-full h-12 rounded-xl bg-[#0B0E11] border border-[#2A2C30] cursor-pointer"
          />
        </div>

        {/* Parameters */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Action Parameters (optional)</label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={paramKey}
              onChange={(e) => setParamKey(e.target.value)}
              placeholder="Key"
              className="px-3 py-2 rounded-lg bg-[#0B0E11] border border-[#2A2C30] text-white text-sm placeholder-gray-500 focus:border-[#3AA9BE] focus:outline-none"
            />
            <input
              type="text"
              value={paramValue}
              onChange={(e) => setParamValue(e.target.value)}
              placeholder="Value"
              className="px-3 py-2 rounded-lg bg-[#0B0E11] border border-[#2A2C30] text-white text-sm placeholder-gray-500 focus:border-[#3AA9BE] focus:outline-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl bg-[#1A1C20] text-white hover:bg-[#2A2C30] transition-all duration-180 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            className="flex-1 px-4 py-3 rounded-xl bg-[#3AA9BE] text-black hover:bg-[#3AA9BE]/80 transition-all duration-180 font-medium"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}
