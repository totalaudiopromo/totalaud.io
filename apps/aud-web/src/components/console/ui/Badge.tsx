import clsx from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md'
}

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  return (
    <span
      className={clsx('inline-flex items-center rounded-full font-mono lowercase', {
        'px-2 py-0.5 text-xs': size === 'sm',
        'px-3 py-1 text-sm': size === 'md',
        'bg-ta-panel text-ta-white': variant === 'default',
        'bg-green-500/20 text-green-400': variant === 'success',
        'bg-yellow-500/20 text-yellow-400': variant === 'warning',
        'bg-red-500/20 text-red-400': variant === 'error',
        'bg-ta-cyan/20 text-ta-cyan': variant === 'info',
      })}
    >
      {children}
    </span>
  )
}
