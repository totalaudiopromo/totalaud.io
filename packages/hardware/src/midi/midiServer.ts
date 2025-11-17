/**
 * MIDI Server
 * Handles Web MIDI API connection and device detection
 */

import { WebMidi, Input, Output } from 'webmidi';
import { HardwareDeviceType } from '../types';
import { logger } from '../utils/logger';
import { MIDIRouter } from './midiRouter';

const log = logger.createScope('MIDIServer');

export interface DetectedDevice {
  type: HardwareDeviceType;
  name: string;
  manufacturer: string;
  midiIn: Input;
  midiOut?: Output;
}

export class MIDIServer {
  private router: MIDIRouter | null = null;
  private connectedDevices: Map<string, DetectedDevice> = new Map();
  private initialized = false;

  constructor() {
    log.info('MIDI Server created');
  }

  /**
   * Initialize Web MIDI API
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      log.warn('MIDI Server already initialized');
      return;
    }

    try {
      await WebMidi.enable();
      log.info('Web MIDI API enabled', {
        inputs: WebMidi.inputs.length,
        outputs: WebMidi.outputs.length,
      });

      // Listen for device connections
      WebMidi.addListener('connected', (e) => {
        log.info('MIDI device connected', { device: e.port.name });
        this.detectDevices();
      });

      WebMidi.addListener('disconnected', (e) => {
        log.info('MIDI device disconnected', { device: e.port.name });
        this.handleDeviceDisconnect(e.port.name);
      });

      this.initialized = true;
      await this.detectDevices();
    } catch (error) {
      log.error('Failed to initialize Web MIDI API', error);
      throw error;
    }
  }

  /**
   * Detect connected hardware devices
   */
  async detectDevices(): Promise<DetectedDevice[]> {
    const devices: DetectedDevice[] = [];

    for (const input of WebMidi.inputs) {
      const deviceType = this.identifyDevice(input.name, input.manufacturer);

      if (deviceType) {
        // Find matching output port
        const output = WebMidi.outputs.find(
          (out) => out.name === input.name || out.manufacturer === input.manufacturer
        );

        const device: DetectedDevice = {
          type: deviceType,
          name: input.name,
          manufacturer: input.manufacturer,
          midiIn: input,
          midiOut: output,
        };

        devices.push(device);
        this.connectedDevices.set(input.name, device);

        log.info('Hardware device detected', {
          type: deviceType,
          name: input.name,
          hasOutput: !!output,
        });
      }
    }

    return devices;
  }

  /**
   * Identify device type from name/manufacturer
   */
  private identifyDevice(name: string, manufacturer: string): HardwareDeviceType | null {
    const lowerName = name.toLowerCase();
    const lowerManufacturer = manufacturer.toLowerCase();

    // Ableton Push 2
    if (
      lowerName.includes('push 2') ||
      lowerName.includes('ableton push 2') ||
      (lowerManufacturer.includes('ableton') && lowerName.includes('push') && !lowerName.includes('push 3'))
    ) {
      return 'push2';
    }

    // Ableton Push 3
    if (
      lowerName.includes('push 3') ||
      lowerName.includes('ableton push 3')
    ) {
      return 'push3';
    }

    // Novation Launchpad
    if (
      lowerName.includes('launchpad') ||
      lowerManufacturer.includes('novation')
    ) {
      return 'launchpad';
    }

    // AKAI MPK Mini
    if (
      lowerName.includes('mpk') ||
      (lowerManufacturer.includes('akai') && lowerName.includes('mini'))
    ) {
      return 'mpk';
    }

    // Generic MIDI fallback
    log.info('Unknown MIDI device, using generic driver', { name, manufacturer });
    return 'generic_midi';
  }

  /**
   * Connect to a specific device and start routing
   */
  async connect(deviceName: string): Promise<MIDIRouter | null> {
    const device = this.connectedDevices.get(deviceName);

    if (!device) {
      log.error('Device not found', { deviceName });
      return null;
    }

    try {
      this.router = new MIDIRouter(device);
      await this.router.start();

      log.info('Connected to hardware device', {
        type: device.type,
        name: device.name,
      });

      return this.router;
    } catch (error) {
      log.error('Failed to connect to device', error, { deviceName });
      return null;
    }
  }

  /**
   * Disconnect current device
   */
  async disconnect(): Promise<void> {
    if (this.router) {
      await this.router.stop();
      this.router = null;
      log.info('Disconnected from device');
    }
  }

  /**
   * Handle device disconnect event
   */
  private handleDeviceDisconnect(deviceName: string): void {
    this.connectedDevices.delete(deviceName);

    if (this.router && this.router.getDeviceName() === deviceName) {
      log.warn('Active device disconnected', { deviceName });
      this.router.stop();
      this.router = null;
    }
  }

  /**
   * Get list of connected devices
   */
  getConnectedDevices(): DetectedDevice[] {
    return Array.from(this.connectedDevices.values());
  }

  /**
   * Get current router
   */
  getRouter(): MIDIRouter | null {
    return this.router;
  }

  /**
   * Check if Web MIDI is supported
   */
  static isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;
  }

  /**
   * Cleanup and disable
   */
  async cleanup(): Promise<void> {
    await this.disconnect();

    if (this.initialized) {
      WebMidi.disable();
      this.initialized = false;
      log.info('MIDI Server cleaned up');
    }
  }
}
