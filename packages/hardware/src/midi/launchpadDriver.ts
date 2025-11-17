/**
 * Novation Launchpad Pro Driver
 * Handles Launchpad specific MIDI messages and RGB LED feedback
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
import { noteToPadPosition, colourNameToHex } from './midiNormalizer';

const log = logger.createScope('LaunchpadDriver');

export class LaunchpadDriver implements HardwareDriver {
  deviceType: HardwareDeviceType = 'launchpad';
  name = 'Novation Launchpad Pro';

  private midiIn: Input | null = null;
  private midiOut: Output | null = null;

  // Launchpad layout constants
  private readonly PAD_BASE_NOTE = 11;
  private readonly PAD_ROWS = 8;
  private readonly PAD_COLS = 8;

  // Launchpad colour palette (RGB velocity mapping)
  private readonly COLOURS: Record<string, number> = {
    off: 0,
    red: 5,
    'red-dim': 7,
    orange: 9,
    yellow: 13,
    green: 21,
    'green-dim': 23,
    cyan: 37,
    'slate-cyan': 37,
    blue: 45,
    purple: 49,
    pink: 53,
    white: 3,
  };

  async initialize(midiIn: unknown, midiOut: unknown): Promise<void> {
    this.midiIn = midiIn as Input;
    this.midiOut = midiOut as Output | undefined;

    log.info('Launchpad driver initialized', {
      hasOutput: !!this.midiOut,
    });

    // Send initialization (enter programmer mode)
    if (this.midiOut) {
      await this.sendInitSequence();
    }
  }

  /**
   * Enter Launchpad Programmer Mode
   */
  private async sendInitSequence(): Promise<void> {
    if (!this.midiOut) return;

    try {
      // SysEx to enter programmer mode
      const sysex = [0xf0, 0x00, 0x20, 0x29, 0x02, 0x10, 0x21, 0x01, 0xf7];
      this.midiOut.send(sysex);

      log.info('Launchpad programmer mode enabled');
    } catch (error) {
      log.error('Error sending init sequence', error);
    }
  }

  normalizeMessage(message: MIDIMessage): NormalizedInputEvent | null {
    const { type, note, controller, value, velocity } = message;

    // Pad press
    if (type === 'noteon' && note !== undefined) {
      const position = this.noteToPadPosition(note);

      if (position) {
        return {
          device: this.deviceType,
          inputType: 'pad',
          inputId: `pad-${position.row}-${position.col}`,
          value: velocity || 0,
          velocity,
          timestamp: message.timestamp,
          metadata: { row: position.row, col: position.col },
        };
      }
    }

    // Pad release
    if (type === 'noteoff' && note !== undefined) {
      const position = this.noteToPadPosition(note);

      if (position) {
        return {
          device: this.deviceType,
          inputType: 'pad',
          inputId: `pad-${position.row}-${position.col}`,
          value: 0,
          velocity: 0,
          timestamp: message.timestamp,
          metadata: { row: position.row, col: position.col, released: true },
        };
      }
    }

    // Scene buttons (top row)
    if (type === 'controlchange' && controller !== undefined) {
      if (controller >= 104 && controller <= 111) {
        const sceneIndex = controller - 104;
        return {
          device: this.deviceType,
          inputType: 'button',
          inputId: `scene-${sceneIndex}`,
          value: value || 0,
          timestamp: message.timestamp,
          metadata: { sceneIndex, pressed: value === 127 },
        };
      }
    }

    return null;
  }

  /**
   * Launchpad-specific note to pad position
   * Launchpad uses note 11 as base
   */
  private noteToPadPosition(note: number): { row: number; col: number } | null {
    if (note < this.PAD_BASE_NOTE) {
      return null;
    }

    const offset = note - this.PAD_BASE_NOTE;

    // Launchpad uses 10-column layout (8 pads + 2 side buttons)
    // We only care about the 8x8 grid
    const row = Math.floor(offset / 10);
    const col = offset % 10;

    if (row >= 0 && row < 8 && col >= 0 && col < 8) {
      return { row, col };
    }

    return null;
  }

  async sendFeedback(feedback: LEDFeedback): Promise<void> {
    if (!this.midiOut) {
      log.warn('Cannot send feedback: no output port');
      return;
    }

    try {
      const { inputId, colour, intensity, mode } = feedback;

      // Parse pad ID
      const padMatch = inputId.match(/pad-(\d+)-(\d+)/);
      if (padMatch) {
        const row = parseInt(padMatch[1], 10);
        const col = parseInt(padMatch[2], 10);
        const note = this.PAD_BASE_NOTE + row * 10 + col;

        // Get colour velocity
        const colourVelocity = this.COLOURS[colour.toLowerCase()] || this.COLOURS['slate-cyan'];

        // Adjust for intensity
        const adjustedVelocity = Math.min(127, Math.max(0, colourVelocity + Math.floor(intensity / 10)));

        // Send note on with colour
        this.midiOut.sendNoteOn(note, adjustedVelocity, { channels: 1 });

        // Handle blink/pulse modes
        if (mode === 'blink') {
          const duration = feedback.duration || 500;
          setTimeout(() => {
            if (this.midiOut) {
              this.midiOut.sendNoteOff(note, { channels: 1 });
            }
          }, duration);
        } else if (mode === 'pulse') {
          // Pulse mode using velocity modulation
          const duration = feedback.duration || 500;
          setTimeout(() => {
            if (this.midiOut) {
              this.midiOut.sendNoteOn(note, Math.floor(adjustedVelocity / 2), { channels: 1 });
            }
          }, duration);
        }
      }
    } catch (error) {
      log.error('Error sending feedback', error, { inputId: feedback.inputId });
    }
  }

  async disconnect(): Promise<void> {
    // Exit programmer mode
    if (this.midiOut) {
      try {
        const sysex = [0xf0, 0x00, 0x20, 0x29, 0x02, 0x10, 0x21, 0x00, 0xf7];
        this.midiOut.send(sysex);
      } catch (error) {
        log.error('Error sending disconnect sequence', error);
      }
    }

    this.midiIn = null;
    this.midiOut = null;

    log.info('Launchpad driver disconnected');
  }

  getLayout(): Record<string, unknown> {
    return {
      pads: {
        rows: this.PAD_ROWS,
        cols: this.PAD_COLS,
        baseNote: this.PAD_BASE_NOTE,
      },
      colours: this.COLOURS,
    };
  }
}
