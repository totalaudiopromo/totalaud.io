'use client';

import { JSONViewer } from '@/components/hardware/JSONViewer';
import { DeviceBadge } from '@/components/hardware/DeviceBadge';
import type { HardwareGesture } from './GestureCard';

interface GestureInspectorProps {
  gesture: HardwareGesture | null;
  onClose: () => void;
}

export function GestureInspector({ gesture, onClose }: GestureInspectorProps) {
  if (!gesture) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-centre justify-centre bg-black/80 p-4">
      <div className="bg-[#0B0E11] border border-[#2A2C30] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#0B0E11] border-b border-[#2A2C30] px-6 py-4 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-white mb-2">{gesture.name}</h2>
            {gesture.description && (
              <p className="text-gray-400">{gesture.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 rounded-lg hover:bg-[#1A1C20] transition-all duration-180"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Device Info */}
          <div>
            <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">Device</h3>
            <DeviceBadge deviceType={gesture.device_type} size="md" />
          </div>

          {/* Gesture Type */}
          <div>
            <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">Gesture Type</h3>
            <div className="px-4 py-3 rounded-xl bg-[#111418] border border-[#2A2C30]">
              <div className="text-white font-mono">{gesture.gesture_type}</div>
              <div className="text-sm text-gray-400 mt-1">
                Timing threshold: <span className="text-[#3AA9BE]">{gesture.timing_threshold_ms}ms</span>
              </div>
            </div>
          </div>

          {/* Input Sequence */}
          <div>
            <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">Input Sequence</h3>
            <div className="space-y-2">
              {gesture.input_sequence.map((input, idx) => (
                <div
                  key={idx}
                  className="px-4 py-3 rounded-xl bg-[#111418] border border-[#2A2C30] flex items-centre justify-between"
                >
                  <div>
                    <div className="text-white font-mono">{input.input_id}</div>
                    <div className="text-sm text-gray-400">{input.input_type}</div>
                  </div>
                  <div className="flex gap-3 text-sm">
                    {input.value !== undefined && (
                      <div className="text-[#3AA9BE] font-mono">value: {input.value}</div>
                    )}
                    {input.timing_ms !== undefined && (
                      <div className="text-[#3AA9BE] font-mono">{input.timing_ms}ms</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Target Action */}
          <div>
            <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">Target Action</h3>
            <div className="px-4 py-3 rounded-xl bg-[#111418] border border-[#2A2C30]">
              <div className="text-[#3AA9BE] font-mono mb-2">{gesture.target_action_type}</div>
              {gesture.target_action_params && Object.keys(gesture.target_action_params).length > 0 && (
                <div className="mt-3">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Parameters</div>
                  <JSONViewer data={gesture.target_action_params} />
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div>
            <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">Metadata</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="px-4 py-3 rounded-xl bg-[#111418] border border-[#2A2C30]">
                <div className="text-xs text-gray-500 mb-1">Created</div>
                <div className="text-white text-sm font-mono">
                  {new Date(gesture.created_at).toLocaleString()}
                </div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-[#111418] border border-[#2A2C30]">
                <div className="text-xs text-gray-500 mb-1">Updated</div>
                <div className="text-white text-sm font-mono">
                  {new Date(gesture.updated_at).toLocaleString()}
                </div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-[#111418] border border-[#2A2C30] col-span-2">
                <div className="text-xs text-gray-500 mb-1">Gesture ID</div>
                <div className="text-white text-sm font-mono break-all">{gesture.id}</div>
              </div>
            </div>
          </div>

          {/* Full JSON */}
          <div>
            <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-3">Full JSON</h3>
            <JSONViewer data={gesture} />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#0B0E11] border-t border-[#2A2C30] px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 rounded-xl bg-[#3AA9BE] text-black hover:bg-[#3AA9BE]/80 transition-all duration-180 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
