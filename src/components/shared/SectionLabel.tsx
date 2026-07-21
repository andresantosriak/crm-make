import type { ReactNode } from 'react'

interface SectionLabelProps {
  children: ReactNode
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <p className="mb-2.5 text-[11px] font-normal uppercase tracking-[1.2px] text-text-secondary">
      {children}
    </p>
  )
}
