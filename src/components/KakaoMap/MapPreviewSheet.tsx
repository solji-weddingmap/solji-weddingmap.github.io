import { X, ImageOff } from 'lucide-react'
import type { WeddingHall } from '@/types/weddingHall'
import { formatManwon, formatMealPrice } from '@/utils/format'
import { regionLabel } from '@/utils/regions'

interface MapPreviewSheetProps {
  hall: WeddingHall
  onClose: () => void
  onViewDetail: () => void
}

// Mobile-only: tapping a map marker raises this compact bottom sheet instead
// of jumping straight into the full detail screen (spec section 9). Desktop
// keeps its existing in-map CustomOverlay card (see KakaoMap.tsx) - this
// component renders nothing there.
export default function MapPreviewSheet({ hall, onClose, onViewDetail }: MapPreviewSheetProps) {
  return (
    <div
      className="fixed inset-x-3 bottom-[calc(4rem+0.75rem+env(safe-area-inset-bottom))] z-30 overflow-hidden rounded-2xl border border-line bg-white shadow-popover md:hidden"
      role="dialog"
      aria-label={`${hall.name} 미리보기`}
    >
      <div className="flex justify-center pt-2">
        <span className="h-1 w-10 rounded-full bg-line" />
      </div>
      <div className="flex gap-3 p-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-line">
          {hall.mainImage ? (
            <img src={hall.mainImage} alt={hall.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-subtext">
              <ImageOff size={18} strokeWidth={1.5} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-semibold text-ink">{hall.name}</p>
            <button
              type="button"
              onClick={onClose}
              aria-label="미리보기 닫기"
              className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center text-subtext"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-sm text-subtext">
            {regionLabel(hall.region)} {hall.district}
          </p>
          <p className="mt-1 text-sm text-ink">
            식대 {formatMealPrice(hall.mealPrice)} · 대관료 {formatManwon(hall.rentalFee)}
          </p>
        </div>
      </div>
      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={onViewDetail}
          className="w-full rounded-full bg-olive py-2.5 text-sm font-medium text-white transition hover:bg-olive-dark"
        >
          상세보기
        </button>
      </div>
    </div>
  )
}
