import { ChevronLeft } from 'lucide-react'

interface BackButtonProps {
  onClick: () => void
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-tile bg-card cursor-pointer"
      style={{ border: '1px solid rgba(233,220,198,.10)' }}
    >
      <ChevronLeft size={18} strokeWidth={1.9} className="text-text-primary" />
    </button>
  )
}
