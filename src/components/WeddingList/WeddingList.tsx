import { useRef, useEffect } from 'react'
import type { WeddingHall } from '@/types/weddingHall'
import WeddingCard from '@/components/WeddingCard/WeddingCard'
import EmptyState from '@/components/common/EmptyState'

interface WeddingListProps {
  halls: WeddingHall[]
  selectedId: string | null
  favoriteIds: Set<string>
  onSelect: (hall: WeddingHall) => void
  onToggleFavorite: (id: string) => void
  loading?: boolean
}

export default function WeddingList({
  halls,
  selectedId,
  favoriteIds,
  onSelect,
  onToggleFavorite,
  loading,
}: WeddingListProps) {
  const activeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selectedId])

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl2 bg-line/60" />
        ))}
      </div>
    )
  }

  if (halls.length === 0) {
    return (
      <EmptyState
        title="검색 결과가 없습니다."
        description="다른 웨딩홀명이나 지역으로 검색해보세요."
      />
    )
  }

  return (
    <div className="space-y-3 p-4">
      {halls.map((hall) => (
        <div key={hall.id} ref={hall.id === selectedId ? activeRef : undefined}>
          <WeddingCard
            hall={hall}
            active={hall.id === selectedId}
            favorite={favoriteIds.has(hall.id)}
            onSelect={onSelect}
            onToggleFavorite={onToggleFavorite}
          />
        </div>
      ))}
    </div>
  )
}
