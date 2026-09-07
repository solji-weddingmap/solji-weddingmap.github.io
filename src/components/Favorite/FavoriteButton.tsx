import { Heart } from 'lucide-react'
import { cn } from '@/utils/cn'

interface FavoriteButtonProps {
  active: boolean
  onToggle: () => void
  size?: number
  className?: string
}

export default function FavoriteButton({ active, onToggle, size = 18, className }: FavoriteButtonProps) {
  return (
    <button
      type="button"
      aria-label={active ? '찜 해제' : '찜하기'}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onToggle()
      }}
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-card transition-transform hover:scale-105 active:scale-95',
        'h-8 w-8',
        className,
      )}
    >
      <Heart
        size={size}
        className={active ? 'fill-olive text-olive' : 'text-subtext'}
        strokeWidth={1.75}
      />
    </button>
  )
}
