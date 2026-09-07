import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ClipboardCheck, ShieldAlert } from 'lucide-react'
import Header from '@/components/Header/Header'
import WeddingForm from '@/components/WeddingForm/WeddingForm'
import ErrorBanner from '@/components/common/ErrorBanner'
import {
  createWeddingHall,
  fetchWeddingHallById,
  updateWeddingHall,
} from '@/services/weddingHallService'
import { recordMyRegisteredHall } from '@/services/myRegisteredHallsService'
import { useAuth } from '@/context/AuthContext'
import type { WeddingHall, WeddingHallInput } from '@/types/weddingHall'

interface WeddingRegisterPageProps {
  mode: 'create' | 'edit'
}

export default function WeddingRegisterPage({ mode }: WeddingRegisterPageProps) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user, isAdmin, loading: authLoading, authAvailable, isLoggedIn } = useAuth()
  const [existing, setExisting] = useState<WeddingHall | null>(null)
  const [loading, setLoading] = useState(mode === 'edit')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [completedHall, setCompletedHall] = useState<WeddingHall | null>(null)

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
      const created = await createWeddingHall(input, user?.id)
      recordMyRegisteredHall(created.id, user?.id)
      // Show a completion screen instead of jumping straight to the detail
      // page (spec's 등록 완료 mockup) - the user picks where to go next.
      setCompletedHall(created)
    }
  }

  // 웨딩홀 등록/수정은 관리자만 가능 (Supabase RLS가 실제 강제하지만, 폼을 보여줬다가
  // 제출 시점에 실패하는 것보다 미리 안내하는 게 낫다). authAvailable이 꺼져있는
  // mock 모드(로컬 개발/데모)에서는 기존처럼 누구나 등록 가능하게 둔다.
  const canRegister = !authAvailable || isAdmin

  if (authAvailable && authLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-beige">
        <Header />
        <p className="flex-1 py-20 text-center text-subtext">불러오는 중...</p>
      </div>
    )
  }

  if (!canRegister) {
    return (
      <div className="flex min-h-screen flex-col bg-beige">
        <Header />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center px-6 py-10 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-olive-light">
            <ShieldAlert size={32} className="text-olive-dark" strokeWidth={1.75} />
          </div>
          <h1 className="mt-6 text-lg font-bold text-ink">관리자만 이용할 수 있어요</h1>
          <p className="mt-2 text-sm text-subtext">
            웨딩홀 등록/수정은 관리자 계정으로 로그인한 경우에만 가능합니다.
          </p>
          <div className="mt-8 w-full space-y-2.5">
            {!isLoggedIn && (
              <Link
                to="/login"
                className="block w-full rounded-full bg-olive py-3 text-sm font-semibold text-white transition hover:bg-olive-dark"
              >
                로그인하러 가기
              </Link>
            )}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full rounded-full border border-line bg-white py-3 text-sm font-medium text-ink transition hover:bg-beige"
            >
              홈으로 이동
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (completedHall) {
    return (
      <div className="flex min-h-screen flex-col bg-beige">
        <Header />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center px-6 py-10 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-olive-light">
            <ClipboardCheck size={36} className="text-olive-dark" strokeWidth={1.75} />
          </div>
          <h1 className="mt-6 text-lg font-bold text-ink">웨딩홀 등록이 완료되었습니다!</h1>
          <p className="mt-2 text-sm text-subtext">
            소중한 웨딩홀 정보가 웨딩홀을 찾고 있는 예비부부들에게 도움이 되길 바랍니다.
          </p>
          <div className="mt-8 w-full space-y-2.5">
            <button
              type="button"
              onClick={() => navigate(`/wedding/${completedHall.id}`)}
              className="w-full rounded-full bg-olive py-3 text-sm font-semibold text-white transition hover:bg-olive-dark"
            >
              등록한 웨딩홀 보기
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full rounded-full border border-line bg-white py-3 text-sm font-medium text-ink transition hover:bg-beige"
            >
              홈으로 이동
            </button>
          </div>
        </div>
      </div>
    )
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
