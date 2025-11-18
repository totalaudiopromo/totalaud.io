'use client';

import { useState, useEffect } from 'react';
import { GestureList } from './components/GestureList';
import { GestureForm } from './components/GestureForm';
import { GestureInspector } from './components/GestureInspector';
import type { HardwareGesture } from './components/GestureCard';
import type { HardwareActionType } from '@/components/hardware/ActionSelector';
import type { HardwareDeviceType } from '@/components/hardware/DeviceBadge';
import type { GestureType } from './components/GestureCard';

interface CreateGesturePayload {
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
  target_action_type: HardwareActionType;
  target_action_params: Record<string, unknown>;
  description?: string;
}

export default function GesturesPage() {
  const [gestures, setGestures] = useState<HardwareGesture[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [inspectedGesture, setInspectedGesture] = useState<HardwareGesture | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch gestures
  useEffect(() => {
    fetchGestures();
  }, []);

  const fetchGestures = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/hardware/gestures');
      if (!response.ok) {
        throw new Error(`Failed to fetch gestures: ${response.statusText}`);
      }
      const data = await response.json();
      setGestures(data.gestures || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gestures');
      console.error('Error fetching gestures:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create gesture
  const handleCreateGesture = async (payload: CreateGesturePayload) => {
    try {
      setError(null);
      const response = await fetch('/api/hardware/gestures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create gesture: ${response.statusText}`);
      }

      const data = await response.json();
      setGestures([data.gesture, ...gestures]);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create gesture');
      console.error('Error creating gesture:', err);
    }
  };

  // Delete gesture
  const handleDeleteGesture = async (id: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/hardware/gestures?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete gesture: ${response.statusText}`);
      }

      setGestures(gestures.filter((g) => g.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete gesture');
      console.error('Error deleting gesture:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E11] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Hardware Gestures</h1>
              <p className="text-gray-400 text-lg">
                Advanced input patterns for hardware MIDI controllers
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 rounded-xl bg-[#3AA9BE] text-black font-medium hover:bg-[#3AA9BE]/80 transition-all duration-180"
            >
              {showForm ? 'Cancel' : '+ Create Gesture'}
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="px-4 py-2 rounded-lg bg-[#111418] border border-[#2A2C30]">
              <span className="text-gray-400 text-sm">Total Gestures: </span>
              <span className="text-white font-mono font-semibold">{gestures.length}</span>
            </div>
            <div className="px-4 py-2 rounded-lg bg-[#111418] border border-[#2A2C30]">
              <span className="text-gray-400 text-sm">Status: </span>
              <span className="text-[#3AA9BE] font-mono font-semibold">
                {loading ? 'Loading...' : 'Ready'}
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

        {/* Form */}
        {showForm && (
          <div className="mb-8">
            <GestureForm
              onSubmit={handleCreateGesture}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Gesture List */}
        {loading ? (
          <div className="flex items-centre justify-centre py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#3AA9BE] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading gestures...</p>
            </div>
          </div>
        ) : (
          <GestureList
            gestures={gestures}
            onDelete={handleDeleteGesture}
            onInspect={setInspectedGesture}
          />
        )}

        {/* Inspector Modal */}
        <GestureInspector
          gesture={inspectedGesture}
          onClose={() => setInspectedGesture(null)}
        />
      </div>
    </div>
  );
}
