import { useState } from 'react'
import { ImagePlus, X, Check } from 'lucide-react'
import type { CeremonyType, RegionCode, WeddingHallInput } from '@/types/weddingHall'
import AddressSearchField from './AddressSearchField'
import BusinessSearchField from './BusinessSearchField'
import LocationPickerMap from '@/components/KakaoMap/LocationPickerMap'
import { uploadWeddingHallImage } from '@/services/storageService'
import ErrorBanner from '@/components/common/ErrorBanner'
import { cn } from '@/utils/cn'
import type { AddressSearchResult, PlaceSearchResult } from '@/lib/kakao'

const STEPS = ['기본정보', '예식정보', '비용정보', '시설정보', '기타정보'] as const

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }

function inferRegion(address: string): RegionCode {
  if (address.includes('서울')) return 'seoul'
  if (address.includes('인천')) return 'incheon'
  return 'gyeonggi'
}

function inferDistrict(address: string): string {
  const match = address.match(/([가-힣]+[시구])\s/)
  return match ? match[1] : ''
}

export interface WeddingFormProps {
  initial?: Partial<WeddingHallInput>
  submitLabel: string
  onSubmit: (input: WeddingHallInput) => Promise<void>
  onCancel: () => void
}

export default function WeddingForm({ initial, submitLabel, onSubmit, onCancel }: WeddingFormProps) {
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')

  const [data, setData] = useState<WeddingHallInput>({
    name: initial?.name ?? '',
    region: initial?.region ?? 'seoul',
    district: initial?.district ?? '',
    address: initial?.address ?? '',
    detailAddress: initial?.detailAddress ?? '',
    latitude: initial?.latitude ?? DEFAULT_CENTER.lat,
    longitude: initial?.longitude ?? DEFAULT_CENTER.lng,
    mainImage: initial?.mainImage ?? null,
    images: initial?.images ?? [],
    homepage: initial?.homepage ?? '',
    phone: initial?.phone ?? '',
    openUntil: initial?.openUntil ?? '',
    tags: initial?.tags ?? [],
    minimumGuests: initial?.minimumGuests,
    sundayEveningGuests: initial?.sundayEveningGuests,
    rentalFee: initial?.rentalFee,
    mealPrice: initial?.mealPrice,
    negotiable: initial?.negotiable ?? false,
    negotiableMemo: initial?.negotiableMemo ?? '',
    ceremonyType: initial?.ceremonyType,
    hallCount: initial?.hallCount,
    parkingCapacity: initial?.parkingCapacity,
    parkingInfo: initial?.parkingInfo ?? '',
    subwayInfo: initial?.subwayInfo ?? '',
    shuttleInfo: initial?.shuttleInfo ?? '',
    description: initial?.description ?? '',
    memo: initial?.memo ?? '',
    rating: initial?.rating,
    reviewCount: initial?.reviewCount,
  })

  const [imageUploading, setImageUploading] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)

  function update<K extends keyof WeddingHallInput>(key: K, value: WeddingHallInput[K]) {
    setData((d) => ({ ...d, [key]: value }))
  }

  function addTag() {
    const t = tagInput.trim()
    if (!t) return
    if (!data.tags.includes(t)) update('tags', [...data.tags, t])
    setTagInput('')
  }

  function removeTag(tag: string) {
    update(
      'tags',
      data.tags.filter((t) => t !== tag),
    )
  }

  async function handleMainImageChange(file: File | null) {
    if (!file) return
    setImageUploading(true)
    setImageError(null)
    try {
      const url = await uploadWeddingHallImage(file)
      update('mainImage', url)
      update('images', [url, ...data.images.filter((i) => i !== data.mainImage)])
    } catch (err) {
      setImageError(err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.')
    } finally {
      setImageUploading(false)
    }
  }

  async function handleExtraImagesChange(files: FileList | null) {
    if (!files || files.length === 0) return
    setImageUploading(true)
    setImageError(null)
    try {
      const uploaded: string[] = []
      for (const file of Array.from(files)) {
        uploaded.push(await uploadWeddingHallImage(file))
      }
      update('images', [...data.images, ...uploaded])
    } catch (err) {
      setImageError(err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.')
    } finally {
      setImageUploading(false)
    }
  }

  function handleAddressSelect(result: AddressSearchResult) {
    const address = result.roadAddress ?? result.address
    setData((d) => ({
      ...d,
      address,
      region: inferRegion(address),
      district: inferDistrict(address) || d.district,
      latitude: result.latitude,
      longitude: result.longitude,
    }))
  }

  function handlePlaceSelect(result: PlaceSearchResult) {
    const address = result.roadAddress ?? result.address
    setData((d) => ({
      ...d,
      name: result.placeName || d.name,
      address,
      region: inferRegion(address),
      district: inferDistrict(address) || d.district,
      latitude: result.latitude,
      longitude: result.longitude,
      phone: result.phone || d.phone,
    }))
  }

  function validateStep(): string | null {
    if (step === 0) {
      if (!data.name.trim()) return '웨딩홀명을 입력해주세요.'
      if (!data.mainImage) return '대표 이미지를 등록해주세요.'
      if (!data.address.trim()) return '주소를 검색해 등록해주세요.'
    }
    return null
  }

  function goNext() {
    const err = validateStep()
    if (err) {
      setSubmitError(err)
      return
    }
    setSubmitError(null)
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function goPrev() {
    setSubmitError(null)
    setStep((s) => Math.max(s - 1, 0))
  }

  async function handleSubmit() {
    const err = validateStep()
    if (err) {
      setSubmitError(err)
      setStep(0)
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit(data)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : '등록에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* step indicator */}
      <div className="mb-6 flex items-center">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              onClick={() => setStep(i)}
              className="flex flex-col items-center gap-1.5"
            >
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
                  i === step
                    ? 'bg-olive text-white'
                    : i < step
                      ? 'bg-olive-light text-olive-dark'
                      : 'bg-line text-subtext',
                )}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </span>
              <span className={cn('text-[11px]', i === step ? 'font-medium text-ink' : 'text-subtext')}>
                {label}
              </span>
            </button>
            {i < STEPS.length - 1 && <div className="mx-1 h-px flex-1 bg-line" />}
          </div>
        ))}
      </div>

      {submitError && (
        <div className="mb-4">
          <ErrorBanner message={submitError} onDismiss={() => setSubmitError(null)} />
        </div>
      )}

      <div className="rounded-xl2 border border-line bg-white p-6">
        {step === 0 && (
          <div className="space-y-5">
            <BusinessSearchField onSelect={handlePlaceSelect} />

            <Field label="웨딩홀명" required>
              <input
                type="text"
                value={data.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="그랜드컨벤션센터"
                className="input"
              />
            </Field>

            <Field label="대표 이미지" required>
              <div className="flex items-center gap-3">
                {data.mainImage ? (
                  <img src={data.mainImage} className="h-20 w-28 rounded-lg object-cover" alt="대표 이미지" />
                ) : (
                  <div className="flex h-20 w-28 items-center justify-center rounded-lg border border-dashed border-line text-subtext">
                    <ImagePlus size={22} />
                  </div>
                )}
                <label className="cursor-pointer rounded-lg border border-line px-3 py-2 text-sm hover:bg-beige">
                  {imageUploading ? '업로드 중...' : '이미지 업로드'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={imageUploading}
                    onChange={(e) => handleMainImageChange(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
            </Field>

            <Field label="추가 이미지">
              <div className="flex flex-wrap items-center gap-2">
                {data.images
                  .filter((i) => i !== data.mainImage)
                  .map((img) => (
                    <div key={img} className="relative">
                      <img src={img} className="h-16 w-16 rounded-lg object-cover" alt="" />
                      <button
                        type="button"
                        onClick={() => update('images', data.images.filter((i) => i !== img))}
                        className="absolute -right-1.5 -top-1.5 rounded-full bg-white p-0.5 shadow-card"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border border-dashed border-line text-subtext hover:bg-beige">
                  <ImagePlus size={18} />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={imageUploading}
                    onChange={(e) => handleExtraImagesChange(e.target.files)}
                  />
                </label>
              </div>
              {imageError && <p className="mt-2 text-xs text-red-600">{imageError}</p>}
            </Field>

            <Field label="홈페이지 URL">
              <input
                type="url"
                value={data.homepage}
                onChange={(e) => update('homepage', e.target.value)}
                placeholder="https://www.example.com/"
                className="input"
              />
            </Field>

            <Field label="전화번호">
              <input
                type="tel"
                value={data.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="02-123-4567"
                className="input"
              />
            </Field>

            <Field label="태그">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="예: 11월까지오픈"
                  className="input"
                />
                <button type="button" onClick={addTag} className="shrink-0 rounded-lg border border-line px-3 text-sm hover:bg-beige">
                  추가
                </button>
              </div>
              {data.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {data.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 rounded-full bg-olive-light px-2.5 py-1 text-xs text-olive-dark">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </Field>

            <Field label="주소" required>
              <AddressSearchField
                value={data.address}
                onSelect={handleAddressSelect}
                onManualChange={(value) => update('address', value)}
              />
            </Field>

            <Field label="상세주소">
              <input
                type="text"
                value={data.detailAddress}
                onChange={(e) => update('detailAddress', e.target.value)}
                placeholder="상세주소를 입력해주세요"
                className="input"
              />
            </Field>

            <Field label="위치 조정" hint="지도에서 위치를 확인하고, 필요하면 마커를 드래그해 조정해주세요.">
              <LocationPickerMap
                latitude={data.latitude}
                longitude={data.longitude}
                onChange={(lat, lng) => setData((d) => ({ ...d, latitude: lat, longitude: lng }))}
              />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="최소 보증 인원">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={data.minimumGuests ?? ''}
                    onChange={(e) => update('minimumGuests', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="250"
                    className="input"
                  />
                  <span className="shrink-0 text-sm text-subtext">명~</span>
                </div>
              </Field>
              <Field label="일요일 저녁 최소 인원">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={data.sundayEveningGuests ?? ''}
                    onChange={(e) =>
                      update('sundayEveningGuests', e.target.value ? Number(e.target.value) : undefined)
                    }
                    placeholder="200"
                    className="input"
                  />
                  <span className="shrink-0 text-sm text-subtext">명~</span>
                </div>
              </Field>
            </div>

            <Field label="예식 형태">
              <div className="flex gap-3">
                {(['분리예식', '동시예식'] as CeremonyType[]).map((type) => (
                  <label
                    key={type}
                    className={cn(
                      'flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border py-2.5 text-sm',
                      data.ceremonyType === type ? 'border-olive bg-olive-light font-medium text-olive-dark' : 'border-line',
                    )}
                  >
                    <input
                      type="radio"
                      name="ceremonyType"
                      className="hidden"
                      checked={data.ceremonyType === type}
                      onChange={() => update('ceremonyType', type)}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </Field>

            <Field label="홀 개수">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={data.hallCount ?? ''}
                  onChange={(e) => update('hallCount', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="3"
                  className="input"
                />
                <span className="shrink-0 text-sm text-subtext">개</span>
              </div>
            </Field>

            <Field label="오픈 안내 태그" hint="예: 11월까지오픈">
              <input
                type="text"
                value={data.openUntil}
                onChange={(e) => update('openUntil', e.target.value)}
                placeholder="11월까지오픈"
                className="input"
              />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <Field label="대관료">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step={10000}
                  value={data.rentalFee ?? ''}
                  onChange={(e) => update('rentalFee', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="9000000"
                  className="input"
                />
                <span className="shrink-0 text-sm text-subtext">원</span>
              </div>
            </Field>

            <Field label="식대">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={data.mealPrice ?? ''}
                  onChange={(e) => update('mealPrice', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="90000"
                  className="input"
                />
                <span className="shrink-0 text-sm text-subtext">원~</span>
              </div>
            </Field>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={data.negotiable}
                onChange={(e) => update('negotiable', e.target.checked)}
                className="h-4 w-4 accent-olive"
              />
              가격 협의 가능
            </label>

            <Field label="추가 메모">
              <textarea
                value={data.negotiableMemo}
                onChange={(e) => update('negotiableMemo', e.target.value)}
                placeholder="방문시 조율 가능"
                rows={3}
                className="input resize-none"
              />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <Field label="주차 가능 대수" hint="필터/정렬에는 사용되지 않고 상세 화면에만 표시됩니다.">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={data.parkingCapacity ?? ''}
                  onChange={(e) => update('parkingCapacity', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="500"
                  className="input"
                />
                <span className="shrink-0 text-sm text-subtext">대</span>
              </div>
            </Field>

            <Field label="주차 안내">
              <input
                type="text"
                value={data.parkingInfo}
                onChange={(e) => update('parkingInfo', e.target.value)}
                placeholder="건물 내 지하주차장 이용 (발렛 가능)"
                className="input"
              />
            </Field>

            <Field label="지하철 안내">
              <input
                type="text"
                value={data.subwayInfo}
                onChange={(e) => update('subwayInfo', e.target.value)}
                placeholder="2호선 강남역 3번 출구 도보 5분"
                className="input"
              />
            </Field>

            <Field label="셔틀 안내">
              <input
                type="text"
                value={data.shuttleInfo}
                onChange={(e) => update('shuttleInfo', e.target.value)}
                placeholder="예식 당일 셔틀버스 운행"
                className="input"
              />
            </Field>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <Field label="웨딩홀 소개">
              <textarea
                value={data.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="웨딩홀을 소개하는 문구를 입력해주세요."
                rows={5}
                className="input resize-none"
              />
            </Field>

            <Field label="내부 메모" hint="관리자만 확인하는 메모입니다.">
              <textarea
                value={data.memo}
                onChange={(e) => update('memo', e.target.value)}
                placeholder="예: 담당자 연락처, 계약 조건 등"
                rows={3}
                className="input resize-none"
              />
            </Field>
          </div>
        )}
      </div>

      <div className="mt-5 flex justify-between">
        <button
          type="button"
          onClick={step === 0 ? onCancel : goPrev}
          className="rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink hover:bg-beige"
        >
          {step === 0 ? '취소' : '이전'}
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-full bg-olive px-6 py-2.5 text-sm font-medium text-white hover:bg-olive-dark"
          >
            다음 단계 →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-full bg-olive px-6 py-2.5 text-sm font-medium text-white hover:bg-olive-dark disabled:opacity-60"
          >
            {submitting ? '저장 중...' : submitLabel}
          </button>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">
        {label} {required && <span className="text-olive">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-subtext">{hint}</p>}
    </div>
  )
}
