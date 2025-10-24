/**
 * UI Components
 *
 * Reusable UI components including ambient audio, effects, and common controls.
 */

// Ambient audio
export * from './ambient'
export { AmbientSoundLayer } from './AmbientSoundLayer'

// Visual effects
export * from './effects'

// UI Controls & Components
export { Button } from './Button'
export { CommandPalette } from './CommandPalette'
export { default as ConsoleShell, ConsolePanel } from './ConsoleShell'
export { EmptyState } from './EmptyState'
export { GlobalCommandPalette } from './GlobalCommandPalette'
export { IntegrationManager } from './IntegrationManager'
export {
  OperatorCommandPalette,
  OperatorCommandPaletteTrigger,
  useOperatorCommandPalette,
} from './OperatorCommandPalette'
export { default as OSCard } from './OSCard'
export { default as OSTransition } from './OSTransition'
export { SignalPresence } from './SignalPresence'
export { SmartComposer } from './SmartComposer'
export { SoundToggle, useSoundEnabled } from './SoundToggle'
export { default as ThemeToggle } from './ThemeToggle'
export { Tooltip } from './Tooltip'
