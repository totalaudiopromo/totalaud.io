import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════
// HARDWARE DEVICE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export const HardwareDeviceTypeSchema = z.enum([
  'push2',
  'push3',
  'launchpad',
  'mpk',
  'generic_midi',
]);

export type HardwareDeviceType = z.infer<typeof HardwareDeviceTypeSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// MIDI MESSAGE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export const MIDIMessageTypeSchema = z.enum([
  'noteon',
  'noteoff',
  'controlchange',
  'programchange',
  'pitchbend',
  'aftertouch',
  'sysex',
]);

export type MIDIMessageType = z.infer<typeof MIDIMessageTypeSchema>;

export interface MIDIMessage {
  type: MIDIMessageType;
  channel: number;
  note?: number;
  velocity?: number;
  controller?: number;
  value?: number;
  timestamp: number;
  rawData: Uint8Array;
}

// ═══════════════════════════════════════════════════════════════════════════
// NORMALIZED INPUT EVENTS
// ═══════════════════════════════════════════════════════════════════════════

export const InputTypeSchema = z.enum([
  'pad',
  'encoder',
  'button',
  'fader',
  'strip',
  'key',
  'knob',
]);

export type InputType = z.infer<typeof InputTypeSchema>;

export interface NormalizedInputEvent {
  device: HardwareDeviceType;
  inputType: InputType;
  inputId: string;
  value: number;
  velocity?: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════
// HARDWARE ACTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const HardwareActionTypeSchema = z.enum([
  'open_window',
  'focus_window',
  'close_window',
  'cycle_window',
  'trigger_scene',
  'switch_scene',
  'run_agent',
  'spawn_agent',
  'run_skill',
  'control_param',
  'adjust_param',
  'toggle_mode',
  'save_snapshot',
  'trigger_command',
  'navigate',
  'cycle_theme',
  'toggle_flow_mode',
  'trigger_boot',
]);

export type HardwareActionType = z.infer<typeof HardwareActionTypeSchema>;

export interface HardwareAction {
  type: HardwareActionType;
  param: Record<string, unknown>;
  context?: string;
  metadata?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════
// HARDWARE MAPPING
// ═══════════════════════════════════════════════════════════════════════════

export interface HardwareMapping {
  id: string;
  profileId: string;
  inputType: InputType;
  inputId: string;
  action: HardwareActionType;
  param: Record<string, unknown>;
  feedback?: string | null;
  enabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const HardwareMappingCreateSchema = z.object({
  profileId: z.string().uuid(),
  inputType: InputTypeSchema,
  inputId: z.string(),
  action: HardwareActionTypeSchema,
  param: z.record(z.unknown()),
  feedback: z.string().nullable().optional(),
  enabled: z.boolean().default(true),
});

export type HardwareMappingCreate = z.infer<typeof HardwareMappingCreateSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// HARDWARE PROFILE
// ═══════════════════════════════════════════════════════════════════════════

export interface HardwareProfile {
  id: string;
  userId: string;
  deviceType: HardwareDeviceType;
  deviceId?: string | null;
  midiInPort?: string | null;
  midiOutPort?: string | null;
  layout: Record<string, unknown>;
  createdAt: Date;
  updatedAt?: Date;
}

export const HardwareProfileCreateSchema = z.object({
  userId: z.string().uuid(),
  deviceType: HardwareDeviceTypeSchema,
  deviceId: z.string().optional(),
  midiInPort: z.string().optional(),
  midiOutPort: z.string().optional(),
  layout: z.record(z.unknown()).default({}),
});

export type HardwareProfileCreate = z.infer<typeof HardwareProfileCreateSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// HARDWARE SESSION
// ═══════════════════════════════════════════════════════════════════════════

export interface HardwareSession {
  id: string;
  userId: string;
  deviceType: HardwareDeviceType;
  profileId?: string | null;
  startedAt: Date;
  endedAt?: Date | null;
  metadata: Record<string, unknown>;
  totalActions?: number;
  duration?: number;
}

export const HardwareSessionCreateSchema = z.object({
  userId: z.string().uuid(),
  deviceType: HardwareDeviceTypeSchema,
  profileId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).default({}),
});

export type HardwareSessionCreate = z.infer<typeof HardwareSessionCreateSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// LED FEEDBACK
// ═══════════════════════════════════════════════════════════════════════════

export interface LEDFeedback {
  inputId: string;
  colour: string; // British spelling
  intensity: number;
  mode: 'static' | 'pulse' | 'blink' | 'flow';
  duration?: number;
}

export const LEDFeedbackSchema = z.object({
  inputId: z.string(),
  colour: z.string(),
  intensity: z.number().min(0).max(127),
  mode: z.enum(['static', 'pulse', 'blink', 'flow']),
  duration: z.number().optional(),
});

// ═══════════════════════════════════════════════════════════════════════════
// DRIVER INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

export interface HardwareDriver {
  deviceType: HardwareDeviceType;
  name: string;

  /**
   * Initialize the driver with MIDI ports
   */
  initialize(midiIn: unknown, midiOut: unknown): Promise<void>;

  /**
   * Normalize a MIDI message to a standard input event
   */
  normalizeMessage(message: MIDIMessage): NormalizedInputEvent | null;

  /**
   * Send LED feedback to the device
   */
  sendFeedback(feedback: LEDFeedback): Promise<void>;

  /**
   * Disconnect and cleanup
   */
  disconnect(): Promise<void>;

  /**
   * Get device layout (pads, encoders, etc.)
   */
  getLayout(): Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════
// HCL SESSION STATE
// ═══════════════════════════════════════════════════════════════════════════

export interface HCLSessionState {
  sessionId: string | null;
  connected: boolean;
  deviceType: HardwareDeviceType | null;
  profile: HardwareProfile | null;
  mappings: HardwareMapping[];
  flowMode: boolean;
  lastActivity: Date | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export interface HCLConfig {
  enableWebMIDI: boolean;
  enableNodeMIDI: boolean;
  autoConnect: boolean;
  defaultFeedbackColour: string;
  flowModeTimeout: number; // ms
  sessionTimeout: number; // ms
}

export const defaultHCLConfig: HCLConfig = {
  enableWebMIDI: true,
  enableNodeMIDI: false,
  autoConnect: true,
  defaultFeedbackColour: '#3AA9BE', // Slate Cyan
  flowModeTimeout: 300000, // 5 minutes
  sessionTimeout: 1800000, // 30 minutes
};
