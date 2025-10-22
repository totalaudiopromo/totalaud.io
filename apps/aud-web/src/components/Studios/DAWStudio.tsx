/**
 * DAW Studio
 *
 * Metaphor: Timeline
 * Layout: Sequencer-style horizontal flow
 * Interaction: Sequencing, tempo-synced
 * Node Visibility: Nodes appear as timeline segments/clips
 *
 * The DAW Studio is for experimental producers who think in time.
 * Everything syncs to 120 BPM, and workflows are arranged horizontally.
 *
 * Phase 6: OS Studio Refactor
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { BaseWorkflow, type WorkflowState, type WorkflowActions } from '../BaseWorkflow';
import { AmbientSound } from '../Ambient/AmbientSound';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Plus,
  Settings,
  Clock,
  Activity,
} from 'lucide-react';
import type { FlowTemplate } from '@total-audio/core-agent-executor/client';

interface DAWStudioProps {
  initialTemplate?: FlowTemplate | null;
}

interface Track {
  id: string;
  name: string;
  color: string;
  clips: Clip[];
}

interface Clip {
  id: string;
  start: number;
  duration: number;
  label: string;
  status: 'idle' | 'running' | 'complete';
}

const BPM = 120;
const BEAT_DURATION = (60 / BPM) * 1000; // ms per beat

export function DAWStudio({ initialTemplate }: DAWStudioProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const beatTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize tracks from workflow nodes
  const [tracks, setTracks] = useState<Track[]>([
    {
      id: 'scout',
      name: 'Scout Track',
      color: '#10b981',
      clips: [
        { id: 'c1', start: 0, duration: 4, label: 'research contacts', status: 'idle' },
        { id: 'c2', start: 8, duration: 4, label: 'analyze trends', status: 'idle' },
      ],
    },
    {
      id: 'coach',
      name: 'Coach Track',
      color: '#6366f1',
      clips: [
        { id: 'c3', start: 4, duration: 4, label: 'generate pitch', status: 'idle' },
        { id: 'c4', start: 12, duration: 4, label: 'craft message', status: 'idle' },
      ],
    },
    {
      id: 'tracker',
      name: 'Tracker Track',
      color: '#f59e0b',
      clips: [
        { id: 'c5', start: 16, duration: 4, label: 'monitor campaign', status: 'idle' },
      ],
    },
  ]);

  // Beat timer
  useEffect(() => {
    if (isPlaying) {
      beatTimerRef.current = setInterval(() => {
        setCurrentBeat((prev) => prev + 1);
      }, BEAT_DURATION);
    } else {
      if (beatTimerRef.current) {
        clearInterval(beatTimerRef.current);
      }
    }

    return () => {
      if (beatTimerRef.current) {
        clearInterval(beatTimerRef.current);
      }
    };
  }, [isPlaying]);

  const handlePlayPause = (actions: WorkflowActions) => {
    if (isPlaying) {
      setIsPlaying(false);
      actions.stopExecution();
    } else {
      setIsPlaying(true);
      actions.executeFlow();
    }
  };

  const handleStop = (actions: WorkflowActions) => {
    setIsPlaying(false);
    setCurrentBeat(0);
    actions.stopExecution();
  };

  return (
    <BaseWorkflow initialTemplate={initialTemplate}>
      {(state: WorkflowState, actions: WorkflowActions) => (
        <div className="min-h-screen bg-zinc-900 text-zinc-100">
          {/* Ambient sound */}
          <AmbientSound type="theme-ambient" theme="daw" autoPlay />

          {/* DAW Header (Transport Controls) */}
          <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
            <div className="container mx-auto px-6 py-3">
              <div className="flex items-center justify-between">
                {/* Left: Title */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold">Timeline Studio</h1>
                    <p className="text-xs text-zinc-500">sync. sequence. create.</p>
                  </div>
                </div>

                {/* Center: Transport Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStop(actions)}
                    className="p-2 rounded hover:bg-zinc-800 transition-colors"
                    title="Stop"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePlayPause(actions)}
                    className={`p-3 rounded-lg font-medium transition-all ${
                      isPlaying
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => setCurrentBeat((prev) => prev + 8)}
                    className="p-2 rounded hover:bg-zinc-800 transition-colors"
                    title="Forward"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Right: Info + Settings */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span className="font-mono">{BPM} BPM</span>
                    </div>
                    <div className="h-4 w-px bg-zinc-700" />
                    <div className="font-mono">
                      {Math.floor(currentBeat / 4)}:{(currentBeat % 4) + 1}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 rounded hover:bg-zinc-800 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Timeline Grid */}
          <div className="p-6">
            <div className="space-y-4">
              {/* Ruler (Beat Numbers) */}
              <div className="flex items-center gap-2">
                <div className="w-32 flex-shrink-0" />
                <div className="flex-1 relative h-8 border-b border-zinc-800">
                  {Array.from({ length: 20 }).map((_, beat) => (
                    <div
                      key={beat}
                      className="absolute top-0 h-full"
                      style={{ left: `${(beat / 20) * 100}%` }}
                    >
                      <div className="text-xs text-zinc-600 font-mono">{beat}</div>
                      <div className="w-px h-2 bg-zinc-700" />
                    </div>
                  ))}

                  {/* Playhead */}
                  <motion.div
                    className="absolute top-0 bottom-0 w-0.5 bg-purple-500 z-10"
                    style={{ left: `${(currentBeat / 20) * 100}%` }}
                    animate={{ left: `${(currentBeat / 20) * 100}%` }}
                    transition={{ duration: 0 }}
                  >
                    <div className="w-3 h-3 bg-purple-500 rounded-full absolute -top-1 -left-1" />
                  </motion.div>
                </div>
              </div>

              {/* Tracks */}
              {tracks.map((track) => (
                <div key={track.id} className="flex items-start gap-2">
                  {/* Track Header */}
                  <div className="w-32 flex-shrink-0">
                    <div className="p-3 rounded-lg bg-zinc-800 border border-zinc-700">
                      <div
                        className="w-3 h-3 rounded-full mb-2"
                        style={{ backgroundColor: track.color }}
                      />
                      <div className="text-sm font-medium truncate">{track.name}</div>
                    </div>
                  </div>

                  {/* Track Lane */}
                  <div className="flex-1 relative h-20 rounded-lg bg-zinc-800/50 border border-zinc-800">
                    {/* Grid Lines */}
                    {Array.from({ length: 20 }).map((_, beat) => (
                      <div
                        key={beat}
                        className="absolute top-0 bottom-0 w-px bg-zinc-800"
                        style={{ left: `${(beat / 20) * 100}%` }}
                      />
                    ))}

                    {/* Clips */}
                    {track.clips.map((clip) => {
                      const isActive =
                        currentBeat >= clip.start && currentBeat < clip.start + clip.duration;

                      return (
                        <motion.div
                          key={clip.id}
                          className={`absolute top-2 bottom-2 rounded-lg border-2 px-3 py-2 cursor-move transition-all ${
                            isActive
                              ? 'shadow-lg scale-105 z-10'
                              : 'opacity-80 hover:opacity-100'
                          }`}
                          style={{
                            left: `${(clip.start / 20) * 100}%`,
                            width: `${(clip.duration / 20) * 100}%`,
                            backgroundColor: `${track.color}20`,
                            borderColor: track.color,
                          }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="text-xs font-medium truncate" style={{ color: track.color }}>
                            {clip.label}
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                            {clip.start}-{clip.start + clip.duration}
                          </div>

                          {/* Progress Bar */}
                          {isActive && isPlaying && (
                            <motion.div
                              className="absolute bottom-1 left-1 right-1 h-0.5 bg-white/50 rounded-full overflow-hidden"
                            >
                              <motion.div
                                className="h-full bg-white"
                                initial={{ width: '0%' }}
                                animate={{
                                  width: `${((currentBeat - clip.start) / clip.duration) * 100}%`,
                                }}
                                transition={{ duration: 0 }}
                              />
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Add Track Button */}
              <button
                onClick={() => {
                  const newTrack: Track = {
                    id: `track-${tracks.length}`,
                    name: `Track ${tracks.length + 1}`,
                    color: '#6366f1',
                    clips: [],
                  };
                  setTracks([...tracks, newTrack]);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 border-dashed hover:border-purple-500 hover:bg-zinc-800/50 transition-all text-sm text-zinc-500 hover:text-purple-400"
              >
                <Plus className="w-4 h-4" />
                Add Track
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ x: 300 }}
                animate={{ x: 0 }}
                exit={{ x: 300 }}
                className="fixed right-0 top-0 bottom-0 w-80 bg-zinc-900 border-l border-zinc-800 shadow-2xl p-6 overflow-y-auto z-20"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Timeline Settings</h3>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-zinc-500 hover:text-zinc-300"
                    >
                      ✕
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Tempo (BPM)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="60"
                        max="180"
                        value={BPM}
                        className="flex-1"
                        disabled
                      />
                      <span className="font-mono text-sm w-12">{BPM}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Grid Snap</label>
                    <select className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">
                      <option>1/4 Beat</option>
                      <option>1/2 Beat</option>
                      <option>1 Beat</option>
                      <option>Off</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-zinc-800">
                    <div className="text-xs text-zinc-500 space-y-1">
                      <div>Nodes: {state.nodes.length}</div>
                      <div>Edges: {state.edges.length}</div>
                      <div>Session: {state.sessionId.slice(0, 8)}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </BaseWorkflow>
  );
}
