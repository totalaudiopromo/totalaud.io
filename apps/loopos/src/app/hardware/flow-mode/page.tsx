'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FlowModePage() {
  const router = useRouter();
  const [isFlowMode, setIsFlowMode] = useState(false);

  const toggleFlowMode = () => {
    setIsFlowMode(!isFlowMode);
    // In a real implementation, this would communicate with the HCL
  };

  return (
    <div className={`min-h-screen p-8 transition-all duration-400 ${
      isFlowMode ? 'bg-black' : 'bg-[#0F1113]'
    }`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        {!isFlowMode && (
          <div className="mb-8">
            <button
              onClick={() => router.push('/hardware')}
              className="text-gray-400 hover:text-white mb-4 flex items-centre gap-2"
            >
              ← Back
            </button>
            <h1 className="text-4xl font-bold mb-2 text-white">Flow Mode</h1>
            <p className="text-gray-400">
              Cinematic, hardware-driven workflow with minimal UI distractions
            </p>
          </div>
        )}

        {/* Flow Mode Toggle */}
        <div className="text-centre py-12">
          <div className="mb-8">
            <div className={`text-8xl mb-6 transition-all ${
              isFlowMode ? 'animate-pulse' : ''
            }`}>
              🌊
            </div>
            <h2 className={`text-3xl font-bold mb-4 transition-colours ${
              isFlowMode ? 'text-[#3AA9BE]' : 'text-white'
            }`}>
              {isFlowMode ? 'Flow Mode Active' : 'Enter Flow Mode'}
            </h2>
            <p className={`transition-colours ${
              isFlowMode ? 'text-[#3AA9BE]/70' : 'text-gray-400'
            }`}>
              {isFlowMode
                ? 'Hardware controls are now your primary interface'
                : 'Dim the UI and work entirely with your hardware controller'}
            </p>
          </div>

          <button
            onClick={toggleFlowMode}
            className={`px-12 py-6 rounded-lg text-xl font-semibold transition-all ${
              isFlowMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-[#3AA9BE] text-black hover:bg-[#3AA9BE]/90'
            }`}
          >
            {isFlowMode ? 'Exit Flow Mode' : 'Enter Flow Mode'}
          </button>
        </div>

        {/* Flow Mode Features */}
        {!isFlowMode && (
          <div className="mt-12 space-y-6">
            <h3 className="text-2xl font-semibold text-white">What is Flow Mode?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-lg border border-gray-800 bg-black/20">
                <h4 className="text-lg font-semibold mb-2 text-white">Minimal UI</h4>
                <p className="text-gray-400 text-sm">
                  Interface dims to let you focus on music and creativity
                </p>
              </div>
              <div className="p-6 rounded-lg border border-gray-800 bg-black/20">
                <h4 className="text-lg font-semibold mb-2 text-white">Hardware First</h4>
                <p className="text-gray-400 text-sm">
                  All controls mapped to your MIDI controller
                </p>
              </div>
              <div className="p-6 rounded-lg border border-gray-800 bg-black/20">
                <h4 className="text-lg font-semibold mb-2 text-white">LED Feedback</h4>
                <p className="text-gray-400 text-sm">
                  Cyan glow patterns indicate active mappings
                </p>
              </div>
              <div className="p-6 rounded-lg border border-gray-800 bg-black/20">
                <h4 className="text-lg font-semibold mb-2 text-white">Uninterrupted</h4>
                <p className="text-gray-400 text-sm">
                  Work for hours without touching mouse or keyboard
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
