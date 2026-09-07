import { useState } from 'react'
import { Search } from 'lucide-react'
import { isKakaoConfigured, searchAddress, type AddressSearchResult } from '@/lib/kakao'
import { useKakaoLoader } from '@/hooks/useKakaoLoader'
import ErrorBanner from '@/components/common/ErrorBanner'

interface AddressSearchFieldProps {
  value: string
  onSelect: (result: AddressSearchResult) => void
  onManualChange: (value: string) => void
}

// The text input stays editable even without a Kakao API key, so the
// registration form is fully usable in mock-data mode (spec #6) - only the
// "주소 검색" lookup itself (and therefore automatic lat/lng + map preview)
// requires the Kakao SDK. Without it, users can still type a full address by
// hand and adjust the pin manually on the location map.
export default function AddressSearchField({ value, onSelect, onManualChange }: AddressSearchFieldProps) {
  const kakaoState = useKakaoLoader()
  const [results, setResults] = useState<AddressSearchResult[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSearch() {
    if (!value.trim()) return
    if (kakaoState !== 'ready') {
      setError('카카오맵을 사용할 수 없어 주소 검색이 비활성화되어 있습니다.')
      return
    }
    setSearching(true)
    setError(null)
    try {
      const found = await searchAddress(value.trim())
      setResults(found)
      if (found.length === 0) {
        setError('검색 결과가 없습니다. 다른 주소로 검색해보세요.')
      }
    } catch {
      setError('주소 검색에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setSearching(false)
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onManualChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
          placeholder="주소를 검색해주세요"
          className="input flex-1"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={!isKakaoConfigured || searching}
          className="flex shrink-0 items-center gap-1 rounded-lg bg-olive px-4 py-2.5 text-sm font-medium text-white hover:bg-olive-dark disabled:opacity-50"
        >
          <Search size={15} />
          {searching ? '검색중...' : '주소 검색'}
        </button>
      </div>

      {!isKakaoConfigured && (
        <p className="mt-2 text-xs text-subtext">
          카카오맵 API Key가 없어 자동 주소 검색이 비활성화되어 있습니다. 주소를 직접 입력하고, 아래 지도를
          클릭하거나 마커를 드래그해 위치를 지정해주세요.
        </p>
      )}

      {error && (
        <div className="mt-2">
          <ErrorBanner message={error} variant="warning" onDismiss={() => setError(null)} />
        </div>
      )}

      {results && results.length > 0 && (
        <ul className="mt-2 max-h-52 overflow-y-auto rounded-lg border border-line">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => {
                  onSelect(r)
                  setResults(null)
                }}
                className="block w-full border-b border-line px-3 py-2 text-left text-sm last:border-b-0 hover:bg-beige"
              >
                <p className="text-ink">{r.roadAddress ?? r.address}</p>
                {r.roadAddress && <p className="text-xs text-subtext">{r.address}</p>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
