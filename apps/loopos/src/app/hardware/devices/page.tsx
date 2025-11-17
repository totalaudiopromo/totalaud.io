'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type DeviceType = 'push2' | 'push3' | 'launchpad' | 'mpk' | 'generic_midi';

interface Device {
  type: DeviceType;
  name: string;
  description: string;
  icon: string;
  features: string[];
}

const DEVICES: Device[] = [
  {
    type: 'push2',
    name: 'Ableton Push 2',
    description: '8x8 RGB pad grid, 8 encoders, touch strip',
    icon: '🎹',
    features: ['64 RGB pads', '8 rotary encoders', 'Touch strip', 'Full LED feedback'],
  },
  {
    type: 'push3',
    name: 'Ableton Push 3',
    description: 'Latest Push with standalone mode support',
    icon: '🎛️',
    features: ['64 RGB pads', '8 rotary encoders', 'MPE support', 'Standalone mode (stub)'],
  },
  {
    type: 'launchpad',
    name: 'Novation Launchpad Pro',
    description: '8x8 velocity-sensitive RGB pads',
    icon: '🟩',
    features: ['64 RGB pads', 'Scene buttons', 'Programmer mode', 'Velocity sensitive'],
  },
  {
    type: 'mpk',
    name: 'AKAI MPK Mini',
    description: '8 pads, 8 knobs, 25 keys',
    icon: '🎼',
    features: ['8 pads', '8 rotary knobs', '25 keys', 'Compact design'],
  },
  {
    type: 'generic_midi',
    name: 'Generic MIDI Controller',
    description: 'Any MIDI controller with basic mapping',
    icon: '🎚️',
    features: ['Note mapping', 'CC mapping', 'Basic feedback', 'Universal compatibility'],
  },
];

export default function DevicesPage() {
  const router = useRouter();
  const [selectedDevice, setSelectedDevice] = useState<DeviceType | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!selectedDevice) return;

    setIsConnecting(true);
    setError(null);

    try {
      // Connect to device
      const response = await fetch('/api/hardware/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceType: selectedDevice,
          deviceId: `${selectedDevice}-${Date.now()}`,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Connection failed');
      }

      // Start session
      const sessionResponse = await fetch('/api/hardware/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceType: selectedDevice,
          profileId: data.profileId,
          metadata: { connectedAt: new Date().toISOString() },
        }),
      });

      const sessionData = await sessionResponse.json();

      if (!sessionData.success) {
        throw new Error(sessionData.error || 'Failed to start session');
      }

      // Navigate to mappings
      router.push('/hardware/mappings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1113] text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/hardware')}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold mb-2">Connect Hardware Device</h1>
          <p className="text-gray-400">Select your MIDI controller to begin</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-900 text-red-400">
            {error}
          </div>
        )}

        {/* Device Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {DEVICES.map((device) => (
            <div
              key={device.type}
              onClick={() => setSelectedDevice(device.type)}
              className={`p-6 rounded-lg border cursor-pointer transition-all ${
                selectedDevice === device.type
                  ? 'border-[#3AA9BE] bg-[#3AA9BE]/10'
                  : 'border-gray-800 bg-black/20 hover:border-gray-700'
              }`}
            >
              <div className="text-4xl mb-4">{device.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{device.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{device.description}</p>
              <ul className="space-y-1">
                {device.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="text-[#3AA9BE]">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Connect Button */}
        {selectedDevice && (
          <div className="flex justify-center">
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all ${
                isConnecting
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-[#3AA9BE] text-black hover:bg-[#3AA9BE]/90'
              }`}
            >
              {isConnecting ? 'Connecting...' : 'Connect Device'}
            </button>
          </div>
        )}

        {/* Web MIDI Note */}
        <div className="mt-12 p-6 rounded-lg border border-gray-800 bg-black/10">
          <h2 className="text-lg font-semibold mb-2">Web MIDI API Required</h2>
          <p className="text-gray-400 text-sm">
            This feature requires the Web MIDI API. Make sure your browser supports it and you've
            granted MIDI access permissions. Chrome, Edge, and Opera are recommended.
          </p>
        </div>
      </div>
    </div>
  );
}
