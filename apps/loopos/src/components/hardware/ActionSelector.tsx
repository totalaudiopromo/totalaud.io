'use client';

import { useState } from 'react';

export type HardwareActionType =
  | 'open_window'
  | 'close_window'
  | 'focus_window'
  | 'control_param'
  | 'trigger_scene'
  | 'spawn_agent'
  | 'execute_agent'
  | 'toggle_presence'
  | 'custom';

interface ActionSelectorProps {
  value: HardwareActionType;
  onChange: (actionType: HardwareActionType) => void;
  disabled?: boolean;
}

const ACTION_OPTIONS: Array<{ value: HardwareActionType; label: string; description: string }> = [
  { value: 'open_window', label: 'Open Window', description: 'Launch an OperatorOS window' },
  { value: 'close_window', label: 'Close Window', description: 'Close a specific window' },
  { value: 'focus_window', label: 'Focus Window', description: 'Bring window to front' },
  { value: 'control_param', label: 'Control Parameter', description: 'Adjust CIS parameter value' },
  { value: 'trigger_scene', label: 'Trigger Scene', description: 'Navigate to scene by ID' },
  { value: 'spawn_agent', label: 'Spawn Agent', description: 'Create new agent instance' },
  { value: 'execute_agent', label: 'Execute Agent', description: 'Run agent task' },
  { value: 'toggle_presence', label: 'Toggle Presence', description: 'Show/hide presence indicator' },
  { value: 'custom', label: 'Custom Action', description: 'Custom JavaScript execution' },
];

export function ActionSelector({ value, onChange, disabled = false }: ActionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = ACTION_OPTIONS.find((opt) => opt.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl bg-[#111418] border border-[#2A2C30] text-left transition-all duration-200 ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:border-[#3AA9BE] hover:bg-[#1A1C20]'
        }`}
      >
        <div className="flex items-centre justify-between">
          <div>
            <div className="text-white font-medium">{selectedOption?.label || 'Select Action'}</div>
            <div className="text-gray-400 text-sm mt-0.5">{selectedOption?.description}</div>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-[#111418] border border-[#2A2C30] rounded-xl shadow-2xl overflow-hidden">
          <div className="max-h-80 overflow-y-auto">
            {ACTION_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left transition-all duration-180 hover:bg-[#1A1C20] ${
                  value === option.value ? 'bg-[#3AA9BE]/10 border-l-2 border-[#3AA9BE]' : ''
                }`}
              >
                <div className="text-white font-medium">{option.label}</div>
                <div className="text-gray-400 text-sm mt-0.5">{option.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && !disabled && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
