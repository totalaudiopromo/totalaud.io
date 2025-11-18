/**
 * OperatorOS Types
 * Core type definitions for the OperatorOS desktop environment
 */

export type OperatorOSTheme = 'xp' | 'aqua' | 'daw' | 'ascii' | 'analogue';

export type OperatorAppID =
  | 'dashboard'
  | 'intel'
  | 'pitch'
  | 'tracker'
  | 'studio'
  | 'community'
  | 'autopilot'
  | 'automations'
  | 'coach'
  | 'scenes'
  | 'mig'
  | 'anr'
  | 'settings'
  | 'terminal';

export type OperatorPersona = 'default' | 'strategist' | 'producer' | 'campaign' | 'dev';

export interface OperatorWindow {
  id: string;
  appId: OperatorAppID;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isFocused: boolean;
  isMinimised: boolean;
  isMaximised: boolean;
  zIndex: number;
  route?: string;
}

export interface OperatorNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: number;
}

export interface OperatorState {
  activeTheme: OperatorOSTheme;
  windows: OperatorWindow[];
  dockApps: OperatorAppID[];
  commandHistory: string[];
  notifications: OperatorNotification[];
  operatorPersona: OperatorPersona;
  isCommandPaletteOpen: boolean;
  focusedWindowId: string | null;
}

export interface ThemeTokens {
  name: string;
  background: string;
  windowChrome: {
    background: string;
    border: string;
    titleBar: string;
    titleBarText: string;
    buttonHover: string;
  };
  dock: {
    background: string;
    border: string;
    itemHover: string;
  };
  accent: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  border: string;
  shadow: string;
  noise?: string;
}

export interface OperatorCommand {
  id: string;
  label: string;
  description?: string;
  keywords?: string[];
  handler: () => void;
  icon?: string;
}
