'use client';

interface FlowScoreBreakdown {
  input_diversity: number;
  gesture_usage: number;
  session_duration: number;
  error_rate: number;
}

interface FlowScoreCardProps {
  flowScore: number;
  breakdown?: FlowScoreBreakdown;
  sessionId?: string;
}

export function FlowScoreCard({ flowScore, breakdown, sessionId }: FlowScoreCardProps) {
  const getScoreColour = (score: number): string => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#3AA9BE'; // Cyan
    if (score >= 40) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const scoreColour = getScoreColour(flowScore);
  const scoreLabel = getScoreLabel(flowScore);

  // Calculate percentage for circular progress
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (flowScore / 100) * circumference;

  return (
    <div className="bg-[#111418] border border-[#2A2C30] rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Creative Flow Score</h3>

      <div className="flex items-centre gap-8 mb-6">
        {/* Circular Score */}
        <div className="relative w-40 h-40 flex-shrink-0">
          <svg className="absolute inset-0 -rotate-90" width="160" height="160">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="#2A2C30"
              strokeWidth="12"
            />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke={scoreColour}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-500"
              style={{
                filter: `drop-shadow(0 0 12px ${scoreColour}40)`,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-centre justify-centre">
            <div className="text-4xl font-mono font-bold" style={{ color: scoreColour }}>
              {flowScore}
            </div>
            <div className="text-sm text-gray-400 mt-1">{scoreLabel}</div>
          </div>
        </div>

        {/* Breakdown */}
        {breakdown && (
          <div className="flex-1 space-y-3">
            {Object.entries(breakdown).map(([key, value]) => {
              const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
              const percentage = Math.round(value);
              const barColour = getScoreColour(percentage);

              return (
                <div key={key}>
                  <div className="flex items-centre justify-between text-sm mb-1">
                    <span className="text-gray-400">{formattedKey}</span>
                    <span className="text-white font-mono font-semibold">{percentage}%</span>
                  </div>
                  <div className="h-2 bg-[#0B0E11] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: barColour,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Session Info */}
      {sessionId && (
        <div className="pt-4 border-t border-[#2A2C30]">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Session ID</div>
          <div className="text-sm text-white font-mono break-all">{sessionId}</div>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 px-4 py-3 rounded-xl bg-[#3AA9BE]/10 border border-[#3AA9BE]">
        <p className="text-xs text-[#3AA9BE]">
          <strong>Flow Score</strong> measures creative productivity based on input diversity,
          gesture usage, session duration, and error rate. Higher scores indicate more efficient
          hardware control patterns.
        </p>
      </div>
    </div>
  );
}
