import type {
  QiblaCompassCallbacks,
  QiblaCompassController,
  QiblaHeadingReading
} from './types'

const COMPASS_TIMEOUT_MS = 4000

type IosOrientationReading = {
  webkitCompassHeading?: number
}

export function headingFromIosOrientation(
  event: IosOrientationReading
): QiblaHeadingReading | null {
  if (!isFiniteNumber(event.webkitCompassHeading)) return null

  return {
    heading: normalizeDegrees(event.webkitCompassHeading),
    source: 'ios-compass'
  }
}

export function startIosCompassEngine(
  callbacks: QiblaCompassCallbacks
): QiblaCompassController {
  let receivedHeading = false

  const onOrientation = (event: DeviceOrientationEvent) => {
    const reading = headingFromIosOrientation(event)
    if (!reading) return
    receivedHeading = true
    callbacks.onReading(reading)
  }

  window.addEventListener('deviceorientation', onOrientation)

  const timeoutId = window.setTimeout(() => {
    if (!receivedHeading) {
      callbacks.onUnavailable(
        'No iPhone compass heading was received. Check Safari motion/orientation access.'
      )
    }
  }, COMPASS_TIMEOUT_MS)

  return {
    stop() {
      window.clearTimeout(timeoutId)
      window.removeEventListener('deviceorientation', onOrientation)
    }
  }
}

function normalizeDegrees(degrees: number) {
  const normalized = degrees % 360
  return normalized < 0 ? normalized + 360 : normalized
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}
