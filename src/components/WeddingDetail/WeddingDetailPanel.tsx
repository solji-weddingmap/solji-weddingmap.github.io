import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, MapPin, ExternalLink, Pencil, Trash2, Phone, Star, ImageOff } from 'lucide-react'
import type { WeddingHall } from '@/types/weddingHall'
import { formatManwon, formatMealPrice, formatGuests, formatParking } from '@/utils/format'
import { regionLabel } from '@/utils/regions'
import FavoriteButton from '@/components/Favorite/FavoriteButton'
import { deleteWeddingHall } from '@/services/weddingHallService'
import { recordView } from '@/services/viewHistoryService'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/utils/cn'

const TABS = ['기본정보', '시설/비용', '위치/교통', '리뷰'] as const

interface WeddingDetailPanelProps {
  hall: WeddingHall
  favorite: boolean
  onToggleFavorite: (id: string) => void
  onClose: () => void
  onDeleted: () => void
  onShowOnMap: () => void
}

export default function WeddingDetailPanel({
  hall,
  favorite,
  onToggleFavorite,
  onClose,
  onDeleted,
  onShowOnMap,
}: WeddingDetailPanelProps) {
  const navigate = useNavigate()
  const { user, isAdmin, authAvailable } = useAuth()
  const canManage = !authAvailable || isAdmin
  const [tab, setTab] = useState<(typeof TABS)[number]>('기본정보')
  const [imageIndex, setImageIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const images = hall.images.length > 0 ? hall.images : hall.mainImage ? [hall.mainImage] : []

  useEffect(() => {
    void recordView(hall.id, user?.id)
  }, [hall.id, user?.id])

  async function handleDelete() {
    if (!window.confirm(`'${hall.name}'을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteWeddingHall(hall.id)
      onDeleted()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : '삭제에 실패했습니다.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-white">
      <div className="relative">
        <div className="h-56 w-full bg-line md:h-64">
          {images.length > 0 ? (
            <img src={images[imageIndex]} alt={hall.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-subtext">
              <ImageOff size={36} strokeWidth={1.5} />
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white">
            {imageIndex + 1} / {images.length}
          </div>
        )}
        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-0 flex justify-between px-2 py-2">
            <button
              type="button"
              onClick={() => setImageIndex((i) => (i - 1 + images.length) % images.length)}
              className="rounded-full bg-white/80 px-2 py-1 text-xs shadow-card"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setImageIndex((i) => (i + 1) % images.length)}
              className="rounded-full bg-white/80 px-2 py-1 text-xs shadow-card"
            >
              ›
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="상세정보 닫기"
          className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-card"
        >
          <X size={16} />
        </button>
      </div>

      <div className="border-b border-line px-5 pb-4 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-ink">{hall.name}</h2>
            <p className="mt-1 text-sm text-subtext">
              {hall.address}
              {hall.detailAddress ? ` ${hall.detailAddress}` : ''}
            </p>
          </div>
          <FavoriteButton active={favorite} onToggle={() => onToggleFavorite(hall.id)} />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {hall.rating !== undefined && (
            <span className="flex items-center gap-1 text-sm text-ink">
              <Star size={14} className="fill-olive text-olive" />
              {hall.rating.toFixed(1)}
              <span className="text-subtext">({hall.reviewCount ?? 0})</span>
            </span>
          )}
          <span className="text-sm text-subtext">
            {regionLabel(hall.region)} · {hall.district}
          </span>
        </div>

        {hall.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {hall.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-olive-light px-2.5 py-1 text-xs font-medium text-olive-dark">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          {hall.homepage && (
            <a
              href={hall.homepage}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-olive px-4 py-2 text-sm font-medium text-olive hover:bg-olive-light"
            >
              홈페이지 방문 <ExternalLink size={14} />
            </a>
          )}
          {hall.phone && (
            <a
              href={`tel:${hall.phone}`}
              className="flex items-center justify-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-beige md:hidden"
            >
              <Phone size={14} /> 전화하기
            </a>
          )}
        </div>
      </div>

      <div className="flex border-b border-line px-5">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'border-b-2 px-3 py-3 text-sm font-medium',
              tab === t ? 'border-olive text-olive' : 'border-transparent text-subtext',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 px-5 py-5">
        {tab === '기본정보' && (
          <div className="space-y-5">
            <section>
              <h3 className="mb-2 font-semibold text-ink">예식 정보</h3>
              <dl className="grid grid-cols-2 gap-y-3 text-sm">
                <InfoRow label="최소 보증 인원" value={formatGuests(hall.minimumGuests)} />
                <InfoRow label="일요일 저녁" value={formatGuests(hall.sundayEveningGuests)} />
                <InfoRow label="대관료" value={formatManwon(hall.rentalFee)} />
                <InfoRow label="식대" value={formatMealPrice(hall.mealPrice)} />
                <InfoRow label="예식 형태" value={hall.ceremonyType ?? '정보 없음'} />
                <InfoRow label="홀 개수" value={hall.hallCount ? `${hall.hallCount}개` : '정보 없음'} />
              </dl>
              {hall.openUntil && <p className="mt-3 text-sm font-medium text-olive">{hall.openUntil}</p>}
            </section>

            {hall.description && (
              <section>
                <h3 className="mb-2 font-semibold text-ink">웨딩홀 소개</h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{hall.description}</p>
              </section>
            )}

            {(hall.negotiableMemo || hall.memo) && (
              <p className="rounded-lg bg-beige px-3 py-2.5 text-sm text-subtext">
                ※ {hall.negotiableMemo || hall.memo}
              </p>
            )}
          </div>
        )}

        {tab === '시설/비용' && (
          <div className="space-y-5">
            <section>
              <h3 className="mb-2 font-semibold text-ink">비용 정보</h3>
              <dl className="grid grid-cols-2 gap-y-3 text-sm">
                <InfoRow label="대관료" value={formatManwon(hall.rentalFee)} />
                <InfoRow label="식대" value={formatMealPrice(hall.mealPrice)} />
                <InfoRow label="가격 협의" value={hall.negotiable ? '가능' : '정보 없음'} />
              </dl>
            </section>
            <section>
              <h3 className="mb-2 font-semibold text-ink">시설 정보</h3>
              <dl className="grid grid-cols-2 gap-y-3 text-sm">
                <InfoRow label="홀 개수" value={hall.hallCount ? `${hall.hallCount}개` : '정보 없음'} />
                {/* Parking is shown in detail view only - never used for filtering/sorting (spec #11, #25) */}
                <InfoRow label="주차" value={formatParking(hall.parkingCapacity)} />
              </dl>
              {hall.parkingInfo && <p className="mt-2 text-sm text-subtext">{hall.parkingInfo}</p>}
            </section>
          </div>
        )}

        {tab === '위치/교통' && (
          <div className="space-y-5">
            <section>
              <h3 className="mb-2 font-semibold text-ink">주소</h3>
              <p className="text-sm text-ink">
                {hall.address}
                {hall.detailAddress ? ` ${hall.detailAddress}` : ''}
              </p>
              <button
                type="button"
                onClick={onShowOnMap}
                className="mt-3 flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm hover:bg-beige"
              >
                <MapPin size={14} /> 지도에서 위치 보기
              </button>
            </section>
            {hall.subwayInfo && (
              <section>
                <h3 className="mb-1 font-semibold text-ink">지하철</h3>
                <p className="text-sm text-subtext">{hall.subwayInfo}</p>
              </section>
            )}
            {hall.shuttleInfo && (
              <section>
                <h3 className="mb-1 font-semibold text-ink">셔틀버스</h3>
                <p className="text-sm text-subtext">{hall.shuttleInfo}</p>
              </section>
            )}
          </div>
        )}

        {tab === '리뷰' && (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-subtext">
            <p>리뷰 기능은 준비 중입니다.</p>
            <p className="text-xs">추후 사용자 리뷰가 이곳에 표시됩니다.</p>
          </div>
        )}
      </div>

      {deleteError && (
        <div className="px-5 pb-3">
          <p className="text-sm text-red-600">{deleteError}</p>
        </div>
      )}

      <div className="sticky bottom-0 flex gap-2 border-t border-line bg-white px-5 py-4">
        <button
          type="button"
          onClick={onShowOnMap}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-line py-2.5 text-sm font-medium hover:bg-beige"
        >
          <MapPin size={15} /> 지도에서 보기
        </button>
        {canManage && (
          <button
            type="button"
            onClick={() => navigate(`/register/${hall.id}`)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-line py-2.5 text-sm font-medium hover:bg-beige"
          >
            <Pencil size={15} /> 수정
          </button>
        )}
        {canManage && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-red-200 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            <Trash2 size={15} /> {deleting ? '삭제 중...' : '삭제'}
          </button>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-subtext">{label}</dt>
      <dd className="mt-0.5 font-medium text-ink">{value}</dd>
    </div>
  )
}
