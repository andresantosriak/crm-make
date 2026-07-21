import { cn } from '@/lib/utils'
import type { ReactNode, ButtonHTMLAttributes } from 'react'

interface GoldButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  fullWidth?: boolean
}

export function GoldButton({ children, fullWidth, className, ...props }: GoldButtonProps) {
  return (
    <button
      className={cn(
        'rounded-[14px] border-none px-4 py-4 text-[15px] font-semibold tracking-[.4px] cursor-pointer',
        fullWidth && 'w-full',
        className,
      )}
      style={{
        background: 'linear-gradient(135deg, #d6b25c, #b78d3d)',
        color: '#1a1408',
        boxShadow: '0 8px 24px rgba(200,162,76,.22)',
      }}
      {...props}
    >
      {children}
    </button>
  )
}
