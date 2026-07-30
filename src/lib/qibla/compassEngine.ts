import { startAndroidCompassEngine } from './androidCompassEngine'
import { startIosCompassEngine } from './iosCompassEngine'
import type { QiblaCompassCallbacks, QiblaCompassController } from './types'

export function startQiblaCompassEngine(
  callbacks: QiblaCompassCallbacks
): QiblaCompassController {
  return isAppleMobilePlatform()
    ? startIosCompassEngine(callbacks)
    : startAndroidCompassEngine(callbacks)
}

export function isQiblaCompassSupported() {
  return Boolean(window.DeviceOrientationEvent || window.AbsoluteOrientationSensor)
}

export function isAppleMobilePlatform(
  platform: Pick<Navigator, 'userAgent' | 'platform' | 'maxTouchPoints'> = navigator
) {
  if (/iPad|iPhone|iPod/i.test(platform.userAgent)) return true
  return platform.platform === 'MacIntel' && platform.maxTouchPoints > 1
}
