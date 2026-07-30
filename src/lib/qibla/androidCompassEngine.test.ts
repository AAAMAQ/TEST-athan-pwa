import { afterEach, describe, expect, it, vi } from 'vitest'
import { startAndroidCompassEngine } from './androidCompassEngine'
import type { AbsoluteOrientationSensorLike, QiblaHeadingReading } from './types'

function orientationEvent(
  type: 'deviceorientation' | 'deviceorientationabsolute',
  values: {
    absolute: boolean
    alpha: number
    beta?: number
    gamma?: number
  }
) {
  const event = new Event(type)
  Object.assign(event, {
    beta: values.beta ?? 0,
    gamma: values.gamma ?? 0,
    ...values
  })
  return event
}

afterEach(() => {
  vi.useRealTimers()
  delete window.AbsoluteOrientationSensor
  Reflect.deleteProperty(window, 'isSecureContext')
})

describe('Android compass engine', () => {
  it('rejects a relative startup zero instead of declaring it North', () => {
    vi.useFakeTimers()
    const readings: QiblaHeadingReading[] = []
    const unavailable = vi.fn()
    const controller = startAndroidCompassEngine({
      onReading: (reading) => readings.push(reading),
      onUnavailable: unavailable
    })

    window.dispatchEvent(orientationEvent('deviceorientation', {
      absolute: false,
      alpha: 0
    }))

    expect(readings).toEqual([])

    vi.advanceTimersByTime(4000)
    expect(unavailable).toHaveBeenCalledWith(
      expect.stringContaining('starting direction was rejected')
    )
    controller.stop()
  })

  it('accepts a strictly absolute fallback heading', () => {
    vi.useFakeTimers()
    const readings: QiblaHeadingReading[] = []
    const controller = startAndroidCompassEngine({
      onReading: (reading) => readings.push(reading),
      onUnavailable: vi.fn()
    })

    window.dispatchEvent(orientationEvent('deviceorientationabsolute', {
      absolute: true,
      alpha: 72
    }))

    expect(readings[0]).toMatchObject({
      heading: 288,
      source: 'android-absolute-orientation'
    })
    controller.stop()
  })

  it('prefers and locks onto the Earth-referenced quaternion sensor', () => {
    vi.useFakeTimers()
    const half = Math.sqrt(0.5)

    class FakeAbsoluteOrientationSensor extends EventTarget implements AbsoluteOrientationSensorLike {
      static instance: FakeAbsoluteOrientationSensor
      quaternion: readonly number[] | null = [0, 0, -half, half]

      constructor() {
        super()
        FakeAbsoluteOrientationSensor.instance = this
      }

      start() {}
      stop() {}
    }

    Object.defineProperty(window, 'isSecureContext', {
      configurable: true,
      value: true
    })
    window.AbsoluteOrientationSensor = FakeAbsoluteOrientationSensor

    const readings: QiblaHeadingReading[] = []
    const controller = startAndroidCompassEngine({
      onReading: (reading) => readings.push(reading),
      onUnavailable: vi.fn()
    })

    FakeAbsoluteOrientationSensor.instance.dispatchEvent(new Event('reading'))
    window.dispatchEvent(orientationEvent('deviceorientationabsolute', {
      absolute: true,
      alpha: 180
    }))

    expect(readings).toHaveLength(1)
    expect(readings[0].heading).toBeCloseTo(90)
    expect(readings[0].source).toBe('android-absolute-sensor')
    controller.stop()
  })
})
