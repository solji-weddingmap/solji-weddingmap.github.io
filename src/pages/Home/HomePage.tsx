import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '@/components/Header/Header'
import SearchBar from '@/components/SearchBar/SearchBar'
import FilterBar from '@/components/Filter/FilterBar'
import WeddingList from '@/components/WeddingList/WeddingList'
import KakaoMap from '@/components/KakaoMap/KakaoMap'
import WeddingDetailPanel from '@/components/WeddingDetail/WeddingDetailPanel'
import MobileNav from '@/components/common/MobileNav'
import BottomSheet from '@/components/common/BottomSheet'
import ErrorBanner from '@/components/common/ErrorBanner'
import { useWeddingHalls } from '@/hooks/useWeddingHalls'
import { useFavorites } from '@/hooks/useFavorites'
import { DEFAULT_FILTERS, type SortOption, type WeddingHall, type WeddingHallFilters } from '@/types/weddingHall'
import { applyFilters, applySort } from '@/utils/filterSort'
import { isKakaoConfigured } from '@/lib/kakao'
import { isSupabaseConfigured } from '@/lib/supabase'

export default function HomePage() {
  const navigate = useNavigate()
  const params = useParams<{ id?: string }>()
  const { halls, loading, error, refetch } = useWeddingHalls()
  const { favoriteIds, toggle } = useFavorites()

  const [filters, setFilters] = useState<WeddingHallFilters>(DEFAULT_FILTERS)
  const [sort, setSort] = useState<SortOption>('recommended')
  const [mobileExpanded, setMobileExpanded] = useState(false)
  const [dismissedInfoBanner, setDismissedInfoBanner] = useState(false)

  const selectedId = params.id ?? null

  const filtered = useMemo(() => applyFilters(halls, filters), [halls, filters])
  const sorted = useMemo(() => applySort(filtered, sort), [filtered, sort])

  const selectedHall: WeddingHall | undefined = useMemo(
    () => halls.find((h) => h.id === selectedId),
    [halls, selectedId],
  )

  function selectHall(hall: WeddingHall) {
    navigate(`/wedding/${hall.id}`)
    setMobileExpanded(false)
  }

  function closeDetail() {
    navigate('/')
  }

  useEffect(() => {
    // if the deep-linked hall no longer exists (e.g. deleted), fall back to list
    if (selectedId && !loading && halls.length > 0 && !selectedHall) {
      navigate('/', { replace: true })
    }
  }, [selectedId, loading, halls.length, selectedHall, navigate])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-beige">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop: list column */}
        <div className="hidden w-[420px] shrink-0 flex-col overflow-hidden border-r border-line bg-beige md:flex">
          <div className="space-y-3 border-b border-line bg-white px-4 py-4">
            <SearchBar value={filters.keyword} onChange={(keyword) => setFilters((f) => ({ ...f, keyword }))} />
            <FilterBar
              filters={filters}
              sort={sort}
              onChange={setFilters}
              onSortChange={setSort}
              resultCount={sorted.length}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {!isKakaoConfigured && !dismissedInfoBanner && (
              <div className="px-4 pt-4">
                <ErrorBanner
                  variant="warning"
                  message="카카오맵 API Key가 설정되지 않아 지도가 비활성화되어 있습니다. Mock 데이터로 목록/필터 기능은 정상 작동합니다."
                  onDismiss={() => setDismissedInfoBanner(true)}
                />
              </div>
            )}
            {error && (
              <div className="px-4 pt-4">
                <ErrorBanner message={error.userMessage} />
              </div>
            )}
            <WeddingList
              halls={sorted}
              selectedId={selectedId}
              favoriteIds={favoriteIds}
              onSelect={selectHall}
              onToggleFavorite={toggle}
              loading={loading}
            />
          </div>
        </div>

        {/* Map column (desktop: right side; mobile: full screen background) */}
        <div className="relative flex-1">
          <KakaoMap halls={sorted} selectedId={selectedId} onSelectHall={selectHall} />

          {/* Mobile: search + filter overlay on top of the map */}
          <div className="absolute inset-x-0 top-0 z-10 space-y-2 p-3 md:hidden">
            <div className="rounded-2xl bg-white/95 p-2.5 shadow-popover backdrop-blur-sm">
              <SearchBar value={filters.keyword} onChange={(keyword) => setFilters((f) => ({ ...f, keyword }))} />
            </div>
            <div className="overflow-x-auto rounded-2xl bg-white/95 p-2.5 shadow-popover backdrop-blur-sm">
              <FilterBar
                filters={filters}
                sort={sort}
                onChange={setFilters}
                onSortChange={setSort}
                resultCount={sorted.length}
              />
            </div>
          </div>
        </div>

        {/* Desktop: detail slide-over */}
        {selectedHall && (
          <div className="hidden w-[420px] shrink-0 border-l border-line md:block">
            <WeddingDetailPanel
              hall={selectedHall}
              favorite={favoriteIds.has(selectedHall.id)}
              onToggleFavorite={toggle}
              onClose={closeDetail}
              onDeleted={() => {
                closeDetail()
                refetch()
              }}
              onShowOnMap={() => {
                /* map already centers on selection via selectedId sync */
              }}
            />
          </div>
        )}
      </div>

      {/* Mobile: bottom sheet list, or full-screen detail */}
      {selectedHall ? (
        <div className="fixed inset-0 z-30 md:hidden">
          <WeddingDetailPanel
            hall={selectedHall}
            favorite={favoriteIds.has(selectedHall.id)}
            onToggleFavorite={toggle}
            onClose={closeDetail}
            onDeleted={() => {
              closeDetail()
              refetch()
            }}
            onShowOnMap={closeDetail}
          />
        </div>
      ) : (
        <BottomSheet expanded={mobileExpanded} onToggle={() => setMobileExpanded((e) => !e)}>
          <div className="px-1 pb-2 text-center text-xs text-subtext">
            총 {sorted.length}개의 웨딩홀 · 위로 당겨서 목록 보기
          </div>
          <WeddingList
            halls={sorted}
            selectedId={selectedId}
            favoriteIds={favoriteIds}
            onSelect={selectHall}
            onToggleFavorite={toggle}
            loading={loading}
          />
        </BottomSheet>
      )}

      {!isSupabaseConfigured && (
        <div className="hidden" aria-hidden>
          {/* Supabase not configured: app runs on in-memory mock data (see services/weddingHallService.ts) */}
        </div>
      )}

      <MobileNav />
    </div>
  )
}
