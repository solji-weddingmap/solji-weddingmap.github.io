import type { CeremonyType, RegionCode, WeddingHallInput } from '@/types/weddingHall'
import { DISTRICTS_BY_REGION } from '@/utils/regions'
import { inferDistrict, inferRegion } from '@/utils/addressInference'

// ---------------------------------------------------------------------------
// Excel 일괄 등록: 웨딩홀 등록 폼(WeddingForm)에 있는 항목들을 그대로 컬럼으로
// 옮긴 양식을 만들고, 관리자가 채워서 업로드한 파일을 파싱해 WeddingHallInput
// 배열로 변환한다. 대표 이미지는 "이미 어딘가에 호스팅된 URL"만 받는다 -
// 엑셀에는 파일을 첨부할 방법이 없기 때문.
// ---------------------------------------------------------------------------

export interface TemplateColumn {
  key: string
  label: string
  example: string
  note?: string
}

export const TEMPLATE_COLUMNS: TemplateColumn[] = [
  { key: 'name', label: '웨딩홀명*', example: '그랜드컨벤션센터' },
  { key: 'region', label: '지역', example: '서울', note: '서울 / 경기 / 인천 중 하나. 비워두면 주소로 자동 판별됩니다.' },
  { key: 'district', label: '구/시', example: '강남구', note: '비워두면 주소에서 자동으로 추출을 시도합니다.' },
  { key: 'address', label: '주소*', example: '서울 강남구 테헤란로 123' },
  { key: 'detailAddress', label: '상세주소', example: '3층 그랜드홀' },
  {
    key: 'mainImage',
    label: '대표 이미지 URL',
    example: '',
    note: '이미 인터넷에 올라가 있는 이미지 주소만 가능합니다 (파일 첨부 불가). 비워둬도 등록은 진행되며, 나중에 수정 화면에서 업로드할 수 있어요.',
  },
  { key: 'images', label: '추가 이미지 URL', example: '', note: '여러 개는 쉼표(,)로 구분해주세요.' },
  { key: 'homepage', label: '홈페이지 URL', example: 'https://www.example.com/' },
  { key: 'phone', label: '전화번호', example: '02-123-4567' },
  { key: 'openUntil', label: '오픈 안내 태그', example: '11월까지오픈' },
  { key: 'tags', label: '태그', example: '한강뷰, 채플식', note: '여러 개는 쉼표(,)로 구분해주세요.' },
  { key: 'minimumGuests', label: '최소 보증 인원', example: '250' },
  { key: 'sundayEveningGuests', label: '일요일 저녁 최소 인원', example: '200' },
  { key: 'rentalFee', label: '대관료(원)', example: '9000000' },
  { key: 'mealPrice', label: '식대(원, 1인)', example: '90000' },
  { key: 'negotiable', label: '가격 협의 가능(Y/N)', example: 'N' },
  { key: 'negotiableMemo', label: '협의 메모', example: '' },
  { key: 'ceremonyType', label: '예식 형태', example: '분리예식', note: '분리예식 / 동시예식 중 하나 (비워둬도 됩니다)' },
  { key: 'hallCount', label: '홀 개수', example: '3' },
  { key: 'parkingCapacity', label: '주차 가능 대수', example: '500' },
  { key: 'parkingInfo', label: '주차 안내', example: '건물 내 지하주차장 이용 (발렛 가능)' },
  { key: 'subwayInfo', label: '지하철 안내', example: '2호선 강남역 3번 출구 도보 5분' },
  { key: 'shuttleInfo', label: '셔틀 안내', example: '예식 당일 셔틀버스 운행' },
  { key: 'description', label: '웨딩홀 소개', example: '' },
  { key: 'memo', label: '내부 메모(관리자만 확인)', example: '' },
]

