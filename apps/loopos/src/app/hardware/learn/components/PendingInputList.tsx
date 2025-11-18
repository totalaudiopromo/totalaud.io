'use client';

import { InputIcon } from '@/components/hardware/InputIcon';
import type { InputType } from '@/components/hardware/InputIcon';

export interface PendingInput {
  input_id: string;
  input_type: InputType;
  value: number;
  timestamp: number;
}

interface PendingInputListProps {
  pendingInputs: PendingInput[];
  onMapInput: (input: PendingInput) => void;
  onClearAll: () => void;
}

export function PendingInputList({ pendingInputs, onMapInput, onClearAll }: PendingInputListProps) {
  if (pendingInputs.length === 0) {
    return (
      <div className="bg-[#111418] border border-[#2A2C30] rounded-2xl p-12 text-centre">
        <div className="text-6xl mb-4">🎹</div>
        <h3 className="text-xl font-semibold text-white mb-2">No Pending Inputs</h3>
        <p className="text-gray-400">
          Press any button, pad, or encoder on your hardware controller to begin mapping.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#111418] border border-[#2A2C30] rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-centre justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">Pending Inputs</h3>
          <p className="text-sm text-gray-400">
            {pendingInputs.length} input{pendingInputs.length !== 1 ? 's' : ''} waiting to be mapped
          </p>
        </div>
        <button
          onClick={onClearAll}
          className="px-4 py-2 rounded-lg bg-[#1A1C20] text-red-400 hover:bg-red-600 hover:text-white transition-all duration-180 font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Input List */}
      <div className="space-y-3">
        {pendingInputs.map((input, idx) => (
          <div
            key={`${input.input_id}-${input.timestamp}`}
            className="bg-[#0B0E11] border border-[#2A2C30] rounded-xl p-4 hover:border-[#3AA9BE] transition-all duration-240"
          >
            <div className="flex items-centre justify-between">
              {/* Input Info */}
              <div className="flex items-centre gap-4 flex-1">
                <InputIcon
                  inputType={input.input_type}
                  inputId={input.input_id}
                  size="sm"
                />
                <div className="flex-1">
                  <div className="text-white font-mono font-semibold">{input.input_id}</div>
                  <div className="text-sm text-gray-400">{input.input_type}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Value</div>
                  <div className="text-lg text-[#3AA9BE] font-mono font-semibold">
                    {input.value}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Time</div>
                  <div className="text-sm text-gray-400 font-mono">
                    {new Date(input.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Map Button */}
              <button
                onClick={() => onMapInput(input)}
                className="ml-4 px-4 py-2 rounded-lg bg-[#3AA9BE] text-black hover:bg-[#3AA9BE]/80 transition-all duration-180 font-medium"
              >
                Map Action
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
