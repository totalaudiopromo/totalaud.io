/**
 * Canvas Drawing Utilities
 * Low-level drawing functions for showreel rendering
 */

import type { OSNode, SocialEdge, PerformanceState } from '@totalaud/performance';
import type { ShowreelScene } from '@totalaud/showreel';

/**
 * Colours (British English)
 */
export const COLOURS = {
  matteBlack: '#0F1113',
  slateCyan: '#3AA9BE',
  lightGrey: '#E5E7EB',
  darkGrey: '#374151',
};

/**
 * Draw background with atmosphere based on performance state
 */
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: PerformanceState | null
): void {
  // Base matte black
  ctx.fillStyle = COLOURS.matteBlack;
  ctx.fillRect(0, 0, width, height);

  if (!state) return;

  // Radial gradient based on cohesion
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.max(width, height) * 0.6;

  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    radius
  );

  // Cohesion creates cyan glow
  const cohesionAlpha = state.cohesion * 0.15;
  gradient.addColorStop(0, `rgba(58, 169, 190, ${cohesionAlpha})`);
  gradient.addColorStop(0.5, `rgba(58, 169, 190, ${cohesionAlpha * 0.5})`);
  gradient.addColorStop(1, 'rgba(58, 169, 190, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Tension creates subtle red vignette
  if (state.tension > 0.3) {
    const tensionGradient = ctx.createRadialGradient(
      centerX,
      centerY,
      radius * 0.5,
      centerX,
      centerY,
      radius
    );
    const tensionAlpha = (state.tension - 0.3) * 0.1;
    tensionGradient.addColorStop(0, 'rgba(255, 100, 100, 0)');
    tensionGradient.addColorStop(1, `rgba(255, 100, 100, ${tensionAlpha})`);

    ctx.fillStyle = tensionGradient;
    ctx.fillRect(0, 0, width, height);
  }
}

/**
 * Calculate pentagon layout for OS nodes
 */
export function calculatePentagonLayout(
  nodes: OSNode[],
  centerX: number,
  centerY: number,
  radius: number
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const count = nodes.length;

  if (count === 0) return positions;

  nodes.forEach((node, index) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2; // Start from top
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    positions.set(node.id, { x, y });
  });

  return positions;
}

/**
 * Draw OS nodes
 */
export function drawOSNodes(
  ctx: CanvasRenderingContext2D,
  nodes: OSNode[],
  positions: Map<string, { x: number; y: number }>,
  sceneProgress: number, // 0-1
  emphasisMode: string
): void {
  nodes.forEach((node) => {
    const pos = positions.get(node.id);
    if (!pos) return;

    // Fade in/out based on scene progress
    let alpha = 1;
    if (sceneProgress < 0.1) {
      alpha = sceneProgress / 0.1; // Fade in first 10%
    } else if (sceneProgress > 0.9) {
      alpha = (1 - sceneProgress) / 0.1; // Fade out last 10%
    }

    // Base radius based on energy
    const baseRadius = 20 + node.energy * 30;

    // Leader emphasis
    const isLeader = node.role === 'leader';
    const radius = isLeader && emphasisMode === 'leader' ? baseRadius * 1.5 : baseRadius;

    // Glow based on energy
    const glowRadius = radius + node.energy * 20;
    const gradient = ctx.createRadialGradient(pos.x, pos.y, radius * 0.3, pos.x, pos.y, glowRadius);

    const nodeColour = node.colour || COLOURS.slateCyan;
    gradient.addColorStop(0, `${nodeColour}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
    gradient.addColorStop(0.7, `${nodeColour}${Math.floor(alpha * 128).toString(16).padStart(2, '0')}`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Core circle
    ctx.fillStyle = `${nodeColour}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Label
    ctx.fillStyle = `rgba(229, 231, 235, ${alpha})`;
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.name, pos.x, pos.y + radius + 16);
  });
}

/**
 * Draw social graph edges
 */
