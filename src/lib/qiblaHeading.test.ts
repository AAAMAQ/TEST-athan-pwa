import { describe, expect, it } from 'vitest'
import { qiblaHeadingFromOrientation, qiblaHeadingSourceLabel } from './qiblaHeading'

describe('Qibla compass heading normalization', () => {
  it('prefers the iPhone compass heading', () => {
    expect(qiblaHeadingFromOrientation({
      absolute: false,
      alpha: 72,
      webkitCompassHeading: 288
    }, 'deviceorientation')).toEqual({
      heading: 288,
      source: 'ios-compass'
    })
  })

  it('converts an Android absolute orientation to a compass heading', () => {
    expect(qiblaHeadingFromOrientation({
      absolute: true,
      alpha: 72
    }, 'deviceorientationabsolute')).toEqual({
      heading: 288,
      source: 'absolute-orientation'
    })
  })

  it('accepts an absolute reading delivered through the standard event', () => {
    expect(qiblaHeadingFromOrientation({
      absolute: true,
      alpha: 350
    }, 'deviceorientation')).toEqual({
      heading: 10,
      source: 'absolute-orientation'
    })
  })

  it('rejects relative Android alpha values instead of presenting a false heading', () => {
    expect(qiblaHeadingFromOrientation({
      absolute: false,
      alpha: 194
    }, 'deviceorientation')).toBeNull()
  })

  it('rejects missing and non-finite sensor values', () => {
    expect(qiblaHeadingFromOrientation({ absolute: true, alpha: null }, 'deviceorientationabsolute')).toBeNull()
    expect(qiblaHeadingFromOrientation({ absolute: true, alpha: Number.NaN }, 'deviceorientationabsolute')).toBeNull()
  })

  it('provides reader-facing source labels', () => {
    expect(qiblaHeadingSourceLabel('ios-compass')).toBe('iPhone compass')
    expect(qiblaHeadingSourceLabel('absolute-orientation')).toBe('Absolute device orientation')
    expect(qiblaHeadingSourceLabel(null)).toBe('Waiting for an absolute compass')
  })
})
