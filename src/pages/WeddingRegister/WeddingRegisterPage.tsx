import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '@/components/Header/Header'
import WeddingForm from '@/components/WeddingForm/WeddingForm'
import ErrorBanner from '@/components/common/ErrorBanner'
import {
  createWeddingHall,
  fetchWeddingHallById,
  updateWeddingHall,
} from '@/services/weddingHallService'
import type { WeddingHall, WeddingHallInput } from '@/types/weddingHall'

interface WeddingRegisterPageProps {
  mode: 'create' | 'edit'
}

export default function WeddingRegisterPage({ mode }: WeddingRegisterPageProps) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [existing, setExisting] = useState<WeddingHall | null>(null)
  const [loading, setLoading] = useState(mode === 'edit')
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (mode !== 'edit' || !id) return
    let cancelled = false
    setLoading(true)
    fetchWeddingHallById(id)
      .then((hall) => {
        if (!cancelled) setExisting(hall)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : '웨딩홀 정보를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [mode, id])

  async function handleSubmit(input: WeddingHallInput) {
    if (mode === 'edit' && id) {
      await updateWeddingHall(id, input)
      navigate(`/wedding/${id}`)
    } else {
      const created = await createWeddingHall(input)
      navigate(`/wedding/${created.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-beige">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-1 text-xl font-bold text-ink">
          {mode === 'edit' ? '웨딩홀 정보 수정' : '웨딩홀 등록하기'}
        </h1>
        <p className="mb-6 text-sm text-subtext">
          새로운 웨딩홀 정보를 등록하고, 설레는 예비부부들에게 소개해주세요.
        </p>

        {loading && <p className="py-20 text-center text-subtext">불러오는 중...</p>}

        {loadError && (
          <div className="mb-4">
            <ErrorBanner message={loadError} />
          </div>
        )}

        {!loading && mode === 'edit' && !existing && !loadError && (
          <ErrorBanner message="수정할 웨딩홀을 찾을 수 없습니다." />
        )}

        {!loading && (mode === 'create' || existing) && (
          <WeddingForm
            initial={existing ?? undefined}
            submitLabel={mode === 'edit' ? '수정 완료' : '등록 완료'}
            onSubmit={handleSubmit}
            onCancel={() => navigate(-1)}
          />
        )}
      </div>
    </div>
  )
}
