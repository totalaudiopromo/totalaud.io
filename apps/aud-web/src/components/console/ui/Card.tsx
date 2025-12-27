import { ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-ta-panel rounded-ta shadow-ta border border-ta-panel/50 transition-all duration-180',
        {
          'p-4': padding === 'sm',
          'p-6': padding === 'md',
          'p-8': padding === 'lg',
        },
        className
      )}
    >
      {children}
    </div>
  )
}
