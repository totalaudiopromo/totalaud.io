'use client';

import { CyanPulse } from '@/components/hardware/CyanPulse';

interface LearnModePanelProps {
  isActive: boolean;
  inputCount: number;
  onToggle: () => void;
}

export function LearnModePanel({ isActive, inputCount, onToggle }: LearnModePanelProps) {
  return (
    <div className="bg-[#111418] border border-[#2A2C30] rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-centre gap-3">
          <CyanPulse active={isActive} size="lg" />
          <div>
            <h2 className="text-2xl font-semibold text-white mb-1">Learn Mode</h2>
            <p className="text-sm text-gray-400">
              {isActive ? 'Listening for hardware inputs...' : 'Press any control to begin'}
            </p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-240 ${
            isActive
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-[#3AA9BE] text-black hover:bg-[#3AA9BE]/80'
          }`}
        >
          {isActive ? 'Stop Learning' : 'Start Learning'}
        </button>
      </div>

      {/* Status */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="px-4 py-3 rounded-xl bg-[#0B0E11] border border-[#2A2C30]">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</div>
          <div className={`text-lg font-mono font-semibold ${isActive ? 'text-[#3AA9BE]' : 'text-gray-400'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </div>
        </div>
        <div className="px-4 py-3 rounded-xl bg-[#0B0E11] border border-[#2A2C30]">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Inputs Detected</div>
          <div className="text-lg font-mono font-semibold text-white">{inputCount}</div>
        </div>
        <div className="px-4 py-3 rounded-xl bg-[#0B0E11] border border-[#2A2C30]">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Mode</div>
          <div className="text-lg font-mono font-semibold text-white">Auto-Map</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="px-4 py-3 rounded-xl bg-[#3AA9BE]/10 border border-[#3AA9BE]">
        <h3 className="text-sm font-semibold text-[#3AA9BE] uppercase tracking-wide mb-2">
          How It Works
        </h3>
        <ol className="text-sm text-white space-y-2">
          <li className="flex gap-2">
            <span className="text-[#3AA9BE] font-mono">1.</span>
            <span>Click "Start Learning" to activate Learn Mode</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#3AA9BE] font-mono">2.</span>
            <span>Press any button, pad, or encoder on your hardware controller</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#3AA9BE] font-mono">3.</span>
            <span>The input will appear in the Pending Inputs list below</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#3AA9BE] font-mono">4.</span>
            <span>Click "Map Action" to assign a TotalAud.io action to that input</span>
          </li>
          <li className="flex gap-2">
            <span className="text-[#3AA9BE] font-mono">5.</span>
            <span>The mapping is saved automatically and immediately active</span>
          </li>
        </ol>
      </div>

      {/* Tips */}
      {isActive && (
        <div className="mt-6 px-4 py-3 rounded-xl bg-yellow-900/20 border border-yellow-600">
          <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wide mb-2">
            💡 Tips
          </h3>
          <ul className="text-sm text-yellow-200 space-y-1">
            <li>• Press controls slowly to avoid duplicate detections</li>
            <li>• Encoders will show their current value (0-127)</li>
            <li>• Velocity-sensitive pads show pressure values</li>
            <li>• Clear inputs you don't want to map before stopping</li>
          </ul>
        </div>
      )}
    </div>
  );
}
