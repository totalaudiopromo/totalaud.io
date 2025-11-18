'use client';

import { useState, useEffect } from 'react';
import { DeviceGroupList, type DeviceGroup } from './components/DeviceGroupList';
import { DeviceGroupForm } from './components/DeviceGroupForm';
import type { HardwareDevice } from './components/DeviceCard';

interface CreateDeviceGroupPayload {
  name: string;
  description?: string;
  device_ids: string[];
  primary_device_id: string;
  sync_enabled: boolean;
  led_broadcast_enabled: boolean;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<DeviceGroup[]>([]);
  const [availableDevices, setAvailableDevices] = useState<HardwareDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch groups and devices
  useEffect(() => {
    fetchGroups();
    fetchAvailableDevices();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/hardware/groups');
      if (!response.ok) {
        throw new Error(`Failed to fetch groups: ${response.statusText}`);
      }
      const data = await response.json();
      setGroups(data.groups || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch groups');
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableDevices = async () => {
    try {
      // Fetch connected devices from profiles endpoint
      const response = await fetch('/api/hardware/profiles');
      if (!response.ok) {
        throw new Error(`Failed to fetch devices: ${response.statusText}`);
      }
      const data = await response.json();
      const profiles = data.profiles || [];

      // Convert profiles to HardwareDevice format
      const devices: HardwareDevice[] = profiles.map((profile: any) => ({
        id: profile.id,
        device_type: profile.device_type,
        device_name: profile.device_name,
        is_connected: profile.is_connected || false,
        is_primary: false,
      }));

      setAvailableDevices(devices);
    } catch (err) {
      console.error('Error fetching available devices:', err);
      // Don't set error here, just log it
    }
  };

  // Create group
  const handleCreateGroup = async (payload: CreateDeviceGroupPayload) => {
    try {
      setError(null);
      const response = await fetch('/api/hardware/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create group: ${response.statusText}`);
      }

      const data = await response.json();
      setGroups([data.group, ...groups]);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
      console.error('Error creating group:', err);
    }
  };

  // Delete group
  const handleDeleteGroup = async (id: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/hardware/groups?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete group: ${response.statusText}`);
      }

      setGroups(groups.filter((g) => g.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete group');
      console.error('Error deleting group:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E11] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Device Groups</h1>
              <p className="text-gray-400 text-lg">
                Manage multi-device control and synchronisation
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 rounded-xl bg-[#3AA9BE] text-black font-medium hover:bg-[#3AA9BE]/80 transition-all duration-180"
            >
              {showForm ? 'Cancel' : '+ Create Group'}
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="px-4 py-2 rounded-lg bg-[#111418] border border-[#2A2C30]">
              <span className="text-gray-400 text-sm">Total Groups: </span>
              <span className="text-white font-mono font-semibold">{groups.length}</span>
            </div>
            <div className="px-4 py-2 rounded-lg bg-[#111418] border border-[#2A2C30]">
              <span className="text-gray-400 text-sm">Available Devices: </span>
              <span className="text-white font-mono font-semibold">{availableDevices.length}</span>
            </div>
            <div className="px-4 py-2 rounded-lg bg-[#111418] border border-[#2A2C30]">
              <span className="text-gray-400 text-sm">Status: </span>
              <span className="text-[#3AA9BE] font-mono font-semibold">
                {loading ? 'Loading...' : 'Ready'}
              </span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-900/20 border border-red-600 text-red-400">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="mb-8">
            <DeviceGroupForm
              availableDevices={availableDevices}
              onSubmit={handleCreateGroup}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Group List */}
        {loading ? (
          <div className="flex items-centre justify-centre py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#3AA9BE] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading groups...</p>
            </div>
          </div>
        ) : (
          <DeviceGroupList groups={groups} onDelete={handleDeleteGroup} />
        )}
      </div>
    </div>
  );
}
