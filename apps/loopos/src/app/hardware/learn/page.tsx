'use client';

import { useState, useEffect, useCallback } from 'react';
import { LearnModePanel } from './components/LearnModePanel';
import { PendingInputList, type PendingInput } from './components/PendingInputList';
import { ActionSelector, type HardwareActionType } from '@/components/hardware/ActionSelector';
import type { InputType } from '@/components/hardware/InputIcon';

export default function LearnPage() {
  const [isActive, setIsActive] = useState(false);
  const [pendingInputs, setPendingInputs] = useState<PendingInput[]>([]);
  const [selectedInput, setSelectedInput] = useState<PendingInput | null>(null);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [actionType, setActionType] = useState<HardwareActionType>('open_window');
  const [error, setError] = useState<string | null>(null);

  // Simulate hardware input detection
  useEffect(() => {
    if (!isActive) return;

    // In a real implementation, this would listen to the hardware controller via Web MIDI API
    // For now, we'll simulate it with a mock function
    const simulateInput = () => {
      // This is just a placeholder - real implementation would use MIDI events
      console.log('Learn mode active - waiting for hardware input...');
    };

    const interval = setInterval(simulateInput, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  // Toggle learn mode
  const handleToggle = () => {
    setIsActive(!isActive);
    if (isActive) {
      // Stopping learn mode
      console.log('Learn mode deactivated');
    } else {
      // Starting learn mode
      console.log('Learn mode activated');
    }
  };

  // Handle mapping input
  const handleMapInput = (input: PendingInput) => {
    setSelectedInput(input);
    setShowMappingModal(true);
  };

  // Create mapping
  const handleCreateMapping = async () => {
    if (!selectedInput) return;

    try {
      setError(null);
      const response = await fetch('/api/hardware/mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input_id: selectedInput.input_id,
          input_type: selectedInput.input_type,
          action_type: actionType,
          action_params: {},
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create mapping: ${response.statusText}`);
      }

      // Remove from pending inputs
      setPendingInputs(pendingInputs.filter((input) => input.input_id !== selectedInput.input_id));
      setShowMappingModal(false);
      setSelectedInput(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create mapping');
      console.error('Error creating mapping:', err);
    }
  };

  // Clear all pending inputs
  const handleClearAll = () => {
    if (confirm('Clear all pending inputs?')) {
      setPendingInputs([]);
    }
  };

  // Simulate adding a pending input (for demo purposes)
  const simulateInput = () => {
    const inputTypes: InputType[] = ['pad', 'encoder', 'button', 'fader', 'knob'];
    const randomType = inputTypes[Math.floor(Math.random() * inputTypes.length)];
    const randomId = `${randomType}-${Math.floor(Math.random() * 64)}`;
    const randomValue = Math.floor(Math.random() * 128);

    const newInput: PendingInput = {
      input_id: randomId,
      input_type: randomType,
      value: randomValue,
      timestamp: Date.now(),
    };

    setPendingInputs([newInput, ...pendingInputs]);
  };

  return (
    <div className="min-h-screen bg-[#0B0E11] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Learn Mode</h1>
          <p className="text-gray-400 text-lg">
            Auto-detect hardware inputs and create mappings on the fly
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-900/20 border border-red-600 text-red-400">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Learn Mode Panel */}
        <div className="mb-8">
          <LearnModePanel
            isActive={isActive}
            inputCount={pendingInputs.length}
            onToggle={handleToggle}
          />
        </div>

        {/* Demo Button (remove in production) */}
        {isActive && (
          <div className="mb-6 text-centre">
            <button
              onClick={simulateInput}
              className="px-6 py-3 rounded-xl bg-yellow-600 text-black font-medium hover:bg-yellow-700 transition-all duration-180"
            >
              🎲 Simulate Hardware Input (Demo)
            </button>
          </div>
        )}

        {/* Pending Inputs */}
        <PendingInputList
          pendingInputs={pendingInputs}
          onMapInput={handleMapInput}
          onClearAll={handleClearAll}
        />

        {/* Mapping Modal */}
        {showMappingModal && selectedInput && (
          <div className="fixed inset-0 z-50 flex items-centre justify-centre bg-black/80 p-4">
            <div className="bg-[#111418] border border-[#2A2C30] rounded-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Map Action to {selectedInput.input_id}
              </h3>

              {/* Input Info */}
              <div className="mb-6 px-4 py-3 rounded-xl bg-[#0B0E11] border border-[#2A2C30]">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Input ID</div>
                    <div className="text-white font-mono">{selectedInput.input_id}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Type</div>
                    <div className="text-white font-mono">{selectedInput.input_type}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Value</div>
                    <div className="text-[#3AA9BE] font-mono font-semibold">
                      {selectedInput.value}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Detected</div>
                    <div className="text-white font-mono text-xs">
                      {new Date(selectedInput.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Selection */}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Target Action</label>
                <ActionSelector value={actionType} onChange={setActionType} />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowMappingModal(false);
                    setSelectedInput(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#1A1C20] text-white hover:bg-[#2A2C30] transition-all duration-180 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateMapping}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#3AA9BE] text-black hover:bg-[#3AA9BE]/80 transition-all duration-180 font-medium"
                >
                  Create Mapping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
