/**
 * AKAI MPK Mini Driver
 * Handles MPK Mini specific MIDI messages (pads, keys, knobs)
 */

import { Input, Output } from 'webmidi';
import {
  HardwareDriver,
  MIDIMessage,
  NormalizedInputEvent,
  LEDFeedback,
  HardwareDeviceType,
} from '../types';
import { logger } from '../utils/logger';

const log = logger.createScope('MPKDriver');

export class MPKDriver implements HardwareDriver {
  deviceType: HardwareDeviceType = 'mpk';
  name = 'AKAI MPK Mini';

  private midiIn: Input | null = null;
  private midiOut: Output | null = null;

  // MPK Mini layout constants
  private readonly PAD_BASE_NOTE = 36;
  private readonly PAD_COUNT = 8;
  private readonly KNOB_BASE_CC = 1;
  private readonly KNOB_COUNT = 8;
  private readonly KEY_BASE_NOTE = 48;
  private readonly KEY_COUNT = 25;

  async initialize(midiIn: unknown, midiOut: unknown): Promise<void> {
    this.midiIn = midiIn as Input;
    this.midiOut = midiOut as Output | undefined;

    log.info('MPK Mini driver initialized', {
      hasOutput: !!this.midiOut,
    });
  }

  normalizeMessage(message: MIDIMessage): NormalizedInputEvent | null {
    const { type, note, controller, value, velocity } = message;

    // Pads (8 pads on MPK Mini)
    if (type === 'noteon' && note !== undefined) {
      const padIndex = note - this.PAD_BASE_NOTE;

      if (padIndex >= 0 && padIndex < this.PAD_COUNT) {
        return {
          device: this.deviceType,
          inputType: 'pad',
          inputId: `pad-${padIndex}`,
          value: velocity || 0,
          velocity,
          timestamp: message.timestamp,
          metadata: { padIndex },
        };
      }

      // Keyboard keys
      const keyIndex = note - this.KEY_BASE_NOTE;
      if (keyIndex >= 0 && keyIndex < this.KEY_COUNT) {
        return {
          device: this.deviceType,
          inputType: 'key',
          inputId: `key-${note}`,
          value: velocity || 0,
          velocity,
          timestamp: message.timestamp,
          metadata: { keyIndex, note },
        };
      }
    }

    // Pad/key release
    if (type === 'noteoff' && note !== undefined) {
      const padIndex = note - this.PAD_BASE_NOTE;

      if (padIndex >= 0 && padIndex < this.PAD_COUNT) {
        return {
          device: this.deviceType,
          inputType: 'pad',
          inputId: `pad-${padIndex}`,
          value: 0,
          velocity: 0,
          timestamp: message.timestamp,
          metadata: { padIndex, released: true },
        };
      }

      const keyIndex = note - this.KEY_BASE_NOTE;
      if (keyIndex >= 0 && keyIndex < this.KEY_COUNT) {
        return {
          device: this.deviceType,
          inputType: 'key',
          inputId: `key-${note}`,
          value: 0,
          velocity: 0,
          timestamp: message.timestamp,
          metadata: { keyIndex, note, released: true },
        };
      }
    }

    // Knobs (8 rotary knobs)
    if (type === 'controlchange' && controller !== undefined) {
      const knobIndex = controller - this.KNOB_BASE_CC;

      if (knobIndex >= 0 && knobIndex < this.KNOB_COUNT) {
        return {
          device: this.deviceType,
          inputType: 'knob',
          inputId: `knob-${knobIndex}`,
          value: value || 0,
          timestamp: message.timestamp,
          metadata: { knobIndex },
        };
      }
    }

    return null;
  }

  async sendFeedback(feedback: LEDFeedback): Promise<void> {
    // MPK Mini has limited LED feedback (only pad LEDs in some models)
    if (!this.midiOut) {
      log.warn('Cannot send feedback: no output port');
      return;
    }

    log.warn('MPK Mini has limited LED feedback support', {
      inputId: feedback.inputId,
    });
  }

  async disconnect(): Promise<void> {
    this.midiIn = null;
    this.midiOut = null;

    log.info('MPK Mini driver disconnected');
  }

  getLayout(): Record<string, unknown> {
    return {
      pads: {
        count: this.PAD_COUNT,
        baseNote: this.PAD_BASE_NOTE,
      },
      knobs: {
        count: this.KNOB_COUNT,
        baseCC: this.KNOB_BASE_CC,
      },
      keys: {
        count: this.KEY_COUNT,
        baseNote: this.KEY_BASE_NOTE,
      },
    };
  }
}
