import { describe, expect, it } from 'vitest'
import { CircularCompassFilter } from './compassFilter'

describe('CircularCompassFilter', () => {
  it('smooths across the 359-to-0 boundary using the shortest turn', () => {
    const filter = new CircularCompassFilter()
    expect(filter.update(359, 1000)).toBe(359)

    const next = filter.update(1, 1100)!
    expect(next > 359 || next < 1).toBe(true)
  })

  it('dampens an implausibly large jump between fast samples', () => {
    const filter = new CircularCompassFilter()
    filter.update(0, 1000)

    expect(filter.update(180, 1050)).toBeLessThan(10)
  })

  it('rejects non-finite input and can be reset', () => {
    const filter = new CircularCompassFilter()
    filter.update(90, 1000)
    expect(filter.update(Number.NaN, 1100)).toBe(90)

    filter.reset()
    expect(filter.update(270, 1200)).toBe(270)
  })
})
