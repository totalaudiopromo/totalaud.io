'use client';

import { useState } from 'react';
import { DeviceCard, type HardwareDevice } from './DeviceCard';

interface DeviceGroupFormProps {
  availableDevices: HardwareDevice[];
  onSubmit: (group: {
    name: string;
    description?: string;
    device_ids: string[];
    primary_device_id: string;
    sync_enabled: boolean;
    led_broadcast_enabled: boolean;
  }) => void;
  onCancel: () => void;
}

export function DeviceGroupForm({ availableDevices, onSubmit, onCancel }: DeviceGroupFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [primaryDeviceId, setPrimaryDeviceId] = useState<string>('');
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [ledBroadcastEnabled, setLedBroadcastEnabled] = useState(true);

  const handleToggleDevice = (device: HardwareDevice) => {
    if (selectedDeviceIds.includes(device.id)) {
      setSelectedDeviceIds(selectedDeviceIds.filter((id) => id !== device.id));
      if (primaryDeviceId === device.id) {
        setPrimaryDeviceId('');
      }
    } else {
      setSelectedDeviceIds([...selectedDeviceIds, device.id]);
      if (!primaryDeviceId) {
        setPrimaryDeviceId(device.id);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDeviceIds.length === 0) {
      alert('Please select at least one device');
      return;
    }
    if (!primaryDeviceId || !selectedDeviceIds.includes(primaryDeviceId)) {
      alert('Please select a primary device from the selected devices');
      return;
    }

    onSubmit({
      name,
      description: description || undefined,
      device_ids: selectedDeviceIds,
      primary_device_id: primaryDeviceId,
      sync_enabled: syncEnabled,
      led_broadcast_enabled: ledBroadcastEnabled,
    });
  };

  const selectedDevices = availableDevices.filter((d) => selectedDeviceIds.includes(d.id));

  return (
    <form onSubmit={handleSubmit} className="bg-[#111418] border border-[#2A2C30] rounded-2xl p-6">
      <h2 className="text-2xl font-semibold text-white mb-6">Create Device Group</h2>

      {/* Name */}
      <div className="mb-5">
        <label className="block text-sm text-gray-400 mb-2">Group Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Push Duo"
          required
          className="w-full px-4 py-3 rounded-xl bg-[#0B0E11] border border-[#2A2C30] text-white placeholder-gray-500 focus:border-[#3AA9BE] focus:outline-none transition-all duration-180"
        />
      </div>

      {/* Description */}
      <div className="mb-5">
        <label className="block text-sm text-gray-400 mb-2">Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe this device group..."
          rows={2}
          className="w-full px-4 py-3 rounded-xl bg-[#0B0E11] border border-[#2A2C30] text-white placeholder-gray-500 focus:border-[#3AA9BE] focus:outline-none transition-all duration-180 resize-none"
        />
      </div>

      {/* Device Selection */}
      <div className="mb-5">
        <label className="block text-sm text-gray-400 mb-2">
          Select Devices ({selectedDeviceIds.length} selected)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {availableDevices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              isSelected={selectedDeviceIds.includes(device.id)}
              onToggle={handleToggleDevice}
            />
          ))}
        </div>
        {availableDevices.length === 0 && (
          <div className="text-centre py-8 text-gray-500">
            No devices available. Connect a hardware controller first.
          </div>
        )}
      </div>

      {/* Primary Device */}
      {selectedDevices.length > 0 && (
        <div className="mb-5">
          <label className="block text-sm text-gray-400 mb-2">Primary Device</label>
          <select
            value={primaryDeviceId}
            onChange={(e) => setPrimaryDeviceId(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-[#0B0E11] border border-[#2A2C30] text-white focus:border-[#3AA9BE] focus:outline-none transition-all duration-180"
          >
            <option value="">Select primary device...</option>
            {selectedDevices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.device_name} ({device.device_type})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2">
            Primary device receives input commands and broadcasts to group members
          </p>
        </div>
      )}

      {/* Options */}
      <div className="mb-6 space-y-3">
        <label className="flex items-centre gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={syncEnabled}
            onChange={(e) => setSyncEnabled(e.target.checked)}
            className="w-5 h-5 rounded bg-[#0B0E11] border border-[#2A2C30] text-[#3AA9BE] focus:ring-[#3AA9BE] focus:ring-offset-0"
          />
          <div>
            <div className="text-white font-medium">Enable Sync</div>
            <div className="text-xs text-gray-400">Synchronise input across all devices</div>
          </div>
        </label>

        <label className="flex items-centre gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={ledBroadcastEnabled}
            onChange={(e) => setLedBroadcastEnabled(e.target.checked)}
            className="w-5 h-5 rounded bg-[#0B0E11] border border-[#2A2C30] text-[#3AA9BE] focus:ring-[#3AA9BE] focus:ring-offset-0"
          />
          <div>
            <div className="text-white font-medium">LED Broadcast</div>
            <div className="text-xs text-gray-400">Mirror LED feedback across all devices</div>
          </div>
        </label>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 rounded-xl bg-[#1A1C20] text-white hover:bg-[#2A2C30] transition-all duration-180 font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name || selectedDeviceIds.length === 0 || !primaryDeviceId}
          className="flex-1 px-4 py-3 rounded-xl bg-[#3AA9BE] text-black hover:bg-[#3AA9BE]/80 transition-all duration-180 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Group
        </button>
      </div>
    </form>
  );
}
