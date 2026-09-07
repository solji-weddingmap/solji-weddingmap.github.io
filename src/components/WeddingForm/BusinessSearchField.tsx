import { useState } from 'react'
import { Search, Sparkles } from 'lucide-react'
import { isKakaoConfigured, searchPlaces, type PlaceSearchResult } from '@/lib/kakao'
import { useKakaoLoader } from '@/hooks/useKakaoLoader'
import ErrorBanner from '@/components/common/ErrorBanner'

interface BusinessSearchFieldProps {
  onSelect: (result: PlaceSearchResult) => void
}

// Optional helper shown above the 웨딩홀명 field: lets an admin search Kakao
// Map's own place database by business name and, if the wedding hall is
// already registered there, auto-fill name/address/좌표/전화번호 from it.
//
// Kakao's place search doesn't carry 홈페이지, 대관료, 식대, 인원 같은
// 웨딩홀 전용 정보이므로 나머지 항목은 계속 직접 입력해야 한다 - 이 사실을
// 안내 문구로 명시한다.
export default function BusinessSearchField({ onSelect }: BusinessSearchFieldProps) {
  const kakaoState = useKakaoLoader()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlaceSearchResult[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSearch() {
    const q = query.trim()
    if (!q) return
    if (kakaoState !== 'ready') {
      setError('카카오맵을 사용할 수 없어 업체 검색이 비활성화되어 있습니다.')
      return
    }
    setSearching(true)
    setError(null)
    try {
      const found = await searchPlaces(q)
      setResults(found)
      if (found.length === 0) {
        setError('카카오맵에서 검색 결과를 찾지 못했어요. 이름/주소는 직접 입력해주세요.')
      }
    } catch {
      setError('업체 검색에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="rounded-xl2 border border-dashed border-olive/40 bg-olive-light/30 p-4">
      <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-olive-dark">
        <Sparkles size={15} />
        카카오맵에서 업체명으로 자동 입력
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
          placeholder="웨딩홀 업체명을 입력해주세요 (예: 그랜드컨벤션센터)"
          className="input flex-1 bg-white"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={!isKakaoConfigured || searching}
          className="flex shrink-0 items-center gap-1 rounded-lg bg-olive px-4 py-2.5 text-sm font-medium text-white hover:bg-olive-dark disabled:opacity-50"
        >
          <Search size={15} />
          {searching ? '검색중...' : '검색'}
        </button>
      </div>

      <p className="mt-2 text-xs text-subtext">
        {isKakaoConfigured
          ? '카카오맵에 등록된 업체를 선택하면 이름/주소/좌표/전화번호가 자동으로 채워져요. 홈페이지, 대관료, 인원 등 웨딩홀 전용 정보는 카카오맵에 없어 직접 입력해야 해요.'
          : '카카오맵 API Key가 없어 업체 자동 검색이 비활성화되어 있습니다. 아래 항목을 직접 입력해주세요.'}
      </p>

      {error && (
        <div className="mt-2">
          <ErrorBanner message={error} variant="warning" onDismiss={() => setError(null)} />
        </div>
      )}

      {results && results.length > 0 && (
        <ul className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-line bg-white">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => {
                  onSelect(r)
                  setResults(null)
                  setQuery(r.placeName)
                }}
                className="block w-full border-b border-line px-3 py-2 text-left text-sm last:border-b-0 hover:bg-beige"
              >
                <p className="font-medium text-ink">{r.placeName}</p>
                <p className="text-xs text-subtext">{r.roadAddress ?? r.address}</p>
                <p className="text-xs text-subtext">
                  {[r.categoryName, r.phone].filter(Boolean).join(' · ')}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
