import { useEffect, useState } from 'react'
import { isKakaoConfigured, loadKakaoMaps } from '@/lib/kakao'

export type KakaoLoadState = 'missing-key' | 'loading' | 'ready' | 'error'

export function useKakaoLoader(): KakaoLoadState {
  const [state, setState] = useState<KakaoLoadState>(isKakaoConfigured ? 'loading' : 'missing-key')

  useEffect(() => {
    if (!isKakaoConfigured) {
      setState('missing-key')
      return
    }
    let cancelled = false
    loadKakaoMaps()
      .then(() => {
        if (!cancelled) setState('ready')
      })
      .catch(() => {
        if (!cancelled) setState('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
