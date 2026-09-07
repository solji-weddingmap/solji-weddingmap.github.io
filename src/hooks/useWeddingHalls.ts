import { useCallback, useEffect, useState } from 'react'
import { fetchWeddingHalls } from '@/services/weddingHallService'
import type { WeddingHall } from '@/types/weddingHall'
import { AppError } from '@/utils/errors'

interface UseWeddingHallsResult {
  halls: WeddingHall[]
  loading: boolean
  error: AppError | null
  refetch: () => void
}

export function useWeddingHalls(): UseWeddingHallsResult {
  const [halls, setHalls] = useState<WeddingHall[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AppError | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchWeddingHalls()
      .then((data) => {
        if (!cancelled) setHalls(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof AppError ? err : new AppError('데이터를 불러오지 못했습니다.', String(err)))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [reloadToken])

  const refetch = useCallback(() => setReloadToken((t) => t + 1), [])

  return { halls, loading, error, refetch }
}
