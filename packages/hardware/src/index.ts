/**
 * Hardware Control Layer (HCL)
 * Main entry point for hardware controller integration
 */

// Types
export * from './types';

// MIDI Server & Router
export { MIDIServer, DetectedDevice } from './midi/midiServer';
export { MIDIRouter, InputEventCallback } from './midi/midiRouter';
export {
  normalizeMIDIMessage,
  noteToPadPosition,
  padPositionToNote,
  rgbToVelocity,
  colourNameToHex,
} from './midi/midiNormalizer';

// Drivers
export { Push2Driver } from './midi/push2Driver';
export { Push3Driver } from './midi/push3Driver';
export { LaunchpadDriver } from './midi/launchpadDriver';
export { MPKDriver } from './midi/mpkDriver';
export { GenericMIDIDriver } from './midi/genericMidiDriver';

// Mapping Engine
export { MappingEngine, ActionExecutor } from './mappingEngine';

// Action Handlers
export { OperatorActions, OperatorOSAPI } from './actions/operatorActions';
export { CISActions, CISAPI } from './actions/cisActions';
export { SceneActions, ScenesAPI } from './actions/sceneActions';
export { AgentActions, AgentAPI } from './actions/agentActions';

// Session Manager
export { SessionManager } from './sessionManager';

// Feedback Engine
export { FeedbackEngine, FeedbackPattern } from './feedbackEngine';

// Logger
export { logger, HCLLogger } from './utils/logger';
