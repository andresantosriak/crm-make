import { LOW_STOCK_THRESHOLD } from '@/lib/constants'

interface StockBadgeProps {
  stock: number
  threshold?: number
}

export function StockBadge({ stock, threshold = LOW_STOCK_THRESHOLD }: StockBadgeProps) {
  const isLow = stock <= threshold
  return (
    <span
      className="rounded-chip px-2.5 py-[5px] text-xs font-medium"
      style={{
        background: isLow ? 'rgba(208,124,103,.16)' : 'rgba(143,169,138,.14)',
        color: isLow ? '#D07C67' : '#8FA98A',
      }}
    >
      {stock} un.
    </span>
  )
}
