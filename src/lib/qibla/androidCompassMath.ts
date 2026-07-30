import type { QiblaHeadingReading } from './types'

type AbsoluteOrientationReading = {
  absolute?: boolean
  alpha?: number | null
  beta?: number | null
  gamma?: number | null
}

export function headingFromAndroidQuaternion(
  quaternion: readonly number[] | null
): QiblaHeadingReading | null {
  if (!quaternion || quaternion.length !== 4 || !quaternion.every(isFiniteNumber)) {
    return null
  }

  const [rawX, rawY, rawZ, rawW] = quaternion
  const magnitude = Math.hypot(rawX, rawY, rawZ, rawW)
  if (!Number.isFinite(magnitude) || magnitude < 0.000001) return null

  const x = rawX / magnitude
  const y = rawY / magnitude
  const z = rawZ / magnitude
  const w = rawW / magnitude

  // W3C AbsoluteOrientationSensor quaternions rotate the screen coordinate
  // system into Earth's East-North-Up frame. Project the screen's +Y axis
  // (the visible top edge) onto the horizontal East/North plane.
  const east = 2 * (x * y - z * w)
  const north = 1 - 2 * (x * x + z * z)
  const horizontalMagnitude = Math.hypot(east, north)

  // When the top edge points almost vertically, it has no trustworthy
  // horizontal heading. Do not manufacture a North value in that posture.
  if (!Number.isFinite(horizontalMagnitude) || horizontalMagnitude < 0.05) {
    return null
  }

  return {
    heading: normalizeDegrees(radiansToDegrees(Math.atan2(east, north))),
    source: 'android-absolute-sensor'
  }
}

export function headingFromAndroidOrientation(
  event: AbsoluteOrientationReading,
  screenAngleDegrees = 0
): QiblaHeadingReading | null {
  if (event.absolute !== true || !isFiniteNumber(event.alpha)) return null

  let heading: number
  if (isFiniteNumber(event.beta) && isFiniteNumber(event.gamma)) {
    const quaternion = quaternionFromDeviceOrientation(
      event.alpha,
      event.beta,
      event.gamma
    )
    const reading = headingFromAndroidQuaternion([
      quaternion.x,
      quaternion.y,
      quaternion.z,
      quaternion.w
    ])
    if (!reading) return null
    heading = reading.heading
  } else {
    // The W3C flat-device relation: alpha rotates opposite to compass heading.
    heading = normalizeDegrees(360 - event.alpha)
  }

  // DeviceOrientationEvent uses the device's natural coordinate frame.
  // Convert it to the current visible screen's top edge.
  return {
    heading: normalizeDegrees(heading - normalizeDegrees(screenAngleDegrees)),
    source: 'android-absolute-orientation'
  }
}

export function quaternionFromDeviceOrientation(
  alphaDegrees: number,
  betaDegrees: number,
  gammaDegrees: number
) {
  const halfAlpha = degreesToRadians(alphaDegrees) / 2
  const halfBeta = degreesToRadians(betaDegrees) / 2
  const halfGamma = degreesToRadians(gammaDegrees) / 2

  const cX = Math.cos(halfBeta)
  const cY = Math.cos(halfGamma)
  const cZ = Math.cos(halfAlpha)
  const sX = Math.sin(halfBeta)
  const sY = Math.sin(halfGamma)
  const sZ = Math.sin(halfAlpha)

  // W3C Device Orientation uses intrinsic Z-X'-Y'' rotations.
  return {
    x: sX * cY * cZ - cX * sY * sZ,
    y: cX * sY * cZ + sX * cY * sZ,
    z: cX * cY * sZ + sX * sY * cZ,
    w: cX * cY * cZ - sX * sY * sZ
  }
}

export function normalizeDegrees(degrees: number) {
  const normalized = degrees % 360
  return normalized < 0 ? normalized + 360 : normalized
}

export function signedAngleDegrees(degrees: number) {
  const normalized = normalizeDegrees(degrees)
  return normalized > 180 ? normalized - 360 : normalized
}

function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180
}

function radiansToDegrees(radians: number) {
  return (radians * 180) / Math.PI
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}
