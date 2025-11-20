/**
 * OperatorOS State Store
 * Global state management using Zustand
 */

import { create } from 'zustand';
import type {
  OperatorState,
  OperatorOSTheme,
  OperatorAppID,
  OperatorWindow,
  OperatorNotification,
  OperatorPersona,
} from '../types';

interface OperatorStore extends OperatorState {
  // Window management
  openApp: (
    appId: OperatorAppID,
    route?: string,
    initialState?: Partial<Pick<OperatorWindow, 'position' | 'size' | 'isMaximised'>>
  ) => void;
  closeWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  minimiseWindow: (windowId: string) => void;
  maximiseWindow: (windowId: string) => void;
  moveWindow: (windowId: string, position: { x: number; y: number }) => void;
  resizeWindow: (windowId: string, size: { width: number; height: number }) => void;

  // Theme & persona
  setTheme: (theme: OperatorOSTheme) => void;
  setOperatorPersona: (persona: OperatorPersona) => void;

  // Notifications
  pushNotification: (notification: Omit<OperatorNotification, 'id' | 'createdAt'>) => void;
  dismissNotification: (id: string) => void;

  // Command palette
  toggleCommandPalette: () => void;
  closeCommandPalette: () => void;
  openCommandPalette: () => void;

  // Command history
  addToHistory: (command: string) => void;
}

const defaultDockApps: OperatorAppID[] = [
  'dashboard',
  'intel',
  'pitch',
  'tracker',
  'studio',
  'autopilot',
  'coach',
];

export const useOperatorStore = create<OperatorStore>((set, get) => ({
  // Initial state
  activeTheme: 'daw',
  windows: [],
  dockApps: defaultDockApps,
  commandHistory: [],
  notifications: [],
  operatorPersona: 'default',
  isCommandPaletteOpen: false,
  focusedWindowId: null,

  // Window management
  openApp: (appId, route, initialState) => {
    const state = get();

    // Check if window for this app already exists
    const existingWindow = state.windows.find(w => w.appId === appId);

    if (existingWindow) {
      // Focus existing window
      get().focusWindow(existingWindow.id);
      return;
    }

    // Default window state
    const defaultPosition = { x: 100 + state.windows.length * 40, y: 80 + state.windows.length * 40 };
    const defaultSize = { width: 1000, height: 700 };

    // Create new window with optional initial state from app profile
    const newWindow: OperatorWindow = {
      id: `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      appId,
      title: appId.charAt(0).toUpperCase() + appId.slice(1),
      position: initialState?.position || defaultPosition,
      size: initialState?.size || defaultSize,
      isFocused: true,
      isMinimised: false,
      isMaximised: initialState?.isMaximised || false,
      zIndex: state.windows.length + 1,
      route,
    };

    set(state => ({
      windows: [
        ...state.windows.map(w => ({ ...w, isFocused: false })),
        newWindow,
      ],
      focusedWindowId: newWindow.id,
    }));
  },

  closeWindow: (windowId) => {
    set(state => ({
      windows: state.windows.filter(w => w.id !== windowId),
      focusedWindowId: state.focusedWindowId === windowId ? null : state.focusedWindowId,
    }));
  },

  focusWindow: (windowId) => {
    set(state => {
      const maxZ = Math.max(...state.windows.map(w => w.zIndex), 0);

      return {
        windows: state.windows.map(w =>
          w.id === windowId
            ? { ...w, isFocused: true, isMinimised: false, zIndex: maxZ + 1 }
            : { ...w, isFocused: false }
        ),
        focusedWindowId: windowId,
      };
    });
  },

  minimiseWindow: (windowId) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === windowId
          ? { ...w, isMinimised: true, isFocused: false }
          : w
      ),
      focusedWindowId: state.focusedWindowId === windowId ? null : state.focusedWindowId,
    }));
  },

  maximiseWindow: (windowId) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === windowId
          ? { ...w, isMaximised: !w.isMaximised }
          : w
      ),
    }));
  },

  moveWindow: (windowId, position) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === windowId ? { ...w, position } : w
      ),
    }));
  },

  resizeWindow: (windowId, size) => {
    set(state => ({
      windows: state.windows.map(w =>
        w.id === windowId ? { ...w, size } : w
      ),
    }));
  },

  // Theme & persona
  setTheme: (theme) => {
    set({ activeTheme: theme });
  },

  setOperatorPersona: (persona) => {
    set({ operatorPersona: persona });
  },

  // Notifications
  pushNotification: (notification) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: OperatorNotification = {
      ...notification,
      id,
      createdAt: Date.now(),
    };

    set(state => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      get().dismissNotification(id);
    }, 5000);
  },

  dismissNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id),
    }));
  },

  // Command palette
  toggleCommandPalette: () => {
    set(state => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen }));
  },

  closeCommandPalette: () => {
    set({ isCommandPaletteOpen: false });
  },

  openCommandPalette: () => {
    set({ isCommandPaletteOpen: true });
  },

  // Command history
  addToHistory: (command) => {
    set(state => ({
      commandHistory: [...state.commandHistory, command].slice(-50), // Keep last 50
    }));
  },
}));
