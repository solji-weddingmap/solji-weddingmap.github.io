import { useCallback, useEffect, useState } from 'react'
import {
  FAVORITES_CHANGED_EVENT,
  getFavoriteIds,
  notifyFavoritesChanged,
  toggleFavorite,
} from '@/services/favoriteService'

export function useFavorites() {
  const [ids, setIds] = useState<Set<string>>(() => new Set(getFavoriteIds()))

  useEffect(() => {
    const handler = () => setIds(new Set(getFavoriteIds()))
    window.addEventListener(FAVORITES_CHANGED_EVENT, handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener(FAVORITES_CHANGED_EVENT, handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  const toggle = useCallback((id: string) => {
    toggleFavorite(id)
    setIds(new Set(getFavoriteIds()))
    notifyFavoritesChanged()
  }, [])

  const isFav = useCallback((id: string) => ids.has(id), [ids])

  return { favoriteIds: ids, toggle, isFav }
}
