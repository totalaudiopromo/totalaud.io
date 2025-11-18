/**
 * Window Layout Utilities
 * Helper functions for window positioning and arrangement
 */

import type { OperatorWindow } from '../types';

export interface ViewportSize {
  width: number;
  height: number;
}

/**
 * Cascade windows in a staggered pattern
 */
export function cascadeWindows(
  windows: OperatorWindow[],
  viewport: ViewportSize
): OperatorWindow[] {
  const CASCADE_OFFSET = 40;
  const START_X = 100;
  const START_Y = 80;

  return windows.map((window, index) => ({
    ...window,
    position: {
      x: START_X + (index * CASCADE_OFFSET),
      y: START_Y + (index * CASCADE_OFFSET),
    },
    isMaximised: false,
  }));
}

/**
 * Tile windows in a grid
 */
export function tileWindows(
  windows: OperatorWindow[],
  viewport: ViewportSize
): OperatorWindow[] {
  if (windows.length === 0) return windows;

  const PADDING = 20;
  const DOCK_HEIGHT = 80;
  const TOP_BAR_HEIGHT = 60;

  const availableWidth = viewport.width - (PADDING * 2);
  const availableHeight = viewport.height - DOCK_HEIGHT - TOP_BAR_HEIGHT - (PADDING * 2);

  // Calculate grid dimensions
  const cols = Math.ceil(Math.sqrt(windows.length));
  const rows = Math.ceil(windows.length / cols);

  const windowWidth = (availableWidth / cols) - PADDING;
  const windowHeight = (availableHeight / rows) - PADDING;

  return windows.map((window, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);

    return {
      ...window,
      position: {
        x: PADDING + (col * (windowWidth + PADDING)),
        y: TOP_BAR_HEIGHT + PADDING + (row * (windowHeight + PADDING)),
      },
      size: {
        width: windowWidth,
        height: windowHeight,
      },
      isMaximised: false,
    };
  });
}

/**
 * Get default window position
 */
export function getDefaultWindowPosition(
  existingWindows: OperatorWindow[],
  viewport: ViewportSize
): { x: number; y: number } {
  const CASCADE_OFFSET = 40;
  const START_X = 100;
  const START_Y = 80;

  const count = existingWindows.length;

  return {
    x: START_X + (count * CASCADE_OFFSET) % (viewport.width - 400),
    y: START_Y + (count * CASCADE_OFFSET) % (viewport.height - 300),
  };
}

/**
 * Constrain window to viewport bounds
 */
export function constrainToViewport(
  window: OperatorWindow,
  viewport: ViewportSize
): OperatorWindow {
  const DOCK_HEIGHT = 80;
  const TOP_BAR_HEIGHT = 60;
  const MIN_VISIBLE = 100; // Minimum pixels that must be visible

  let { x, y } = window.position;
  const { width, height } = window.size;

  // Constrain X
  x = Math.max(MIN_VISIBLE - width, x);
  x = Math.min(viewport.width - MIN_VISIBLE, x);

  // Constrain Y
  y = Math.max(TOP_BAR_HEIGHT, y);
  y = Math.min(viewport.height - DOCK_HEIGHT - MIN_VISIBLE, y);

  return {
    ...window,
    position: { x, y },
  };
}

/**
 * Snap window to edges
 */
export function snapToEdges(
  position: { x: number; y: number },
  viewport: ViewportSize,
  threshold: number = 20
): { x: number; y: number } {
  const TOP_BAR_HEIGHT = 60;
  let { x, y } = position;

  // Snap to left edge
  if (x < threshold) {
    x = 0;
  }

  // Snap to right edge
  if (viewport.width - x < threshold) {
    x = viewport.width;
  }

  // Snap to top
  if (y - TOP_BAR_HEIGHT < threshold) {
    y = TOP_BAR_HEIGHT;
  }

  return { x, y };
}
