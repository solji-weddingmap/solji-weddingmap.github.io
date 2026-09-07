// ---------------------------------------------------------------------------
// SVG marker icons for Kakao Maps, in the WEDDING MAP olive palette.
// Kakao's MarkerImage takes a raw image URL, so icons are inlined as data URIs.
// ---------------------------------------------------------------------------

const OLIVE = '#5F7058'
const OLIVE_DARK = '#3F4C3A'

function pinSvg(color: string): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
  <path d="M17 0C7.6 0 0 7.6 0 17c0 12.4 17 27 17 27s17-14.6 17-27C34 7.6 26.4 0 17 0z" fill="${color}"/>
  <circle cx="17" cy="17" r="7" fill="white"/>
</svg>`.trim()
}

function toDataUri(svg: string): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export const MARKER_ICON_DEFAULT = toDataUri(pinSvg(OLIVE))
export const MARKER_ICON_ACTIVE = toDataUri(pinSvg(OLIVE_DARK))

export const MARKER_SIZE = { width: 34, height: 44 }
export const MARKER_OFFSET = { x: 17, y: 44 }
