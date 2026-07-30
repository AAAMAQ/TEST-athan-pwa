import { describe, expect, it } from 'vitest'
import { headingFromIosOrientation } from './iosCompassEngine'

describe('iOS compass engine', () => {
  it('preserves the established iPhone compass heading', () => {
    expect(headingFromIosOrientation({
      webkitCompassHeading: 288
    })).toEqual({
      heading: 288,
      source: 'ios-compass'
    })
  })

  it('normalizes valid headings without consulting Android orientation fields', () => {
    expect(headingFromIosOrientation({
      webkitCompassHeading: 370
    })?.heading).toBe(10)
  })

  it('rejects missing and non-finite iPhone headings', () => {
    expect(headingFromIosOrientation({})).toBeNull()
    expect(headingFromIosOrientation({ webkitCompassHeading: Number.NaN })).toBeNull()
  })
})
