/**
 * Performance Mode
 * Real-time performance control with hardware grids
 */

import { logger } from '../utils/logger';

const log = logger.createScope('PerformanceMode');

export type PerformanceLayoutType = 'clip_matrix' | 'parameter_matrix' | 'visualisation_matrix';

export interface PerformanceCell {
  position: [number, number];
  action: string;
  param: Record<string, unknown>;
  colour?: string;
  label?: string;
}

export interface PerformanceLayout {
  id: string;
  name: string;
  layoutType: PerformanceLayoutType;
  gridSize: [number, number];
  cells: PerformanceCell[];
}

export class PerformanceMode {
  private activeLayout: PerformanceLayout | null = null;
  private isActive = false;

  /**
   * Activate performance mode
   */
  activate(layout: PerformanceLayout): void {
    this.activeLayout = layout;
    this.isActive = true;

    log.info('Performance mode activated', {
      layoutType: layout.layoutType,
      gridSize: layout.gridSize,
      cellCount: layout.cells.length,
    });
  }

  /**
   * Deactivate performance mode
   */
  deactivate(): void {
    this.activeLayout = null;
    this.isActive = false;

    log.info('Performance mode deactivated');
  }

  /**
   * Get cell at position
   */
  getCellAtPosition(row: number, col: number): PerformanceCell | null {
    if (!this.activeLayout) return null;

    return (
      this.activeLayout.cells.find(
        (cell) => cell.position[0] === row && cell.position[1] === col
      ) || null
    );
  }

  /**
   * Update cell colour (for visualisation)
   */
  updateCellColour(row: number, col: number, colour: string): void {
    const cell = this.getCellAtPosition(row, col);
    if (cell) {
      cell.colour = colour;
    }
  }

  /**
   * Check if performance mode is active
   */
  isPerformanceModeActive(): boolean {
    return this.isActive;
  }

  /**
   * Get active layout
   */
  getActiveLayout(): PerformanceLayout | null {
    return this.activeLayout;
  }
}
