/**
 * OS Drift Panel
 * Phase 22: Creative Memory Graph UI
 *
 * Shows OS confidence/empathy/risk over time
 */

'use client';

import type { OSDriftData, OSName } from '@total-audio/core-cmg';

interface OSDriftPanelProps {
  osDrift: Record<OSName, OSDriftData>;
}

export function OSDriftPanel({ osDrift }: OSDriftPanelProps) {
  const osNames: OSName[] = ['ascii', 'xp', 'aqua', 'daw', 'analogue'];

  const osColours: Record<OSName, string> = {
    ascii: '#00FF00',
    xp: '#0078D7',
    aqua: '#3AA9BE',
    daw: '#FF6B35',
    analogue: '#D4AF37',
  };

  const osLabels: Record<OSName, string> = {
    ascii: 'ASCII',
    xp: 'XP',
    aqua: 'AQUA',
    daw: 'DAW',
    analogue: 'ANALOGUE',
  };

  const trendIcons = {
    increasing: '↗',
    decreasing: '↘',
    stable: '→',
  };

  // Check if we have any data
  const hasData = osNames.some((os) => osDrift[os]?.timeSeries?.length > 0);

  if (!hasData) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-centre backdrop-blur-sm">
        <div className="text-sm text-white/40">
          No OS activity data yet. Create campaigns to track OS evolution.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <h3 className="mb-4 text-sm font-medium text-white/80">OS Activity & Drift</h3>

      <div className="space-y-4">
        {osNames.map((os) => {
          const drift = osDrift[os];
          if (!drift || drift.timeSeries.length === 0) {
            return null;
          }

          // Get latest metrics
          const latest = drift.timeSeries[drift.timeSeries.length - 1];
          const trend = drift.trend;

          return (
            <div
              key={os}
              className="rounded-md border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20"
            >
              <div className="mb-3 flex items-centre justify-between">
                <div className="flex items-centre gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: osColours[os] }}
                  />
                  <span className="font-medium" style={{ colour: osColours[os] }}>
                    {osLabels[os]}
                  </span>
                </div>

                <div className="flex items-centre gap-2 text-xs text-white/60">
                  <span>Trend</span>
                  <span className="text-base">{trendIcons[trend]}</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-white/40">Confidence</div>
                  <div className="mt-1 font-mono text-sm text-white">
                    {Math.round(latest.confidence * 100)}%
                  </div>
                </div>
                <div>
                  <div className="text-white/40">Empathy</div>
                  <div className="mt-1 font-mono text-sm text-white">
                    {Math.round(latest.empathy * 100)}%
                  </div>
                </div>
                <div>
                  <div className="text-white/40">Risk</div>
                  <div className="mt-1 font-mono text-sm text-white">
                    {Math.round(latest.risk * 100)}%
                  </div>
                </div>
              </div>

              {/* Mini sparkline (simple bars) */}
              <div className="mt-3 flex items-end gap-px" style={{ height: '32px' }}>
                {drift.timeSeries.slice(-20).map((point, idx) => {
                  const height = point.confidence * 100;
                  return (
                    <div
                      key={idx}
                      className="flex-1 rounded-t-sm transition-all"
                      style={{
                        height: `${height}%`,
                        backgroundColor: osColours[os],
                        opacity: 0.6,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
