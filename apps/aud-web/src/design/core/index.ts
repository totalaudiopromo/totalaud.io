/**
 * FlowCore Design System
 *
 * Unified design token system for totalaud.io
 * Provides consistent motion, sound, typography, and textures across all themes.
 *
 * Usage:
 * ```tsx
 * import { flowCore, motionCore, soundCore } from '@/design/core'
 *
 * // Access motion tokens
 * <motion.div transition={flowCore.motion.transitions.smooth}>
 *
 * // Access sound tokens
 * playSound(flowCore.sound.ui.click)
 *
 * // Access typography
 * <h1 style={flowCore.typography.textStyles.hero}>
 * ```
 */

export { flowCore, useFlowCore, type FlowCore, type ThemeFlowCore } from './flowCore'
export {
  motionCore,
  easingCurves,
  durations,
  transitions,
  springs,
  toCubicBezier,
  toTransition,
  type MotionCore,
} from './motion'
export {
  soundCore,
  uiSounds,
  ambientSounds,
  themeSoundOverrides,
  playSound,
  createSoundPlayer,
  type SoundCore,
  type SoundConfig,
  type OscillatorType,
} from './sounds'
export {
  typographyCore,
  fonts,
  sizes,
  weights,
  lineHeights,
  letterSpacing,
  textStyles,
  maxWidths,
  toCSSClass,
  fluidSize,
  type TypographyCore,
} from './typography'
export {
  textureCore,
  shadows,
  glows,
  gradients,
  borders,
  borderRadius,
  backdrops,
  opacity,
  themeTextures,
  combineShadows,
  layerGradients,
  toBorder,
  type TextureCore,
} from './textures'
export {
  themePersonalities,
  getThemePersonality,
  getAllThemeIds,
  type ThemeId,
  type ThemePersonality,
  type MotionType,
  type TextureType,
} from './themes'
