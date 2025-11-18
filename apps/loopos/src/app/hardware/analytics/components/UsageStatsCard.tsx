'use client';

interface UsageStat {
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  colour?: string;
}

interface UsageStatsCardProps {
  title: string;
  stats: UsageStat[];
}

export function UsageStatsCard({ title, stats }: UsageStatsCardProps) {
  return (
    <div className="bg-[#111418] border border-[#2A2C30] rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="px-4 py-3 rounded-xl bg-[#0B0E11] border border-[#2A2C30]">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {stat.label}
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span
                  className="text-2xl font-mono font-semibold"
                  style={{ color: stat.colour || '#3AA9BE' }}
                >
                  {stat.value}
                </span>
                {stat.unit && (
                  <span className="text-sm text-gray-400 ml-1">{stat.unit}</span>
                )}
              </div>
              {stat.trend && (
                <div className="text-lg">
                  {stat.trend === 'up' && <span className="text-green-400">↗</span>}
                  {stat.trend === 'down' && <span className="text-red-400">↘</span>}
                  {stat.trend === 'neutral' && <span className="text-gray-400">→</span>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
