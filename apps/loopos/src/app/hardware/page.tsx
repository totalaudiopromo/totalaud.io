'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface HardwareSession {
  id: string;
  device_type: string;
  started_at: string;
  ended_at: string | null;
  total_actions: number;
  flow_mode_enabled: boolean;
}

export default function HardwarePage() {
  const [activeSession, setActiveSession] = useState<HardwareSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActiveSession();
  }, []);

  const fetchActiveSession = async () => {
    try {
      const response = await fetch('/api/hardware/sessions?active=true');
      const data = await response.json();

      if (data.success && data.sessions.length > 0) {
        setActiveSession(data.sessions[0]);
      }
    } catch (error) {
      console.error('Error fetching active session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1113] text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Hardware Control Layer</h1>
          <p className="text-gray-400">
            Connect and control TotalAud.io with hardware MIDI controllers
          </p>
        </div>

        {/* Active Session Status */}
        {!isLoading && (
          <div className="mb-8 p-6 rounded-lg border border-gray-800 bg-black/20">
            <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
            {activeSession ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#3AA9BE] animate-pulse" />
                  <span className="text-[#3AA9BE] font-medium">Connected</span>
                </div>
                <p className="text-gray-400">
                  Device: <span className="text-white">{activeSession.device_type.toUpperCase()}</span>
                </p>
                <p className="text-gray-400">
                  Actions: <span className="text-white">{activeSession.total_actions}</span>
                </p>
                {activeSession.flow_mode_enabled && (
                  <div className="mt-2 px-3 py-1 rounded-full bg-[#3AA9BE]/20 text-[#3AA9BE] text-sm w-fit">
                    Flow Mode Active
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-gray-600" />
                <span className="text-gray-400">No active session</span>
              </div>
            )}
          </div>
        )}

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Devices */}
          <Link href="/hardware/devices">
            <div className="p-6 rounded-lg border border-gray-800 bg-black/20 hover:border-[#3AA9BE] transition-all cursor-pointer group">
              <div className="text-3xl mb-4">🎛️</div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-[#3AA9BE] transition-colors">
                Devices
              </h3>
              <p className="text-gray-400 text-sm">
                Connect Push 2, Launchpad, MPK Mini, or generic MIDI controllers
              </p>
            </div>
          </Link>

          {/* Mappings */}
          <Link href="/hardware/mappings">
            <div className="p-6 rounded-lg border border-gray-800 bg-black/20 hover:border-[#3AA9BE] transition-all cursor-pointer group">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-[#3AA9BE] transition-colors">
                Mappings
              </h3>
              <p className="text-gray-400 text-sm">
                Map pads, encoders, and buttons to TotalAud.io actions
              </p>
            </div>
          </Link>

          {/* Flow Mode */}
          <Link href="/hardware/flow-mode">
            <div className="p-6 rounded-lg border border-gray-800 bg-black/20 hover:border-[#3AA9BE] transition-all cursor-pointer group">
              <div className="text-3xl mb-4">🌊</div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-[#3AA9BE] transition-colors">
                Flow Mode
              </h3>
              <p className="text-gray-400 text-sm">
                Cinematic, uninterrupted hardware-driven workflow
              </p>
            </div>
          </Link>

          {/* Sessions */}
          <Link href="/hardware/sessions">
            <div className="p-6 rounded-lg border border-gray-800 bg-black/20 hover:border-[#3AA9BE] transition-all cursor-pointer group">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-[#3AA9BE] transition-colors">
                Sessions
              </h3>
              <p className="text-gray-400 text-sm">
                View session history and usage statistics
              </p>
            </div>
          </Link>

          {/* Test & Monitor */}
          <div className="p-6 rounded-lg border border-gray-800 bg-black/20 hover:border-[#3AA9BE] transition-all cursor-pointer group opacity-50">
            <div className="text-3xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-[#3AA9BE] transition-colours">
              Test & Monitor
            </h3>
            <p className="text-gray-400 text-sm">MIDI monitor and LED test patterns (Coming soon)</p>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="mt-12 p-6 rounded-lg border border-gray-800 bg-black/10">
          <h2 className="text-2xl font-semibold mb-4">Quick Start</h2>
          <ol className="space-y-3 text-gray-300">
            <li className="flex gap-3">
              <span className="text-[#3AA9BE] font-mono">1.</span>
              <span>Connect your hardware controller via USB</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#3AA9BE] font-mono">2.</span>
              <span>Navigate to Devices and select your controller type</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#3AA9BE] font-mono">3.</span>
              <span>Configure mappings for pads, encoders, and buttons</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#3AA9BE] font-mono">4.</span>
              <span>Start a session and control TotalAud.io with hardware</span>
            </li>
          </ol>
        </div>

        {/* Supported Devices */}
        <div className="mt-8 p-6 rounded-lg border border-gray-800 bg-black/10">
          <h2 className="text-2xl font-semibold mb-4">Supported Devices</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#3AA9BE]" />
              <span>Ableton Push 2</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#3AA9BE]" />
              <span>Ableton Push 3</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#3AA9BE]" />
              <span>Novation Launchpad Pro</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#3AA9BE]" />
              <span>AKAI MPK Mini</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-gray-600" />
              <span>Generic MIDI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
