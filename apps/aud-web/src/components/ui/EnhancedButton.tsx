/**
 * Enhanced Button Component
 *
 * Beautiful buttons with glow effects and satisfying feedback
 * Using className-based styling to avoid framer-motion type conflicts
 */

'use client'

import { motion } from 'framer-motion'
import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'success' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface EnhancedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  isLoading?: boolean
  glow?: boolean
}

export const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      leftIcon,
      rightIcon,
      isLoading,
      glow = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      primary: 'bg-gradient-to-br from-[#3AA9BE] to-[#2D8A9B] text-white border-none',
      secondary: 'bg-white/5 text-[#F7F8F9] border border-white/10',
      ghost: 'bg-transparent text-white/80 border border-transparent hover:bg-white/5',
      success: 'bg-gradient-to-br from-[#10B981] to-[#059669] text-white border-none',
      danger: 'bg-gradient-to-br from-[#EF4444] to-[#DC2626] text-white border-none',
    }

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-[13px] rounded-md gap-1',
      md: 'px-4 py-2.5 text-sm rounded-lg gap-1.5',
      lg: 'px-6 py-3.5 text-[15px] rounded-xl gap-2',
    }

    const baseClasses = `
      inline-flex items-center justify-center font-medium
      transition-all duration-200 ease-out
      relative overflow-hidden
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      ${glow ? 'btn-glow' : ''}
      ${className}
    `
      .trim()
      .replace(/\s+/g, ' ')

    return (
      <motion.button
        ref={ref}
        className={baseClasses}
        disabled={disabled || isLoading}
        whileHover={
          !disabled && !isLoading
            ? {
                scale: 1.02,
                y: -1,
              }
            : undefined
        }
        whileTap={
          !disabled && !isLoading
            ? {
                scale: 0.98,
                y: 0,
              }
            : undefined
        }
        {...props}
      >
        {isLoading && (
          <motion.span
            className="mr-1.5"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            ⟳
          </motion.span>
        )}

        {leftIcon && !isLoading && <span className="flex">{leftIcon}</span>}

        <span className="relative z-10">{children}</span>

        {rightIcon && <span className="flex">{rightIcon}</span>}
      </motion.button>
    )
  }
)

EnhancedButton.displayName = 'EnhancedButton'

// Quick action button with icon
interface QuickActionProps {
  icon: string
  label: string
  onClick: () => void
  active?: boolean
}

export function QuickAction({ icon, label, onClick, active }: QuickActionProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        flex flex-col items-center gap-1.5 px-4 py-3 min-w-[80px]
        rounded-xl cursor-pointer
        ${
          active
            ? 'bg-[#3AA9BE]/15 border border-[#3AA9BE]/30'
            : 'bg-white/[0.03] border border-white/[0.06]'
        }
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="text-2xl">{icon}</span>
      <span
        className={`
        text-xs font-medium
        ${active ? 'text-[#3AA9BE]' : 'text-white/70'}
      `}
      >
        {label}
      </span>
    </motion.button>
  )
}
