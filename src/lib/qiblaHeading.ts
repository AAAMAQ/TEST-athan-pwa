export type QiblaHeadingSource = 'ios-compass' | 'absolute-orientation'

export type QiblaHeadingReading = {
  heading: number
  source: QiblaHeadingSource
}

type OrientationReading = {
  absolute?: boolean
  alpha?: number | null
  webkitCompassHeading?: number
}

export function qiblaHeadingFromOrientation(
  event: OrientationReading,
  eventType: 'deviceorientation' | 'deviceorientationabsolute'
): QiblaHeadingReading | null {
  if (isFiniteNumber(event.webkitCompassHeading)) {
    return {
      heading: normalizeDegrees(event.webkitCompassHeading),
      source: 'ios-compass'
    }
  }

  const isAbsolute = eventType === 'deviceorientationabsolute' || event.absolute === true
  if (!isAbsolute || !isFiniteNumber(event.alpha)) return null

  return {
    heading: normalizeDegrees(360 - event.alpha),
    source: 'absolute-orientation'
  }
}

export function qiblaHeadingSourceLabel(source: QiblaHeadingSource | null) {
  if (source === 'ios-compass') return 'iPhone compass'
  if (source === 'absolute-orientation') return 'Absolute device orientation'
  return 'Waiting for an absolute compass'
}

function normalizeDegrees(degrees: number) {
  const normalized = degrees % 360
  return normalized < 0 ? normalized + 360 : normalized
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}
