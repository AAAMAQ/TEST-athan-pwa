import { describe, expect, it } from 'vitest'
import {
  headingFromAndroidOrientation,
  headingFromAndroidQuaternion,
  quaternionFromDeviceOrientation
} from './androidCompassMath'

describe('Android absolute compass math', () => {
  it('maps Earth-referenced quaternions to cardinal headings', () => {
    const half = Math.sqrt(0.5)

    expect(headingFromAndroidQuaternion([0, 0, 0, 1])?.heading).toBeCloseTo(0)
    expect(headingFromAndroidQuaternion([0, 0, -half, half])?.heading).toBeCloseTo(90)
    expect(headingFromAndroidQuaternion([0, 0, 1, 0])?.heading).toBeCloseTo(180)
    expect(headingFromAndroidQuaternion([0, 0, half, half])?.heading).toBeCloseTo(270)
  })

  it('normalizes non-unit quaternions before calculating heading', () => {
    expect(headingFromAndroidQuaternion([0, 0, -2, 2])?.heading).toBeCloseTo(90)
  })

  it('rejects invalid and horizontally ambiguous sensor readings', () => {
    const half = Math.sqrt(0.5)

    expect(headingFromAndroidQuaternion(null)).toBeNull()
    expect(headingFromAndroidQuaternion([0, 0, 0])).toBeNull()
    expect(headingFromAndroidQuaternion([0, 0, 0, 0])).toBeNull()
    expect(headingFromAndroidQuaternion([Number.NaN, 0, 0, 1])).toBeNull()
    expect(headingFromAndroidQuaternion([half, 0, 0, half])).toBeNull()
  })

  it('never treats a session-relative alpha value as North', () => {
    expect(headingFromAndroidOrientation({
      absolute: false,
      alpha: 0,
      beta: 0,
      gamma: 0
    })).toBeNull()

    expect(headingFromAndroidOrientation({
      absolute: false,
      alpha: 194,
      beta: 0,
      gamma: 0
    })).toBeNull()
  })

  it('maps absolute flat-device Euler readings to cardinal headings', () => {
    expect(headingFromAndroidOrientation({ absolute: true, alpha: 0 })?.heading).toBe(0)
    expect(headingFromAndroidOrientation({ absolute: true, alpha: 270 })?.heading).toBe(90)
    expect(headingFromAndroidOrientation({ absolute: true, alpha: 180 })?.heading).toBe(180)
    expect(headingFromAndroidOrientation({ absolute: true, alpha: 90 })?.heading).toBe(270)
  })

  it('uses the complete orientation and compensates for screen rotation', () => {
    const event = {
      absolute: true,
      alpha: 320,
      beta: 20,
      gamma: -12
    }
    const quaternion = quaternionFromDeviceOrientation(
      event.alpha,
      event.beta,
      event.gamma
    )
    const quaternionHeading = headingFromAndroidQuaternion([
      quaternion.x,
      quaternion.y,
      quaternion.z,
      quaternion.w
    ])!.heading

    expect(headingFromAndroidOrientation(event)?.heading).toBeCloseTo(quaternionHeading)
    expect(headingFromAndroidOrientation(event, 90)?.heading)
      .toBeCloseTo((quaternionHeading + 270) % 360)
  })
})
