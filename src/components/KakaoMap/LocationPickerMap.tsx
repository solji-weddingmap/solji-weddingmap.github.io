import { useEffect, useRef } from 'react'
import { useKakaoLoader } from '@/hooks/useKakaoLoader'
import KakaoMapStatus from './KakaoMapStatus'
import { MARKER_ICON_ACTIVE, MARKER_OFFSET, MARKER_SIZE } from '@/components/MapMarker/markerIcon'

interface LocationPickerMapProps {
  latitude: number
  longitude: number
  onChange: (lat: number, lng: number) => void
}

// Draggable single-marker map used on the registration form so the user can
// fine-tune the exact entrance position after an address search (spec #14).
export default function LocationPickerMap({ latitude, longitude, onChange }: LocationPickerMapProps) {
  const kakaoState = useKakaoLoader()
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (kakaoState !== 'ready' || !containerRef.current || mapRef.current) return
    const kakao = window.kakao
    const center = new kakao.maps.LatLng(latitude, longitude)
    const map = new kakao.maps.Map(containerRef.current, { center, level: 4 })

    const marker = new kakao.maps.Marker({
      position: center,
      draggable: true,
      image: new kakao.maps.MarkerImage(
        MARKER_ICON_ACTIVE,
        new kakao.maps.Size(MARKER_SIZE.width, MARKER_SIZE.height),
        { offset: new kakao.maps.Point(MARKER_OFFSET.x, MARKER_OFFSET.y) },
      ),
    })
    marker.setMap(map)

    kakao.maps.event.addListener(marker, 'dragend', () => {
      const pos = marker.getPosition()
      onChangeRef.current(pos.getLat(), pos.getLng())
    })

    kakao.maps.event.addListener(map, 'click', (e: any) => {
      marker.setPosition(e.latLng)
      onChangeRef.current(e.latLng.getLat(), e.latLng.getLng())
    })

    mapRef.current = map
    markerRef.current = marker
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kakaoState])

  // keep marker + center in sync when lat/lng change from outside (e.g. address search)
  useEffect(() => {
    if (kakaoState !== 'ready' || !mapRef.current || !markerRef.current) return
    const kakao = window.kakao
    const pos = new kakao.maps.LatLng(latitude, longitude)
    markerRef.current.setPosition(pos)
    mapRef.current.panTo(pos)
  }, [latitude, longitude, kakaoState])

  if (kakaoState !== 'ready') {
    return (
      <div className="h-56 w-full rounded-xl2 overflow-hidden">
        <KakaoMapStatus state={kakaoState} />
      </div>
    )
  }

  return <div ref={containerRef} className="h-56 w-full rounded-xl2 overflow-hidden border border-line" />
}
