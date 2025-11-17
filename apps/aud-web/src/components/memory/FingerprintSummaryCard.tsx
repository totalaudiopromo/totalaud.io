/**
 * Fingerprint Summary Card
 * Phase 22: Creative Memory Graph UI
 *
 * Displays high-level creative fingerprint summary
 */

'use client';

import type { CreativeFingerprint, OSName } from '@total-audio/core-cmg';

interface FingerprintSummaryCardProps {
  fingerprint: CreativeFingerprint;
}

export function FingerprintSummaryCard({ fingerprint }: FingerprintSummaryCardProps) {
  const { structural, emotional, os, sonic } = fingerprint;

  // Determine dominant arc type
  const arcType =
    structural.peakPosition < 0.4
      ? 'Early Peak'
      : structural.peakPosition > 0.7
        ? 'Late Peak'
        : 'Classic Arc';

  // Format tempo band
  const tempoBand = `${Math.round(sonic.typicalTempoRange[0])}–${Math.round(sonic.typicalTempoRange[1])} BPM`;

  // Get OS name with fallback
  const leadOSName = os.leadOS || 'None';

  // Determine resolution pattern label
  const resolutionLabel = {
    positive: 'Optimistic',
    negative: 'Realistic',
    neutral: 'Balanced',
    ambiguous: 'Complex',
  }[emotional.typicalResolutionPattern];

  const osColours: Record<OSName, string> = {
    ascii: '#00FF00',
    xp: '#0078D7',
    aqua: '#3AA9BE',
    daw: '#FF6B35',
    analogue: '#D4AF37',
  };

  const leadOSColour = os.leadOS ? osColours[os.leadOS] : '#888888';

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Dominant Arc Type */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <div className="text-xs uppercase tracking-wide text-white/60">Dominant Arc Type</div>
        <div className="mt-2 text-xl font-semibold">{arcType}</div>
        <div className="mt-1 text-xs text-white/40">
          Peak at {Math.round(structural.peakPosition * 100)}%
        </div>
      </div>

      {/* Typical Tempo Band */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <div className="text-xs uppercase tracking-wide text-white/60">Typical Tempo</div>
        <div className="mt-2 text-xl font-semibold">{tempoBand}</div>
        <div className="mt-1 text-xs text-white/40 capitalize">{sonic.harmonicPalette} palette</div>
      </div>

      {/* OS That Usually Leads */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <div className="text-xs uppercase tracking-wide text-white/60">Lead OS</div>
        <div className="mt-2 text-xl font-semibold" style={{ colour: leadOSColour }}>
          {leadOSName.toUpperCase()}
        </div>
        <div className="mt-1 text-xs text-white/40">Most frequent campaign starter</div>
      </div>

      {/* Resolution Pattern */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <div className="text-xs uppercase tracking-wide text-white/60">Resolution Style</div>
        <div className="mt-2 text-xl font-semibold">{resolutionLabel}</div>
        <div className="mt-1 text-xs text-white/40">
          {Math.round(emotional.resolutionTendency * 100)}% resolution rate
        </div>
      </div>
    </div>
  );
}
