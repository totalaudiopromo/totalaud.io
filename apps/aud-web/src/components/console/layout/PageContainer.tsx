import { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
}

export function PageContainer({ children }: PageContainerProps) {
  return <div className="max-w-[1600px] mx-auto px-8 py-8">{children}</div>
}
