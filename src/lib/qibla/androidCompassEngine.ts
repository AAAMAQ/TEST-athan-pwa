import { headingFromAndroidOrientation, headingFromAndroidQuaternion } from './androidCompassMath'
import { CircularCompassFilter } from './compassFilter'
import type {
  AbsoluteOrientationSensorLike,
  QiblaCompassCallbacks,
  QiblaCompassController,
  QiblaHeadingReading
} from './types'

const COMPASS_TIMEOUT_MS = 4000
const ABSOLUTE_SENSOR_GRACE_MS = 1500

type ActiveAndroidSource = 'absolute-sensor' | 'absolute-orientation' | null

export function startAndroidCompassEngine(
  callbacks: QiblaCompassCallbacks
): QiblaCompassController {
  const filter = new CircularCompassFilter()
  let stopped = false
  let activeSource: ActiveAndroidSource = null
  let receivedRelativeOnly = false
  let sensorFailed = false
  let fallbackAttached = false
  let sensor: AbsoluteOrientationSensorLike | null = null

  const publish = (reading: QiblaHeadingReading) => {
    if (stopped) return
    const expectedSource: ActiveAndroidSource = reading.source === 'android-absolute-sensor'
      ? 'absolute-sensor'
      : 'absolute-orientation'

    // Pick one Earth-referenced source and keep it for the session. Competing
    // browser streams must never overwrite each other and move North.
    if (activeSource !== null && activeSource !== expectedSource) return
    activeSource = expectedSource

    const filteredHeading = filter.update(reading.heading)
    if (filteredHeading === null) return
    callbacks.onReading({ ...reading, heading: filteredHeading })
  }

  const getScreenAngle = () => {
    const angle = window.screen.orientation?.angle
    if (typeof angle === 'number' && Number.isFinite(angle)) return angle
    const legacyAngle = (window as Window & { orientation?: number }).orientation
    return typeof legacyAngle === 'number' && Number.isFinite(legacyAngle)
      ? legacyAngle
      : 0
  }

  const onAbsoluteOrientation = (event: DeviceOrientationEvent) => {
    if (activeSource === 'absolute-sensor') return
    const reading = headingFromAndroidOrientation(event, getScreenAngle())
    if (reading) publish(reading)
  }

  const onOrientation = (event: DeviceOrientationEvent) => {
    if (event.absolute !== true && typeof event.alpha === 'number') {
      receivedRelativeOnly = true
      return
    }
    onAbsoluteOrientation(event)
  }

  const attachFallback = () => {
    if (stopped || fallbackAttached || activeSource === 'absolute-sensor') return
    fallbackAttached = true
    window.addEventListener('deviceorientationabsolute', onAbsoluteOrientation)
    window.addEventListener('deviceorientation', onOrientation)
  }

  const detachFallback = () => {
    if (!fallbackAttached) return
    fallbackAttached = false
    window.removeEventListener('deviceorientationabsolute', onAbsoluteOrientation)
    window.removeEventListener('deviceorientation', onOrientation)
  }

  const onSensorReading = () => {
    const reading = headingFromAndroidQuaternion(sensor?.quaternion ?? null)
    if (!reading) return
    if (activeSource === null) detachFallback()
    publish(reading)
  }

  const onSensorError = () => {
    sensorFailed = true
    if (activeSource === 'absolute-sensor') {
      activeSource = null
      filter.reset()
    }
    stopSensor()
    attachFallback()
  }

  const stopSensor = () => {
    if (!sensor) return
    sensor.removeEventListener('reading', onSensorReading)
    sensor.removeEventListener('error', onSensorError)
    try {
      sensor.stop()
    } catch {
      // The browser may already have stopped a failed sensor.
    }
    sensor = null
  }

  if (window.AbsoluteOrientationSensor && window.isSecureContext) {
    try {
      sensor = new window.AbsoluteOrientationSensor({
        frequency: 20,
        referenceFrame: 'screen'
      })
      sensor.addEventListener('reading', onSensorReading)
      sensor.addEventListener('error', onSensorError)
      sensor.start()
    } catch {
      sensorFailed = true
      stopSensor()
      attachFallback()
    }
  } else {
    sensorFailed = true
    attachFallback()
  }

  const fallbackTimer = window.setTimeout(() => {
    if (activeSource === null) attachFallback()
  }, ABSOLUTE_SENSOR_GRACE_MS)

  const timeoutTimer = window.setTimeout(() => {
    if (activeSource !== null || stopped) return
    const magneticSensorDetail = sensorFailed
      ? ' The Android magnetic sensor was unavailable.'
      : ''
    callbacks.onUnavailable(
      receivedRelativeOnly
        ? `This browser supplied only session-relative motion, so the starting direction was rejected instead of being treated as North.${magneticSensorDetail}`
        : `No Earth-referenced Android compass heading was received.${magneticSensorDetail} Check motion/orientation access or try an updated Chrome or Samsung Internet.`
    )
  }, COMPASS_TIMEOUT_MS)

  return {
    stop() {
      stopped = true
      window.clearTimeout(fallbackTimer)
      window.clearTimeout(timeoutTimer)
      detachFallback()
      stopSensor()
      filter.reset()
    }
  }
}
