import { useEffect, useRef } from 'react'
import { useKakaoLoader } from '@/hooks/useKakaoLoader'
import type { WeddingHall } from '@/types/weddingHall'
import KakaoMapStatus from './KakaoMapStatus'
import { MARKER_ICON_ACTIVE, MARKER_ICON_DEFAULT, MARKER_OFFSET, MARKER_SIZE } from '@/components/MapMarker/markerIcon'
import { formatManwon, formatMealPrice } from '@/utils/format'
import { regionLabel } from '@/utils/regions'

// Seoul metro-area default view
const DEFAULT_CENTER = { lat: 37.4837, lng: 127.0324 }
const DEFAULT_LEVEL = 9

interface KakaoMapProps {
  halls: WeddingHall[]
  selectedId: string | null
  onSelectHall: (hall: WeddingHall) => void
}

export default function KakaoMap({ halls, selectedId, onSelectHall }: KakaoMapProps) {
  const kakaoState = useKakaoLoader()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const clustererRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())
  const overlayRef = useRef<any>(null)
  const onSelectRef = useRef(onSelectHall)
  onSelectRef.current = onSelectHall

  // initialize the map once the SDK is ready
  useEffect(() => {
    if (kakaoState !== 'ready' || !containerRef.current || mapRef.current) return
    const kakao = window.kakao
    const map = new kakao.maps.Map(containerRef.current, {
      center: new kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng),
      level: DEFAULT_LEVEL,
    })
    map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT)
    mapRef.current = map
    clustererRef.current = new kakao.maps.MarkerClusterer({
      map,
      averageCenter: true,
      minLevel: 7,
      disableClickZoom: false,
      styles: [
        {
          width: '44px',
          height: '44px',
          background: 'rgba(95, 112, 88, 0.9)',
          borderRadius: '50%',
          color: '#fff',
          textAlign: 'center',
          lineHeight: '44px',
          fontWeight: '600',
          fontSize: '14px',
        },
      ],
    })
  }, [kakaoState])

  function closeOverlay() {
    overlayRef.current?.setMap(null)
    overlayRef.current = null
  }

  function openOverlayFor(hall: WeddingHall) {
    const kakao = window.kakao
    const map = mapRef.current
    if (!kakao || !map) return
    closeOverlay()

    const content = document.createElement('div')
    content.className = 'kakao-overlay-card'
    content.innerHTML = `
      <div style="position:relative">
        <div style="height:96px;background:#E6E7E1;overflow:hidden">
          ${
            hall.mainImage
              ? `<img src="${hall.mainImage}" style="width:100%;height:100%;object-fit:cover" />`
              : ''
          }
        </div>
        <button data-close style="position:absolute;top:6px;right:6px;width:22px;height:22px;border-radius:9999px;background:rgba(255,255,255,0.9);border:none;cursor:pointer;font-size:13px;line-height:1;">✕</button>
      </div>
      <div style="padding:10px 12px 12px">
        <p style="font-weight:600;font-size:13.5px;color:#292D28;margin:0 0 2px">${hall.name}</p>
        <p style="font-size:12px;color:#7D827A;margin:0 0 8px">${regionLabel(hall.region)} ${hall.district}</p>
        <p style="font-size:12px;color:#292D28;margin:0">식대 ${formatMealPrice(hall.mealPrice)}</p>
        <p style="font-size:12px;color:#292D28;margin:2px 0 10px">대관료 ${formatManwon(hall.rentalFee)}</p>
        <button data-detail style="width:100%;background:#5F7058;color:white;border:none;border-radius:9999px;padding:7px 0;font-size:12.5px;font-weight:500;cursor:pointer">상세보기</button>
      </div>
    `
    content.querySelector('[data-close]')?.addEventListener('click', closeOverlay)
    content.querySelector('[data-detail]')?.addEventListener('click', () => onSelectRef.current(hall))

    const overlay = new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(hall.latitude, hall.longitude),
      content,
      yAnchor: 1.35,
      zIndex: 10,
    })
    overlay.setMap(map)
    overlayRef.current = overlay
  }

  // sync markers with halls list
  useEffect(() => {
    if (kakaoState !== 'ready' || !mapRef.current) return
    const kakao = window.kakao
    const map = mapRef.current

    markersRef.current.forEach((m) => m.setMap(null))
    markersRef.current.clear()
    clustererRef.current?.clear()

    const markers = halls.map((hall) => {
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(hall.latitude, hall.longitude),
        image: new kakao.maps.MarkerImage(
          hall.id === selectedId ? MARKER_ICON_ACTIVE : MARKER_ICON_DEFAULT,
          new kakao.maps.Size(MARKER_SIZE.width, MARKER_SIZE.height),
          { offset: new kakao.maps.Point(MARKER_OFFSET.x, MARKER_OFFSET.y) },
        ),
      })
      kakao.maps.event.addListener(marker, 'click', () => {
        onSelectRef.current(hall)
      })
      markersRef.current.set(hall.id, marker)
      return marker
    })

    clustererRef.current?.addMarkers(markers)

    return () => {
      markers.forEach((m) => m.setMap(null))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [halls, kakaoState])

  // react to selection changes: pan + highlight + overlay
  useEffect(() => {
    if (kakaoState !== 'ready' || !mapRef.current) return
    const kakao = window.kakao
    const map = mapRef.current

    markersRef.current.forEach((marker, id) => {
      marker.setImage(
        new kakao.maps.MarkerImage(
          id === selectedId ? MARKER_ICON_ACTIVE : MARKER_ICON_DEFAULT,
          new kakao.maps.Size(MARKER_SIZE.width, MARKER_SIZE.height),
          { offset: new kakao.maps.Point(MARKER_OFFSET.x, MARKER_OFFSET.y) },
        ),
      )
    })

    if (!selectedId) {
      closeOverlay()
      return
    }

    const hall = halls.find((h) => h.id === selectedId)
    if (!hall) return

    map.panTo(new kakao.maps.LatLng(hall.latitude, hall.longitude))
    openOverlayFor(hall)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, kakaoState])

  if (kakaoState !== 'ready') {
    return <KakaoMapStatus state={kakaoState} />
  }

  return <div ref={containerRef} className="h-full w-full" />
}
