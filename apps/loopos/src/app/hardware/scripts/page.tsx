'use client';

import { useState, useEffect } from 'react';
import { ScriptList } from './components/ScriptList';
import { ScriptEditor } from './components/ScriptEditor';
import type { HardwareScript } from './components/ScriptCard';
import type { HardwareDeviceType } from '@/components/hardware/DeviceBadge';

interface ScriptStep {
  action_type: string;
  action_params: Record<string, unknown>;
  delay_ms?: number;
  condition?: string;
}

interface CreateScriptPayload {
  name: string;
  description?: string;
  device_type?: HardwareDeviceType;
  trigger_input_id?: string;
  script_steps: ScriptStep[];
}

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<HardwareScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingScript, setEditingScript] = useState<HardwareScript | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [runningScriptId, setRunningScriptId] = useState<string | null>(null);

  // Fetch scripts
  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/hardware/scripts');
      if (!response.ok) {
        throw new Error(`Failed to fetch scripts: ${response.statusText}`);
      }
      const data = await response.json();
      setScripts(data.scripts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch scripts');
      console.error('Error fetching scripts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create script
  const handleCreateScript = async (payload: CreateScriptPayload) => {
    try {
      setError(null);
      const response = await fetch('/api/hardware/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create script: ${response.statusText}`);
      }

      const data = await response.json();
      setScripts([data.script, ...scripts]);
      setShowEditor(false);
      setEditingScript(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create script');
      console.error('Error creating script:', err);
    }
  };

  // Delete script
  const handleDeleteScript = async (id: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/hardware/scripts?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete script: ${response.statusText}`);
      }

      setScripts(scripts.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete script');
      console.error('Error deleting script:', err);
    }
  };

  // Run script (simulate execution)
  const handleRunScript = async (script: HardwareScript) => {
    setRunningScriptId(script.id);
    setError(null);

    try {
      // Simulate running the script
      console.log(`Running script: ${script.name}`);
      for (let i = 0; i < script.script_steps.length; i++) {
        const step = script.script_steps[i];
        console.log(`Step ${i + 1}:`, step.action_type, step.action_params);

        // Wait for delay if specified
        if (step.delay_ms && step.delay_ms > 0) {
          await new Promise((resolve) => setTimeout(resolve, step.delay_ms));
        }
      }
      console.log(`Script completed: ${script.name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Script execution failed');
      console.error('Error running script:', err);
    } finally {
      setRunningScriptId(null);
    }
  };

  // Edit script
  const handleEditScript = (script: HardwareScript) => {
    setEditingScript(script);
    setShowEditor(true);
  };

  return (
    <div className="min-h-screen bg-[#0B0E11] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Hardware Scripts</h1>
              <p className="text-gray-400 text-lg">
                Automate multi-step workflows with JSON DSL scripts
              </p>
            </div>
            <button
              onClick={() => {
                setEditingScript(undefined);
                setShowEditor(!showEditor);
              }}
              className="px-6 py-3 rounded-xl bg-[#3AA9BE] text-black font-medium hover:bg-[#3AA9BE]/80 transition-all duration-180"
            >
              {showEditor && !editingScript ? 'Cancel' : '+ Create Script'}
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="px-4 py-2 rounded-lg bg-[#111418] border border-[#2A2C30]">
              <span className="text-gray-400 text-sm">Total Scripts: </span>
              <span className="text-white font-mono font-semibold">{scripts.length}</span>
            </div>
            <div className="px-4 py-2 rounded-lg bg-[#111418] border border-[#2A2C30]">
              <span className="text-gray-400 text-sm">Status: </span>
              <span className="text-[#3AA9BE] font-mono font-semibold">
                {loading ? 'Loading...' : runningScriptId ? 'Running...' : 'Ready'}
              </span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-900/20 border border-red-600 text-red-400">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Editor */}
        {showEditor && (
          <div className="mb-8">
            <ScriptEditor
              initialScript={editingScript}
              onSubmit={handleCreateScript}
              onCancel={() => {
                setShowEditor(false);
                setEditingScript(undefined);
              }}
            />
          </div>
        )}

        {/* Script List */}
        {loading ? (
          <div className="flex items-centre justify-centre py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#3AA9BE] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading scripts...</p>
            </div>
          </div>
        ) : (
          <ScriptList
            scripts={scripts}
            onDelete={handleDeleteScript}
            onRun={handleRunScript}
            onEdit={handleEditScript}
          />
        )}
      </div>
    </div>
  );
}
