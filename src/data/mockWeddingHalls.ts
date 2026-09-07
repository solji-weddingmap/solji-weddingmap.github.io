import type { WeddingHall } from '@/types/weddingHall'

// ---------------------------------------------------------------------------
// Sample / seed data for local development and first-run UI without a
// Supabase connection. All wedding hall names below are FICTIONAL and any
// resemblance to a real venue is coincidental — only publicly verifiable
// geographic facts (district names, approximate coordinates) are used.
//
// Coordinates are approximate district-center points, good enough for map
// demo purposes. Replace with real venue data once Supabase is connected.
// ---------------------------------------------------------------------------

const now = new Date()
function daysAgo(n: number): string {
  const d = new Date(now)
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

interface DistrictPoint {
  region: WeddingHall['region']
  district: string
  lat: number
  lng: number
  addressPrefix: string
}

const DISTRICT_POINTS: DistrictPoint[] = [
  { region: 'seoul', district: '강남구', lat: 37.5172, lng: 127.0473, addressPrefix: '서울특별시 강남구' },
  { region: 'seoul', district: '강서구', lat: 37.5509, lng: 126.8495, addressPrefix: '서울특별시 강서구' },
  { region: 'seoul', district: '송파구', lat: 37.5145, lng: 127.1058, addressPrefix: '서울특별시 송파구' },
  { region: 'seoul', district: '영등포구', lat: 37.5264, lng: 126.8963, addressPrefix: '서울특별시 영등포구' },
  { region: 'seoul', district: '마포구', lat: 37.5663, lng: 126.9019, addressPrefix: '서울특별시 마포구' },
  { region: 'seoul', district: '용산구', lat: 37.5326, lng: 126.9903, addressPrefix: '서울특별시 용산구' },
  { region: 'seoul', district: '종로구', lat: 37.5735, lng: 126.9788, addressPrefix: '서울특별시 종로구' },
  { region: 'gyeonggi', district: '성남시', lat: 37.4201, lng: 127.1262, addressPrefix: '경기도 성남시' },
  { region: 'gyeonggi', district: '수원시', lat: 37.2636, lng: 127.0286, addressPrefix: '경기도 수원시' },
  { region: 'gyeonggi', district: '용인시', lat: 37.2411, lng: 127.1776, addressPrefix: '경기도 용인시' },
  { region: 'gyeonggi', district: '고양시', lat: 37.6584, lng: 126.8320, addressPrefix: '경기도 고양시' },
  { region: 'gyeonggi', district: '부천시', lat: 37.5034, lng: 126.7660, addressPrefix: '경기도 부천시' },
  { region: 'gyeonggi', district: '안양시', lat: 37.3943, lng: 126.9568, addressPrefix: '경기도 안양시' },
  { region: 'incheon', district: '남동구', lat: 37.4467, lng: 126.7314, addressPrefix: '인천광역시 남동구' },
  { region: 'incheon', district: '연수구', lat: 37.4100, lng: 126.6784, addressPrefix: '인천광역시 연수구' },
  { region: 'incheon', district: '부평구', lat: 37.5074, lng: 126.7217, addressPrefix: '인천광역시 부평구' },
]

const NAME_POOL = [
  '그랜드컨벤션', '라움가든', '더화이트베일', '베르사체홀', '더테일러웨딩',
  '이든가든웨딩', '스카이라인컨벤션', '올리브가든웨딩', '더포레스트웨딩', '라비앙로즈',
  '더뮤즈웨딩홀', '센텀웨딩컨벤션', '더클래식가든', '아펠가모웨딩', '더채플웨딩',
  '아이리스컨벤션', '더그레이스웨딩', '벨라루체웨딩', '더데이원웨딩', '이스트가든컨벤션',
  '더모먼트웨딩', '노블레스웨딩홀', '더로즈가든', '세인트메리웨딩',
]

const IMAGE_POOL = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80',
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80',
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80',
  'https://images.unsplash.com/photo-1550005809-91ad75fb315f?w=800&q=80',
]

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length]
}

