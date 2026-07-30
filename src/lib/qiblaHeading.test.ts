import { describe, expect, it } from 'vitest'
import {
  isAppleMobilePlatform,
  qiblaHeadingSourceLabel
} from './qiblaHeading'

describe('Qibla compass platform facade', () => {
  it('recognizes iPhone and touch-enabled iPadOS platform signatures', () => {
    expect(isAppleMobilePlatform({
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',
      platform: 'iPhone',
      maxTouchPoints: 5
    })).toBe(true)

    expect(isAppleMobilePlatform({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)',
      platform: 'MacIntel',
      maxTouchPoints: 5
    })).toBe(true)
  })

  it('keeps Android on its separate engine', () => {
    expect(isAppleMobilePlatform({
      userAgent: 'Mozilla/5.0 (Linux; Android 15; SM-S928B)',
      platform: 'Linux armv8l',
      maxTouchPoints: 5
    })).toBe(false)
  })

  it('provides reader-facing source labels', () => {
    expect(qiblaHeadingSourceLabel('ios-compass')).toBe('iPhone compass')
    expect(qiblaHeadingSourceLabel('android-absolute-sensor')).toBe('Android magnetic North sensor')
    expect(qiblaHeadingSourceLabel('android-absolute-orientation')).toBe('Android absolute orientation')
    expect(qiblaHeadingSourceLabel(null)).toBe('Waiting for an absolute compass')
  })
})
