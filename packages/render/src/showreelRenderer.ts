/**
 * Showreel Renderer
 * High-level orchestrator for browser-based video export
 * Uses canvas.captureStream() + MediaRecorder to produce WebM
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

/**
 * Main render orchestrator
 * Renders a showreel to a video file in the browser
 */
export async function renderShowreelToVideo(
  job: ShowreelRenderJob,
  onProgress?: RenderProgressCallback
): Promise<ShowreelRenderResult> {
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

  // Create render clock
  const renderClock = new RenderClock(fps);
  const totalFrames = renderClock.framesTotalForDuration(
    job.script.totalDurationSeconds
  );

  // Create showreel player in manual mode
  const player = new ShowreelPlayer(job.script);
  player.setManualMode(true);
  player.start();

  // Setup MediaRecorder
  const stream = canvas.captureStream(fps);
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp8',
    videoBitsPerSecond: 5000000, // 5 Mbps
  });

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  // Start recording
  mediaRecorder.start();

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
    // Advance player
    player.tick(deltaSeconds);

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
    const performanceState: PerformanceState | null = currentScene.performanceSnapshot
      ? {
          cohesion: currentScene.performanceSnapshot.cohesion ?? 0.5,
          tension: currentScene.performanceSnapshot.tension ?? 0.3,
          momentum: currentScene.performanceSnapshot.momentum ?? 0.5,
          nodes: currentScene.performanceSnapshot.nodes ?? generateDefaultNodes(),
          edges: currentScene.performanceSnapshot.edges ?? [],
          currentNarrative: currentScene.title,
        }
      : {
          cohesion: 0.5,
          tension: 0.3,
          momentum: 0.5,
          nodes: generateDefaultNodes(),
          edges: [],
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

  // Draw social edges (if emphasis mode requires)
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

  // Draw loop satellites (evolution scenes)
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
 * Generate default OS nodes for scenes without snapshots
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
