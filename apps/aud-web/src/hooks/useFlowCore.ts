/**
 * useFlowCore Hook
 *
 * Convenient re-export of the FlowCore hook for easier imports.
 *
 * Usage:
 * ```tsx
 * import { useFlowCore } from '@/hooks/useFlowCore'
 *
 * function MyComponent() {
 *   const { motion, sound, typography, texture, theme } = useFlowCore()
 *
 *   return (
 *     <motion.div transition={motion.transitions.smooth}>
 *       <h1 style={typography.textStyles.hero}>Hello {theme.name}</h1>
 *     </motion.div>
 *   )
 * }
 * ```
 */

export { useFlowCore, type ThemeFlowCore } from '@/design/core/flowCore'