function jitter(base: number, seedIndex: number): number {
  // small deterministic offset so multiple halls in the same district
  // don't stack exactly on top of each other on the map
  const offset = ((seedIndex * 37) % 100) / 100000 - 0.0005
  return base + offset
}

export const mockWeddingHalls: WeddingHall[] = DISTRICT_POINTS.flatMap((point, districtIndex) => {
  const hallsInDistrict = districtIndex % 3 === 0 ? 2 : 1
  return Array.from({ length: hallsInDistrict }, (_, i) => {
    const globalIndex = districtIndex * 2 + i
    const name = `${pick(NAME_POOL, globalIndex)} ${point.district === '강남구' && i === 0 ? '' : '웨딩홀'}`.trim()
    const mealPrice = 45000 + (globalIndex % 6) * 10000
    const rentalFee = 3_000_000 + (globalIndex % 8) * 1_000_000
    const minimumGuests = 100 + (globalIndex % 5) * 50
    const ceremonyType = globalIndex % 2 === 0 ? '분리예식' : '동시예식'
    const hasParking = globalIndex % 4 !== 0
    const id = `hall-${districtIndex}-${i}`

    return {
      id,
      name,
      region: point.region,
      district: point.district,
      address: `${point.addressPrefix} ○○로 ${100 + globalIndex}`,
      detailAddress: globalIndex % 2 === 0 ? `${2 + (globalIndex % 8)}층 웨딩홀` : undefined,
      latitude: jitter(point.lat, globalIndex),
      longitude: jitter(point.lng, globalIndex + 13),
      mainImage: pick(IMAGE_POOL, globalIndex),
      images: [pick(IMAGE_POOL, globalIndex), pick(IMAGE_POOL, globalIndex + 1), pick(IMAGE_POOL, globalIndex + 2)],
      homepage: globalIndex % 3 === 0 ? undefined : `https://example.com/wedding-hall-${globalIndex}`,
      phone: globalIndex % 5 === 0 ? undefined : `02-${1000 + globalIndex}-${5000 + globalIndex}`,
      openUntil: globalIndex % 4 === 0 ? '11월까지오픈' : undefined,
      tags: [
        ceremonyType,
        ...(globalIndex % 4 === 0 ? ['11월까지오픈'] : []),
        ...(globalIndex % 6 === 0 ? ['신규오픈'] : []),
      ],
      minimumGuests,
      sundayEveningGuests: globalIndex % 2 === 0 ? Math.max(50, minimumGuests - 50) : undefined,
      rentalFee,
      mealPrice,
      negotiable: globalIndex % 3 === 0,
      negotiableMemo: globalIndex % 3 === 0 ? '방문시 조율 가능' : undefined,
      ceremonyType,
      hallCount: 1 + (globalIndex % 4),
      parkingCapacity: hasParking ? 100 + (globalIndex % 10) * 50 : undefined,
      parkingInfo: hasParking ? '건물 내 지하주차장 이용 (발렛 가능)' : undefined,
      subwayInfo: globalIndex % 2 === 0 ? `${point.district} 인근 지하철역에서 도보 5분` : undefined,
      shuttleInfo: globalIndex % 5 === 0 ? '예식 당일 셔틀버스 운행' : undefined,
      description: `${point.addressPrefix}에 위치한 프리미엄 웨딩홀입니다. 넓은 채광과 고급스러운 인테리어로 특별한 날을 더욱 빛나게 만들어드립니다.`,
      memo: globalIndex % 3 === 0 ? '방문시 조율 가능' : undefined,
      rating: 4.1 + ((globalIndex % 9) / 10),
      reviewCount: 20 + globalIndex * 7,
      createdAt: daysAgo(30 - globalIndex),
      updatedAt: daysAgo(10 - (globalIndex % 10)),
    } satisfies WeddingHall
  })
})
