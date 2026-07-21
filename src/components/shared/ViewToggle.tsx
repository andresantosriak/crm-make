import { List, LayoutGrid } from 'lucide-react'

interface ViewToggleProps {
  mode: 'lista' | 'grade'
  onToggle: (mode: 'lista' | 'grade') => void
}

export function ViewToggle({ mode, onToggle }: ViewToggleProps) {
  return (
    <div
      className="flex rounded-tile p-[3px] bg-card"
      style={{ border: '1px solid rgba(233,220,198,.10)' }}
    >
      <button
        onClick={() => onToggle('lista')}
        className="flex h-[34px] w-[38px] items-center justify-center rounded-lg border-none cursor-pointer"
        style={{
          background: mode === 'lista' ? 'rgba(200,162,76,.18)' : 'transparent',
          color: mode === 'lista' ? '#d9b869' : '#7c7264',
        }}
      >
        <List size={17} strokeWidth={1.8} />
      </button>
      <button
        onClick={() => onToggle('grade')}
        className="flex h-[34px] w-[38px] items-center justify-center rounded-lg border-none cursor-pointer"
        style={{
          background: mode === 'grade' ? 'rgba(200,162,76,.18)' : 'transparent',
          color: mode === 'grade' ? '#d9b869' : '#7c7264',
        }}
      >
        <LayoutGrid size={17} strokeWidth={1.8} />
      </button>
    </div>
  )
}
