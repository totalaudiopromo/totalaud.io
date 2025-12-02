import { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-2xl font-semibold text-tap-white lowercase tracking-tight">{title}</h2>
        {description && <p className="mt-1 text-sm text-tap-grey lowercase">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
