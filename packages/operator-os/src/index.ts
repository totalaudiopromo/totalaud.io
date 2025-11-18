/**
 * OperatorOS Package Entry Point
 * Exports all public components, hooks, and utilities
 */

// Components
export { OperatorDesktop } from './components/OperatorDesktop';
export { OperatorWindow } from './components/OperatorWindow';
export { OperatorDock } from './components/OperatorDock';
export { OperatorTopBar } from './components/OperatorTopBar';
export { OperatorCommandPalette } from './components/OperatorCommandPalette';
export { OperatorNotifications } from './components/OperatorNotifications';
export { OperatorStatusBar } from './components/OperatorStatusBar';
export { OperatorAppSwitcher } from './components/OperatorAppSwitcher';
export { OperatorLayoutSwitcher } from './components/OperatorLayoutSwitcher';
export { OperatorPersonaIndicator } from './components/OperatorPersonaIndicator';
export { OperatorLayoutManager } from './components/OperatorLayoutManager';
export { OperatorPersonaPanel } from './components/OperatorPersonaPanel';
export { OperatorPersonaSuggestionStrip } from './components/OperatorPersonaSuggestionStrip';
export { AppProfilePopover } from './components/AppProfilePopover';

// Hooks
export { useOperatorHotkeys } from './hooks/useOperatorHotkeys';
export { useWindowManager } from './hooks/useWindowManager';

// State
export { useOperatorStore } from './state/operatorStore';
export { useLayoutStore } from './state/layoutStore';
export { useThemeStore } from './state/themeStore';

// Layout Persistence
export {
  loadLayout,
  saveLayout,
  listLayouts,
  deleteLayout,
  applyLayoutToStore,
  extractLayoutFromStore,
  exportLayoutToJson,
  importLayoutFromJson,
  createDebouncedLayoutSave,
} from './state/layoutPersistence';

export type {
  OperatorLayout,
  OperatorLayoutWindow,
  OperatorLayoutSummary,
} from './state/layoutPersistence';

// App Profiles
export {
  getAppProfile,
  setAppProfile,
  getPinnedApps,
  resolveInitialWindowState,
  updateAppProfileWithWindowState,
  toggleAppPinning,
} from './state/appProfiles';

export type {
  AppProfile,
  LaunchMode,
} from './state/appProfiles';

// Themes
export { themes, xpTheme, aquaTheme, dawTheme, asciiTheme, analogueTheme } from './themes';

// Types
export type {
  OperatorOSTheme,
  OperatorAppID,
  OperatorPersona,
  OperatorWindow,
  OperatorNotification,
  OperatorState,
  ThemeTokens,
  OperatorCommand,
} from './types';

// Utils
export * from './utils/windowLayout';
export * from './utils/animations';
