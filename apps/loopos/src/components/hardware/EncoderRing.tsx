'use client';

interface EncoderRingProps {
  encoderId: string;
  value: number; // 0-127 (MIDI range)
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

export function EncoderRing({
  encoderId,
  value,
  label,
  size = 'md',
  showValue = true,
}: EncoderRingProps) {
  const sizeClasses = {
    sm: { container: 'w-16 h-16', ring: 48, stroke: 4, text: 'text-xs' },
    md: { container: 'w-24 h-24', ring: 72, stroke: 6, text: 'text-sm' },
    lg: { container: 'w-32 h-32', ring: 96, stroke: 8, text: 'text-base' },
  };

  const config = sizeClasses[size];
  const radius = (config.ring - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  // Normalize value to 0-1 range
  const normalizedValue = Math.max(0, Math.min(127, value)) / 127;

  // Calculate dash offset for the progress arc (starts from top, goes clockwise)
  const offset = circumference - normalizedValue * circumference;

  return (
    <div className="flex flex-col items-centre gap-2">
      <div className={`${config.container} relative`}>
        {/* Background ring */}
        <svg
          className="absolute inset-0 -rotate-90"
          width={config.ring}
          height={config.ring}
        >
          <circle
            cx={config.ring / 2}
            cy={config.ring / 2}
            r={radius}
            fill="none"
            stroke="#2A2C30"
            strokeWidth={config.stroke}
          />
          {/* Progress ring */}
          <circle
            cx={config.ring / 2}
            cy={config.ring / 2}
            r={radius}
            fill="none"
            stroke="#3AA9BE"
            strokeWidth={config.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-180 ease-out"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(58, 169, 190, 0.4))',
            }}
          />
        </svg>

        {/* Centre value display */}
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-centre justify-centre">
            <div className={`${config.text} font-mono text-white font-semibold`}>
              {value}
            </div>
            <div className="text-[10px] text-gray-400 font-mono mt-0.5">
              {Math.round(normalizedValue * 100)}%
            </div>
          </div>
        )}
      </div>

      {/* Label */}
      {label && (
        <div className="text-center">
          <div className="text-sm text-white font-medium">{label}</div>
          <div className="text-xs text-gray-400 font-mono">{encoderId}</div>
        </div>
      )}
    </div>
  );
}
