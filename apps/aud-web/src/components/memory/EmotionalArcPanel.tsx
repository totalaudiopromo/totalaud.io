/**
 * Emotional Arc Panel
 * Phase 22: Creative Memory Graph UI
 *
 * Displays emotional fingerprint summary
 */

'use client';

import type { EmotionalFingerprint } from '@total-audio/core-cmg';

interface EmotionalArcPanelProps {
  emotional: EmotionalFingerprint;
}

export function EmotionalArcPanel({ emotional }: EmotionalArcPanelProps) {
  const sentiments = [
    { label: 'Positive', ratio: emotional.positiveRatio, colour: '#22C55E' },
    { label: 'Neutral', ratio: emotional.neutralRatio, colour: '#64748B' },
    { label: 'Negative', ratio: emotional.negativeRatio, colour: '#EF4444' },
    { label: 'Mixed', ratio: emotional.mixedRatio, colour: '#F59E0B' },
  ];

  // Volatility indicator
  const volatilityLabel =
    emotional.volatility > 0.7
      ? 'High'
      : emotional.volatility > 0.4
        ? 'Moderate'
        : 'Low';

  const volatilityColour =
    emotional.volatility > 0.7
      ? '#EF4444'
      : emotional.volatility > 0.4
        ? '#F59E0B'
        : '#22C55E';

  return (
    <div className="space-y-6 rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      {/* Sentiment Distribution */}
      <div>
        <h3 className="mb-4 text-sm font-medium text-white/80">Sentiment Distribution</h3>
        <div className="space-y-3">
          {sentiments.map((sentiment) => (
            <div key={sentiment.label}>
              <div className="mb-1 flex items-centre justify-between text-sm">
                <span className="text-white/60">{sentiment.label}</span>
                <span className="font-mono text-white/80">{Math.round(sentiment.ratio * 100)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${sentiment.ratio * 100}%`,
                    backgroundColor: sentiment.colour,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-white/60">Volatility</div>
          <div
            className="mt-1 text-lg font-semibold"
            style={{ colour: volatilityColour }}
          >
            {volatilityLabel}
          </div>
          <div className="mt-0.5 text-xs text-white/40">
            {Math.round(emotional.volatility * 100)}%
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wide text-white/60">Resolution Rate</div>
          <div className="mt-1 text-lg font-semibold">
            {Math.round(emotional.resolutionTendency * 100)}%
          </div>
          <div className="mt-0.5 text-xs text-white/40">
            Negative → Positive
          </div>
        </div>
      </div>
    </div>
  );
}
