'use client';

import { useState } from 'react';
import { StepPreview } from './StepPreview';
import type { HardwareDeviceType } from '@/components/hardware/DeviceBadge';
import type { HardwareScript } from './ScriptCard';

interface ScriptStep {
  action_type: string;
  action_params: Record<string, unknown>;
  delay_ms?: number;
  condition?: string;
}

interface ScriptEditorProps {
  initialScript?: HardwareScript;
  onSubmit: (script: {
    name: string;
    description?: string;
    device_type?: HardwareDeviceType;
    trigger_input_id?: string;
    script_steps: ScriptStep[];
  }) => void;
  onCancel: () => void;
}

export function ScriptEditor({ initialScript, onSubmit, onCancel }: ScriptEditorProps) {
  const [name, setName] = useState(initialScript?.name || '');
  const [description, setDescription] = useState(initialScript?.description || '');
  const [deviceType, setDeviceType] = useState<HardwareDeviceType | ''>(
    initialScript?.device_type || ''
  );
  const [triggerInputId, setTriggerInputId] = useState(initialScript?.trigger_input_id || '');
  const [jsonText, setJsonText] = useState(
    JSON.stringify(initialScript?.script_steps || [], null, 2)
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Parse and validate JSON
  const parseSteps = (): ScriptStep[] | null => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        setValidationError('Script steps must be an array');
        return null;
      }

      for (let i = 0; i < parsed.length; i++) {
        const step = parsed[i];
        if (!step.action_type || typeof step.action_type !== 'string') {
          setValidationError(`Step ${i + 1}: action_type is required and must be a string`);
          return null;
        }
        if (!step.action_params || typeof step.action_params !== 'object') {
          setValidationError(`Step ${i + 1}: action_params is required and must be an object`);
          return null;
        }
      }

      setValidationError(null);
      return parsed;
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Invalid JSON');
      return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const steps = parseSteps();
    if (!steps) return;

    onSubmit({
      name,
      description: description || undefined,
      device_type: deviceType || undefined,
      trigger_input_id: triggerInputId || undefined,
      script_steps: steps,
    });
  };

  const parsedSteps = parseSteps();

  // Example template
  const loadExample = () => {
    const example = [
      {
        action_type: 'open_window',
        action_params: { window_id: 'broker-chat' },
        delay_ms: 0,
      },
      {
        action_type: 'control_param',
        action_params: { param_id: 'vocal_presence', value: 0.8 },
        delay_ms: 500,
      },
      {
        action_type: 'trigger_scene',
        action_params: { scene_id: 'scene-123' },
        delay_ms: 1000,
      },
    ];
    setJsonText(JSON.stringify(example, null, 2));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#111418] border border-[#2A2C30] rounded-2xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-1">
            {initialScript ? 'Edit Script' : 'Create New Script'}
          </h2>
          <p className="text-gray-400 text-sm">Build multi-step automation workflows</p>
        </div>
        <button
          type="button"
          onClick={() => setPreviewMode(!previewMode)}
          className="px-4 py-2 rounded-lg bg-[#1A1C20] text-white hover:bg-[#2A2C30] transition-all duration-180"
        >
          {previewMode ? '📝 Edit' : '👁️ Preview'}
        </button>
      </div>

      {previewMode ? (
        /* Preview Mode */
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Script Preview</h3>
          {parsedSteps ? (
            <StepPreview steps={parsedSteps} />
          ) : (
            <div className="bg-red-900/20 border border-red-600 rounded-xl p-4 text-red-400">
              <strong>Validation Error:</strong> {validationError}
            </div>
          )}
        </div>
      ) : (
        /* Edit Mode */
        <>
          {/* Name */}
          <div className="mb-5">
            <label className="block text-sm text-gray-400 mb-2">Script Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Studio Workflow"
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
              placeholder="Describe this script..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-[#0B0E11] border border-[#2A2C30] text-white placeholder-gray-500 focus:border-[#3AA9BE] focus:outline-none transition-all duration-180 resize-none"
            />
          </div>

          {/* Device Type & Trigger */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Device Type (optional)</label>
              <select
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value as HardwareDeviceType)}
                className="w-full px-4 py-3 rounded-xl bg-[#0B0E11] border border-[#2A2C30] text-white focus:border-[#3AA9BE] focus:outline-none transition-all duration-180"
              >
                <option value="">Any Device</option>
                <option value="push2">Ableton Push 2</option>
                <option value="push3">Ableton Push 3</option>
                <option value="launchpad">Novation Launchpad Pro</option>
                <option value="mpk">AKAI MPK Mini</option>
                <option value="generic_midi">Generic MIDI</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Trigger Input (optional)</label>
              <input
                type="text"
                value={triggerInputId}
                onChange={(e) => setTriggerInputId(e.target.value)}
                placeholder="e.g., button-7"
                className="w-full px-4 py-3 rounded-xl bg-[#0B0E11] border border-[#2A2C30] text-white placeholder-gray-500 focus:border-[#3AA9BE] focus:outline-none transition-all duration-180"
              />
            </div>
          </div>

          {/* JSON Editor */}
          <div className="mb-5">
            <div className="flex items-centre justify-between mb-2">
              <label className="block text-sm text-gray-400">Script Steps (JSON)</label>
              <button
                type="button"
                onClick={loadExample}
                className="px-3 py-1 rounded-lg bg-[#1A1C20] text-[#3AA9BE] text-sm hover:bg-[#2A2C30] transition-all duration-180"
              >
                Load Example
              </button>
            </div>
            <textarea
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                parseSteps();
              }}
              rows={20}
              className="w-full px-4 py-3 rounded-xl bg-[#0B0E11] border border-[#2A2C30] text-[#3AA9BE] font-mono text-sm placeholder-gray-500 focus:border-[#3AA9BE] focus:outline-none transition-all duration-180 resize-none"
              spellCheck={false}
            />
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-900/20 border border-red-600 text-red-400">
              <strong>Validation Error:</strong> {validationError}
            </div>
          )}
        </>
      )}

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
          disabled={!name || !parsedSteps}
          className="flex-1 px-4 py-3 rounded-xl bg-[#3AA9BE] text-black hover:bg-[#3AA9BE]/80 transition-all duration-180 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {initialScript ? 'Update Script' : 'Create Script'}
        </button>
      </div>
    </form>
  );
}
