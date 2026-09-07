import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '@/components/Header/Header'
import WeddingCard from '@/components/WeddingCard/WeddingCard'
import EmptyState from '@/components/common/EmptyState'
import MobileNav from '@/components/common/MobileNav'
import { useWeddingHalls } from '@/hooks/useWeddingHalls'
import { useFavorites } from '@/hooks/useFavorites'
import { REGIONS } from '@/utils/filterOptions'
import type { RegionCode } from '@/types/weddingHall'
import { cn } from '@/utils/cn'

// 찜 탭 전용 화면 (spec #6): 관심 웨딩홀 목록 + 지역별 필터.
export default function FavoritesPage() {
  const navigate = useNavigate()
  const { halls, loading } = useWeddingHalls()
  const { favoriteIds, toggle } = useFavorites()
  const [region, setRegion] = useState<'all' | RegionCode>('all')

  const favoriteHalls = useMemo(
    () => halls.filter((h) => favoriteIds.has(h.id) && (region === 'all' || h.region === region)),
    [halls, favoriteIds, region],
  )

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-beige">
      <Header />

      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto pb-24">
        <div className="px-4 pt-5">
          <h1 className="text-xl font-bold text-ink">찜한 웨딩홀</h1>
          <p className="mt-1 text-sm text-subtext">
            총 <strong className="text-ink">{favoriteHalls.length}</strong>개의 웨딩홀이 있습니다.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 px-4 pt-4">
          {REGIONS.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRegion(r.key)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                region === r.key ? 'bg-olive text-white' : 'border border-line bg-white text-ink hover:bg-beige',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-xl2 bg-line/60" />
              ))}
            </div>
          ) : favoriteHalls.length === 0 ? (
            <EmptyState title="찜한 웨딩홀이 없습니다." description="마음에 드는 웨딩홀의 하트를 눌러 찜해보세요." />
          ) : (
            <div className="space-y-3">
              {favoriteHalls.map((hall) => (
                <WeddingCard
                  key={hall.id}
                  hall={hall}
                  favorite
                  onSelect={(h) => navigate(`/wedding/${h.id}`)}
                  onToggleFavorite={toggle}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <MobileNav />
    </div>
  )
}
