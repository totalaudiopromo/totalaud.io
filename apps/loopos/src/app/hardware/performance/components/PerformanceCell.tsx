'use client';

import { InputIcon } from '@/components/hardware/InputIcon';
import type { InputType } from '@/components/hardware/InputIcon';

export interface CellAction {
  action_type: string;
  action_params: Record<string, unknown>;
  label?: string;
  colour?: string;
}

interface PerformanceCellProps {
  row: number;
  col: number;
  action?: CellAction;
  isSelected?: boolean;
  onClick: (row: number, col: number) => void;
}

export function PerformanceCell({ row, col, action, isSelected, onClick }: PerformanceCellProps) {
  const padId = `pad-${row}-${col}`;

  return (
    <button
      onClick={() => onClick(row, col)}
      className={`relative w-full aspect-square rounded-lg transition-all duration-180 hover:scale-105 group ${
        isSelected
          ? 'ring-2 ring-[#3AA9BE] ring-offset-2 ring-offset-[#0B0E11]'
          : ''
      }`}
      style={{
        backgroundColor: action?.colour || '#1A1C20',
        border: action ? `2px solid ${action.colour || '#3AA9BE'}` : '1px solid #2A2C30',
      }}
    >
      {/* Action Label */}
      {action && (
        <div className="absolute inset-0 flex flex-col items-centre justify-centre p-2">
          <div className="text-xs font-mono text-white font-semibold text-centre leading-tight">
            {action.label || action.action_type}
          </div>
          <div className="text-[10px] font-mono text-gray-400 mt-1">
            {row},{col}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!action && (
        <div className="absolute inset-0 flex items-centre justify-centre opacity-40 group-hover:opacity-100 transition-opacity">
          <div className="text-xs font-mono text-gray-600">
            {row},{col}
          </div>
        </div>
      )}

      {/* Tooltip */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10">
        {action ? action.label || action.action_type : `Empty (${row},${col})`}
      </div>
    </button>
  );
}
