/**
 * MIDI Router
 * Routes MIDI messages to appropriate driver and normalizes events
 */

import { Input, Output, MessageEvent } from 'webmidi';
import { HardwareDriver, MIDIMessage, NormalizedInputEvent } from '../types';
import { logger } from '../utils/logger';
import { DetectedDevice } from './midiServer';
import { normalizeMIDIMessage } from './midiNormalizer';

// Import drivers
import { Push2Driver } from './push2Driver';
import { Push3Driver } from './push3Driver';
import { LaunchpadDriver } from './launchpadDriver';
import { MPKDriver } from './mpkDriver';
import { GenericMIDIDriver } from './genericMidiDriver';

const log = logger.createScope('MIDIRouter');

export type InputEventCallback = (event: NormalizedInputEvent) => void;

export class MIDIRouter {
  private device: DetectedDevice;
  private driver: HardwareDriver;
  private midiIn: Input;
  private midiOut?: Output;
  private callbacks: InputEventCallback[] = [];
  private running = false;

  constructor(device: DetectedDevice) {
    this.device = device;
    this.midiIn = device.midiIn;
    this.midiOut = device.midiOut;

    // Initialize appropriate driver
    this.driver = this.createDriver(device.type);

    log.info('MIDI Router created', {
      deviceType: device.type,
      driverName: this.driver.name,
    });
  }

  /**
   * Create driver instance based on device type
   */
  private createDriver(deviceType: string): HardwareDriver {
    switch (deviceType) {
      case 'push2':
        return new Push2Driver();
      case 'push3':
        return new Push3Driver();
      case 'launchpad':
        return new LaunchpadDriver();
      case 'mpk':
        return new MPKDriver();
      case 'generic_midi':
      default:
        return new GenericMIDIDriver();
    }
  }

  /**
   * Start routing MIDI messages
   */
  async start(): Promise<void> {
    if (this.running) {
      log.warn('Router already running');
      return;
    }

    try {
      // Initialize driver
      await this.driver.initialize(this.midiIn, this.midiOut);

      // Listen to all MIDI message types
      this.midiIn.addListener('noteon', this.handleMIDIMessage.bind(this));
      this.midiIn.addListener('noteoff', this.handleMIDIMessage.bind(this));
      this.midiIn.addListener('controlchange', this.handleMIDIMessage.bind(this));
      this.midiIn.addListener('pitchbend', this.handleMIDIMessage.bind(this));
      this.midiIn.addListener('programchange', this.handleMIDIMessage.bind(this));
      this.midiIn.addListener('channelaftertouch', this.handleMIDIMessage.bind(this));
      this.midiIn.addListener('sysex', this.handleMIDIMessage.bind(this));

      this.running = true;

      log.info('MIDI Router started', {
        device: this.device.name,
        driver: this.driver.name,
      });
    } catch (error) {
      log.error('Failed to start MIDI Router', error);
      throw error;
    }
  }

  /**
   * Stop routing MIDI messages
   */
  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    // Remove all listeners
    this.midiIn.removeListener();

    // Disconnect driver
    await this.driver.disconnect();

    this.running = false;
    this.callbacks = [];

    log.info('MIDI Router stopped');
  }

  /**
   * Handle incoming MIDI message
   */
  private handleMIDIMessage(event: MessageEvent): void {
    try {
      // Convert WebMIDI event to our MIDIMessage format
      const midiMessage = normalizeMIDIMessage(event);

      log.debug('MIDI message received', {
        type: midiMessage.type,
        channel: midiMessage.channel,
        note: midiMessage.note,
        value: midiMessage.value,
      });

      // Pass to driver for normalization
      const normalizedEvent = this.driver.normalizeMessage(midiMessage);

      if (normalizedEvent) {
        log.debug('Input event normalized', {
          inputType: normalizedEvent.inputType,
          inputId: normalizedEvent.inputId,
          value: normalizedEvent.value,
        });

        // Trigger callbacks
        this.triggerCallbacks(normalizedEvent);
      }
    } catch (error) {
      log.error('Error handling MIDI message', error);
    }
  }

  /**
   * Add input event callback
   */
  onInput(callback: InputEventCallback): () => void {
    this.callbacks.push(callback);

    // Return unsubscribe function
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    };
  }

  /**
   * Trigger all input event callbacks
   */
  private triggerCallbacks(event: NormalizedInputEvent): void {
    for (const callback of this.callbacks) {
      try {
        callback(event);
      } catch (error) {
        log.error('Error in input callback', error);
      }
    }
  }

  /**
   * Send feedback to device
   */
  async sendFeedback(inputId: string, colour: string, intensity: number, mode: 'static' | 'pulse' | 'blink' | 'flow'): Promise<void> {
    try {
      await this.driver.sendFeedback({
        inputId,
        colour,
        intensity,
        mode,
      });
    } catch (error) {
      log.error('Error sending feedback', error, { inputId, colour });
    }
  }

  /**
   * Get device layout
   */
  getLayout(): Record<string, unknown> {
    return this.driver.getLayout();
  }

  /**
   * Get device name
   */
  getDeviceName(): string {
    return this.device.name;
  }

  /**
   * Get device type
   */
  getDeviceType(): string {
    return this.device.type;
  }

  /**
   * Get driver instance
   */
  getDriver(): HardwareDriver {
    return this.driver;
  }

  /**
   * Check if router is running
   */
  isRunning(): boolean {
    return this.running;
  }
}
