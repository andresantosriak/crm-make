import { Search } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchInput({ value, onChange, placeholder = 'Buscar...' }: SearchInputProps) {
  return (
    <div className="relative mb-3.5">
      <Search
        size={17}
        strokeWidth={1.8}
        className="absolute left-3.5 top-3.5 text-text-muted"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-input bg-card text-[14px] text-text-primary outline-none py-[13px] pr-3.5 pl-10"
        style={{ border: '1px solid rgba(233,220,198,.10)' }}
      />
    </div>
  )
}
