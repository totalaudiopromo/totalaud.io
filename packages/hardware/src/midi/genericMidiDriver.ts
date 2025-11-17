/**
 * Generic MIDI Driver
 * Fallback driver for unknown/generic MIDI controllers
 * Maps all MIDI messages to generic input events
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

const log = logger.createScope('GenericMIDIDriver');

export class GenericMIDIDriver implements HardwareDriver {
  deviceType: HardwareDeviceType = 'generic_midi';
  name = 'Generic MIDI Controller';

  private midiIn: Input | null = null;
  private midiOut: Output | null = null;

  async initialize(midiIn: unknown, midiOut: unknown): Promise<void> {
    this.midiIn = midiIn as Input;
    this.midiOut = midiOut as Output | undefined;

    log.info('Generic MIDI driver initialized', {
      hasOutput: !!this.midiOut,
    });
  }

  normalizeMessage(message: MIDIMessage): NormalizedInputEvent | null {
    const { type, note, controller, value, velocity } = message;

    // Note on (treat as pads or keys)
    if (type === 'noteon' && note !== undefined) {
      return {
        device: this.deviceType,
        inputType: note < 60 ? 'pad' : 'key', // Heuristic: low notes = pads, high = keys
        inputId: `note-${note}`,
        value: velocity || 0,
        velocity,
        timestamp: message.timestamp,
        metadata: { note },
      };
    }

    // Note off
    if (type === 'noteoff' && note !== undefined) {
      return {
        device: this.deviceType,
        inputType: note < 60 ? 'pad' : 'key',
        inputId: `note-${note}`,
        value: 0,
        velocity: 0,
        timestamp: message.timestamp,
        metadata: { note, released: true },
      };
    }

    // Control change (treat as knobs/faders/buttons)
    if (type === 'controlchange' && controller !== undefined) {
      // Heuristic: CC 0-31 = knobs, 32-63 = faders, 64+ = buttons
      let inputType: 'knob' | 'fader' | 'button' = 'knob';

      if (controller >= 32 && controller < 64) {
        inputType = 'fader';
      } else if (controller >= 64) {
        inputType = 'button';
      }

      return {
        device: this.deviceType,
        inputType,
        inputId: `cc-${controller}`,
        value: value || 0,
        timestamp: message.timestamp,
        metadata: { controller },
      };
    }

    // Pitch bend
    if (type === 'pitchbend') {
      return {
        device: this.deviceType,
        inputType: 'fader',
        inputId: 'pitchbend',
        value: value || 0,
        timestamp: message.timestamp,
        metadata: { pitchbend: true },
      };
    }

    // Aftertouch
    if (type === 'aftertouch' && note !== undefined) {
      return {
        device: this.deviceType,
        inputType: 'pad',
        inputId: `aftertouch-${note}`,
        value: value || 0,
        timestamp: message.timestamp,
        metadata: { note, aftertouch: true },
      };
    }

    return null;
  }

  async sendFeedback(feedback: LEDFeedback): Promise<void> {
    // Generic MIDI has no standard LED feedback
    log.debug('Generic MIDI: LED feedback not supported', {
      inputId: feedback.inputId,
    });
  }

  async disconnect(): Promise<void> {
    this.midiIn = null;
    this.midiOut = null;

    log.info('Generic MIDI driver disconnected');
  }

  getLayout(): Record<string, unknown> {
    return {
      type: 'generic',
      note: 'All MIDI messages are mapped generically',
    };
  }
}
