/**
 * Showreel Renderer with Audio Support
 * Extended renderer that combines canvas video + Web Audio into WebM with soundtrack
 */

import { ShowreelPlayer } from '@totalaud/showreel';
import type { PerformanceState } from '@totalaud/performance';
import type {
  ShowreelRenderJob,
  ShowreelRenderResult,
  RenderProgressCallback,
} from './renderTypes';
import { RENDER_PRESETS } from './renderTypes';
import { RenderClock } from './RenderClock';
import {
  drawBackground,
  calculatePentagonLayout,
  drawOSNodes,
  drawSocialEdges,
  drawTextOverlay,
  drawLoopSatellites,
} from './canvasDrawing';
import {
  ensureAudioContext,
  createAudioGraph,
  PerformanceAudioEngine,
  type AudioGraph,
  type PerformanceAudioState,
  type OSSonicState,
  type OSType,
} from '@totalaud/audio';

/**
 * Render showreel with optional audio track
 */
export async function renderShowreelWithAudio(
  job: ShowreelRenderJob,
  onProgress?: RenderProgressCallback
): Promise<ShowreelRenderResult> {
  const includeSoundtrack = job.options.includeSoundtrack ?? true;

  // If no soundtrack, use the silent renderer
  if (!includeSoundtrack) {
    return renderShowreelSilent(job, onProgress);
  }

  // Get preset
  const preset = RENDER_PRESETS.find((p) => p.id === job.options.preset);
  if (!preset) {
    throw new Error(`Invalid preset: ${job.options.preset}`);
  }

  const { width, height, fps } = preset;
  const includeCaptions = job.options.includeCaptions ?? true;

  // Report preparing phase
  onProgress?.({
    phase: 'preparing',
    progress: 0,
  });

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context');
  }

  // Create audio context and graph
  const audioCtx = await ensureAudioContext();
  if (!audioCtx) {
    console.warn('AudioContext not available, falling back to silent render');
    return renderShowreelSilent(job, onProgress);
  }

  const audioGraph = createAudioGraph(audioCtx);

  // Create audio destination for MediaRecorder
  const audioDestination = audioCtx.createMediaStreamDestination();
  audioGraph.masterGain.connect(audioDestination);

  // Create render clock
  const renderClock = new RenderClock(fps);
  const totalFrames = renderClock.framesTotalForDuration(
    job.script.totalDurationSeconds
  );

  // Create showreel player in manual mode
  const player = new ShowreelPlayer(job.script);
  player.setManualMode(true);

  // Create audio engine
  const audioEngine = new PerformanceAudioEngine(audioGraph, {
    config: { bpm: 120 },
    getState: () => {
      const playerState = player.state;
      const currentScene = player.getCurrentScene();

      // Build PerformanceAudioState from current scene
      const osStates: Record<OSType, OSSonicState> = {
        ascii: 'thinking',
        xp: 'thinking',
        aqua: 'idle',
        daw: 'speaking',
        analogue: 'idle',
      };

      // Vary OS states based on scene type
      if (currentScene?.type === 'social_graph') {
        osStates.ascii = 'speaking';
        osStates.xp = 'speaking';
      } else if (currentScene?.type === 'evolution_spark') {
        osStates.ascii = 'charged';
        osStates.daw = 'charged';
      }

      return {
        bpm: 120,
        bar: Math.floor(playerState.totalElapsedSeconds / 2),
        beat: Math.floor(playerState.totalElapsedSeconds * 2),
        subdivision: 0,
        cohesion: currentScene?.performanceSnapshot?.cohesion ?? 0.5,
        tension: currentScene?.performanceSnapshot?.tension ?? 0.3,
        energy: 0.7,
        osStates,
      };
    },
    controls: {
      masterMuted: false,
      masterVolume: 0.6, // Lower volume for export
      osVoicesEnabled: true,
      ambienceEnabled: true,
      sfxEnabled: true,
    },
  });

  // Combine canvas and audio streams
  const canvasStream = canvas.captureStream(fps);
  const audioStream = audioDestination.stream;

  const mixedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...audioStream.getAudioTracks(),
  ]);

  // Setup MediaRecorder
  const mediaRecorder = new MediaRecorder(mixedStream, {
    mimeType: 'video/webm;codecs=vp8,opus',
    videoBitsPerSecond: 5000000, // 5 Mbps
    audioBitsPerSecond: 128000, // 128 kbps
  });

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  // Start audio engine
  audioEngine.start();

  // Start recording
  mediaRecorder.start();

  // Start player
  player.start();

  // Report rendering phase
  onProgress?.({
    phase: 'rendering',
    progress: 0,
    currentFrame: 0,
    totalFrames,
  });

  // Render loop
  let currentFrame = 0;
  const deltaSeconds = renderClock.nextDeltaSeconds();

  while (!player.state.isComplete && currentFrame < totalFrames) {
    // Advance player and audio
    player.tick(deltaSeconds);
    audioEngine.update(deltaSeconds);

    // Get current state
    const playerState = player.state;
    const currentScene = player.getCurrentScene();

    if (!currentScene) break;

    // Calculate scene progress
    const sceneProgress =
      currentScene.durationSeconds > 0
        ? playerState.sceneElapsedSeconds / currentScene.durationSeconds
        : 1;

    // Build performance state from scene snapshot
    const performanceState: PerformanceState = {
      cohesion: currentScene.performanceSnapshot?.cohesion ?? 0.5,
      tension: currentScene.performanceSnapshot?.tension ?? 0.3,
      momentum: currentScene.performanceSnapshot?.momentum ?? 0.5,
      nodes: currentScene.performanceSnapshot?.nodes ?? generateDefaultNodes(),
      edges: currentScene.performanceSnapshot?.edges ?? [],
      currentNarrative: currentScene.title,
    };

    // Render frame
    renderFrame(
      ctx,
      width,
      height,
      currentScene,
      performanceState,
      sceneProgress,
      includeCaptions ? playerState.currentCaption : undefined
    );

    // Progress update every 10 frames
    if (currentFrame % 10 === 0) {
      const progress = currentFrame / totalFrames;
      const framesRemaining = totalFrames - currentFrame;
      const estimatedSecondsRemaining = framesRemaining / fps;

      onProgress?.({
        phase: 'rendering',
        progress,
        currentFrame,
        totalFrames,
        estimatedSecondsRemaining,
      });
    }

    currentFrame++;

    // Allow browser to breathe every 30 frames
    if (currentFrame % 30 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  // Stop audio engine
  audioEngine.stop();

  // Report finalising phase
  onProgress?.({
    phase: 'finalising',
    progress: 0.95,
  });

  // Stop recording and wait for final blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    mediaRecorder.onstop = () => {
      const finalBlob = new Blob(chunks, { type: 'video/webm' });
      resolve(finalBlob);
    };
    mediaRecorder.onerror = (error) => {
      reject(error);
    };
    mediaRecorder.stop();
  });

  // Cleanup
  player.destroy();
  audioEngine.destroy();

  // Report complete
  onProgress?.({
    phase: 'complete',
    progress: 1,
  });

  const fileName = `${job.campaignId}-showreel-${Date.now()}.webm`;

  return {
    blob,
    fileName,
    mimeType: 'video/webm',
    durationSeconds: job.script.totalDurationSeconds,
  };
}

