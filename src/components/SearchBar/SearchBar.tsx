import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtext" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="웨딩홀명, 주소, 지역을 검색해주세요"
        className="w-full rounded-full border border-line bg-white py-2.5 pl-10 pr-9 text-sm text-ink placeholder:text-subtext focus:border-olive focus:outline-none focus:ring-1 focus:ring-olive"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="검색어 지우기"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-subtext hover:text-ink"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
