'use client';

import { useState } from 'react';
import { ConfirmDeleteModal } from '@/components/hardware/ConfirmDeleteModal';
import { DeviceBadge } from '@/components/hardware/DeviceBadge';
import type { HardwareDeviceType } from '@/components/hardware/DeviceBadge';

export interface DeviceGroup {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  device_ids: string[];
  primary_device_id: string;
  sync_enabled: boolean;
  led_broadcast_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface DeviceGroupWithDevices extends DeviceGroup {
  devices?: Array<{
    id: string;
    device_type: HardwareDeviceType;
    device_name: string;
    is_connected: boolean;
  }>;
}

interface DeviceGroupListProps {
  groups: DeviceGroupWithDevices[];
  onDelete: (id: string) => void;
}

function DeviceGroupCard({ group, onDelete }: { group: DeviceGroupWithDevices; onDelete: (id: string) => void }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <div className="bg-[#111418] border border-[#2A2C30] rounded-2xl p-5 hover:border-[#3AA9BE] transition-all duration-240">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-white font-semibold text-lg mb-1">{group.name}</h3>
          {group.description && (
            <p className="text-gray-400 text-sm">{group.description}</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-3 mb-4">
          <div className="px-3 py-1.5 rounded-lg bg-[#1A1C20] border border-[#2A2C30]">
            <span className="text-xs text-gray-400">Devices: </span>
            <span className="text-sm font-mono text-[#3AA9BE] font-semibold">
              {group.device_ids.length}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#1A1C20] border border-[#2A2C30]">
            <span className="text-xs text-gray-400">Sync: </span>
            <span className={`text-sm font-mono font-semibold ${group.sync_enabled ? 'text-green-400' : 'text-gray-400'}`}>
              {group.sync_enabled ? 'ON' : 'OFF'}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#1A1C20] border border-[#2A2C30]">
            <span className="text-xs text-gray-400">LED: </span>
            <span className={`text-sm font-mono font-semibold ${group.led_broadcast_enabled ? 'text-green-400' : 'text-gray-400'}`}>
              {group.led_broadcast_enabled ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Devices */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Group Devices</div>
          <div className="grid grid-cols-2 gap-2">
            {group.devices && group.devices.length > 0 ? (
              group.devices.map((device) => (
                <div
                  key={device.id}
                  className="px-3 py-2 rounded-lg bg-[#0B0E11] border border-[#2A2C30]"
                >
                  <DeviceBadge
                    deviceType={device.device_type}
                    isPrimary={device.id === group.primary_device_id}
                    size="sm"
                  />
                  <div className="text-xs text-gray-400 mt-1">{device.device_name}</div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-xs text-gray-500 text-centre py-2">
                No device details available
              </div>
            )}
          </div>
        </div>

        {/* Primary Device Info */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Primary Device</div>
          <div className="px-3 py-2 rounded-lg bg-[#3AA9BE]/10 border border-[#3AA9BE]">
            <div className="text-sm text-[#3AA9BE] font-mono">{group.primary_device_id}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex-1 px-4 py-2 rounded-lg bg-[#1A1C20] text-red-400 hover:bg-red-600 hover:text-white transition-all duration-180 font-medium"
          >
            Delete
          </button>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        itemName={group.name}
        onConfirm={() => {
          onDelete(group.id);
          setShowDeleteModal(false);
        }}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
}

export function DeviceGroupList({ groups, onDelete }: DeviceGroupListProps) {
  if (groups.length === 0) {
    return (
      <div className="bg-[#111418] border border-[#2A2C30] rounded-2xl p-12 text-centre">
        <div className="text-6xl mb-4">🎛️</div>
        <h3 className="text-xl font-semibold text-white mb-2">No Device Groups Yet</h3>
        <p className="text-gray-400">
          Create your first device group to control multiple MIDI controllers simultaneously.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {groups.map((group) => (
        <DeviceGroupCard key={group.id} group={group} onDelete={onDelete} />
      ))}
    </div>
  );
}
