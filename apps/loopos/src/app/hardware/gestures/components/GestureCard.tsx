'use client';

import { useState } from 'react';
import { ConfirmDeleteModal } from '@/components/hardware/ConfirmDeleteModal';
import { DeviceBadge } from '@/components/hardware/DeviceBadge';
import type { HardwareDeviceType } from '@/components/hardware/DeviceBadge';

export type GestureType = 'double_tap' | 'hold' | 'combo' | 'velocity_sensitive' | 'sequence';

export interface HardwareGesture {
  id: string;
  user_id: string;
  name: string;
  gesture_type: GestureType;
  device_type: HardwareDeviceType;
  input_sequence: Array<{
    input_id: string;
    input_type: string;
    value?: number;
    timing_ms?: number;
  }>;
  timing_threshold_ms: number;
  target_action_type: string;
  target_action_params?: Record<string, unknown>;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface GestureCardProps {
  gesture: HardwareGesture;
  onDelete: (id: string) => void;
  onInspect: (gesture: HardwareGesture) => void;
}

const GESTURE_TYPE_LABELS: Record<GestureType, { label: string; icon: string; colour: string }> = {
  double_tap: { label: 'Double Tap', icon: '👆👆', colour: '#3AA9BE' },
  hold: { label: 'Hold', icon: '⏱️', colour: '#A78BFA' },
  combo: { label: 'Combo', icon: '🎹', colour: '#F59E0B' },
  velocity_sensitive: { label: 'Velocity', icon: '⚡', colour: '#10B981' },
  sequence: { label: 'Sequence', icon: '🎵', colour: '#EC4899' },
};

export function GestureCard({ gesture, onDelete, onInspect }: GestureCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const typeInfo = GESTURE_TYPE_LABELS[gesture.gesture_type];

  return (
    <>
      <div className="bg-[#111418] border border-[#2A2C30] rounded-2xl p-5 hover:border-[#3AA9BE] transition-all duration-240 group">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg mb-1">{gesture.name}</h3>
            {gesture.description && (
              <p className="text-gray-400 text-sm">{gesture.description}</p>
            )}
          </div>
          <DeviceBadge deviceType={gesture.device_type} size="sm" />
        </div>

        {/* Gesture Type Badge */}
        <div className="flex items-centre gap-3 mb-4">
          <div
            className="px-3 py-1.5 rounded-lg flex items-centre gap-2"
            style={{ backgroundColor: `${typeInfo.colour}20`, borderLeft: `3px solid ${typeInfo.colour}` }}
          >
            <span className="text-lg">{typeInfo.icon}</span>
            <span className="text-sm font-medium text-white">{typeInfo.label}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#1A1C20] border border-[#2A2C30]">
            <span className="text-xs font-mono text-gray-400">
              {gesture.timing_threshold_ms}ms threshold
            </span>
          </div>
        </div>

        {/* Input Sequence */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Input Sequence</div>
          <div className="flex flex-wrap gap-2">
            {gesture.input_sequence.map((input, idx) => (
              <div
                key={idx}
                className="px-3 py-2 rounded-lg bg-[#1A1C20] border border-[#2A2C30]"
              >
                <div className="text-sm text-white font-mono">{input.input_id}</div>
                <div className="text-xs text-gray-400">
                  {input.input_type}
                  {input.value !== undefined && ` • ${input.value}`}
                  {input.timing_ms !== undefined && ` • ${input.timing_ms}ms`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Target Action */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Target Action</div>
          <div className="px-3 py-2 rounded-lg bg-[#0B0E11] border border-[#2A2C30]">
            <div className="text-sm text-[#3AA9BE] font-mono">{gesture.target_action_type}</div>
            {gesture.target_action_params && Object.keys(gesture.target_action_params).length > 0 && (
              <div className="text-xs text-gray-400 mt-1 font-mono">
                {JSON.stringify(gesture.target_action_params, null, 2)}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onInspect(gesture)}
            className="flex-1 px-4 py-2 rounded-lg bg-[#1A1C20] text-white hover:bg-[#3AA9BE] hover:text-black transition-all duration-180 font-medium"
          >
            Inspect
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 rounded-lg bg-[#1A1C20] text-red-400 hover:bg-red-600 hover:text-white transition-all duration-180 font-medium"
          >
            Delete
          </button>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        itemName={gesture.name}
        onConfirm={() => {
          onDelete(gesture.id);
          setShowDeleteModal(false);
        }}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
}
