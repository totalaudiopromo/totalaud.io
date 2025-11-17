/**
 * Device Group Engine
 * Manages multiple connected hardware devices as a single control surface
 */

import { HardwareDeviceType, LEDFeedback } from '../types';
import { logger } from '../utils/logger';

const log = logger.createScope('DeviceGroupEngine');

export interface DeviceGroup {
  id: string;
  name: string;
  deviceIds: string[];
  primaryDeviceId?: string;
  settings: {
    ledSync: boolean;
    sharedMappings: boolean;
    failover: 'auto' | 'manual';
  };
}

export interface ConnectedDevice {
  deviceId: string;
  deviceType: HardwareDeviceType;
  isActive: boolean;
  isPrimary: boolean;
}

export class DeviceGroupEngine {
  private groups: Map<string, DeviceGroup> = new Map();
  private connectedDevices: Map<string, ConnectedDevice> = new Map();

  /**
   * Create a device group
   */
  createGroup(group: DeviceGroup): void {
    this.groups.set(group.id, group);
    log.info('Device group created', {
      id: group.id,
      name: group.name,
      deviceCount: group.deviceIds.length,
    });
  }

  /**
   * Add device to system
   */
  addDevice(device: ConnectedDevice): void {
    this.connectedDevices.set(device.deviceId, device);
    log.info('Device added', {
      deviceId: device.deviceId,
      type: device.deviceType,
    });
  }

  /**
   * Remove device from system
   */
  removeDevice(deviceId: string): void {
    this.connectedDevices.delete(deviceId);
    log.info('Device removed', { deviceId });

    // Handle failover if this was primary device
    this.handleDeviceDisconnect(deviceId);
  }

  /**
   * Broadcast LED feedback to all devices in group
   */
  async broadcastFeedback(groupId: string, feedback: LEDFeedback): Promise<void> {
    const group = this.groups.get(groupId);
    if (!group || !group.settings.ledSync) {
      return;
    }

    log.debug('Broadcasting LED feedback', {
      groupId,
      inputId: feedback.inputId,
    });

    // In real implementation, would send to all devices in group
    // This is a stub for the structure
  }

  /**
   * Handle device disconnect and failover
   */
  private handleDeviceDisconnect(deviceId: string): void {
    // Find groups containing this device
    for (const [groupId, group] of this.groups.entries()) {
      if (group.deviceIds.includes(deviceId)) {
        // If this was primary device and failover is auto
        if (group.primaryDeviceId === deviceId && group.settings.failover === 'auto') {
          // Promote next active device to primary
          const nextDevice = group.deviceIds.find(
            (id) => id !== deviceId && this.connectedDevices.get(id)?.isActive
          );

          if (nextDevice) {
            group.primaryDeviceId = nextDevice;
            log.info('Primary device promoted', {
              groupId,
              newPrimary: nextDevice,
            });
          }
        }
      }
    }
  }

  /**
   * Get active devices in group
   */
  getActiveDevices(groupId: string): ConnectedDevice[] {
    const group = this.groups.get(groupId);
    if (!group) return [];

    return group.deviceIds
      .map((id) => this.connectedDevices.get(id))
      .filter((device): device is ConnectedDevice => !!device && device.isActive);
  }

  /**
   * Get primary device for group
   */
  getPrimaryDevice(groupId: string): ConnectedDevice | null {
    const group = this.groups.get(groupId);
    if (!group || !group.primaryDeviceId) return null;

    return this.connectedDevices.get(group.primaryDeviceId) || null;
  }
}
