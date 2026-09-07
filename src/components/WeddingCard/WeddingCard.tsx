import { Star, ImageOff } from 'lucide-react'
import type { WeddingHall } from '@/types/weddingHall'
import { formatManwon, formatMealPrice, formatGuests } from '@/utils/format'
import { regionLabel } from '@/utils/regions'
import FavoriteButton from '@/components/Favorite/FavoriteButton'
import { cn } from '@/utils/cn'

interface WeddingCardProps {
  hall: WeddingHall
  active?: boolean
  favorite: boolean
  onSelect: (hall: WeddingHall) => void
  onToggleFavorite: (id: string) => void
  compact?: boolean
}

export default function WeddingCard({
  hall,
  active,
  favorite,
  onSelect,
  onToggleFavorite,
  compact,
}: WeddingCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(hall)}
      className={cn(
        'group w-full text-left bg-white rounded-xl2 border overflow-hidden transition-all',
        active ? 'border-olive shadow-popover ring-1 ring-olive' : 'border-line shadow-card hover:shadow-popover',
      )}
    >
      <div className="relative">
        <div className={cn('w-full bg-line', compact ? 'h-32' : 'h-40')}>
          {hall.mainImage ? (
            <img src={hall.mainImage} alt={hall.name} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-subtext">
              <ImageOff size={28} strokeWidth={1.5} />
            </div>
          )}
        </div>
        <FavoriteButton
          active={favorite}
          onToggle={() => onToggleFavorite(hall.id)}
          className="absolute top-2 right-2"
        />
      </div>

      <div className="p-3.5">
        <div className="flex items-center gap-1.5">
          <h3 className="font-semibold text-ink truncate">{hall.name}</h3>
          {hall.rating !== undefined && (
            <span className="flex items-center gap-0.5 text-xs text-subtext shrink-0">
              <Star size={12} className="fill-olive text-olive" />
              {hall.rating.toFixed(1)}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-subtext">
          {regionLabel(hall.region)} · {hall.district}
        </p>

        {hall.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {hall.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-olive-light px-2 py-0.5 text-[11px] font-medium text-olive-dark"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <dl className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-subtext">최소보증</dt>
            <dd className="font-medium text-ink">{formatGuests(hall.minimumGuests)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-subtext">식대</dt>
            <dd className="font-medium text-ink">{formatMealPrice(hall.mealPrice)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-subtext">대관료</dt>
            <dd className="font-medium text-ink">{formatManwon(hall.rentalFee)}</dd>
          </div>
        </dl>

        <div className="mt-3 flex justify-end">
          <span className="text-sm font-medium text-olive group-hover:underline">상세보기 →</span>
        </div>
      </div>
    </button>
  )
}