/**
 * Silent renderer (no audio track)
 */
async function renderShowreelSilent(
  job: ShowreelRenderJob,
  onProgress?: RenderProgressCallback
): Promise<ShowreelRenderResult> {
  // Import the original renderer
  const { renderShowreelToVideo } = await import('./showreelRenderer');
  return renderShowreelToVideo(job, onProgress);
}

/**
 * Render a single frame to canvas
 */
function renderFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scene: any,
  performanceState: PerformanceState,
  sceneProgress: number,
  caption?: string
): void {
  // Clear
  ctx.clearRect(0, 0, width, height);

  // Background with atmosphere
  drawBackground(ctx, width, height, performanceState);

  // Calculate OS node positions (pentagon layout)
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.25;
  const positions = calculatePentagonLayout(
    performanceState.nodes,
    centerX,
    centerY,
    radius
  );

  // Draw social edges
  drawSocialEdges(
    ctx,
    performanceState.edges,
    positions,
    sceneProgress,
    scene.emphasisMode,
    performanceState.tension
  );

  // Draw OS nodes
  drawOSNodes(
    ctx,
    performanceState.nodes,
    positions,
    sceneProgress,
    scene.emphasisMode
  );

  // Draw loop satellites
  drawLoopSatellites(
    ctx,
    performanceState.nodes,
    positions,
    sceneProgress,
    scene.emphasisMode
  );

  // Draw text overlays
  drawTextOverlay(
    ctx,
    width,
    height,
    scene.title,
    scene.subtitle,
    caption,
    sceneProgress
  );
}

/**
 * Generate default OS nodes
 */
function generateDefaultNodes() {
  return [
    {
      id: 'os-1',
      name: 'Scout',
      colour: '#3AA9BE',
      role: 'leader' as const,
      energy: 0.8,
    },
    {
      id: 'os-2',
      name: 'Coach',
      colour: '#8B5CF6',
      role: 'support' as const,
      energy: 0.7,
    },
    {
      id: 'os-3',
      name: 'Tracker',
      colour: '#10B981',
      role: 'support' as const,
      energy: 0.6,
    },
    {
      id: 'os-4',
      name: 'Insight',
      colour: '#F59E0B',
      role: 'neutral' as const,
      energy: 0.5,
    },
    {
      id: 'os-5',
      name: 'Catalyst',
      colour: '#EF4444',
      role: 'rebel' as const,
      energy: 0.9,
    },
  ];
}
