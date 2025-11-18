'use client';

interface CyanPulseProps {
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function CyanPulse({ active = false, size = 'md' }: CyanPulseProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <div
        className={`absolute inset-0 rounded-full ${
          active ? 'bg-[#3AA9BE] animate-pulse' : 'bg-gray-600'
        }`}
      />
      {active && (
        <div className="absolute inset-0 rounded-full bg-[#3AA9BE] opacity-50 animate-ping" />
      )}
    </div>
  );
}
