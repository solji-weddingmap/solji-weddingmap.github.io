import { isSupabaseConfigured, supabase, WEDDING_HALL_TABLE } from '@/lib/supabase'
import { mockWeddingHalls } from '@/data/mockWeddingHalls'
import type { WeddingHall, WeddingHallInput } from '@/types/weddingHall'
import { AppError, toAppError } from '@/utils/errors'

// ---------------------------------------------------------------------------
// Data-access layer for wedding halls.
//
// - Before Supabase is configured (.env not set), everything runs against an
//   in-memory copy of the mock/seed data so the full UI (including create /
//   edit / delete) is testable without a backend. Changes are NOT persisted
//   across page reloads in this mode.
// - Once VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set, all functions
//   transparently switch to reading/writing the Supabase `wedding_halls`
//   table instead. No component code needs to change.
// ---------------------------------------------------------------------------

let memoryStore: WeddingHall[] = mockWeddingHalls.map((h) => ({ ...h }))

function generateId(): string {
  return `hall-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// snake_case (DB) <-> camelCase (app) mapping ------------------------------

interface WeddingHallRow {
  id: string
  name: string
  region: string
  district: string
  address: string
  detail_address: string | null
  latitude: number
  longitude: number
  main_image: string | null
  images: string[] | null
  homepage: string | null
  phone: string | null
  open_until: string | null
  tags: string[] | null
  minimum_guests: number | null
  sunday_evening_guests: number | null
  rental_fee: number | null
  meal_price: number | null
  negotiable: boolean | null
  negotiable_memo: string | null
  ceremony_type: string | null
  hall_count: number | null
  parking_capacity: number | null
  parking_info: string | null
  subway_info: string | null
  shuttle_info: string | null
  description: string | null
  memo: string | null
  rating: number | null
  review_count: number | null
  created_at: string
  updated_at: string
  created_by: string | null
}

function rowToHall(row: WeddingHallRow): WeddingHall {
  return {
    id: row.id,
    name: row.name,
    region: row.region as WeddingHall['region'],
    district: row.district,
    address: row.address,
    detailAddress: row.detail_address ?? undefined,
    latitude: row.latitude,
    longitude: row.longitude,
    mainImage: row.main_image,
    images: row.images ?? [],
    homepage: row.homepage ?? undefined,
    phone: row.phone ?? undefined,
    openUntil: row.open_until ?? undefined,
    tags: row.tags ?? [],
    minimumGuests: row.minimum_guests ?? undefined,
    sundayEveningGuests: row.sunday_evening_guests ?? undefined,
    rentalFee: row.rental_fee ?? undefined,
    mealPrice: row.meal_price ?? undefined,
    negotiable: row.negotiable ?? undefined,
    negotiableMemo: row.negotiable_memo ?? undefined,
    ceremonyType: (row.ceremony_type as WeddingHall['ceremonyType']) ?? undefined,
    hallCount: row.hall_count ?? undefined,
    parkingCapacity: row.parking_capacity ?? undefined,
    parkingInfo: row.parking_info ?? undefined,
    subwayInfo: row.subway_info ?? undefined,
    shuttleInfo: row.shuttle_info ?? undefined,
    description: row.description ?? undefined,
    memo: row.memo ?? undefined,
    rating: row.rating ?? undefined,
    reviewCount: row.review_count ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by ?? undefined,
  }
}

function hallToRow(
  input: WeddingHallInput,
): Omit<WeddingHallRow, 'id' | 'created_at' | 'updated_at' | 'created_by'> {
  return {
    name: input.name,
    region: input.region,
    district: input.district,
    address: input.address,
    detail_address: input.detailAddress ?? null,
    latitude: input.latitude,
    longitude: input.longitude,
    main_image: input.mainImage,
    images: input.images ?? [],
    homepage: input.homepage ?? null,
    phone: input.phone ?? null,
    open_until: input.openUntil ?? null,
    tags: input.tags ?? [],
    minimum_guests: input.minimumGuests ?? null,
    sunday_evening_guests: input.sundayEveningGuests ?? null,
    rental_fee: input.rentalFee ?? null,
    meal_price: input.mealPrice ?? null,
    negotiable: input.negotiable ?? null,
    negotiable_memo: input.negotiableMemo ?? null,
    ceremony_type: input.ceremonyType ?? null,
    hall_count: input.hallCount ?? null,
    parking_capacity: input.parkingCapacity ?? null,
    parking_info: input.parkingInfo ?? null,
    subway_info: input.subwayInfo ?? null,
    shuttle_info: input.shuttleInfo ?? null,
    description: input.description ?? null,
    memo: input.memo ?? null,
    rating: input.rating ?? null,
    review_count: input.reviewCount ?? null,
  }
}

export async function fetchWeddingHalls(): Promise<WeddingHall[]> {
  if (!isSupabaseConfigured || !supabase) {
    return memoryStore.map((h) => ({ ...h }))
  }
  try {
    const { data, error } = await supabase
      .from(WEDDING_HALL_TABLE)
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data as WeddingHallRow[]).map(rowToHall)
  } catch (err) {
    throw toAppError(
      '웨딩홀 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
      'fetchWeddingHalls failed',
      err,
    )
  }
}

export async function fetchWeddingHallById(id: string): Promise<WeddingHall | null> {
  if (!isSupabaseConfigured || !supabase) {
    return memoryStore.find((h) => h.id === id) ?? null
  }
  try {
    const { data, error } = await supabase.from(WEDDING_HALL_TABLE).select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? rowToHall(data as WeddingHallRow) : null
  } catch (err) {
    throw toAppError('웨딩홀 정보를 불러오지 못했습니다.', 'fetchWeddingHallById failed', err)
  }
}

export async function createWeddingHall(input: WeddingHallInput, userId?: string | null): Promise<WeddingHall> {
  const nowIso = new Date().toISOString()

  if (!isSupabaseConfigured || !supabase) {
    const hall: WeddingHall = {
      ...input,
      id: generateId(),
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: userId ?? undefined,
    }
    memoryStore = [hall, ...memoryStore]
    return hall
  }

  try {
    const row = { ...hallToRow(input), created_by: userId ?? null }
    const { data, error } = await supabase.from(WEDDING_HALL_TABLE).insert(row).select().single()
    if (error) throw error
    return rowToHall(data as WeddingHallRow)
  } catch (err) {
    throw toAppError(
      '웨딩홀 등록에 실패했습니다. 입력 내용을 확인한 뒤 다시 시도해주세요.',
      'createWeddingHall failed',
      err,
    )
  }
}

export async function updateWeddingHall(id: string, input: WeddingHallInput): Promise<WeddingHall> {
  const nowIso = new Date().toISOString()

  if (!isSupabaseConfigured || !supabase) {
    const idx = memoryStore.findIndex((h) => h.id === id)
    if (idx === -1) {
      throw new AppError('수정할 웨딩홀을 찾을 수 없습니다.', `updateWeddingHall: id ${id} not found`)
    }
    const updated: WeddingHall = { ...input, id, createdAt: memoryStore[idx].createdAt, updatedAt: nowIso }
    memoryStore = memoryStore.map((h) => (h.id === id ? updated : h))
    return updated
  }

  try {
    const row = hallToRow(input)
    const { data, error } = await supabase
      .from(WEDDING_HALL_TABLE)
      .update({ ...row, updated_at: nowIso })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return rowToHall(data as WeddingHallRow)
  } catch (err) {
    throw toAppError('웨딩홀 수정에 실패했습니다. 잠시 후 다시 시도해주세요.', 'updateWeddingHall failed', err)
  }
}

export async function deleteWeddingHall(id: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    memoryStore = memoryStore.filter((h) => h.id !== id)
    return
  }
  try {
    const { error } = await supabase.from(WEDDING_HALL_TABLE).delete().eq('id', id)
    if (error) throw error
  } catch (err) {
    throw toAppError('웨딩홀 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.', 'deleteWeddingHall failed', err)
  }
}
