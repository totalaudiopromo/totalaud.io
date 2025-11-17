/**
 * Creative Memory Timeline
 * Phase 22: Universal Creative Memory Graph
 *
 * Purpose:
 * - Visualise cross-campaign creative memory graph
 * - Display OS drift, structural motifs, and emotional patterns
 * - Explore creative fingerprint over time
 */

'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/client';
import type {
  TimelineBucket,
  CreativeFingerprint,
  StructuralMotif,
  OSDriftData,
  OSName,
} from '@total-audio/core-cmg';

// Components (to be created)
import { CreativeMemoryTimelineCanvas } from '@aud-web/components/memory/CreativeMemoryTimelineCanvas';
import { OSDriftPanel } from '@aud-web/components/memory/OSDriftPanel';
import { StructuralMotifsPanel } from '@aud-web/components/memory/StructuralMotifsPanel';
import { EmotionalArcPanel } from '@aud-web/components/memory/EmotionalArcPanel';
import { FingerprintSummaryCard } from '@aud-web/components/memory/FingerprintSummaryCard';

const log = logger.scope('CreativeMemoryTimeline');

export default function CreativeMemoryTimelinePage() {
  const router = useRouter();

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Data state
  const [timelineBuckets, setTimelineBuckets] = useState<TimelineBucket[]>([]);
  const [fingerprint, setFingerprint] = useState<CreativeFingerprint | null>(null);
  const [motifs, setMotifs] = useState<StructuralMotif[]>([]);
  const [osDrift, setOSDrift] = useState<Record<OSName, OSDriftData>>({} as any);
  const [selectedWindow, setSelectedWindow] = useState<string>('90d');

  /**
   * Initialise authentication
   */
  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setIsAuthenticated(true);
          setUserId(user.id);
          log.info('User authenticated', { userId: user.id });
        } else {
          log.warn('User not authenticated, redirecting to home');
          router.push('/');
          return;
        }
      } catch (error) {
        log.error('Error checking authentication', error as Error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  /**
   * Load creative memory data
   */
  useEffect(() => {
    if (!userId) return;

    async function loadData() {
      try {
        log.info('Loading creative memory data', { userId, window: selectedWindow });

        // Fetch timeline buckets
        const timelineRes = await fetch(`/api/cmg/timeline?window=${selectedWindow}`);
        if (timelineRes.ok) {
          const data = await timelineRes.json();
          setTimelineBuckets(data.buckets || []);
        }

        // Fetch fingerprint
        const fingerprintRes = await fetch(`/api/cmg/fingerprint?window=${selectedWindow}`);
        if (fingerprintRes.ok) {
          const data = await fingerprintRes.json();
          setFingerprint(data.fingerprint);
        }

        // Fetch motifs
        const motifsRes = await fetch(`/api/cmg/motifs?window=${selectedWindow}`);
        if (motifsRes.ok) {
          const data = await motifsRes.json();
          setMotifs(data.motifs || []);
        }

        // Fetch OS drift for each OS
        const osNames: OSName[] = ['ascii', 'xp', 'aqua', 'daw', 'analogue'];
        const driftData: Record<OSName, OSDriftData> = {} as any;

        for (const os of osNames) {
          const driftRes = await fetch(`/api/cmg/os-drift?os=${os}&window=${selectedWindow}`);
          if (driftRes.ok) {
            const data = await driftRes.json();
            driftData[os] = data.drift;
          }
        }

        setOSDrift(driftData);

        log.info('Creative memory data loaded successfully');
      } catch (error) {
        log.error('Error loading creative memory data', error as Error);
      }
    }

    loadData();
  }, [userId, selectedWindow]);

  if (loading) {
    return (
      <div className="flex h-screen items-centre justify-centre bg-[#0F1113] text-white">
        <div className="animate-pulse">Loading creative memory...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0F1113] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0F1113]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-centre justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Creative Memory Timeline</h1>
              <p className="mt-1 text-sm text-white/60">
                Explore patterns and evolution across all campaigns
              </p>
            </div>

            {/* Window selector */}
            <div className="flex items-centre gap-2">
              <label className="text-sm text-white/60">Window:</label>
              <select
                value={selectedWindow}
                onChange={(e) => setSelectedWindow(e.target.value)}
                className="rounded-md border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white outline-none transition-colours hover:bg-white/10 focus:border-[#3AA9BE] focus:ring-1 focus:ring-[#3AA9BE]"
              >
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="6m">Last 6 months</option>
                <option value="1y">Last year</option>
                <option value="lifetime">All time</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Fingerprint Summary */}
          {fingerprint && (
            <section>
              <h2 className="mb-4 text-lg font-medium">Creative Fingerprint</h2>
              <FingerprintSummaryCard fingerprint={fingerprint} />
            </section>
          )}

          {/* Timeline Canvas */}
          <section>
            <h2 className="mb-4 text-lg font-medium">Memory Timeline</h2>
            <CreativeMemoryTimelineCanvas buckets={timelineBuckets} />
          </section>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left column: OS Drift */}
            <section>
              <h2 className="mb-4 text-lg font-medium">OS Evolution</h2>
              <OSDriftPanel osDrift={osDrift} />
            </section>

            {/* Right column: Structural Motifs */}
            <section>
              <h2 className="mb-4 text-lg font-medium">Structural Motifs</h2>
              <StructuralMotifsPanel motifs={motifs} />
            </section>
          </div>

          {/* Emotional Arc */}
          {fingerprint && (
            <section>
              <h2 className="mb-4 text-lg font-medium">Emotional Patterns</h2>
              <EmotionalArcPanel emotional={fingerprint.emotional} />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
