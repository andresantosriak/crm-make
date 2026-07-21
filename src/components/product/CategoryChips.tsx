interface CategoryChipsProps {
  categories: string[]
  active: string
  onSelect: (category: string) => void
}

export function CategoryChips({ categories, active, onSelect }: CategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto mb-4">
      {categories.map((cat) => {
        const isActive = cat === active
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className="shrink-0 rounded-chip px-4 py-2 text-[13px] cursor-pointer border whitespace-nowrap"
            style={{
              background: isActive ? 'rgba(200,162,76,.16)' : '#221C15',
              color: isActive ? '#d9b869' : '#A79B88',
              borderColor: isActive ? 'rgba(200,162,76,.4)' : 'rgba(233,220,198,.10)',
            }}
          >
            {cat}
          </button>
        )
      })}
    </div>
  )
}
