/**
 * MIDI Normalizer
 * Converts WebMIDI MessageEvent to standardized MIDIMessage format
 */

import { MessageEvent } from 'webmidi';
import { MIDIMessage, MIDIMessageType } from '../types';

/**
 * Normalize WebMIDI MessageEvent to MIDIMessage
 */
export function normalizeMIDIMessage(event: MessageEvent): MIDIMessage {
  const type = getMIDIMessageType(event.type);

  const message: MIDIMessage = {
    type,
    channel: event.message.channel || 1,
    timestamp: event.timestamp || Date.now(),
    rawData: event.data || new Uint8Array(),
  };

  // Add type-specific data
  switch (type) {
    case 'noteon':
    case 'noteoff':
      message.note = event.note?.number;
      message.velocity = event.note?.rawAttack || 0;
      break;

    case 'controlchange':
      message.controller = event.controller?.number;
      message.value = event.value;
      break;

    case 'programchange':
      message.value = event.value;
      break;

    case 'pitchbend':
      message.value = event.value;
      break;

    case 'aftertouch':
      message.note = event.note?.number;
      message.value = event.value;
      break;

    case 'sysex':
      // SysEx data is in rawData
      break;
  }

  return message;
}

/**
 * Convert WebMIDI event type to MIDIMessageType
 */
function getMIDIMessageType(eventType: string): MIDIMessageType {
  switch (eventType.toLowerCase()) {
    case 'noteon':
      return 'noteon';
    case 'noteoff':
      return 'noteoff';
    case 'controlchange':
      return 'controlchange';
    case 'programchange':
      return 'programchange';
    case 'pitchbend':
      return 'pitchbend';
    case 'channelaftertouch':
    case 'aftertouch':
      return 'aftertouch';
    case 'sysex':
      return 'sysex';
    default:
      return 'controlchange'; // Fallback
  }
}

/**
 * Convert MIDI note number to pad grid position
 * Assumes standard 8x8 grid starting at note 36
 */
export function noteToPadPosition(note: number): { row: number; col: number } | null {
  const baseNote = 36; // Standard MIDI pad base note
  const offset = note - baseNote;

  if (offset < 0 || offset >= 64) {
    return null;
  }

  const row = Math.floor(offset / 8);
  const col = offset % 8;

  return { row, col };
}

/**
 * Convert pad grid position to MIDI note number
 */
export function padPositionToNote(row: number, col: number): number {
  const baseNote = 36;
  return baseNote + row * 8 + col;
}

/**
 * Convert RGB colour to MIDI velocity value (0-127)
 * Used for devices that support velocity-based LED colours
 */
export function rgbToVelocity(colour: string): number {
  // Parse hex colour
  const hex = colour.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate brightness (0-127)
  const brightness = Math.floor((r + g + b) / 3 / 2);
  return Math.min(127, Math.max(0, brightness));
}

/**
 * Convert colour name to RGB hex
 */
export function colourNameToHex(colourName: string): string {
  const colours: Record<string, string> = {
    red: '#FF0000',
    green: '#00FF00',
    blue: '#0000FF',
    cyan: '#00FFFF',
    'slate-cyan': '#3AA9BE',
    yellow: '#FFFF00',
    magenta: '#FF00FF',
    white: '#FFFFFF',
    orange: '#FF8800',
    purple: '#8800FF',
    pink: '#FF0088',
  };

  return colours[colourName.toLowerCase()] || colourName;
}
