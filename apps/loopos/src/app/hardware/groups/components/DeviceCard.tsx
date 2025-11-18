'use client';

import { DeviceBadge } from '@/components/hardware/DeviceBadge';
import { CyanPulse } from '@/components/hardware/CyanPulse';
import type { HardwareDeviceType } from '@/components/hardware/DeviceBadge';

export interface HardwareDevice {
  id: string;
  device_type: HardwareDeviceType;
  device_name: string;
  is_connected: boolean;
  is_primary?: boolean;
}

interface DeviceCardProps {
  device: HardwareDevice;
  isSelected?: boolean;
  onToggle?: (device: HardwareDevice) => void;
}

export function DeviceCard({ device, isSelected, onToggle }: DeviceCardProps) {
  return (
    <div
      onClick={() => onToggle?.(device)}
      className={`bg-[#111418] border rounded-xl p-4 transition-all duration-240 cursor-pointer ${
        isSelected
          ? 'border-[#3AA9BE] shadow-lg shadow-[#3AA9BE]/20'
          : 'border-[#2A2C30] hover:border-[#3AA9BE]/50'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <DeviceBadge
          deviceType={device.device_type}
          isPrimary={device.is_primary}
          size="sm"
        />
        <CyanPulse active={device.is_connected} size="sm" />
      </div>

      <h4 className="text-white font-semibold mb-1">{device.device_name}</h4>
      <div className="text-xs text-gray-400">
        {device.is_connected ? 'Connected' : 'Disconnected'}
      </div>

      {isSelected && (
        <div className="mt-3 pt-3 border-t border-[#2A2C30]">
          <div className="flex items-centre gap-2 text-[#3AA9BE]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs font-mono">Selected</span>
          </div>
        </div>
      )}
    </div>
  );
}
