interface MetricProps {
  label: string
  value: string | number
  change?: {
    value: number
    direction: 'up' | 'down'
  }
  format?: 'number' | 'percentage' | 'currency'
}

export function Metric({ label, value, change, format = 'number' }: MetricProps) {
  const formattedValue = () => {
    if (format === 'percentage') return `${value}%`
    if (format === 'currency') return `£${value}`
    return value
  }

  return (
    <div className="space-y-1">
      <p className="text-xs text-tap-grey uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-mono font-semibold text-tap-white">{formattedValue()}</p>
        {change && (
          <span
            className={clsx('text-xs font-mono', {
              'text-green-400': change.direction === 'up',
              'text-red-400': change.direction === 'down',
            })}
          >
            {change.direction === 'up' ? '↑' : '↓'} {Math.abs(change.value)}%
          </span>
        )}
      </div>
    </div>
  )
}

import clsx from 'clsx'
