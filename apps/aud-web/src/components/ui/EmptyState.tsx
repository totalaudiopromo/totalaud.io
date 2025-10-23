/**
 * EmptyState Component
 *
 * Reusable empty state UI with consistent styling, icon, and call-to-action.
 * Used across all workspace tabs to maintain visual consistency.
 *
 * Stage 2: Experience Composer - UX Consistency
 */

'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

export interface EmptyStateProps {
  /** Icon component from lucide-react */
  icon: LucideIcon
  /** Primary heading text */
  title: string
  /** Optional descriptive text below title */
  description?: string
  /** Optional CTA button label */
  ctaLabel?: string
  /** Optional click handler for CTA button */
  onClick?: () => void
  /** Optional variant for different contexts */
  variant?: 'default' | 'bordered'
}

/**
 * EmptyState - Consistent empty state UI component
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={Music}
 *   title="No releases yet"
 *   description="Add your first release to get started"
 *   ctaLabel="Add Release"
 *   onClick={handleAddRelease}
 * />
 * ```
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  onClick,
  variant = 'default',
}: EmptyStateProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  }

  const baseClasses = 'text-center py-12'
  const variantClasses =
    variant === 'bordered'
      ? 'border-2 border-dashed border-border rounded-lg'
      : ''

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Icon */}
      <Icon className="w-12 h-12 mx-auto mb-4 text-muted" />

      {/* Title */}
      <h3 className="text-lg font-medium mb-2 text-foreground">{title}</h3>

      {/* Description (optional) */}
      {description && (
        <p className="text-muted mb-6 max-w-md mx-auto">{description}</p>
      )}

      {/* CTA Button (optional) */}
      {ctaLabel && onClick && (
        <button
          onClick={onClick}
          className="text-accent hover:underline font-medium transition-all"
        >
          {ctaLabel} →
        </button>
      )}
    </motion.div>
  )
}
