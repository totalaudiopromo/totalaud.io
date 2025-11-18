'use client';

interface PadGridProps {
  rows?: number;
  cols?: number;
  activePads?: string[];
  heatmapData?: Array<{ inputId: string; intensity: number }>;
  onPadClick?: (row: number, col: number) => void;
}

export function PadGrid({
  rows = 8,
  cols = 8,
  activePads = [],
  heatmapData = [],
  onPadClick
}: PadGridProps) {
  const getIntensity = (row: number, col: number): number => {
    const padId = `pad-${row}-${col}`;
    const data = heatmapData.find((d) => d.inputId === padId);
    return data?.intensity || 0;
  };

  const isActive = (row: number, col: number): boolean => {
    const padId = `pad-${row}-${col}`;
    return activePads.includes(padId);
  };

  return (
    <div
      className="inline-grid gap-1 p-4 rounded-2xl bg-[#111418] border border-[#2A2C30]"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) => {
          const intensity = getIntensity(row, col);
          const active = isActive(row, col);

          return (
            <button
              key={`${row}-${col}`}
              onClick={() => onPadClick?.(row, col)}
              className="w-10 h-10 rounded-lg transition-all duration-200 hover:scale-110 relative group"
              style={{
                backgroundColor: active
                  ? '#3AA9BE'
                  : intensity > 0
                  ? `rgba(58, 169, 190, ${intensity * 0.8})`
                  : '#1A1C20',
                border: active ? '2px solid #3AA9BE' : '1px solid #2A2C30',
              }}
            >
              {intensity > 0 && (
                <div className="absolute inset-0 flex items-centre justify-centre">
                  <span className="text-[10px] font-mono text-white opacity-70">
                    {Math.round(intensity * 100)}
                  </span>
                </div>
              )}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10">
                {row},{col}
              </div>
            </button>
          );
        })
      )}
    </div>
  );
}
