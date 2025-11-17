/**
 * Creative Memory Timeline Canvas
 * Phase 22: Creative Memory Graph UI
 *
 * Horizontal timeline of major nodes (memories, evolution events, outcomes)
 * Grouped by month or campaign with zoom/pan controls
 */

'use client';

import { useState } from 'react';
import type { TimelineBucket, OSName, CMGNode } from '@total-audio/core-cmg';

interface CreativeMemoryTimelineCanvasProps {
  buckets: TimelineBucket[];
}

export function CreativeMemoryTimelineCanvas({ buckets }: CreativeMemoryTimelineCanvasProps) {
  const [selectedBucket, setSelectedBucket] = useState<TimelineBucket | null>(null);

  const osColours: Record<OSName, string> = {
    ascii: '#00FF00',
    xp: '#0078D7',
    aqua: '#3AA9BE',
    daw: '#FF6B35',
    analogue: '#D4AF37',
  };

  const sentimentColours = {
    positive: '#22C55E',
    neutral: '#64748B',
    negative: '#EF4444',
    mixed: '#F59E0B',
  };

  if (buckets.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-12 text-centre backdrop-blur-sm">
        <div className="mb-2 text-sm font-medium text-white/60">No timeline data yet</div>
        <div className="text-xs text-white/40">
          Create campaigns and memories to build your creative timeline
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      {/* Timeline */}
      <div className="space-y-4">
        {buckets.map((bucket, bucketIdx) => {
          const isSelected = selectedBucket?.startDate === bucket.startDate;

          return (
            <div key={bucket.startDate} className="group">
              {/* Bucket header */}
              <div className="mb-2 flex items-centre justify-between">
                <button
                  onClick={() => setSelectedBucket(isSelected ? null : bucket)}
                  className="flex items-centre gap-2 text-sm font-medium text-white/80 transition-colours hover:text-white"
                >
                  <span className="text-base">{isSelected ? '▼' : '▶'}</span>
                  <span>{bucket.label}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-mono text-white/60">
                    {bucket.stats.totalNodes}
                  </span>
                </button>

                <div className="flex items-centre gap-2 text-xs text-white/40">
                  <span>Avg importance:</span>
                  <span className="font-mono">
                    {bucket.stats.averageImportance.toFixed(1)}/5
                  </span>
                </div>
              </div>

              {/* Bucket timeline bar */}
              <div className="relative h-12 overflow-hidden rounded-md border border-white/10 bg-white/5">
                {/* Nodes as markers */}
                <div className="flex h-full items-centre gap-1 px-2">
                  {bucket.nodes.slice(0, 30).map((node, nodeIdx) => {
                    const os = node.os;
                    const colour = os
                      ? osColours[os]
                      : sentimentColours[node.sentiment || 'neutral'];

                    const size =
                      node.importance === 5
                        ? 'h-8 w-8'
                        : node.importance === 4
                          ? 'h-6 w-6'
                          : 'h-4 w-4';

                    return (
                      <div
                        key={node.id}
                        className={`${size} shrink-0 rounded-full transition-all hover:scale-125`}
                        style={{
                          backgroundColor: colour,
                          opacity: 0.8,
                        }}
                        title={node.label}
                      />
                    );
                  })}
                  {bucket.nodes.length > 30 && (
                    <div className="ml-2 text-xs text-white/40">
                      +{bucket.nodes.length - 30} more
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {isSelected && (
                <div className="mt-3 space-y-2 rounded-md border border-white/10 bg-white/5 p-4">
                  <div className="mb-3 text-xs font-medium uppercase tracking-wide text-white/60">
                    Nodes in this period
                  </div>

                  <div className="max-h-96 space-y-2 overflow-y-auto">
                    {bucket.nodes.map((node) => {
                      const os = node.os;
                      const colour = os
                        ? osColours[os]
                        : sentimentColours[node.sentiment || 'neutral'];

                      return (
                        <div
                          key={node.id}
                          className="flex items-start gap-3 rounded-md border border-white/10 bg-white/5 p-3 text-sm"
                        >
                          <div
                            className="mt-1 h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: colour }}
                          />

                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-medium text-white">{node.label}</div>
                              <div className="flex items-centre gap-2">
                                <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs font-mono text-white/60">
                                  {node.nodeType}
                                </span>
                                <span className="text-xs text-white/40">
                                  {node.importance}/5
                                </span>
                              </div>
                            </div>

                            <div className="mt-1 text-xs text-white/40">
                              {new Date(node.occurredAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="border-t border-white/10 pt-4">
        <div className="text-xs font-medium uppercase tracking-wide text-white/60">Legend</div>
        <div className="mt-2 flex flex-wrap gap-3 text-xs">
          {Object.entries(osColours).map(([os, colour]) => (
            <div key={os} className="flex items-centre gap-1.5">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: colour }} />
              <span className="text-white/60">{os.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
