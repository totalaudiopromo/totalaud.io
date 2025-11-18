'use client';

import { useState } from 'react';
import { ConfirmDeleteModal } from '@/components/hardware/ConfirmDeleteModal';
import { DeviceBadge } from '@/components/hardware/DeviceBadge';
import type { HardwareDeviceType } from '@/components/hardware/DeviceBadge';

export interface HardwareScript {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  device_type?: HardwareDeviceType;
  trigger_input_id?: string;
  script_steps: Array<{
    action_type: string;
    action_params: Record<string, unknown>;
    delay_ms?: number;
    condition?: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface ScriptCardProps {
  script: HardwareScript;
  onDelete: (id: string) => void;
  onRun: (script: HardwareScript) => void;
  onEdit: (script: HardwareScript) => void;
}

export function ScriptCard({ script, onDelete, onRun, onEdit }: ScriptCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    await onRun(script);
    setTimeout(() => setIsRunning(false), 1000);
  };

  const totalDuration = script.script_steps.reduce(
    (sum, step) => sum + (step.delay_ms || 0),
    0
  );

  return (
    <>
      <div className="bg-[#111418] border border-[#2A2C30] rounded-2xl p-5 hover:border-[#3AA9BE] transition-all duration-240 group">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg mb-1">{script.name}</h3>
            {script.description && (
              <p className="text-gray-400 text-sm">{script.description}</p>
            )}
          </div>
          {script.device_type && (
            <DeviceBadge deviceType={script.device_type} size="sm" />
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-3 mb-4">
          <div className="px-3 py-1.5 rounded-lg bg-[#1A1C20] border border-[#2A2C30]">
            <span className="text-xs text-gray-400">Steps: </span>
            <span className="text-sm font-mono text-[#3AA9BE] font-semibold">
              {script.script_steps.length}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#1A1C20] border border-[#2A2C30]">
            <span className="text-xs text-gray-400">Duration: </span>
            <span className="text-sm font-mono text-[#3AA9BE] font-semibold">
              {totalDuration}ms
            </span>
          </div>
          {script.trigger_input_id && (
            <div className="px-3 py-1.5 rounded-lg bg-[#1A1C20] border border-[#2A2C30]">
              <span className="text-xs text-gray-400">Trigger: </span>
              <span className="text-sm font-mono text-white">{script.trigger_input_id}</span>
            </div>
          )}
        </div>

        {/* Script Steps Preview */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Script Steps</div>
          <div className="space-y-1.5">
            {script.script_steps.slice(0, 3).map((step, idx) => (
              <div
                key={idx}
                className="px-3 py-2 rounded-lg bg-[#0B0E11] border border-[#2A2C30] flex items-centre justify-between"
              >
                <div className="flex items-centre gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#3AA9BE]/20 text-[#3AA9BE] flex items-centre justify-centre text-xs font-mono">
                    {idx + 1}
                  </div>
                  <span className="text-sm text-white font-mono">{step.action_type}</span>
                </div>
                {step.delay_ms !== undefined && step.delay_ms > 0 && (
                  <span className="text-xs text-gray-400 font-mono">+{step.delay_ms}ms</span>
                )}
              </div>
            ))}
            {script.script_steps.length > 3 && (
              <div className="text-xs text-gray-500 text-centre py-1">
                +{script.script_steps.length - 3} more steps
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-4 py-2 rounded-lg bg-[#3AA9BE] text-black hover:bg-[#3AA9BE]/80 transition-all duration-180 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-centre justify-centre gap-2"
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Running</span>
              </>
            ) : (
              <>▶ Run</>
            )}
          </button>
          <button
            onClick={() => onEdit(script)}
            className="px-4 py-2 rounded-lg bg-[#1A1C20] text-white hover:bg-[#2A2C30] transition-all duration-180 font-medium"
          >
            Edit
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
        itemName={script.name}
        onConfirm={() => {
          onDelete(script.id);
          setShowDeleteModal(false);
        }}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
}