export async function downloadBulkImportTemplate(): Promise<void> {
  const XLSX = await import('xlsx')

  const headerRow = TEMPLATE_COLUMNS.map((c) => c.label)
  const exampleRow = TEMPLATE_COLUMNS.map((c) => c.example)
  const sheet = XLSX.utils.aoa_to_sheet([headerRow, exampleRow])
  sheet['!cols'] = TEMPLATE_COLUMNS.map(() => ({ wch: 22 }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, '웨딩홀 목록')

  const guideRows: (string | undefined)[][] = [
    ['컬럼', '설명'],
    ...TEMPLATE_COLUMNS.map((c) => [c.label, c.note ?? '']),
    ['', ''],
    ['※ 2행은 작성 예시입니다', '실제 데이터로 덮어쓰거나 행 자체를 삭제한 뒤 3행부터 입력해주세요.'],
    ['좌표(위도/경도)', '따로 입력할 필요 없어요 - 등록 시 주소로 카카오맵에서 자동으로 찾습니다.'],
    ['지역 값', '서울 / 경기 / 인천'],
    ['구/시 예시 (서울)', DISTRICTS_BY_REGION.seoul.join(', ')],
    ['구/시 예시 (경기)', DISTRICTS_BY_REGION.gyeonggi.join(', ')],
    ['구/시 예시 (인천)', DISTRICTS_BY_REGION.incheon.join(', ')],
    ['예식 형태 값', '분리예식 / 동시예식'],
    ['가격 협의 가능 값', 'Y 또는 N (비워두면 N으로 처리)'],
  ]
  const guideSheet = XLSX.utils.aoa_to_sheet(guideRows)
  guideSheet['!cols'] = [{ wch: 26 }, { wch: 70 }]
  XLSX.utils.book_append_sheet(workbook, guideSheet, '작성 안내')

  XLSX.writeFile(workbook, 'wedding_map_bulk_template.xlsx')
}

export interface BulkImportRow {
  rowNumber: number // 엑셀 파일 기준 실제 행 번호 (헤더=1행)
  name: string
  input?: WeddingHallInput
  error?: string
}

function regionFromLabel(label: string): RegionCode | null {
  if (!label) return null
  if (label.includes('서울')) return 'seoul'
  if (label.includes('인천')) return 'incheon'
  if (label.includes('경기')) return 'gyeonggi'
  return null
}

function parseNumber(raw: string): number | undefined {
  if (!raw) return undefined
  const n = Number(String(raw).replace(/,/g, '').trim())
  return Number.isFinite(n) ? n : undefined
}

function parseList(raw: string): string[] {
  if (!raw) return []
  return raw
    .split(/[,，\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function parseYesNo(raw: string): boolean {
  const v = raw.trim().toLowerCase()
  return ['y', 'yes', '예', 'true', '1', 'o'].includes(v)
}

interface ParseOptions {
  // 양식에 위도/경도 컬럼이 없으므로 모든 행의 좌표를 주소로 지오코딩한다 -
  // 카카오맵이 설정/로드되어 있지 않으면 null을 반환하도록 호출부에서 구현한다.
  geocode: (address: string) => Promise<{ lat: number; lng: number } | null>
}

export async function parseBulkImportFile(file: File, options: ParseOptions): Promise<BulkImportRow[]> {
  const XLSX = await import('xlsx')
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const firstSheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[firstSheetName]
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

  if (rows.length === 0) {
    throw new Error('엑셀 파일에 내용이 없습니다.')
  }

  const headerRow = rows[0].map((h) => String(h ?? '').trim())
  const colIndex: Record<string, number> = {}
  TEMPLATE_COLUMNS.forEach((c) => {
    colIndex[c.key] = headerRow.indexOf(c.label)
  })

  if (colIndex.name < 0 || colIndex.address < 0) {
    throw new Error(
      '필수 컬럼(웨딩홀명, 주소)을 찾을 수 없습니다. "엑셀 양식 다운로드"로 받은 파일 형식을 그대로 사용해주세요.',
    )
  }

  function cell(row: unknown[], key: string): string {
    const idx = colIndex[key]
    if (idx == null || idx < 0) return ''
    const v = row[idx]
    if (v === undefined || v === null) return ''
    return String(v).trim()
  }

  const dataRows = rows.slice(1)
  const results: BulkImportRow[] = []

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i]
    const rowNumber = i + 2 // header가 1행이므로 데이터는 2행부터
    const isBlank = row.every((v) => String(v ?? '').trim() === '')
    if (isBlank) continue

    const name = cell(row, 'name')
    const address = cell(row, 'address')

    if (!name) {
      results.push({ rowNumber, name: '(이름 없음)', error: '웨딩홀명이 비어 있습니다.' })
      continue
    }
    if (!address) {
      results.push({ rowNumber, name, error: '주소가 비어 있습니다.' })
      continue
    }

    let latitude: number | undefined
    let longitude: number | undefined
    try {
      const geo = await options.geocode(address)
      if (geo) {
        latitude = geo.lat
        longitude = geo.lng
      }
    } catch {
      // fall through - 아래에서 undefined 체크로 에러 처리
    }

    if (latitude === undefined || longitude === undefined) {
      results.push({
        rowNumber,
        name,
        error: '주소로 좌표를 찾지 못했습니다. 정확한 주소(도로명 또는 지번)로 다시 확인해주세요.',
      })
      continue
    }

    const region = regionFromLabel(cell(row, 'region')) ?? inferRegion(address)
    const district = cell(row, 'district') || inferDistrict(address)

    const images = parseList(cell(row, 'images'))
    const mainImageUrl = cell(row, 'mainImage')
    const mainImage = mainImageUrl || images[0] || null
    const allImages = mainImage ? [mainImage, ...images.filter((i) => i !== mainImage)] : images

    const ceremonyRaw = cell(row, 'ceremonyType')
    const ceremonyType: CeremonyType | undefined =
      ceremonyRaw === '분리예식' || ceremonyRaw === '동시예식' ? ceremonyRaw : undefined

    const input: WeddingHallInput = {
      name,
      region,
      district,
      address,
      detailAddress: cell(row, 'detailAddress') || undefined,
      latitude,
      longitude,
      mainImage,
      images: allImages,
      homepage: cell(row, 'homepage') || undefined,
      phone: cell(row, 'phone') || undefined,
      openUntil: cell(row, 'openUntil') || undefined,
      tags: parseList(cell(row, 'tags')),
      minimumGuests: parseNumber(cell(row, 'minimumGuests')),
      sundayEveningGuests: parseNumber(cell(row, 'sundayEveningGuests')),
      rentalFee: parseNumber(cell(row, 'rentalFee')),
      mealPrice: parseNumber(cell(row, 'mealPrice')),
      negotiable: parseYesNo(cell(row, 'negotiable')),
      negotiableMemo: cell(row, 'negotiableMemo') || undefined,
      ceremonyType,
      hallCount: parseNumber(cell(row, 'hallCount')),
      parkingCapacity: parseNumber(cell(row, 'parkingCapacity')),
      parkingInfo: cell(row, 'parkingInfo') || undefined,
      subwayInfo: cell(row, 'subwayInfo') || undefined,
      shuttleInfo: cell(row, 'shuttleInfo') || undefined,
      description: cell(row, 'description') || undefined,
      memo: cell(row, 'memo') || undefined,
    }

    results.push({ rowNumber, name, input })
  }

  return results
}
