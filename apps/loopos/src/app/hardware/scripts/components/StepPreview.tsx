'use client';

import { JSONViewer } from '@/components/hardware/JSONViewer';

interface ScriptStep {
  action_type: string;
  action_params: Record<string, unknown>;
  delay_ms?: number;
  condition?: string;
}

interface StepPreviewProps {
  steps: ScriptStep[];
  currentStepIndex?: number;
}

export function StepPreview({ steps, currentStepIndex }: StepPreviewProps) {
  if (steps.length === 0) {
    return (
      <div className="bg-[#111418] border border-[#2A2C30] rounded-xl p-8 text-centre">
        <div className="text-4xl mb-2">📝</div>
        <p className="text-gray-400">No steps defined yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {steps.map((step, idx) => {
        const isActive = currentStepIndex === idx;
        const isPast = currentStepIndex !== undefined && idx < currentStepIndex;
        const isFuture = currentStepIndex !== undefined && idx > currentStepIndex;

        return (
          <div
            key={idx}
            className={`bg-[#111418] border rounded-xl p-4 transition-all duration-240 ${
              isActive
                ? 'border-[#3AA9BE] shadow-lg shadow-[#3AA9BE]/20'
                : isPast
                ? 'border-[#2A2C30] opacity-60'
                : 'border-[#2A2C30]'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Step Number */}
              <div
                className={`w-10 h-10 rounded-full flex items-centre justify-centre font-mono font-semibold flex-shrink-0 ${
                  isActive
                    ? 'bg-[#3AA9BE] text-black'
                    : isPast
                    ? 'bg-green-600 text-white'
                    : 'bg-[#1A1C20] text-gray-400'
                }`}
              >
                {isPast ? '✓' : idx + 1}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="text-white font-mono font-semibold mb-1">
                      {step.action_type}
                    </h4>
                    {step.condition && (
                      <div className="text-xs text-yellow-400 mb-2">
                        Condition: <span className="font-mono">{step.condition}</span>
                      </div>
                    )}
                  </div>
                  {step.delay_ms !== undefined && step.delay_ms > 0 && (
                    <div className="ml-4 px-3 py-1 rounded-lg bg-[#1A1C20] border border-[#2A2C30]">
                      <span className="text-xs text-gray-400">Delay: </span>
                      <span className="text-sm text-[#3AA9BE] font-mono">
                        {step.delay_ms}ms
                      </span>
                    </div>
                  )}
                </div>

                {/* Parameters */}
                {Object.keys(step.action_params).length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Parameters
                    </div>
                    <JSONViewer data={step.action_params} />
                  </div>
                )}
              </div>
            </div>

            {/* Progress Indicator for Active Step */}
            {isActive && (
              <div className="mt-3 pt-3 border-t border-[#2A2C30]">
                <div className="flex items-centre gap-2 text-[#3AA9BE]">
                  <div className="w-2 h-2 rounded-full bg-[#3AA9BE] animate-pulse" />
                  <span className="text-xs font-mono">Executing...</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
