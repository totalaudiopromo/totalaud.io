/**
 * Ableton Push 2 Driver
 * Handles Push 2 specific MIDI messages and LED feedback
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
import { noteToPadPosition, colourNameToHex, rgbToVelocity } from './midiNormalizer';

const log = logger.createScope('Push2Driver');

export class Push2Driver implements HardwareDriver {
  deviceType: HardwareDeviceType = 'push2';
  name = 'Ableton Push 2';

  private midiIn: Input | null = null;
  private midiOut: Output | null = null;

  // Push 2 layout constants
  private readonly PAD_BASE_NOTE = 36;
  private readonly PAD_ROWS = 8;
  private readonly PAD_COLS = 8;
  private readonly ENCODER_BASE_CC = 71;
  private readonly ENCODER_COUNT = 8;
  private readonly TOUCH_STRIP_CC = 1;

  // Button CC mappings
  private readonly BUTTONS: Record<number, string> = {
    3: 'tap-tempo',
    9: 'metronome',
    28: 'undo',
    29: 'delete',
    43: 'quantize',
    44: 'duplicate',
    48: 'new',
    49: 'automation',
    50: 'fixed-length',
    85: 'device',
    86: 'browse',
    87: 'track',
    88: 'clip',
    89: 'volume',
    90: 'pan-send',
    102: 'master',
    103: 'stop',
    104: 'select',
    105: 'shift',
    106: 'note',
    107: 'session',
    108: 'add-effect',
    109: 'add-track',
    110: 'octave-down',
    111: 'octave-up',
    112: 'repeat',
    113: 'accent',
    114: 'scales',
    115: 'user',
    116: 'mute',
    117: 'solo',
    118: 'play',
  };

  async initialize(midiIn: unknown, midiOut: unknown): Promise<void> {
    this.midiIn = midiIn as Input;
    this.midiOut = midiOut as Output | undefined;

    log.info('Push 2 driver initialized', {
      hasOutput: !!this.midiOut,
    });

    // Send initialization sequence (if output available)
    if (this.midiOut) {
      await this.sendInitSequence();
    }
  }

  /**
   * Send Push 2 initialization sequence
   * Puts device in User Mode for custom LED control
   */
  private async sendInitSequence(): Promise<void> {
    if (!this.midiOut) return;

    try {
      // Enter User Mode (enables custom LED control)
      this.midiOut.sendControlChange(15, 127, 1);

      log.info('Push 2 initialization sequence sent');
    } catch (error) {
      log.error('Error sending init sequence', error);
    }
  }

  normalizeMessage(message: MIDIMessage): NormalizedInputEvent | null {
    const { type, note, controller, value, velocity } = message;

    // Pad press (8x8 grid)
    if (type === 'noteon' && note !== undefined) {
      const position = noteToPadPosition(note);

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
      const position = noteToPadPosition(note);

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

    // Encoders (8 rotary encoders)
    if (type === 'controlchange' && controller !== undefined) {
      const encoderIndex = controller - this.ENCODER_BASE_CC;

      if (encoderIndex >= 0 && encoderIndex < this.ENCODER_COUNT) {
        // Push 2 encoders send relative values
        // 1-64 = clockwise, 65-127 = counter-clockwise
        const delta = value !== undefined && value > 64 ? -(128 - value) : value || 0;

        return {
          device: this.deviceType,
          inputType: 'encoder',
          inputId: `encoder-${encoderIndex}`,
          value: delta,
          timestamp: message.timestamp,
          metadata: { encoderIndex, delta },
        };
      }

      // Touch strip
      if (controller === this.TOUCH_STRIP_CC) {
        return {
          device: this.deviceType,
          inputType: 'strip',
          inputId: 'touch-strip',
          value: value || 0,
          timestamp: message.timestamp,
        };
      }

      // Buttons
      const buttonName = this.BUTTONS[controller];
      if (buttonName) {
        return {
          device: this.deviceType,
          inputType: 'button',
          inputId: buttonName,
          value: value || 0,
          timestamp: message.timestamp,
          metadata: { pressed: value === 127 },
        };
      }
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
        const note = this.PAD_BASE_NOTE + row * this.PAD_COLS + col;

        // Convert colour to velocity
        const colourHex = colourNameToHex(colour);
        const velocity = Math.min(127, Math.max(1, intensity || rgbToVelocity(colourHex)));

        // Send note on with velocity for LED colour
        this.midiOut.sendNoteOn(note, velocity, { channels: 1 });

        // Handle pulse/blink modes
        if (mode === 'pulse' || mode === 'blink') {
          const duration = feedback.duration || 500;
          setTimeout(() => {
            if (this.midiOut) {
              if (mode === 'blink') {
                this.midiOut.sendNoteOff(note, { channels: 1 });
              } else {
                // Pulse: fade to lower intensity
                this.midiOut.sendNoteOn(note, Math.floor(velocity / 2), { channels: 1 });
              }
            }
          }, duration);
        }
      }
    } catch (error) {
      log.error('Error sending feedback', error, { inputId: feedback.inputId });
    }
  }

  async disconnect(): Promise<void> {
    // Exit User Mode
    if (this.midiOut) {
      try {
        this.midiOut.sendControlChange(15, 0, 1);
      } catch (error) {
        log.error('Error sending disconnect sequence', error);
      }
    }

    this.midiIn = null;
    this.midiOut = null;

    log.info('Push 2 driver disconnected');
  }

  getLayout(): Record<string, unknown> {
    return {
      pads: {
        rows: this.PAD_ROWS,
        cols: this.PAD_COLS,
        baseNote: this.PAD_BASE_NOTE,
      },
      encoders: {
        count: this.ENCODER_COUNT,
        baseCC: this.ENCODER_BASE_CC,
      },
      touchStrip: {
        cc: this.TOUCH_STRIP_CC,
      },
      buttons: this.BUTTONS,
    };
  }
}
