import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Trash2, Plus, ShieldAlert } from 'lucide-react'
import Header from '@/components/Header/Header'
import SearchBar from '@/components/SearchBar/SearchBar'
import ErrorBanner from '@/components/common/ErrorBanner'
import EmptyState from '@/components/common/EmptyState'
import { useWeddingHalls } from '@/hooks/useWeddingHalls'
import { deleteWeddingHall } from '@/services/weddingHallService'
import { useAuth } from '@/context/AuthContext'
import { formatDate, formatMealPrice } from '@/utils/format'
import { matchesKeyword } from '@/utils/filterSort'
import { regionLabel } from '@/utils/regions'

// 웨딩홀 관리 화면 - 등록/수정/삭제와 마찬가지로 관리자 전용 (Supabase RLS로
// 실제 강제되며, 여기서는 비관리자에게 아예 화면을 보여주지 않는다).
export default function AdminPage() {
  const { halls, loading, error, refetch } = useWeddingHalls()
  const { isAdmin, loading: authLoading, authAvailable, isLoggedIn } = useAuth()
  const [keyword, setKeyword] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const filtered = useMemo(() => halls.filter((h) => matchesKeyword(h, keyword)), [halls, keyword])
  const canManage = !authAvailable || isAdmin

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`'${name}'을(를) 삭제하시겠습니까?`)) return
    setDeletingId(id)
    setActionError(null)
    try {
      await deleteWeddingHall(id)
      refetch()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '삭제에 실패했습니다.')
    } finally {
      setDeletingId(null)
    }
  }

  if (authAvailable && authLoading) {
    return (
      <div className="min-h-screen bg-beige">
        <Header />
        <p className="py-20 text-center text-subtext">불러오는 중...</p>
      </div>
    )
  }

  if (!canManage) {
    return (
      <div className="min-h-screen bg-beige">
        <Header />
        <div className="mx-auto flex max-w-sm flex-col items-center px-6 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-olive-light">
            <ShieldAlert size={32} className="text-olive-dark" strokeWidth={1.75} />
          </div>
          <h1 className="mt-6 text-lg font-bold text-ink">관리자만 이용할 수 있어요</h1>
          <p className="mt-2 text-sm text-subtext">웨딩홀 관리는 관리자 계정으로 로그인한 경우에만 가능합니다.</p>
          {!isLoggedIn && (
            <Link
              to="/login"
              className="mt-8 w-full rounded-full bg-olive py-3 text-sm font-semibold text-white transition hover:bg-olive-dark"
            >
              로그인하러 가기
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-beige">
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-bold text-ink">웨딩홀 관리</h1>
          <Link
            to="/register"
            className="flex items-center gap-1.5 rounded-full bg-olive px-4 py-2 text-sm font-medium text-white hover:bg-olive-dark"
          >
            <Plus size={16} /> 웨딩홀 등록
          </Link>
        </div>

        <div className="mb-4 max-w-sm">
          <SearchBar value={keyword} onChange={setKeyword} />
        </div>

        {error && (
          <div className="mb-4">
            <ErrorBanner message={error.userMessage} />
          </div>
        )}
        {actionError && (
          <div className="mb-4">
            <ErrorBanner message={actionError} onDismiss={() => setActionError(null)} />
          </div>
        )}

        <div className="overflow-hidden rounded-xl2 border border-line bg-white">
          {loading ? (
            <p className="py-16 text-center text-subtext">불러오는 중...</p>
          ) : filtered.length === 0 ? (
            <EmptyState title="검색 결과가 없습니다." description="다른 웨딩홀명이나 지역으로 검색해보세요." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-beige text-left text-subtext">
                  <th className="px-4 py-3 font-medium">웨딩홀명</th>
                  <th className="px-4 py-3 font-medium">지역</th>
                  <th className="px-4 py-3 font-medium">식대</th>
                  <th className="px-4 py-3 font-medium">등록일</th>
                  <th className="px-4 py-3 font-medium">관리</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((hall) => (
                  <tr key={hall.id} className="border-b border-line last:border-0 hover:bg-beige/50">
                    <td className="px-4 py-3 font-medium text-ink">{hall.name}</td>
                    <td className="px-4 py-3 text-subtext">
                      {regionLabel(hall.region)} {hall.district}
                    </td>
                    <td className="px-4 py-3 text-ink">{formatMealPrice(hall.mealPrice)}</td>
                    <td className="px-4 py-3 text-subtext">{formatDate(hall.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          to={`/register/${hall.id}`}
                          className="flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-xs hover:bg-beige"
                        >
                          <Pencil size={12} /> 수정
                        </Link>
                        <button
                          type="button"
                          disabled={deletingId === hall.id}
                          onClick={() => handleDelete(hall.id, hall.name)}
                          className="flex items-center gap-1 rounded-full border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-60"
                        >
                          <Trash2 size={12} /> {deletingId === hall.id ? '삭제 중' : '삭제'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
