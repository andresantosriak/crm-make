import { getInitials } from '@/lib/utils'

interface ClientAvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: { width: 40, height: 40, fontSize: 15 },
  md: { width: 44, height: 44, fontSize: 15 },
  lg: { width: 54, height: 54, fontSize: 24 },
} as const

export function ClientAvatar({ name, size = 'md' }: ClientAvatarProps) {
  const s = sizeMap[size]
  const initials = getInitials(name)

  return (
    <div
      className="flex items-center justify-center rounded-full font-medium shrink-0"
      style={{
        width: s.width,
        height: s.height,
        fontSize: s.fontSize,
        background: 'linear-gradient(135deg, #3a2f20, #241d14)',
        border: '1px solid rgba(200,162,76,.25)',
        color: '#C8A24C',
      }}
    >
      {initials}
    </div>
  )
}
