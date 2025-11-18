'use client';

import { useState } from 'react';
import { ActionSelector, type HardwareActionType } from '@/components/hardware/ActionSelector';
import type { HardwareDeviceType } from '@/components/hardware/DeviceBadge';
import type { GestureType } from './GestureCard';

interface InputStep {
  input_id: string;
  input_type: string;
  value?: number;
  timing_ms?: number;
}

interface GestureFormProps {
  onSubmit: (gesture: {
    name: string;
    gesture_type: GestureType;
    device_type: HardwareDeviceType;
    input_sequence: InputStep[];
    timing_threshold_ms: number;
    target_action_type: HardwareActionType;
    target_action_params: Record<string, unknown>;
    description?: string;
  }) => void;
  onCancel: () => void;
}

export function GestureForm({ onSubmit, onCancel }: GestureFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [gestureType, setGestureType] = useState<GestureType>('double_tap');
  const [deviceType, setDeviceType] = useState<HardwareDeviceType>('push2');
  const [timingThreshold, setTimingThreshold] = useState(200);
  const [targetActionType, setTargetActionType] = useState<HardwareActionType>('open_window');
  const [inputSequence, setInputSequence] = useState<InputStep[]>([
    { input_id: 'pad-0-0', input_type: 'pad' },
  ]);

  const handleAddInput = () => {
    setInputSequence([...inputSequence, { input_id: 'pad-0-0', input_type: 'pad' }]);
  };

  const handleRemoveInput = (index: number) => {
    setInputSequence(inputSequence.filter((_, idx) => idx !== index));
  };

  const handleInputChange = (index: number, field: keyof InputStep, value: string | number) => {
    const updated = [...inputSequence];
    updated[index] = { ...updated[index], [field]: value };
    setInputSequence(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      gesture_type: gestureType,
      device_type: deviceType,
      input_sequence: inputSequence,
      timing_threshold_ms: timingThreshold,
      target_action_type: targetActionType,
      target_action_params: {},
      description: description || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#111418] border border-[#2A2C30] rounded-2xl p-6">
      <h2 className="text-2xl font-semibold text-white mb-6">Create New Gesture</h2>

      {/* Name */}
      <div className="mb-5">
        <label className="block text-sm text-gray-400 mb-2">Gesture Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Quick Scene Switch"
          required
          className="w-full px-4 py-3 rounded-xl bg-[#0B0E11] border border-[#2A2C30] text-white placeholder-gray-500 focus:border-[#3AA9BE] focus:outline-none transition-all duration-180"
        />
      </div>

      {/* Description */}
      <div className="mb-5">
        <label className="block text-sm text-gray-400 mb-2">Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what this gesture does..."
          rows={2}
          className="w-full px-4 py-3 rounded-xl bg-[#0B0E11] border border-[#2A2C30] text-white placeholder-gray-500 focus:border-[#3AA9BE] focus:outline-none transition-all duration-180 resize-none"
        />
      </div>

      {/* Gesture Type */}
      <div className="mb-5">
        <label className="block text-sm text-gray-400 mb-2">Gesture Type</label>
        <select
          value={gestureType}
          onChange={(e) => setGestureType(e.target.value as GestureType)}
          className="w-full px-4 py-3 rounded-xl bg-[#0B0E11] border border-[#2A2C30] text-white focus:border-[#3AA9BE] focus:outline-none transition-all duration-180"
        >
          <option value="double_tap">Double Tap</option>
          <option value="hold">Hold</option>
          <option value="combo">Combo</option>
          <option value="velocity_sensitive">Velocity Sensitive</option>
          <option value="sequence">Sequence</option>
        </select>
      </div>

      {/* Device Type */}
      <div className="mb-5">
        <label className="block text-sm text-gray-400 mb-2">Device Type</label>
        <select
          value={deviceType}
          onChange={(e) => setDeviceType(e.target.value as HardwareDeviceType)}
          className="w-full px-4 py-3 rounded-xl bg-[#0B0E11] border border-[#2A2C30] text-white focus:border-[#3AA9BE] focus:outline-none transition-all duration-180"
        >
          <option value="push2">Ableton Push 2</option>
          <option value="push3">Ableton Push 3</option>
          <option value="launchpad">Novation Launchpad Pro</option>
          <option value="mpk">AKAI MPK Mini</option>
          <option value="generic_midi">Generic MIDI</option>
        </select>
      </div>

      {/* Timing Threshold */}
      <div className="mb-5">
        <label className="block text-sm text-gray-400 mb-2">
          Timing Threshold (ms) - {timingThreshold}ms
        </label>
        <input
          type="range"
          min="50"
          max="1000"
          step="10"
          value={timingThreshold}
          onChange={(e) => setTimingThreshold(Number(e.target.value))}
          className="w-full h-2 bg-[#2A2C30] rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3AA9BE 0%, #3AA9BE ${(timingThreshold / 1000) * 100}%, #2A2C30 ${(timingThreshold / 1000) * 100}%, #2A2C30 100%)`,
          }}
        />
      </div>

      {/* Input Sequence */}
      <div className="mb-5">
        <div className="flex items-centre justify-between mb-2">
          <label className="block text-sm text-gray-400">Input Sequence</label>
          <button
            type="button"
            onClick={handleAddInput}
            className="px-3 py-1 rounded-lg bg-[#3AA9BE] text-black text-sm font-medium hover:bg-[#3AA9BE]/80 transition-all duration-180"
          >
            + Add Input
          </button>
        </div>
        <div className="space-y-3">
          {inputSequence.map((input, idx) => (
            <div key={idx} className="flex gap-3 items-start">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={input.input_id}
                  onChange={(e) => handleInputChange(idx, 'input_id', e.target.value)}
                  placeholder="e.g., pad-0-0"
                  className="px-3 py-2 rounded-lg bg-[#0B0E11] border border-[#2A2C30] text-white text-sm placeholder-gray-500 focus:border-[#3AA9BE] focus:outline-none"
                />
                <select
                  value={input.input_type}
                  onChange={(e) => handleInputChange(idx, 'input_type', e.target.value)}
                  className="px-3 py-2 rounded-lg bg-[#0B0E11] border border-[#2A2C30] text-white text-sm focus:border-[#3AA9BE] focus:outline-none"
                >
                  <option value="pad">Pad</option>
                  <option value="encoder">Encoder</option>
                  <option value="button">Button</option>
                  <option value="fader">Fader</option>
                  <option value="strip">Strip</option>
                  <option value="key">Key</option>
                  <option value="knob">Knob</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveInput(idx)}
                className="px-3 py-2 rounded-lg bg-[#1A1C20] text-red-400 hover:bg-red-600 hover:text-white transition-all duration-180"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Target Action */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">Target Action</label>
        <ActionSelector value={targetActionType} onChange={setTargetActionType} />
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 rounded-xl bg-[#1A1C20] text-white hover:bg-[#2A2C30] transition-all duration-180 font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name || inputSequence.length === 0}
          className="flex-1 px-4 py-3 rounded-xl bg-[#3AA9BE] text-black hover:bg-[#3AA9BE]/80 transition-all duration-180 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Gesture
        </button>
      </div>
    </form>
  );
}
