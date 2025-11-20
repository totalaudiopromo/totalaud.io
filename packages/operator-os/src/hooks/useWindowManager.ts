/**
 * Window Manager Hook
 * Encapsulates window stacking and positioning logic
 */

import { useState, useEffect, useCallback } from 'react';
import type { OperatorWindow } from '../types';
import { cascadeWindows, tileWindows, constrainToViewport } from '../utils/windowLayout';

interface ViewportSize {
  width: number;
  height: number;
}

export function useWindowManager(windows: OperatorWindow[]) {
  const [viewport, setViewport] = useState<ViewportSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  // Update viewport size on resize
  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cascade windows
  const cascade = useCallback(() => {
    return cascadeWindows(windows, viewport);
  }, [windows, viewport]);

  // Tile windows
  const tile = useCallback(() => {
    return tileWindows(windows, viewport);
  }, [windows, viewport]);

  // Constrain window to viewport
  const constrain = useCallback((window: OperatorWindow) => {
    return constrainToViewport(window, viewport);
  }, [viewport]);

  // Get next z-index
  const getNextZIndex = useCallback(() => {
    if (windows.length === 0) return 1;
    return Math.max(...windows.map(w => w.zIndex)) + 1;
  }, [windows]);

  return {
    viewport,
    cascade,
    tile,
    constrain,
    getNextZIndex,
  };
}
