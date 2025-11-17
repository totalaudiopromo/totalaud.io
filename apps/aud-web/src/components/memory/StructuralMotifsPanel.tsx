/**
 * Structural Motifs Panel
 * Phase 22: Creative Memory Graph UI
 *
 * Lists detected structural motifs with recurrence counts
 */

'use client';

import type { StructuralMotif } from '@total-audio/core-cmg';

interface StructuralMotifsPanelProps {
  motifs: StructuralMotif[];
}

export function StructuralMotifsPanel({ motifs }: StructuralMotifsPanelProps) {
  if (motifs.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-centre backdrop-blur-sm">
        <div className="text-sm text-white/40">
          No structural motifs detected yet. Create more campaigns to reveal patterns.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <h3 className="mb-4 text-sm font-medium text-white/80">Recurring Patterns</h3>

      <div className="space-y-3">
        {motifs.map((motif) => (
          <div
            key={motif.id}
            className="group rounded-md border border-white/10 bg-white/5 p-4 transition-all hover:border-[#3AA9BE]/50 hover:bg-white/10"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-centre gap-2">
                  <h4 className="font-medium text-white">{motif.name}</h4>
                  <div className="rounded-full bg-[#3AA9BE]/20 px-2 py-0.5 text-xs font-mono text-[#3AA9BE]">
                    ×{motif.recurrenceCount}
                  </div>
                </div>
                <p className="mt-1 text-sm text-white/60">{motif.description}</p>

                {/* Pattern visualisation (simplified) */}
                {motif.pattern.length > 0 && (
                  <div className="mt-3 flex items-centre gap-2">
                    {motif.pattern.map((step, idx) => (
                      <div key={idx} className="flex items-centre gap-1">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            step.sentiment === 'positive'
                              ? 'bg-green-500'
                              : step.sentiment === 'negative'
                                ? 'bg-red-500'
                                : step.sentiment === 'mixed'
                                  ? 'bg-amber-500'
                                  : 'bg-slate-500'
                          }`}
                        />
                        {idx < motif.pattern.length - 1 && (
                          <div className="h-px w-3 bg-white/20" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Strength indicator */}
              <div className="ml-4 flex flex-col items-end">
                <div className="text-xs text-white/40">Strength</div>
                <div className="mt-1 text-sm font-semibold text-white">
                  {Math.round(motif.averageStrength * 100)}%
                </div>
              </div>
            </div>

            {/* Campaign count */}
            <div className="mt-3 border-t border-white/10 pt-2 text-xs text-white/40">
              Appears in {motif.campaignIds.length} campaign
              {motif.campaignIds.length !== 1 ? 's' : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
