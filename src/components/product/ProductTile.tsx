import { getCategoryTile } from '@/lib/constants'

interface ProductTileProps {
  name: string
  category: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: { width: 38, height: 38, fontSize: 17, radius: 10 },
  md: { width: 46, height: 46, fontSize: 22, radius: 11 },
  lg: { width: '100%', height: 70, fontSize: 30, radius: 10 },
} as const

export function ProductTile({ name, category, size = 'md' }: ProductTileProps) {
  const tile = getCategoryTile(category)
  const s = sizeMap[size]
  const initial = name[0] ?? '?'

  return (
    <div
      className="flex items-center justify-center font-display font-semibold shrink-0"
      style={{
        width: s.width,
        height: s.height,
        borderRadius: s.radius,
        background: tile.bg,
        color: tile.text,
        fontSize: s.fontSize,
      }}
    >
      {initial}
    </div>
  )
}
