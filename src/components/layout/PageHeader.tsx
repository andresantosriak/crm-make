import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  right?: ReactNode
  left?: ReactNode
}

export function PageHeader({ title, subtitle, right, left }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between py-2 pb-4">
      <div className="flex items-center gap-3">
        {left}
        <div>
          <h1 className="font-display text-[28px] font-medium text-text-primary">{title}</h1>
          {subtitle && <p className="text-[13px] text-text-secondary">{subtitle}</p>}
        </div>
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  )
}
