'use client';

import { PerformanceCell, type CellAction } from './PerformanceCell';

export type PerformanceLayout = Record<string, CellAction>;

interface PerformanceGridProps {
  layout: PerformanceLayout;
  selectedCell: { row: number; col: number } | null;
  onCellClick: (row: number, col: number) => void;
  rows?: number;
  cols?: number;
}

export function PerformanceGrid({
  layout,
  selectedCell,
  onCellClick,
  rows = 8,
  cols = 8,
}: PerformanceGridProps) {
  return (
    <div className="bg-[#111418] border border-[#2A2C30] rounded-2xl p-6">
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: rows }, (_, row) =>
          Array.from({ length: cols }, (_, col) => {
            const cellKey = `${row}-${col}`;
            const action = layout[cellKey];
            const isSelected = selectedCell?.row === row && selectedCell?.col === col;

            return (
              <PerformanceCell
                key={cellKey}
                row={row}
                col={col}
                action={action}
                isSelected={isSelected}
                onClick={onCellClick}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
