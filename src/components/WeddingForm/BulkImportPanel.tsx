import { useRef, useState, type DragEvent } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Download, FileSpreadsheet, Loader2, UploadCloud, XCircle } from 'lucide-react'
import { isKakaoConfigured, searchAddress } from '@/lib/kakao'
import { useKakaoLoader } from '@/hooks/useKakaoLoader'
import { downloadBulkImportTemplate, parseBulkImportFile, type BulkImportRow } from '@/utils/bulkImportTemplate'
import { createWeddingHall } from '@/services/weddingHallService'
import { recordMyRegisteredHall } from '@/services/myRegisteredHallsService'
import ErrorBanner from '@/components/common/ErrorBanner'
import { cn } from '@/utils/cn'
import type { WeddingHall } from '@/types/weddingHall'

type Stage = 'idle' | 'parsing' | 'preview' | 'submitting' | 'done'

interface SubmitResult {
  row: BulkImportRow
  status: 'success' | 'error'
  message?: string
  hall?: WeddingHall
}

interface BulkImportPanelProps {
  userId?: string
  onCreated?: (hall: WeddingHall) => void
}

// 엑셀 업로드 → 파싱/검증 → 미리보기 → 실제 등록까지 이어지는 일괄 등록 흐름.
// 좌표가 비어있는 행은 카카오맵 지오코딩으로 자동 보완하고(가능한 경우),
// 그 외 항목은 utils/bulkImportTemplate.ts의 규칙을 그대로 따른다.
export default function BulkImportPanel({ userId, onCreated }: BulkImportPanelProps) {
  const kakaoState = useKakaoLoader()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [stage, setStage] = useState<Stage>('idle')
  const [fileName, setFileName] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)
  const [rows, setRows] = useState<BulkImportRow[]>([])
  const [results, setResults] = useState<SubmitResult[]>([])
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const validRows = rows.filter((r) => r.input)
  const invalidRows = rows.filter((r) => !r.input)

  async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
    if (kakaoState !== 'ready') return null
    try {
      const found = await searchAddress(address)
      if (found.length === 0) return null
      return { lat: found[0].latitude, lng: found[0].longitude }
    } catch {
      return null
    }
  }

  async function handleFileChange(file: File | null) {
    if (!file) return
    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      setParseError('엑셀 파일(.xlsx, .xls)만 업로드할 수 있어요.')
      return
    }
    setFileName(file.name)
    setParseError(null)
    setStage('parsing')
    try {
      const parsed = await parseBulkImportFile(file, { geocode })
      setRows(parsed)
      setStage('preview')
    } catch (err) {
      setParseError(err instanceof Error ? err.message : '엑셀 파일을 읽는 데 실패했습니다.')
      setStage('idle')
    }
  }

  function handleDragOver(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  function handleDragLeave(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0] ?? null
    handleFileChange(file)
  }

  async function handleStartImport() {
    setStage('submitting')
    setResults([])
    setProgress(0)
    const collected: SubmitResult[] = []
    for (const row of validRows) {
      if (!row.input) continue
      try {
        const hall = await createWeddingHall(row.input, userId)
        recordMyRegisteredHall(hall.id, userId)
        onCreated?.(hall)
        collected.push({ row, status: 'success', hall })
      } catch (err) {
        collected.push({
          row,
          status: 'error',
          message: err instanceof Error ? err.message : '등록에 실패했습니다.',
        })
      }
      setProgress(collected.length)
      setResults([...collected])
    }
    setStage('done')
  }

  function reset() {
    setStage('idle')
    setFileName('')
    setParseError(null)
    setRows([])
    setResults([])
    setProgress(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const successCount = results.filter((r) => r.status === 'success').length
  const errorCount = results.filter((r) => r.status === 'error').length

  return (
    <div className="rounded-xl2 border border-line bg-white p-5">
      <div className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-ink">
        <FileSpreadsheet size={16} className="text-olive-dark" />
        엑셀로 여러 웨딩홀 한 번에 등록하기
      </div>
      <p className="mb-4 text-xs text-subtext">
        아래 양식에 맞춰 웨딩홀 정보를 채운 뒤 업로드하면 한 번에 등록돼요. 언제든 다시 내려받아 쓸 수 있어요.
      </p>

      <button
        type="button"
        onClick={() => downloadBulkImportTemplate()}
        className="mb-4 flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-sm font-medium text-ink hover:bg-beige"
      >
        <Download size={15} />
        엑셀 양식 다운로드
      </button>

      {stage === 'idle' && (
        <div>
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center text-sm transition-colors',
              isDragging ? 'border-olive bg-olive-light/40 text-olive-dark' : 'border-line text-subtext hover:bg-beige',
            )}
          >
            <UploadCloud size={22} />
            <span>
              {isDragging ? '여기에 놓으면 업로드돼요' : '작성한 엑셀 파일(.xlsx)을 드래그하거나 클릭해서 선택해주세요'}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
          </label>
          {!isKakaoConfigured && (
            <p className="mt-2 text-xs text-subtext">
              카카오맵 API Key가 없어 주소로 좌표를 자동으로 찾을 수 없어요. 지금은 일괄 등록을 사용할 수 없습니다.
            </p>
          )}
          {parseError && (
            <div className="mt-3">
              <ErrorBanner message={parseError} onDismiss={() => setParseError(null)} />
            </div>
          )}
        </div>
      )}

      {stage === 'parsing' && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-line py-10 text-sm text-subtext">
          <Loader2 size={16} className="animate-spin" />
          {fileName} 파일을 확인하는 중... (주소로 좌표를 찾는 중이라 시간이 조금 걸릴 수 있어요)
        </div>
      )}

      {stage === 'preview' && (
        <div>
          <p className="mb-2 text-sm text-ink">
            <strong className="text-olive-dark">{fileName}</strong> · 총 {rows.length}건 중{' '}
            <strong className="text-olive-dark">{validRows.length}건</strong> 등록 가능
            {invalidRows.length > 0 && <> · {invalidRows.length}건 오류</>}
          </p>

          <div className="max-h-72 overflow-y-auto rounded-lg border border-line">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-beige text-subtext">
                <tr>
                  <th className="px-2.5 py-2 font-medium">행</th>
                  <th className="px-2.5 py-2 font-medium">웨딩홀명</th>
                  <th className="px-2.5 py-2 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.rowNumber} className="border-t border-line">
                    <td className="px-2.5 py-1.5 text-subtext">{r.rowNumber}</td>
                    <td className="px-2.5 py-1.5 text-ink">{r.name}</td>
                    <td className={cn('px-2.5 py-1.5', r.error ? 'text-red-600' : 'text-olive-dark')}>
                      {r.error ? `오류: ${r.error}` : '등록 준비 완료'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-beige"
            >
              다시 선택
            </button>
            <button
              type="button"
              onClick={handleStartImport}
              disabled={validRows.length === 0}
              className="rounded-full bg-olive px-5 py-2 text-sm font-medium text-white hover:bg-olive-dark disabled:opacity-50"
            >
              {validRows.length}건 일괄 등록하기
            </button>
          </div>
        </div>
      )}

      {(stage === 'submitting' || stage === 'done') && (
        <div>
          {stage === 'submitting' && (
            <p className="mb-2 flex items-center gap-2 text-sm text-ink">
              <Loader2 size={15} className="animate-spin text-olive-dark" />
              등록하는 중... ({progress}/{validRows.length})
            </p>
          )}
          {stage === 'done' && (
            <p className="mb-2 text-sm text-ink">
              등록 완료 · 성공 <strong className="text-olive-dark">{successCount}건</strong>
              {errorCount > 0 && (
                <>
                  {' '}
                  · 실패 <strong className="text-red-600">{errorCount}건</strong>
                </>
              )}
            </p>
          )}

          <ul className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-line p-2">
            {results.map((r, i) => (
              <li key={i} className="flex items-start gap-1.5 px-1 py-1 text-xs">
                {r.status === 'success' ? (
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-olive-dark" />
                ) : (
                  <XCircle size={14} className="mt-0.5 shrink-0 text-red-600" />
                )}
                <span className="text-ink">{r.row.name}</span>
                {r.status === 'error' && <span className="text-red-600">- {r.message}</span>}
              </li>
            ))}
          </ul>

          {stage === 'done' && (
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-beige"
              >
                다른 파일 업로드
              </button>
              {successCount > 0 && (
                <Link
                  to="/"
                  className="rounded-full bg-olive px-4 py-2 text-sm font-medium text-white hover:bg-olive-dark"
                >
                  홈에서 확인하기
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
