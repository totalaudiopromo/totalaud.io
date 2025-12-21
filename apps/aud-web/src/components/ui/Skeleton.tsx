import clsx from 'clsx'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div
      className={clsx('bg-white/5 rounded-xl animate-shimmer', className)}
      style={{
        width,
        height,
      }}
    />
  )
}
