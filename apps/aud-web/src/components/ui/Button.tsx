/**
 * Button Component
 *
 * Reusable button component with variant system and FlowCore design tokens.
 * Provides consistent styling, states, and interaction patterns.
 *
 * Phase 12.4: Theme Fusion - Theme-aware motion and sound feedback
 */

'use client'

import { ButtonHTMLAttributes, forwardRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useFlowTheme } from '@/hooks/useFlowTheme'
import { LucideIcon } from 'lucide-react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: ButtonVariant
  /** Size variant */
  size?: ButtonSize
  /** Optional icon (lucide-react) */
  icon?: LucideIcon
  /** Icon position */
  iconPosition?: 'left' | 'right'
  /** Full width button */
  fullWidth?: boolean
  /** Loading state */
  isLoading?: boolean
  /** Enable motion animation */
  animated?: boolean
  /** Enable sound feedback (click sound) */
  withSound?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:opacity-90 active:opacity-80 border border-accent',
  secondary:
    'bg-background text-foreground hover:bg-accent/10 active:bg-accent/20 border border-border',
  ghost:
    'bg-transparent text-accent hover:bg-accent/10 active:bg-accent/20 border border-transparent',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 border border-red-500',
}

const sizeStyles: Record<ButtonSize, { padding: string; fontSize: string; iconSize: string }> = {
  sm: {
    padding: 'px-3 py-1.5',
    fontSize: 'text-sm',
    iconSize: 'w-4 h-4',
  },
  md: {
    padding: 'px-4 py-2',
    fontSize: 'text-base',
    iconSize: 'w-4 h-4',
  },
  lg: {
    padding: 'px-6 py-3',
    fontSize: 'text-lg',
    iconSize: 'w-5 h-5',
  },
}

/**
 * Button - Reusable button component with variants
 *
 * @example
 * ```tsx
 * <Button variant="primary" icon={Plus}>
 *   Add Release
 * </Button>
 *
 * <Button variant="ghost" size="sm">
 *   Cancel
 * </Button>
 *
 * <Button variant="danger" isLoading disabled>
 *   Delete
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon: Icon,
      iconPosition = 'left',
      fullWidth = false,
      isLoading = false,
      animated = true,
      withSound = true,
      className = '',
      children,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const sizeConfig = sizeStyles[size]

    // Get theme-aware design tokens
    const { motion: themeMotion, sound: themeSound } = useFlowTheme()

    // Theme-aware sound feedback
    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (withSound && !disabled && !isLoading) {
          // Play theme-specific click sound
          themeSound.playClick()
        }
        onClick?.(e)
      },
      [withSound, disabled, isLoading, onClick, themeSound]
    )

    const baseClasses = `
      inline-flex items-center justify-center gap-2
      ${sizeConfig.padding} ${sizeConfig.fontSize}
      rounded-lg font-medium
      transition-all duration-[120ms]
      focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      ${variantStyles[variant]}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `

    const content = (
      <>
        {Icon && iconPosition === 'left' && (
          <Icon className={`${sizeConfig.iconSize} ${isLoading ? 'animate-spin' : ''}`} />
        )}
        {children}
        {Icon && iconPosition === 'right' && (
          <Icon className={`${sizeConfig.iconSize} ${isLoading ? 'animate-spin' : ''}`} />
        )}
      </>
    )

    if (animated) {
      return (
        <motion.button
          ref={ref}
          className={baseClasses}
          disabled={disabled || isLoading}
          onClick={handleClick}
          whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
          whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
          transition={themeMotion.transition}
          {...props}
        >
          {content}
        </motion.button>
      )
    }

    return (
      <button
        ref={ref}
        className={baseClasses}
        disabled={disabled || isLoading}
        onClick={handleClick}
        {...props}
      >
        {content}
      </button>
    )
  }
)

Button.displayName = 'Button'
