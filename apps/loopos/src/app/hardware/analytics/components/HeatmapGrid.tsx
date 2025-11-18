'use client';

export interface HeatmapData {
  input_id: string;
  input_type: string;
  usage_count: number;
  last_used_at: string;
}

interface HeatmapGridProps {
  heatmapData: HeatmapData[];
  rows?: number;
  cols?: number;
}

export function HeatmapGrid({ heatmapData, rows = 8, cols = 8 }: HeatmapGridProps) {
  // Find max usage for normalization
  const maxUsage = Math.max(...heatmapData.map((d) => d.usage_count), 1);

  // Create a map for quick lookup
  const dataMap = new Map(heatmapData.map((d) => [d.input_id, d]));

  // Get intensity for a given cell
  const getIntensity = (row: number, col: number): number => {
    const padId = `pad-${row}-${col}`;
    const data = dataMap.get(padId);
    return data ? data.usage_count / maxUsage : 0;
  };

  // Get data for a given cell
  const getCellData = (row: number, col: number): HeatmapData | undefined => {
    const padId = `pad-${row}-${col}`;
    return dataMap.get(padId);
  };

  // Get colour based on intensity
  const getColour = (intensity: number): string => {
    if (intensity === 0) return '#1A1C20';

    // Gradient from dark cyan to bright cyan
    const hue = 186; // Cyan hue
    const saturation = 56 + intensity * 20; // 56% to 76%
    const lightness = 35 + intensity * 40; // 35% to 75%

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  return (
    <div className="bg-[#111418] border border-[#2A2C30] rounded-2xl p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-2">Usage Heatmap</h3>
        <p className="text-sm text-gray-400">
          Brighter colours indicate more frequently used inputs
        </p>
      </div>

      {/* Grid */}
      <div
        className="inline-grid gap-1 mb-4"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: rows }, (_, row) =>
          Array.from({ length: cols }, (_, col) => {
            const intensity = getIntensity(row, col);
            const cellData = getCellData(row, col);
            const colour = getColour(intensity);

            return (
              <div
                key={`${row}-${col}`}
                className="w-12 h-12 rounded-lg transition-all duration-200 hover:scale-110 relative group cursor-pointer"
                style={{
                  backgroundColor: colour,
                  border: intensity > 0 ? `2px solid ${colour}` : '1px solid #2A2C30',
                  boxShadow: intensity > 0.7 ? `0 0 12px ${colour}40` : 'none',
                }}
              >
                {/* Usage count */}
                {cellData && cellData.usage_count > 0 && (
                  <div className="absolute inset-0 flex items-centre justify-centre">
                    <span className="text-xs font-mono text-white font-semibold">
                      {cellData.usage_count}
                    </span>
                  </div>
                )}

                {/* Tooltip */}
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10 transition-opacity">
                  <div className="font-mono font-semibold mb-1">
                    {cellData?.input_id || `pad-${row}-${col}`}
                  </div>
                  {cellData ? (
                    <>
                      <div className="text-gray-300">
                        Used: <span className="text-[#3AA9BE]">{cellData.usage_count}</span> times
                      </div>
                      <div className="text-gray-300 text-[10px] mt-1">
                        Last: {new Date(cellData.last_used_at).toLocaleString()}
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400">Not used</div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="flex items-centre gap-4 pt-4 border-t border-[#2A2C30]">
        <div className="text-sm text-gray-400">Intensity:</div>
        <div className="flex items-centre gap-2">
          {[0, 0.25, 0.5, 0.75, 1].map((intensity) => (
            <div key={intensity} className="flex items-centre gap-2">
              <div
                className="w-6 h-6 rounded border border-[#2A2C30]"
                style={{ backgroundColor: getColour(intensity) }}
              />
              <span className="text-xs text-gray-500 font-mono">
                {Math.round(intensity * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Inputs */}
      {heatmapData.length > 0 && (
        <div className="mt-6 pt-6 border-t border-[#2A2C30]">
          <h4 className="text-sm font-semibold text-white mb-3">Top 5 Most Used Inputs</h4>
          <div className="space-y-2">
            {heatmapData
              .sort((a, b) => b.usage_count - a.usage_count)
              .slice(0, 5)
              .map((data, idx) => (
                <div
                  key={data.input_id}
                  className="flex items-centre justify-between px-3 py-2 rounded-lg bg-[#0B0E11] border border-[#2A2C30]"
                >
                  <div className="flex items-centre gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#3AA9BE] text-black flex items-centre justify-centre text-xs font-mono font-semibold">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="text-white font-mono text-sm">{data.input_id}</div>
                      <div className="text-xs text-gray-400">{data.input_type}</div>
                    </div>
                  </div>
                  <div className="text-[#3AA9BE] font-mono font-semibold">
                    {data.usage_count}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