export function drawSocialEdges(
  ctx: CanvasRenderingContext2D,
  edges: SocialEdge[],
  positions: Map<string, { x: number; y: number }>,
  sceneProgress: number,
  emphasisMode: string,
  tension: number
): void {
  if (emphasisMode !== 'graph' && emphasisMode !== 'full') {
    return; // Only show edges in graph/full modes
  }

  edges.forEach((edge) => {
    const fromPos = positions.get(edge.from);
    const toPos = positions.get(edge.to);
    if (!fromPos || !toPos) return;

    // Fade in/out
    let alpha = 0.6;
    if (sceneProgress < 0.1) {
      alpha = (sceneProgress / 0.1) * 0.6;
    } else if (sceneProgress > 0.9) {
      alpha = ((1 - sceneProgress) / 0.1) * 0.6;
    }

    // Line thickness based on synergy
    const thickness = 1 + edge.synergy * 3;

    // Colour based on trust
    let colour: string;
    if (edge.trust > 0.5) {
      colour = COLOURS.slateCyan; // Strong trust
    } else if (edge.trust > 0) {
      colour = COLOURS.lightGrey; // Neutral
    } else {
      colour = '#EF4444'; // Conflict (red)
    }

    // Add wobble based on tension
    const wobble = edge.tension * 10 * Math.sin(sceneProgress * Math.PI * 4);
    const midX = (fromPos.x + toPos.x) / 2 + wobble;
    const midY = (fromPos.y + toPos.y) / 2;

    ctx.strokeStyle = `${colour}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(fromPos.x, fromPos.y);
    ctx.quadraticCurveTo(midX, midY, toPos.x, toPos.y);
    ctx.stroke();
  });
}

/**
 * Draw text overlay (titles, subtitles, captions)
 */
export function drawTextOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  title?: string,
  subtitle?: string,
  caption?: string,
  sceneProgress: number = 1
): void {
  // Fade in/out
  let alpha = 1;
  if (sceneProgress < 0.05) {
    alpha = sceneProgress / 0.05;
  } else if (sceneProgress > 0.95) {
    alpha = (1 - sceneProgress) / 0.05;
  }

  // Title - top centre
  if (title) {
    ctx.fillStyle = `rgba(229, 231, 235, ${alpha})`;
    ctx.font = 'bold 32px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(title, width / 2, 60);
  }

  // Subtitle - below title
  if (subtitle) {
    ctx.fillStyle = `rgba(156, 163, 175, ${alpha * 0.8})`;
    ctx.font = '20px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(subtitle, width / 2, 110);
  }

  // Caption - bottom third
  if (caption) {
    ctx.fillStyle = `rgba(229, 231, 235, ${alpha})`;
    ctx.font = '18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    // Multi-line support (simple word wrap)
    const maxWidth = width * 0.8;
    const words = caption.split(' ');
    let line = '';
    const lines: string[] = [];

    words.forEach((word) => {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line.length > 0) {
        lines.push(line);
        line = word + ' ';
      } else {
        line = testLine;
      }
    });
    lines.push(line);

    const lineHeight = 24;
    const startY = height - 80 - (lines.length - 1) * lineHeight;

    lines.forEach((line, index) => {
      ctx.fillText(line.trim(), width / 2, startY + index * lineHeight);
    });
  }
}

/**
 * Draw loop satellites around OS nodes
 */
export function drawLoopSatellites(
  ctx: CanvasRenderingContext2D,
  nodes: OSNode[],
  positions: Map<string, { x: number; y: number }>,
  sceneProgress: number,
  emphasisMode: string
): void {
  if (emphasisMode !== 'evolution' && emphasisMode !== 'full') {
    return;
  }

  const angle = sceneProgress * Math.PI * 2; // Full rotation per scene

  nodes.forEach((node) => {
    const pos = positions.get(node.id);
    if (!pos) return;

    const orbitRadius = 50;
    const satelliteRadius = 4;

    const satX = pos.x + Math.cos(angle) * orbitRadius;
    const satY = pos.y + Math.sin(angle) * orbitRadius;

    ctx.fillStyle = COLOURS.slateCyan;
    ctx.beginPath();
    ctx.arc(satX, satY, satelliteRadius, 0, Math.PI * 2);
    ctx.fill();
  });
}
