// ---------------------------------------------------------------------------
// Kakao Maps JavaScript SDK loader.
//
// IMPORTANT: use the JavaScript key (앱 키 > JavaScript 키), never the REST
// API key - the REST key will fail silently / be rejected by kakao.maps.load.
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    kakao: any
  }
}

const KAKAO_SDK_URL = 'https://dapi.kakao.com/v2/maps/sdk.js'

export const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY as string | undefined

export const isKakaoConfigured = Boolean(
  KAKAO_MAP_KEY && KAKAO_MAP_KEY !== 'YOUR_KAKAO_JAVASCRIPT_KEY',
)

let loadPromise: Promise<void> | null = null

export function loadKakaoMaps(): Promise<void> {
  if (!isKakaoConfigured) {
    return Promise.reject(new Error('KAKAO_MAP_KEY_MISSING'))
  }

  if (window.kakao?.maps) {
    return Promise.resolve()
  }

  if (loadPromise) return loadPromise

  loadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-kakao-sdk]')
    if (existing) {
      existing.addEventListener('load', () => window.kakao.maps.load(() => resolve()))
      existing.addEventListener('error', () => reject(new Error('KAKAO_SDK_LOAD_FAILED')))
      return
    }

    const script = document.createElement('script')
    script.dataset.kakaoSdk = 'true'
    script.async = true
    script.src = `${KAKAO_SDK_URL}?appkey=${KAKAO_MAP_KEY}&autoload=false&libraries=services,clusterer`
    script.onload = () => {
      if (!window.kakao?.maps) {
        reject(new Error('KAKAO_SDK_LOAD_FAILED'))
        return
      }
      window.kakao.maps.load(() => resolve())
    }
    script.onerror = () => reject(new Error('KAKAO_SDK_LOAD_FAILED'))
    document.head.appendChild(script)
  })

  return loadPromise
}

// ---- Geocoding helpers -----------------------------------------------------

export interface AddressSearchResult {
  address: string
  roadAddress?: string
  latitude: number
  longitude: number
}

export function searchAddress(query: string): Promise<AddressSearchResult[]> {
  return new Promise((resolve, reject) => {
    if (!window.kakao?.maps?.services) {
      reject(new Error('KAKAO_SERVICES_NOT_LOADED'))
      return
    }
    const geocoder = new window.kakao.maps.services.Geocoder()
    geocoder.addressSearch(query, (result: any[], status: string) => {
      if (status === window.kakao.maps.services.Status.OK) {
        resolve(
          result.map((r) => ({
            address: r.address_name,
            roadAddress: r.road_address?.address_name,
            latitude: parseFloat(r.y),
            longitude: parseFloat(r.x),
          })),
        )
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        resolve([])
      } else {
        reject(new Error(`KAKAO_ADDRESS_SEARCH_FAILED:${status}`))
      }
    })
  })
}

// A single business/place result from Kakao's keyword search - used to
// auto-fill the wedding hall registration form from an existing Kakao Map
// listing (name, address, coordinates, phone if Kakao has it on file).
export interface PlaceSearchResult extends AddressSearchResult {
  placeName: string
  phone?: string
  categoryName?: string
  // Link to this place's page on Kakao Map (place.map.kakao.com/...) - NOT
  // the business's own homepage. Kakao's public keyword-search API (the one
  // this SDK call uses) doesn't expose a homepage URL or photos at all, even
  // though the Kakao Map website/app shows them - that data comes from an
  // internal, non-public source. We surface this link so an admin can jump
  // to the Kakao Map listing and copy the real homepage/photos manually.
  placeUrl?: string
}

export function searchPlaces(query: string): Promise<PlaceSearchResult[]> {
  return new Promise((resolve, reject) => {
    if (!window.kakao?.maps?.services) {
      reject(new Error('KAKAO_SERVICES_NOT_LOADED'))
      return
    }
    const places = new window.kakao.maps.services.Places()
    places.keywordSearch(query, (result: any[], status: string) => {
      if (status === window.kakao.maps.services.Status.OK) {
        resolve(
          result.map((r) => ({
            placeName: r.place_name,
            address: r.address_name,
            roadAddress: r.road_address_name || undefined,
            latitude: parseFloat(r.y),
            longitude: parseFloat(r.x),
            phone: r.phone || undefined,
            categoryName: r.category_name || undefined,
            placeUrl: r.place_url || undefined,
          })),
        )
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        resolve([])
      } else {
        reject(new Error(`KAKAO_PLACE_SEARCH_FAILED:${status}`))
      }
    })
  })
}

export function coordToAddress(lat: number, lng: number): Promise<string | null> {
  return new Promise((resolve, reject) => {
    if (!window.kakao?.maps?.services) {
      reject(new Error('KAKAO_SERVICES_NOT_LOADED'))
      return
    }
    const geocoder = new window.kakao.maps.services.Geocoder()
    geocoder.coord2Address(lng, lat, (result: any[], status: string) => {
      if (status === window.kakao.maps.services.Status.OK && result[0]) {
        const r = result[0]
        resolve(r.road_address?.address_name ?? r.address?.address_name ?? null)
      } else {
        resolve(null)
      }
    })
  })
}
