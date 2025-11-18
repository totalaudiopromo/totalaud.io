'use client';

type DeviceType = 'push2' | 'push3' | 'launchpad' | 'mpk' | 'generic_midi';

interface DeviceBadgeProps {
  deviceType: DeviceType;
  isPrimary?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const DEVICE_INFO: Record<DeviceType, { name: string; icon: string; colour: string }> = {
  push2: { name: 'Push 2', icon: '🎹', colour: '#3AA9BE' },
  push3: { name: 'Push 3', icon: '🎛️', colour: '#3AA9BE' },
  launchpad: { name: 'Launchpad', icon: '🟩', colour: '#00FF00' },
  mpk: { name: 'MPK Mini', icon: '🎼', colour: '#FF6B35' },
  generic_midi: { name: 'MIDI', icon: '🎚️', colour: '#888' },
};

export function DeviceBadge({ deviceType, isPrimary, size = 'md' }: DeviceBadgeProps) {
  const info = DEVICE_INFO[deviceType];

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <div
      className={`inline-flex items-centre gap-2 rounded-full bg-[#1A1C20] border border-[#2A2C30] ${sizeClasses[size]}`}
      style={{ borderColor: isPrimary ? info.colour : undefined }}
    >
      <span className="text-lg">{info.icon}</span>
      <span className="text-white font-medium">{info.name}</span>
      {isPrimary && (
        <span
          className="text-xs font-mono px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: info.colour, color: '#000' }}
        >
          PRIMARY
        </span>
      )}
    </div>
  );
}
