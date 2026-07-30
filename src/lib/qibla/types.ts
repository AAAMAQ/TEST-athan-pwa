export type QiblaHeadingSource =
  | 'ios-compass'
  | 'android-absolute-sensor'
  | 'android-absolute-orientation'

export type QiblaHeadingReading = {
  heading: number
  source: QiblaHeadingSource
}

export type QiblaCompassCallbacks = {
  onReading: (reading: QiblaHeadingReading) => void
  onUnavailable: (detail: string) => void
}

export type QiblaCompassController = {
  stop: () => void
}

export type AbsoluteOrientationSensorLike = EventTarget & {
  quaternion: readonly number[] | null
  start: () => void
  stop: () => void
}

declare global {
  interface DeviceOrientationEvent {
    webkitCompassHeading?: number
  }

  interface DeviceOrientationEventConstructor {
    requestPermission?: () => Promise<'granted' | 'denied'>
  }

  interface Window {
    DeviceOrientationEvent?: DeviceOrientationEventConstructor
    AbsoluteOrientationSensor?: new (options?: {
      frequency?: number
      referenceFrame?: 'device' | 'screen'
    }) => AbsoluteOrientationSensorLike
  }
}

export function qiblaHeadingSourceLabel(source: QiblaHeadingSource | null) {
  if (source === 'ios-compass') return 'iPhone compass'
  if (source === 'android-absolute-sensor') return 'Android magnetic North sensor'
  if (source === 'android-absolute-orientation') return 'Android absolute orientation'
  return 'Waiting for an absolute compass'
}
