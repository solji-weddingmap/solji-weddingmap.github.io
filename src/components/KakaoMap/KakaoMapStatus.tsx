import { MapPinOff } from 'lucide-react'
import type { KakaoLoadState } from '@/hooks/useKakaoLoader'

interface KakaoMapStatusProps {
  state: Exclude<KakaoLoadState, 'ready'>
}

export default function KakaoMapStatus({ state }: KakaoMapStatusProps) {
  const message =
    state === 'missing-key'
      ? {
          title: '카카오맵 API Key가 설정되지 않았습니다.',
          desc: '.env 파일에 VITE_KAKAO_MAP_KEY를 설정하면 실제 지도가 표시됩니다. (README 참고)',
        }
      : state === 'loading'
        ? { title: '지도를 불러오는 중입니다...', desc: '' }
        : {
            title: '카카오맵을 불러오지 못했습니다.',
            desc: 'API Key 도메인 등록 여부를 확인하거나 잠시 후 다시 시도해주세요.',
          }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-line/40 px-6 text-center">
      <MapPinOff size={32} className="text-subtext" strokeWidth={1.5} />
      <p className="font-medium text-ink">{message.title}</p>
      {message.desc && <p className="text-sm text-subtext">{message.desc}</p>}
    </div>
  )
}
