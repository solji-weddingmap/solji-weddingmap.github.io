import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Trash2, Plus, ShieldAlert } from 'lucide-react'
import Header from '@/components/Header/Header'
import SearchBar from '@/components/SearchBar/SearchBar'
import ErrorBanner from '@/components/common/ErrorBanner'
import EmptyState from '@/components/common/EmptyState'
import { useWeddingHalls } from '@/hooks/useWeddingHalls'
import { deleteWeddingHall, deleteWeddingHalls } from '@/services/weddingHallService'
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const filtered = useMemo(() => halls.filter((h) => matchesKeyword(h, keyword)), [halls, keyword])
  const canManage = !authAvailable || isAdmin

  // 목록이 바뀌면(검색/새로고침/삭제 후) 더 이상 존재하지 않는 id는 선택에서 정리한다.
  useEffect(() => {
    setSelectedIds((prev) => {
      const validIds = new Set(halls.map((h) => h.id))
      const next = new Set([...prev].filter((id) => validIds.has(id)))
      return next.size === prev.size ? prev : next
    })
  }, [halls])

  const allFilteredSelected = filtered.length > 0 && filtered.every((h) => selectedIds.has(h.id))
  const someFilteredSelected = filtered.some((h) => selectedIds.has(h.id))

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAllFiltered() {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allFilteredSelected) {
        filtered.forEach((h) => next.delete(h.id))
      } else {
        filtered.forEach((h) => next.add(h.id))
      }
      return next
    })
  }

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

  async function handleBulkDelete() {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    if (!window.confirm(`선택한 웨딩홀 ${ids.length}건을 삭제하시겠습니까? 되돌릴 수 없습니다.`)) return

    setBulkDeleting(true)
    setActionError(null)
    try {
      await deleteWeddingHalls(ids)
      setSelectedIds(new Set())
      refetch()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '선택 삭제에 실패했습니다.')
    } finally {
      setBulkDeleting(false)
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

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="max-w-sm flex-1">
            <SearchBar value={keyword} onChange={setKeyword} />
          </div>
          {someFilteredSelected && (
            <div className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3.5 py-1.5 text-sm text-red-700">
              <span>{selectedIds.size}건 선택됨</span>
              <button
                type="button"
                disabled={bulkDeleting}
                onClick={handleBulkDelete}
                className="flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                <Trash2 size={12} /> {bulkDeleting ? '삭제 중...' : '선택 삭제'}
              </button>
              <button
                type="button"
                disabled={bulkDeleting}
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-red-700 underline underline-offset-2 hover:text-red-800 disabled:opacity-60"
              >
                선택 해제
              </button>
            </div>
          )}
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
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleAllFiltered}
                      aria-label="전체 선택"
                      className="h-4 w-4 rounded border-line accent-olive"
                    />
                  </th>
                  <th className="px-4 py-3 font-medium">웨딩홀명</th>
                  <th className="px-4 py-3 font-medium">지역</th>
                  <th className="px-4 py-3 font-medium">식대</th>
                  <th className="px-4 py-3 font-medium">등록일</th>
                  <th className="px-4 py-3 font-medium">관리</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((hall) => (
                  <tr
                    key={hall.id}
                    className={
                      'border-b border-line last:border-0 hover:bg-beige/50' +
                      (selectedIds.has(hall.id) ? ' bg-olive-light/30' : '')
                    }
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(hall.id)}
                        onChange={() => toggleOne(hall.id)}
                        aria-label={`${hall.name} 선택`}
                        className="h-4 w-4 rounded border-line accent-olive"
                      />
                    </td>
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
